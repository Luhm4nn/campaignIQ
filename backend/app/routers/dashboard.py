from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.schemas.campaign import DashboardOverviewResponse
from app.services import campaigns as campaign_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOverviewResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return campaign_service.get_dashboard_overview(db)
