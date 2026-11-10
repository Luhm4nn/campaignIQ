from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.models.users import User
from app.routers.auth import get_optional_current_user
from app.schemas.campaign import InsightRead, AIExecutiveReportRead
from app.services import campaigns as campaign_service
from app.services import ai_reports as ai_service

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=List[InsightRead])
def get_insights(db: Session = Depends(get_db)):
    return campaign_service.list_insights(db)


@router.post("/ai-briefing", response_model=AIExecutiveReportRead)
def generate_workspace_ai_briefing_endpoint(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    return ai_service.generate_workspace_ai_briefing(db, user_id=user_id)
