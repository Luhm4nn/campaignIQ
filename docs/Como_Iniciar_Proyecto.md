# Guía de Requerimientos, Configuración, Inicio y Pruebas para CampaignIQ

## 1. Requerimientos Previos Detallados

Para levantar el proyecto de extremo a extremo necesitas contar con:

1. **Base de Datos PostgreSQL (Obligatoria)**:
   - Versión recomendada: **PostgreSQL 15 o 16+**.
   - El sistema no utiliza bases de datos embebidas ni fallbacks locales: si PostgreSQL no está disponible o `DATABASE_URL` no es una URI válida de PostgreSQL (`postgresql://...` o `postgresql+psycopg2://...`), el backend detendrá el inicio con un error explícito.
2. **Entorno de Backend**:
   - **Python 3.11 o 3.12+**.
   - Paquetes instalados en `backend/.venv` mediante `pip install -r requirements.txt`.
3. **Entorno de Frontend**:
   - **Node.js 20 LTS o superior**.
   - **pnpm** (`npm install -g pnpm`).

---

## 2. Configuración de Variables de Entorno (`.env`)

El repositorio cuenta con plantillas `.env.example` versionadas y archivos `.env` listos para configurar (ignorados por Git mediante `.gitignore`):

- **`.env` (Raíz)** y **`backend/.env`**:
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
- **`frontend/.env`**:
  ```ini
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

Si utilizas una instalación local de PostgreSQL con otro usuario, contraseña o puerto, actualiza `DATABASE_URL` en `.env` y `backend/.env`.

---

## 3. Ejecución con Docker Compose (PostgreSQL + Backend + Frontend)

1. Abrir **Docker Desktop** y esperar a que el motor esté activo.
2. Desde la raíz del proyecto (`campaignIntelligence`), ejecutar:

```powershell
docker compose up --build -d
```

3. Verificar el estado de los contenedores:

```powershell
docker compose ps
docker compose logs -f backend
```

### Aplicar Migraciones con Alembic en Docker

```powershell
docker compose exec backend alembic upgrade head
```

### Consola de PostgreSQL en Docker

```powershell
docker compose exec db psql -U campaign_iq -d campaign_iq
```

Comandos útiles dentro de `psql`:
- `\dt`: listar tablas (`users`, `campaigns`, `posts`)
- `\d campaigns`: ver estructura de la tabla `campaigns`
- `\d posts`: ver estructura de la tabla `posts`
- `SELECT * FROM campaigns;`: consultar campañas
- `\q`: salir

---

## 4. Ejecución Local Conectada a PostgreSQL

### Paso 1: Asegurar que PostgreSQL esté activo

Puedes utilizar tu servicio local de PostgreSQL en el puerto `5432` (creando la base de datos `campaign_iq`) o levantar únicamente el contenedor de PostgreSQL con Docker:

```powershell
docker compose up -d db
```

### Paso 2: Levantar el Backend (FastAPI)

Abrir una terminal en la raíz del proyecto y ejecutar:

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

- API disponible en: `http://localhost:8000`
- Documentación Swagger UI: `http://localhost:8000/docs`

### Paso 3: Levantar el Frontend (Next.js)

Abrir una segunda terminal en la raíz del proyecto y ejecutar:

```powershell
cd frontend
pnpm install
pnpm dev
```

- Dashboard disponible en: `http://localhost:3000`

---

## 5. Ejecución de Tests Automatizados

### Backend (Pytest)

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```

### Frontend (Node Test Runner + TypeScript Check)

```powershell
cd frontend
pnpm test
pnpm typecheck
```

---

## 6. Pruebas Manuales de la API desde PowerShell

Con PostgreSQL y el Backend en ejecución:

```powershell
# Verificar estado del servidor y conexión PostgreSQL
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Crear una campaña
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/campaigns" -ContentType "application/json" -Body '{"name":"Lanzamiento Otoño 2026","description":"Campaña principal de temporada","platform":"instagram","campaignType":"Conversion","status":"active","startDate":"2026-04-01","budget":2500}'

# Crear una publicación asociada a la campaña (ID 1)
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/posts" -ContentType "application/json" -Body '{"campaignId":1,"content":"Excelente lanzamiento con gran calidad e innovación para nuestra comunidad","mediaType":"video","publishedAt":"2026-04-02T19:00:00","likes":840,"comments":95,"shares":65,"reach":11200,"impressions":15400}'

# Consultar el panel general con métricas agregadas e insights dinámicos
Invoke-RestMethod -Uri "http://localhost:8000/dashboard"
```
