from datetime import datetime
import random
from typing import List, Optional, Dict, Any

from app.core.database import get_supabase
from app.schemas.pqrsd import AprobarRequest, PQRSDCreate, PQRSDInput
from app.services.ai_service import analyze_pqrsd_full, generate_embedding, classify_with_huggingface
from app.services.date_service import add_business_days

# Prompts variables por tipo de solicitud
PROMPTS_POR_TIPO = {
    "Queja": "Eres un funcionario empático de la Alcaldía de Medellín. El ciudadano está molesto. Reconoce su inconformidad con genuino interés, explica que la dependencia {dependencias} atenderá el caso en {lugar}. Varía tu tono, no repitas siempre lo mismo.",
    "Petición": "Eres un funcionario servicial de la Alcaldía. Confirma recepción, explica que {dependencias} revisará la solicitud en 15 días hábiles. Sé claro y directo.",
    "Reclamo": "Valida la experiencia del ciudadano sin asumir culpa institucional. Explica el proceso de revisión por parte de {dependencias}. Menciona el radicado como herramienta de seguimiento.",
    "Sugerencia": "Agradece el aporte para mejorar Medellín. {dependencias} evaluará la propuesta. Transmite que las sugerencias son valiosas para la gestión pública.",
    "Denuncia": "Tono serio y formal. Confirma recepción con reserva de identidad. {dependencias} iniciará la verificación de los hechos reportados."
}

async def obtener_contexto_similares(texto_usuario: str):
    """Búsqueda vectorial de casos similares resueltos (RAG)"""
    supabase = get_supabase()
    embedding = await generate_embedding(texto_usuario)
    
    try:
        # Llamada al RPC de búsqueda vectorial definido en la migración SQL
        rpc_result = supabase.rpc(
            'buscar_pqrsd_similares',
            {
                'query_embedding': embedding,
                'match_threshold': 0.7,
                'match_count': 2
            }
        ).execute()
        
        casos = rpc_result.data
        if not casos:
            return "No hay precedentes registrados para casos similares."
            
        contexto = "\nPRECEDENTES HISTÓRICOS (Úsalos como referencia para dar seguridad al ciudadano):\n"
        for c in casos:
            contexto += f"- Caso similar: {c['asunto']}. Solución: {c['respuesta_generada']}\n"
        return contexto
    except Exception as e:
        print(f"RAG Error: {e}")
        return ""

async def procesar_mensaje_chatbot(payload: PQRSDInput):
    """
    Función principal de integración:
    1. Clasifica y extrae entidades.
    2. Busca precedentes (RAG).
    3. Evalúa estado (Falta info / Confirmar / Radicar).
    4. Genera respuesta humana.
    """
    texto = payload.texto
    
    # 1. Análisis de IA y Extracción
    analisis = await analyze_pqrsd_full(texto)
    
    # 2. Recuperación de Precedentes (RAG)
    precedentes = await obtener_contexto_similares(texto)
    
    # 3. Lógica de Máquina de Estados (Simplificada para el bot)
    tipo = analisis.get("tipo_pqrs", "Petición")
    base_prompt = PROMPTS_POR_TIPO.get(tipo, PROMPTS_POR_TIPO["Petición"])
    deps = ", ".join(analisis.get("dependencias", ["Atención Ciudadana"]))
    lugar = analisis.get("lugar", "la ciudad")
    
    # Evaluar si falta información crítica
    info_faltante = []
    if not analisis.get("asunto") or len(analisis.get("asunto", "")) < 4: 
        info_faltante.append("detalles del problema")
        
    if not analisis.get("lugar"): 
        info_faltante.append("barrio o comuna exactos donde ocurre esto")
    
    if info_faltante:
        respuesta_ia = f"Hola, para ayudarte mejor con tu {tipo}, ¿podrías darme más {', y '.join(info_faltante)}? {precedentes if 'No hay' not in precedentes else ''}"
    else:
        # Si tiene todo, generar resumen y pedir confirmación
        respuesta_ia = f"Entiendo tu situación en {lugar}. {base_prompt.format(dependencias=deps, lugar=lugar)}\n\n{precedentes}\n\n¿Deseas radicar esta solicitud oficialmente ahora mismo?"

    # 4. Detección de confirmación para radicar
    if any(k in texto.lower() for k in ['sí', 'si', 'hágale', 'proceda', 'radicar', 'claro']):
        pqrsd_final = await create_pqrsd(PQRSDCreate(
            asunto=analisis.get("asunto", "Solicitud desde Chat"),
            canal="Chatbot IA",
            remitente=analisis.get("nombre", "Anónimo"),
            texto=texto
        ))
        respuesta_ia = (f"¡Excelente! Tu solicitud ha sido radicada con el código: **{pqrsd_final['radicado']}**. "
                       f"La dependencia {deps} tiene 15 días hábiles para responderte. ¡Feliz día!")

    return {
        "respuesta": respuesta_ia,
        "analisis": analisis
    }

async def analyze_only(texto: str) -> Dict[str, Any]:
    return await analyze_pqrsd_full(texto)

async def create_pqrsd(payload: PQRSDCreate):
    supabase = get_supabase()
    now = datetime.utcnow()
    ai_result = await analyze_pqrsd_full(payload.texto)
    
    radicado = f"HER-{now.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    vencimiento = add_business_days(now.date(), 15)
    
    data = {
        "asunto": payload.asunto,
        "canal": payload.canal,
        "remitente": payload.remitente,
        "texto": payload.texto,
        "texto_original": payload.texto,
        "radicado": radicado,
        "estado": "recibida",
        "dependencia_asignada": ai_result.get("dependencias", ["Atención Ciudadana"])[0] if isinstance(ai_result.get("dependencias"), list) else ai_result.get("dependencias", "Atención Ciudadana"),
        "tipo": ai_result.get("tipo_pqrs", "Petición").lower().replace('ó', 'o'),
        "embedding": ai_result.get("embedding"),
        "fecha_creacion": now.isoformat(),
        "fecha_vencimiento": vencimiento.isoformat()
    }
    
    result = supabase.table("pqrsd").insert(data).execute()
    pqrsd = result.data[0]
    
    await add_trazabilidad(pqrsd["id"], "Radicación desde Chat", "sistema", f"Radicado {radicado}")
    return pqrsd

async def get_pqrsd(pqrsd_id: int):
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*").eq("id", pqrsd_id).execute()
    return result.data[0] if result.data else None

async def list_pqrsd():
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*, territorios(nombre)").order("fecha_creacion", desc=True).execute()
    data = result.data
    import re
    for item in data:
        if item.get("territorios") and hasattr(item["territorios"], "get") and item["territorios"].get("nombre"):
            item["lugar"] = item["territorios"]["nombre"]
        elif item.get("texto"):
            m = re.search(r'Territorio:\s*(.*)', item["texto"])
            item["lugar"] = m.group(1).strip() if m else "Desconocido"
        else:
            item["lugar"] = "Desconocido"
    return data

async def get_trazabilidad(pqrsd_id: int):
    supabase = get_supabase()
    result = supabase.table("trazabilidad").select("*").eq("pqrsd_id", pqrsd_id).order("fecha").execute()
    return result.data

async def aprobar_pqrsd(payload: AprobarRequest):
    supabase = get_supabase()
    nuevo_estado = "aprobada_juridico" if payload.aprobado else "devuelta"
    result = supabase.table("pqrsd").update({"estado": nuevo_estado}).eq("id", payload.pqrsd_id).execute()
    if not result.data: return None
    pqrsd = result.data[0]
    await add_trazabilidad(pqrsd["id"], "Revisión Jurídica", payload.usuario, f"Estado: {nuevo_estado}")
    return pqrsd

async def add_trazabilidad(pqrsd_id: int, accion: str, usuario: str, observaciones: str = None):
    supabase = get_supabase()
    data = {
        "pqrsd_id": pqrsd_id, 
        "accion": accion, 
        "detalle": {"usuario_str": usuario, "observaciones": observaciones}, 
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase.table("trazabilidad").insert(data).execute()
    return result.data[0] if result.data else None
