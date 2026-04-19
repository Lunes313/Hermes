# PQRSD FastAPI MVP

Backend simple y funcional para gestionar PQRSD durante una demo de hackathon.

## Estructura

```text
app/
  core/
  models/
  routers/
  schemas/
  services/
  main.py
main.py
requirements.txt
```

## Ejecutar

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API queda disponible en:

- `GET /health`
- `POST /pqrsd`
- `GET /pqrsd/{id}`
- `GET /dependencias`
- `GET /trazabilidad/{id}`
- `POST /aprobar`

Al crear una PQRSD, el backend intenta usar Groq para clasificar la dependencia,
calcular un score, generar un lead y asignar urgencia. Si falta la API key, no
hay internet o la API falla, usa la logica local como respaldo y el endpoint no
se rompe.

Variables de entorno opcionales:

```bash
GROQ_API_KEY=tu_api_key
GROQ_MODEL=llama-3.1-8b-instant
HUGGINGFACE_API_KEY=tu_api_key_opcional
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Documentacion interactiva:

- `http://127.0.0.1:8000/docs`

## Ejemplos rapidos

Crear PQRSD:

```bash
curl -X POST http://127.0.0.1:8000/pqrsd \
  -H "Content-Type: application/json" \
  -d "{\"asunto\":\"Solicitud de informacion\",\"canal\":\"web\",\"remitente\":\"Ana Perez\",\"texto\":\"Quiero conocer el estado de mi tramite.\"}"
```

Aprobar o devolver:

```bash
curl -X POST http://127.0.0.1:8000/aprobar \
  -H "Content-Type: application/json" \
  -d "{\"pqrsd_id\":1,\"aprobado\":true,\"usuario\":\"juridica\",\"observaciones\":\"Respuesta revisada.\"}"
```
