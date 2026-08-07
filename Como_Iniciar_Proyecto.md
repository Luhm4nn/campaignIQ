


# 📑 Guía de Comandos para CampaignIQ

## ANTES QUE NADA 

Reemplace los entornos virtuales por docker que es mas practico.
Instalan docker, siguen las intrucciones y listo, hace que no se necesite instalar ni configurar nada. 

##  Levantar el proyecto (hay que abrir Docker desktop)

Dejan abierto docker desktop y en una terminar (estando situados en campaignIQ) y ejecutan:

docker compose up -d

Inicia todos los servicios definidos en docker-compose.yml (backend y base de datos).

## Entrar al contenedor backend

Ejecutan:

docker compose exec backend bash

Accede al contenedor del backend para correr comandos de Python/Alembic.

## Migraciones con Alembic

Generar migración

Ejecutan:

alembic revision --autogenerate -m "mensaje de migración"

Crea un archivo en migrations/versions con los cambios detectados en los modelos.

## Aplicar migración


alembic upgrade head

Aplica la última migración a la base de datos.

## Entrar a PostgreSQL

docker compose exec db psql -U campaign_iq -d 

Abre la consola de PostgreSQL dentro del contenedor de la base de datos.

## Comandos dentro de psql
Listar tablas


\dt
Ver bases de datos


\l
Ver columnas de una tabla


\d nombre_tabla
Ejecutar consulta


SELECT * FROM users;
Salir de psql


\q