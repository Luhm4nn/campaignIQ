from fastapi import APIRouter, Depends, Path, HTTPException
from fastapi.responses import StreamingResponse
import io, csv
from app.db.dbsession import get_db
from sqlalchemy.orm import Session
from app.services.export import get_campaign_rows

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/campaign/{campaign_id}/csv")
def export_campaign_csv(campaign_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    rows = get_campaign_rows(db, campaign_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Campaign or posts not found")

    output = io.StringIO()
    fieldnames = list(rows[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)
    output.seek(0)
    filename = f"campaign_{campaign_id}_export.csv"
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})
