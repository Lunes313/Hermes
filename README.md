# 🕊️ Hermes: Sistema Inteligente de PQRSD - Alcaldía de Medellín

Hermes es una plataforma de vanguardia diseñada para transformar la interacción entre el ciudadano y la administración distrital de Medellín. Utilizando inteligencia artificial avanzada y un diseño centrado en el usuario, Hermes automatiza la clasificación, el seguimiento y la resolución de Peticiones, Quejas, Reclamos, Sugerencias y Denuncias (PQRSD).

## 🚀 Características Principales

*   **Asistente IA Interactivo**: Un chatbot inteligente que guía al ciudadano en la redacción de su solicitud, extrayendo automáticamente el asunto, la ubicación y los hechos relevantes.
*   **Clasificación Automática**: Motor de IA que asigna las solicitudes a la dependencia competente (Secretaría de Movilidad, Seguridad, Salud, etc.) basándose en el análisis semántico del texto.
*   **Búsqueda de Precedentes (RAG)**: Sistema basado en vectores (`pgvector`) que identifica solicitudes similares históricas para agilizar la respuesta jurídica.
*   **Dashboard Administrativo**: Panel de gestión avanzado con visualización de datos, mapas de calor (Heatmaps) por comunas y tableros Kanban para el control de estados.
*   **Cálculo de Términos de Ley**: Automatización del cálculo de fechas de vencimiento según la Ley 1755 de 2015, incluyendo gestión de festivos en Colombia.

## 🛠️ Stack Tecnológico

### Backend
*   **FastAPI**: Framework de alto rendimiento para la construcción de la API.
*   **PostgreSQL + pgvector**: Base de datos relacional con capacidades de búsqueda vectorial.
*   **Supabase**: Backend-as-a-Service para autenticación, almacenamiento y gestión de base de datos.
*   **HuggingFace Inference**: Modelos de lenguaje para clasificación y generación de embeddings.
*   **Python 3.11+**: Lenguaje de programación robusto y versátil.

### Frontend
*   **React 19 (Vite)**: Biblioteca para la interfaz de usuario con alto rendimiento.
*   **Tailwind CSS 4**: Motor de estilos de última generación enfocado en el rendimiento.
*   **Framer Motion**: Animaciones fluidas y transiciones de estado de nivel premium.
*   **Lucide Icons**: Set de iconos modernos y consistentes.
*   **Stitch Design System**: Sistema de diseño semántico para una experiencia visual cohesiva y profesional.

## 📂 Estructura del Proyecto

```text
Hermes/
├── app/                # Backend (FastAPI, Servicios, Modelos, Esquemas)
├── frontend-hermes/    # Frontend (React + Vite + Tailwind 4)
├── main.py             # Punto de entrada del servidor backend
├── requirements.txt    # Dependencias de Python
└── .env                # Configuración de variables de entorno (Supabase, API Keys)
```

## ⚙️ Configuración e Instalación

### Requisitos Previos
*   Python 3.10+
*   Node.js 18+
*   Cuenta de Supabase con extensión `vector` habilitada.

### Ejecución del Proyecto

1.  **Backend**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Windows: venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```

2.  **Frontend**:
    ```bash
    cd frontend-hermes
    npm install
    npm run dev
    ```

---
*Desarrollado para la transformación digital de la Alcaldía de Medellín durante la Hackathon 2024.*
