import io
import csv
from fastapi import APIRouter, Depends, Path
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.services.export import get_campaign_rows

router = APIRouter(prefix="/export", tags=["export"])

CSV_FIELDNAMES = [
    "campaign_id",
    "campaign_name",
    "campaign_platform",
    "campaign_status",
    "post_id",
    "platform",
    "media_type",
    "published_at",
    "likes",
    "comments",
    "shares",
    "reach",
    "impressions",
    "engagement_rate",
    "engagement_score",
    "sentiment_compound",
    "sentiment_label",
    "performance_tier",
]


@router.get("/campaigns/csv")
def export_all_campaigns_csv(db: Session = Depends(get_db)):
    rows = get_campaign_rows(db)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_FIELDNAMES)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campaigns_export.csv"},
    )


@router.get("/campaign/{campaign_id}/csv")
def export_campaign_csv(
    campaign_id: int = Path(..., ge=1), db: Session = Depends(get_db)
):
    rows = get_campaign_rows(db, campaign_id=campaign_id)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_FIELDNAMES)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    output.seek(0)
    filename = f"campaign_{campaign_id}_export.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
