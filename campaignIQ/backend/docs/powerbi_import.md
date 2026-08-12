# Importar CSV de ejemplo en Power BI Desktop

Este archivo explica cómo importar el CSV generado por el endpoint de ejemplo y algunas recomendaciones de visuales.

## Generar el CSV desde la API
1. Levanta el backend (por ejemplo `uvicorn app.main:app --reload --port 8000`).
2. En el navegador o con `curl`, descarga el CSV de ejemplo:

```powershell
# ejemplo
curl -o sample_campaigns.csv "http://localhost:8000/export/sample/campaigns.csv?days=30&posts_per_day=3"
```

## Abrir en Power BI Desktop
1. Abre Power BI Desktop.
2. En `Home` -> `Get Data` -> `Text/CSV` selecciona el archivo `sample_campaigns.csv`.
3. Ajusta tipos de datos si es necesario (Power BI suele detectar `post_date` como texto, conviértelo a `Date/Time`).
4. Carga los datos.

## Visuales recomendados
- **KPI**: `engagement_rate` promedio, `porcentaje_positivos` (filtrado por `sentiment_label`).
- **Gráfico de líneas**: Engagement promedio por `post_date` (agrupar por día/hora).
- **Bar chart**: Top posts por `likes` o `engagement_rate`.
- **Tabla**: Lista de publicaciones con `post_date`, `likes`, `comments`, `engagement_rate`, `sentiment_label`.
- **Segmentadores (Slicers)**: `campaign_name`, rango de fechas, `sentiment_label`.

## Siguientes pasos
- Para conectar datos reales, crea un endpoint similar que exporte desde la base de datos (`/export/campaign/{id}/csv`).
- Para actualizaciones programadas, publica el `.pbix` en Power BI Service y configura un Gateway o usa la API para push.

---
Generado automáticamente por la herramienta de soporte del proyecto.
