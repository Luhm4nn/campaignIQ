


# 📑 Guía de Comandos para CampaignIQ

## ANTES QUE NADA

Usamos Docker para evitar gestionar entornos virtuales locales. Instalen Docker Desktop y asegúrense de que esté funcionando antes de continuar.

Opcional: crear un archivo `.env` en la raíz del repo con las variables necesarias (ejemplo mínimo):

```
POSTGRES_USER=campaign_iq
POSTGRES_PASSWORD=campaign_iq
POSTGRES_DB=campaign_iq
YOUTUBE_API_KEY=
GEMINI_API_KEY=
```

## Levantar el proyecto

Desde la raíz del repo (`campaignIQ`) ejecuten:

```bash
docker compose up --build -d
```

Esto construye (si hace falta) y arranca los servicios definidos en `docker-compose.yml` (backend y base de datos). Para ver el estado:

```bash
docker compose ps
docker compose logs -f db
```

Esperen a que el servicio `db` aparezca como `healthy` antes de correr migraciones.

## Entrar al contenedor backend

La imagen puede no tener `bash`; prueben `bash` y si falla usen `sh`:

```bash
docker compose exec backend bash || docker compose exec backend sh
```

## Migraciones con Alembic

Generar migración (ejecutar dentro del contenedor `backend`):

```bash
docker compose exec backend alembic revision --autogenerate -m "mensaje de migración"
```

Aplicar migración:

```bash
docker compose exec backend alembic upgrade head
```

Alternativa: ejecutar `alembic` localmente definiendo `DATABASE_URL` apuntando al contenedor, pero el método anterior evita problemas de entorno.

## Entrar a PostgreSQL

Abrir consola psql dentro del contenedor (nota: especificar la base de datos):

```bash
docker compose exec db psql -U campaign_iq -d campaign_iq
```

Comandos útiles dentro de `psql`:

```
\dt                       -- listar tablas
\l                        -- listar bases de datos
\d nombre_tabla           -- ver columnas/estructura de una tabla
SELECT * FROM users;      -- ejemplo de consulta
\q                        -- salir
```

## Probar la API desde PowerShell

PowerShell tiene un alias `curl` que no es el binario. Usen `Invoke-RestMethod` o `curl.exe`:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"

Invoke-RestMethod -Method Post -Uri "http://localhost:8000/users" -ContentType "application/json" -Body '{"name":"Ana","email":"ana@example.com"}'

# o con curl.exe
curl.exe http://localhost:8000/health
curl.exe -X POST "http://localhost:8000/users" -H "Content-Type: application/json" -d '{"name":"Ana","email":"ana@example.com"}'
```

## Logs y debugging

Ver logs del backend y seguir en tiempo real:

```bash
docker compose logs -f backend
```

## Volúmenes y persistencia

Los datos de Postgres se guardan en un volumen Docker (definido en `docker-compose.yml` como `pgdata`). Por defecto ese volumen se almacena dentro de la VM de Docker/WSL2 (p. ej. `/var/lib/docker/volumes/<vol>/_data`).

Comandos para inspeccionar:

```bash
docker volume ls
docker volume inspect <VOLUME_NAME> --format '{{ .Mountpoint }}'
docker run --rm -v <VOLUME_NAME>:/data alpine ls -la /data
```

Si preferís ver los archivos directamente en el host, cambiá el servicio `db` en `docker-compose.yml` a un bind‑mount (no recomendado en producción por rendimiento/permiso en Windows):

```yaml
volumes:
	- ./pgdata:/var/lib/postgresql/data
```

## Backups rápidos

Crear un tar del volumen:

```bash
docker run --rm -v <VOLUME_NAME>:/data -v ${PWD}:/backup alpine sh -c "tar czf /backup/pgdata.tar.gz -C /data ."
```

## Notas finales

- Usen `docker compose` (sin guion) para compatibilidad con la versión actual.
- Esperen que la DB esté `healthy` antes de ejecutar migraciones.
- Para desarrollo local pueden ejecutar `uvicorn` fuera de Docker, pero la reproducción entre máquinas será menos consistente.

Si querés, aplico este archivo directamente al repositorio (ya lo hice). ¿Querés que añada un snippet para restaurar el backup o configurar `pgbouncer` en `docker-compose.yml`? 