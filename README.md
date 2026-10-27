# CampaignIQ — Sistema de Inteligencia de Campañas de Marketing en Redes Sociales

### Grupo 12 — Trabajo Práctico Integrador

---

## Descripción General

**CampaignIQ** es una plataforma web full-stack con enfoque empresarial que centraliza la gestión, monitoreo y análisis de rendimiento de campañas de marketing en redes sociales. Permite administrar el ciclo de vida completo de campañas y publicaciones, evaluar métricas de interacción en tiempo real (alcance, impresiones, likes, comentarios, compartidos), analizar automáticamente el sentimiento del contenido mediante procesamiento de lenguaje natural (VADER bilingüe), identificar horarios óptimos de publicación y generar recomendaciones estratégicas basadas estrictamente en los datos registrados.

El sistema cuenta con una **Interfaz interactiva** desarrollado en Next.js 16 (React 19, Tailwind CSS v4, Recharts) conectado mediante una **API RESTful** a un **Backend en FastAPI** con persistencia relacional normalizada en SQLAlchemy (compatible con PostgreSQL en Docker y SQLite en desarrollo local) y exportación directa a CSV para **Power BI Desktop**.

---

## Arquitectura y Estructura del Proyecto

El repositorio está organizado como un monorepo profesional libre de datos simulados (sin mocks ni semillas estáticas), separando responsabilidades en capas de presentación, negocio, análisis y persistencia:

```text
campaignIntelligence/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── dbsession.py      # Configuración de motor SQLAlchemy y sesiones transaccionales
│   │   ├── models/
│   │   │   ├── campaigns.py      # Modelos ORM relacionales: Campaign y Post (1:N con CASCADE)
│   │   │   └── users.py          # Modelo ORM: User
│   │   ├── routers/
│   │   │   ├── campaigns.py      # Endpoints CRUD de campañas (/campaigns)
│   │   │   ├── dashboard.py      # Endpoint agregador del panel (/dashboard)
│   │   │   ├── export.py         # Exportación de datos relacionales reales a CSV (/export)
│   │   │   ├── insights.py       # Endpoint de recomendaciones dinámicas (/insights)
│   │   │   ├── posts.py          # Endpoints CRUD de publicaciones (/posts)
│   │   │   └── users.py          # Endpoints de usuarios y perfil (/users)
│   │   ├── schemas/
│   │   │   ├── campaign.py       # Contratos Pydantic de entrada/salida (camelCase/snake_case)
│   │   │   └── user.py           # Contratos Pydantic de usuario
│   │   ├── services/
│   │   │   ├── analytics.py      # Motor analítico: VADER, percentiles, series temporales e insights
│   │   │   ├── campaigns.py      # Lógica de negocio CRUD y agregación relacional de métricas
│   │   │   ├── export.py         # Serialización tabular desde la base de datos hacia CSV
│   │   │   └── users.py          # Operaciones de persistencia de usuarios
│   │   └── main.py               # Punto de entrada FastAPI, CORS y ciclo de vida (lifespan)
│   ├── migrations/               # Migraciones de base de datos con Alembic
│   ├── alembic.ini               # Configuración de Alembic
│   ├── Dockerfile                # Imagen Docker del backend
│   └── requirements.txt          # Dependencias de Python
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── analytics/        # Analíticas por plataforma, formato y sentimiento real
│   │   │   ├── campaigns/        # Listado, detalle ([id]), edición de estado y creación (/new)
│   │   │   ├── insights/         # Recomendaciones estratégicas calculadas en tiempo real
│   │   │   ├── posts/            # Biblioteca CRUD de publicaciones y vista de detalle ([id])
│   │   │   ├── pricing/          # Planes del sistema
│   │   │   ├── settings/         # Configuración de perfil de usuario y exportación CSV
│   │   │   ├── layout.tsx        # Layout principal con barra lateral
│   │   │   └── page.tsx          # Panel general (Overview)
│   │   ├── globals.css           # Sistema de diseño y estilos globales
│   │   └── layout.tsx            # Root layout de Next.js
│   ├── components/
│   │   ├── dashboard/            # Gráficos, tablas, tarjetas y modal CRUD (post-form-modal.tsx)
│   │   └── ui/                   # Componentes base de interfaz (Radix UI)
│   ├── lib/
│   │   ├── api.ts                # Cliente HTTP tipado y hook reactivo useCampaignData
│   │   ├── types.ts              # Contratos e interfaces TypeScript alineados con el backend
│   │   └── utils.ts              # Utilidades de formato numérico, colores de estado y clases CSS
│   ├── Dockerfile                # Imagen Docker del frontend
│   └── package.json              # Dependencias de Node.js
├── docs/
│   ├── Como_Iniciar_Proyecto.md  # Guía detallada de ejecución, verificación y comandos
│   └── powerbi_import.md         # Guía de importación de CSV en Power BI
├── .env.example                  # Plantilla de variables de entorno
├── docker-compose.yml            # Orquestación de Base de Datos, Backend y Frontend
└── README.md                     # Documentación general del sistema
```

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| Backend | FastAPI + Uvicorn (Python) | API REST con validación Pydantic v2 y documentación OpenAPI en `/docs` |
| Base de Datos | PostgreSQL / SQLite + SQLAlchemy 2.0 | Persistencia relacional con integridad referencial |
| Frontend | Next.js 16 + React 19 + TypeScript | Interfaz de usuario reactiva con diseño dark glassmorphism |
| Visualización Web | Recharts + Lucide Icons | Gráficos dinámicos de área, líneas y barras |
| Análisis de Sentimiento | VADER (`vaderSentiment`) + Léxico ES | Clasificación automática de sentimiento (`positivo`, `neutro`, `negativo`) |
| Reportes BI | Power BI Desktop | Consumo directo de `/export/campaigns/csv` y `/export/campaign/{id}/csv` |

---

## Modelo de Dominio y Motor Analítico

### Entidades Relacionales y Proyecciones

| Entidad | Tipo | Descripción |
|---|---|---|
| `User` | Tabla ORM (`users`) | Usuario registrado que administra las campañas y su perfil en el sistema |
| `Campaign` | Tabla ORM (`campaigns`) | Entidad maestra con metadatos de campaña (`name`, `platform`, `status`, `budget`, fechas). Sus métricas se agregan dinámicamente a partir de sus publicaciones asociadas |
| `Post` | Tabla ORM (`posts`) | Publicación vinculada a `Campaign` (`campaign_id` con `ON DELETE CASCADE`), almacena interacciones brutas (`likes`, `comments`, `shares`, `reach`, `impressions`), fecha/hora y sentimiento |
| `InsightRead` | Proyección Dinámica | Recomendación calculada en tiempo real por el motor analítico comparando formatos, horarios, plataformas y sentimiento |

### Reglas de Negocio y Fórmulas

1. **Agregación Relacional de Campañas**:
   Las métricas de cada campaña (`likes`, `comments`, `shares`, `reach`, `impressions`, `postsCount`, `engagementRate`, `engagementScore` y `growth`) no se guardan como valores fijos desconectados, sino que se calculan en tiempo real a partir de los registros `Post` hijos.

2. **Engagement Rate y Engagement Score**:
   ```text
   engagement_rate = ((likes + comments + shares) / reach) * 100
   engagement_score = min(100, round(engagement_rate * 8.5, 1))
   ```

3. **Clasificación Percentil de Rendimiento (`buena`, `normal`, `mala`)**:
   El motor calcula los percentiles 33 y 66 de `engagement_rate` sobre el conjunto activo de campañas o publicaciones para clasificar objetivamente el rendimiento relativo de cada registro.

4. **Análisis de Sentimiento Bilingüe (VADER)**:
   El motor aplica VADER enriquecido con léxico en español sobre el texto de cada publicación (`compound` entre `-1.0` y `1.0`):
   ```text
   compound >= 0.05   -> "positivo"
   compound <= -0.05  -> "negativo"
   entre -0.05 y 0.05 -> "neutro"
   ```

5. **Series Temporales y Horario Óptimo**:
   - `engagementOverTime`: Agrupa las publicaciones por fecha cronológica real (`YYYY-MM-DD`).
   - `hourlyInteractions`: Agrupa las interacciones en las 24 franjas horarias (`00h` a `23h`) según la hora real de publicación (`published_at`).

---

## Endpoints de la API REST

Con el backend activo en `http://localhost:8000`, la documentación interactiva OpenAPI se encuentra en `http://localhost:8000/docs`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Verifica el estado operativo del servidor |
| `GET` | `/dashboard` | Devuelve KPIs globales, campañas hidratadas, publicaciones, insights y series temporales |
| `GET` | `/campaigns` | Lista todas las campañas con métricas agregadas y clasificación percentil |
| `GET` | `/campaigns/{id}` | Obtiene el detalle de una campaña, sus publicaciones, insights y series horarias/diarias |
| `POST` | `/campaigns` | Crea una nueva campaña en la base de datos |
| `PATCH` | `/campaigns/{id}` | Actualiza los datos o el estado (`active`, `paused`, `completed`, `draft`, `scheduled`) de una campaña |
| `DELETE` | `/campaigns/{id}` | Elimina una campaña y sus publicaciones asociadas en cascada |
| `GET` | `/posts` | Lista publicaciones con filtro opcional por `campaign_id` y `search` |
| `GET` | `/posts/{id}` | Obtiene el detalle de una publicación junto con su desglose de sentimiento VADER |
| `POST` | `/posts` | Crea una publicación, ejecuta VADER y recalcula las métricas de su campaña |
| `PATCH` | `/posts/{id}` | Actualiza una publicación, recalcula su sentimiento y actualiza la campaña |
| `DELETE` | `/posts/{id}` | Elimina una publicación de la base de datos |
| `GET` | `/insights` | Genera y devuelve los insights estratégicos basados en los datos actuales |
| `GET` | `/users` | Lista los usuarios registrados |
| `POST` | `/users` | Crea o actualiza el perfil de usuario |
| `GET` | `/export/campaigns/csv` | Descarga un archivo CSV con todas las campañas y publicaciones reales |
| `GET` | `/export/campaign/{id}/csv` | Descarga un archivo CSV con las publicaciones reales de una campaña específica |

---

## Cómo Iniciar el Proyecto

### Opción 1: Ejecución Local Directa (SQLite Automático)

1. **Iniciar el Backend (Terminal 1)**:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Iniciar el Frontend (Terminal 2)**:
   ```powershell
   cd frontend
   pnpm install
   pnpm dev
   ```
   Abre `http://localhost:3000` en tu navegador.

### Opción 2: Ejecución con Docker Compose (PostgreSQL + Backend + Frontend)

1. Inicia **Docker Desktop**.
2. En la raíz del repositorio, ejecuta:
   ```powershell
   docker compose up --build -d
   ```
3. Servicios disponibles:
   - **Frontend Dashboard**: `http://localhost:3000`
   - **Backend API & Swagger**: `http://localhost:8000/docs`
   - **PostgreSQL**: puerto `5432`

---

## Integrantes

| Nombre | Legajo |
|---|---|
| Luhmann Emiliano | 53224 |
| Lezcano Diego | 53215 |
| Sello Valentino | 51405 |

---

*Trabajo Práctico Integrador — Soporte — 2026*
