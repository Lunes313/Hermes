from typing import Optional


# Palabras clave por categoría
KEYWORDS = {
    "Infraestructura": ["hueco", "calle", "vía"],
    "Medio Ambiente": ["basura", "contaminación"],
    "Salud": ["salud", "enfermedad"],
    "Hacienda": ["impuesto", "predial"],
}


def clasificar_pqrsd(texto: str) -> dict:
    """
    Clasifica un PQRSD según palabras clave en el texto.
    
    Args:
        texto: Texto del PQRSD a clasificar
        
    Returns:
        Diccionario con estructura:
        {
            "principal": str | None,  # Categoría principal detectada
            "secundarias": list[str],  # Categorías secundarias detectadas
            "revision_manual": bool   # Si requiere revisión manual
        }
    """
    texto_lower = texto.lower()
    
    encontradas = {}
    
    # Buscar coincidencias de palabras clave
    for categoria, keywords in KEYWORDS.items():
        for keyword in keywords:
            if keyword in texto_lower:
                if categoria not in encontradas:
                    encontradas[categoria] = 0
                encontradas[categoria] += 1
    
    # Determinar principal y secundarias
    if not encontradas:
        return {
            "principal": None,
            "secundarias": [],
            "revision_manual": True
        }
    
    # Ordenar por frecuencia de coincidencias
    categorias_ordenadas = sorted(
        encontradas.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    principal = categorias_ordenadas[0][0]
    secundarias = [cat[0] for cat in categorias_ordenadas[1:]]
    
    return {
        "principal": principal,
        "secundarias": secundarias,
        "revision_manual": False
    }
