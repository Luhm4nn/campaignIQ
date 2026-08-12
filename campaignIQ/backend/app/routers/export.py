from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
import io
import csv
from datetime import datetime, timedelta

router = APIRouter(prefix="/export", tags=["export"])


def generate_sample_campaign_rows(days: int = 14, posts_per_day: int = 3):
    """Genera filas de ejemplo para un dataset de campaña."""
    rows = []
    base_date = datetime.utcnow()
    campaign_id = 1
    campaign_name = "Campaña Ejemplo"

    post_counter = 1
    for d in range(days):
        day = base_date - timedelta(days=d)
        for p in range(posts_per_day):
            post_id = post_counter
            post_date = (day - timedelta(minutes=30 * p)).isoformat()
            likes = max(0, 100 + (p * 10) - d * 2)
            comments = max(0, 10 + p - int(d / 3))
            shares = max(0, 5 + int(p / 2))
            reach = max(1, 1000 + (p * 50) - d * 10)
            engagement_rate = round((likes + comments + shares) / reach * 100, 3)
            sentiment_compound = round((-0.5 + (p * 0.25) + (d % 3) * 0.1), 3)
            if sentiment_compound >= 0.05:
                sentiment_label = "positivo"
            elif sentiment_compound <= -0.05:
                sentiment_label = "negativo"
            else:
                sentiment_label = "neutro"

            rows.append({
                "campaign_id": campaign_id,
                "campaign_name": campaign_name,
                "post_id": post_id,
                "post_date": post_date,
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "reach": reach,
                "engagement_rate": engagement_rate,
                "sentiment_compound": sentiment_compound,
                "sentiment_label": sentiment_label,
            })

            post_counter += 1

    return rows


@router.get("/sample/campaigns.csv")
def download_sample_campaign_csv(days: int = Query(14, ge=1, le=365), posts_per_day: int = Query(3, ge=1, le=24)):
    """Devuelve un CSV en memoria con datos de ejemplo para importar en Power BI Desktop.

    Parámetros:
    - `days`: cantidad de días históricos a generar
    - `posts_per_day`: cantidad de posts por día
    """
    rows = generate_sample_campaign_rows(days=days, posts_per_day=posts_per_day)

    output = io.StringIO()
    fieldnames = [
        "campaign_id",
        "campaign_name",
        "post_id",
        "post_date",
        "likes",
        "comments",
        "shares",
        "reach",
        "engagement_rate",
        "sentiment_compound",
        "sentiment_label",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)

    output.seek(0)
    filename = f"sample_campaigns_{datetime.utcnow().date().isoformat()}.csv"
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})
