# Importar CSV en Power BI Desktop

Este documento explica cómo importar los datos relacionales reales de campañas y publicaciones almacenados en PostgreSQL hacia Power BI Desktop utilizando los endpoints de exportación del backend.

## 1. Endpoints de Exportación Disponibles

Con PostgreSQL y el backend en ejecución (`http://localhost:8000`), dispones de dos rutas de exportación que consultan directamente la base de datos:

1. **Todas las campañas y publicaciones registradas**:
   `http://localhost:8000/export/campaigns/csv`
2. **Una campaña específica por su ID numérico**:
   `http://localhost:8000/export/campaign/1/csv`

Descarga desde PowerShell:

```powershell
curl.exe -o campaigns_export.csv "http://localhost:8000/export/campaigns/csv"
```

También puedes hacer clic en el botón **Export Data (CSV)** dentro de la sección **Settings** o **Export CSV** dentro del detalle de cualquier campaña en el Frontend.

## 2. Columnas del Archivo CSV Exportado

El archivo generado contiene las siguientes 18 columnas normalizadas para análisis tabular (definidas en `backend/app/routers/export.py`):

- `campaign_id`, `campaign_name`, `campaign_platform`, `campaign_status`
- `post_id`, `platform`, `media_type`, `published_at`
- `likes`, `comments`, `shares`, `reach`, `impressions`
- `engagement_rate`, `engagement_score`, `sentiment_compound`, `sentiment_label`, `performance_tier`

## 3. Conectar en Power BI Desktop

1. Abre **Power BI Desktop**.
2. Selecciona **Obtener datos (Get Data)** -> **Web** (para conectar directamente a la URL `http://localhost:8000/export/campaigns/csv`) o **Texto/CSV** (si descargaste el archivo localmente).
3. Verifica los tipos de datos en el editor de Power Query (`published_at` como Fecha/Hora, `engagement_rate` y `sentiment_compound` como Número decimal).
4. Haz clic en **Cargar**.

## 4. Visuales Recomendados

- **Tarjetas KPI**: Promedio de `engagement_rate`, total de `reach` y porcentaje de publicaciones con `sentiment_label = "positivo"`.
- **Gráfico de área o líneas**: Evolución de `likes` y `engagement_rate` por `published_at`.
- **Gráfico de barras**: Comparativa de rendimiento por `platform`, `media_type` y `campaign_name`.
- **Segmentadores (Slicers)**: Filtro por `campaign_name`, `platform`, `campaign_status`, `sentiment_label` y `performance_tier`.
