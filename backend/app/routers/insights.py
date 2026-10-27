from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.schemas.campaign import InsightRead
from app.services import campaigns as campaign_service

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=List[InsightRead])
def get_insights(db: Session = Depends(get_db)):
    return campaign_service.list_insights(db)
