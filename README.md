# CampaignIQ — Sistema de Inteligencia de Campañas de Marketing en Redes Sociales

### Grupo 12 — Trabajo Práctico Integrador

---

## Descripción General

**CampaignIQ** es una plataforma web full-stack de arquitectura empresarial que centraliza la gestión, monitoreo y análisis de rendimiento de campañas de marketing en redes sociales. Permite administrar el ciclo de vida completo de campañas y publicaciones, evaluar métricas de interacción en tiempo real (alcance, impresiones, likes, comentarios, compartidos), analizar automáticamente el sentimiento del contenido mediante procesamiento de lenguaje natural (VADER bilingüe), identificar horarios óptimos de publicación y generar recomendaciones estratégicas basadas estrictamente en los datos registrados.

El sistema cuenta con un **Frontend interactivo** desarrollado en Next.js 16 (React 19, Tailwind CSS v4, Recharts) conectado mediante una **API RESTful** a un **Backend en FastAPI** con persistencia relacional estricta sobre **PostgreSQL** (gestionada con SQLAlchemy 2.0 y Alembic) y exportación directa a CSV para **Power BI Desktop**.

---

## Arquitectura y Estructura del Proyecto

El repositorio está organizado como un monorepo profesional libre de datos simulados (sin mocks ni semillas estáticas) y con exigencia estricta de PostgreSQL al iniciar el servidor:

```text
campaignIntelligence/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── dbsession.py      # Validación estricta de PostgreSQL y sesiones SQLAlchemy
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
│   │   │   ├── campaign.py       # Contratos Pydantic de entrada y salida
│   │   │   └── user.py           # Contratos Pydantic de usuario
│   │   ├── services/
│   │   │   ├── analytics.py      # Motor analítico: VADER, percentiles, series temporales e insights
│   │   │   ├── campaigns.py      # Lógica de negocio CRUD y agregación relacional de métricas
│   │   │   ├── export.py         # Serialización tabular desde PostgreSQL hacia CSV
│   │   │   └── users.py          # Operaciones de persistencia de usuarios
│   │   └── main.py               # Punto de entrada FastAPI, verificación de PostgreSQL y CORS
│   ├── migrations/               # Migraciones de esquema con Alembic (0001_initial)
│   ├── tests/                    # Suite de pruebas automatizadas con Pytest (conftest.py, test_api.py)
│   ├── .env.example              # Plantilla de variables de entorno del backend
│   ├── alembic.ini               # Configuración de Alembic para PostgreSQL
│   ├── Dockerfile                # Imagen Docker del backend
│   └── requirements.txt          # Dependencias de Python y testing
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── analytics/        # Analíticas por plataforma, formato y sentimiento real
│   │   │   ├── campaigns/        # Listado, detalle ([id]), edición de estado y creación (/new)
│   │   │   ├── insights/         # Recomendaciones estratégicas calculadas en tiempo real
│   │   │   ├── posts/            # Biblioteca CRUD de publicaciones y vista de detalle ([id])
│   │   │   ├── pricing/          # Planes del sistema
│   │   │   ├── settings/         # Configuración de perfil de usuario, estado PostgreSQL y CSV
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
│   ├── tests/                    # Pruebas automatizadas de contratos e integridad del frontend
│   ├── .env.example              # Plantilla de variables de entorno del frontend
│   ├── Dockerfile                # Imagen Docker del frontend
│   └── package.json              # Dependencias y scripts de Node.js
├── docs/
│   ├── Como_Iniciar_Proyecto.md  # Guía detallada de requerimientos, configuración, ejecución y tests
│   └── powerbi_import.md         # Guía de importación de CSV en Power BI
├── .env.example                  # Plantilla global de variables de entorno
├── .gitignore                    # Reglas de exclusión de Git (incluyendo archivos .env)
├── docker-compose.yml            # Orquestación de PostgreSQL 16, Backend y Frontend
└── README.md                     # Documentación general del sistema
```

---

## Requerimientos del Sistema

### 1. Infraestructura y Base de Datos
- **PostgreSQL 15 o 16+**: El backend exige exclusivamente una conexión válida a PostgreSQL (`postgresql://` o `postgresql+psycopg2://`). Si `DATABASE_URL` no está configurada, apunta a otro motor o el servidor PostgreSQL no responde al iniciar, el backend aborta el arranque inmediatamente lanzando un error explícito.
- **Docker y Docker Compose (Opcional pero recomendado)**: Permite levantar PostgreSQL 16, Backend y Frontend de forma integrada o levantar únicamente el contenedor `db` de PostgreSQL para desarrollo local.

### 2. Requerimientos de Backend
- **Python**: `3.11` o superior (`3.12` compatible).
- **Gestor de paquetes**: `pip` y `venv`.
- **Librerías principales** (definidas en `backend/requirements.txt`):
  - `fastapi>=0.115.0` y `uvicorn[standard]>=0.30.0`
  - `SQLAlchemy>=2.0.30`, `alembic>=1.13.0` y `psycopg2-binary>=2.9.9`
  - `pydantic>=2.7.0`, `pydantic-settings>=2.2.0` y `email-validator>=2.1.0`
  - `vaderSentiment>=3.3.2`, `nltk>=3.8.1` y `pandas>=2.2.0`
  - `pytest>=8.0.0` y `httpx>=0.27.0` (para ejecución de pruebas automatizadas)

### 3. Requerimientos de Frontend
- **Node.js**: `20.x LTS` o superior.
- **Gestor de paquetes**: `pnpm` (v9+ recomendado) o `npm`.
- **Librerías principales** (definidas en `frontend/package.json`):
  - `next` (`16.2.0`), `react` (`19`), `react-dom` (`19`), `typescript` (`5.7.3`)
  - `tailwindcss` (`4.2.0`), `recharts` (`2.15.0`), `lucide-react`, `@radix-ui/*`

---

## Configuración de Variables de Entorno (`.env`)

Todos los archivos `.env` están excluidos del control de versiones en `.gitignore`, mientras que las plantillas `.env.example` están versionadas.

### Variables en `.env` (Raíz del proyecto) y `backend/.env`

```ini
POSTGRES_USER=campaign_iq
POSTGRES_PASSWORD=campaign_iq
POSTGRES_DB=campaign_iq
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

DATABASE_URL=postgresql://campaign_iq:campaign_iq@localhost:5432/campaign_iq

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Variables en `frontend/.env`

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Modelo de Dominio y Motor Analítico

### Entidades Relacionales y Proyecciones

| Entidad | Tipo | Descripción |
|---|---|---|
| `User` | Tabla PostgreSQL (`users`) | Usuario registrado que administra las campañas y su perfil en el sistema |
| `Campaign` | Tabla PostgreSQL (`campaigns`) | Entidad maestra con metadatos de campaña (`name`, `platform`, `status`, `budget`, fechas). Sus métricas se agregan dinámicamente a partir de sus publicaciones asociadas |
| `Post` | Tabla PostgreSQL (`posts`) | Publicación vinculada a `Campaign` (`campaign_id` con `ON DELETE CASCADE`), almacena interacciones brutas (`likes`, `comments`, `shares`, `reach`, `impressions`), fecha/hora y sentimiento |
| `InsightRead` | Proyección Dinámica | Recomendación calculada en tiempo real por el motor analítico comparando formatos, horarios, plataformas y sentimiento |

### Reglas de Negocio y Fórmulas

1. **Agregación Relacional de Campañas**:
   Las métricas de cada campaña (`likes`, `comments`, `shares`, `reach`, `impressions`, `postsCount`, `engagementRate`, `engagementScore` y `growth`) se calculan en tiempo real a partir de los registros `Post` asociados.

2. **Engagement Rate y Engagement Score**:
   ```text
   engagement_rate = ((likes + comments + shares) / reach) * 100
   ```

3. **Clasificación Percentil de Rendimiento (`buena`, `normal`, `mala`)**:
   El motor calcula los percentiles 33 y 66 de `engagement_rate` sobre el conjunto de publicaciones para clasificar objetivamente el rendimiento relativo de cada registro.

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
| `GET` | `/health` | Verifica el estado operativo del servidor y ejecuta `SELECT 1` contra PostgreSQL |
| `GET` | `/dashboard` | Devuelve KPIs globales, campañas hidratadas, publicaciones, insights y series temporales |
| `GET` | `/campaigns` | Lista todas las campañas con métricas agregadas |
| `GET` | `/campaigns/{id}` | Obtiene el detalle de una campaña, sus publicaciones, insights y series horarias/diarias |
| `POST` | `/campaigns` | Crea una nueva campaña en PostgreSQL |
| `PATCH` | `/campaigns/{id}` | Actualiza los datos o el estado (`active`, `paused`, `completed`, `draft`, `scheduled`) de una campaña |
| `DELETE` | `/campaigns/{id}` | Elimina una campaña y sus publicaciones asociadas en cascada (`ON DELETE CASCADE`) |
| `GET` | `/posts` | Lista publicaciones con filtro opcional por `campaign_id` y `search` |
| `GET` | `/posts/{id}` | Obtiene el detalle de una publicación junto con su desglose de sentimiento VADER |
| `POST` | `/posts` | Crea una publicación, ejecuta VADER y recalcula las métricas de su campaña |
| `PATCH` | `/posts/{id}` | Actualiza una publicación, recalcula su sentimiento y actualiza la campaña |
| `DELETE` | `/posts/{id}` | Elimina una publicación de PostgreSQL |
| `GET` | `/insights` | Genera y devuelve los insights estratégicos basados en los datos actuales |
| `GET` | `/users` | Lista los usuarios registrados |
| `POST` | `/users` | Crea o actualiza el perfil de usuario |
| `GET` | `/export/campaigns/csv` | Descarga un archivo CSV con todas las campañas y publicaciones reales |
| `GET` | `/export/campaign/{id}/csv` | Descarga un archivo CSV con las publicaciones reales de una campaña específica |

---

## Cómo Iniciar el Proyecto

### Opción 1: Levantar Todo con Docker Compose (PostgreSQL + Backend + Frontend)

1. Inicia **Docker Desktop**.
2. Verifica las variables en `.env` (creado a partir de `.env.example`).
3. En la raíz del repositorio, ejecuta:
   ```powershell
   docker compose up --build -d
   ```
4. Servicios disponibles:
   - **Frontend Dashboard**: `http://localhost:3000`
   - **Backend API & Swagger**: `http://localhost:8000/docs`
   - **PostgreSQL**: `localhost:5432`

### Opción 2: Ejecución en Entorno Local con PostgreSQL

1. Asegúrate de tener una instancia de **PostgreSQL** corriendo en `localhost:5432` (puedes usar un servidor PostgreSQL local o levantar únicamente la base de datos con `docker compose up -d db`) y que la base de datos configurada en `DATABASE_URL` exista.
2. **Iniciar el Backend (Terminal 1)**:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```
3. **Iniciar el Frontend (Terminal 2)**:
   ```powershell
   cd frontend
   pnpm install
   pnpm dev
   ```
   Abre `http://localhost:3000` en tu navegador.

---

## Ejecución de Pruebas Automatizadas (Testing)

### Pruebas de Backend (Pytest)
Validan la exigencia estricta de `DATABASE_URL` con PostgreSQL, el motor analítico VADER, y el ciclo de vida CRUD de los endpoints críticos:
```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```

### Pruebas y Verificación de Tipos de Frontend
Validan la ausencia de datos simulados, contratos de endpoints HTTP, manejo de errores y tipado estricto TypeScript:
```powershell
cd frontend
pnpm test
pnpm typecheck
```

---

## Integrantes

| Nombre | Legajo |
|---|---|
| Luhmann Emiliano | 53224 |
| Lezcano Diego | 53215 |
| Sello Valentino | 51405 |

---

*Trabajo Práctico Integrador — Soporte — 2026*
