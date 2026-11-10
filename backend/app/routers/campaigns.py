from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.models.users import User
from app.routers.auth import get_optional_current_user
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignRead,
    CampaignDetailResponse,
    AIExecutiveReportRead,
)
from app.services import campaigns as campaign_service
from app.services import ai_reports as ai_service

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("", response_model=List[CampaignRead])
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    return campaign_service.list_campaigns(db, user_id=user_id)


@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
def get_campaign(campaign_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    detail = campaign_service.get_campaign_detail(db, campaign_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return detail


@router.post("", response_model=CampaignRead, status_code=201)
def create_campaign(
    payload: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    return campaign_service.create_campaign(db, payload, user_id=user_id)


@router.patch("/{campaign_id}", response_model=CampaignRead)
def update_campaign(
    payload: CampaignUpdate,
    campaign_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    updated = campaign_service.update_campaign(db, campaign_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    deleted = campaign_service.delete_campaign(db, campaign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"ok": True}


@router.post("/{campaign_id}/ai-report", response_model=AIExecutiveReportRead)
def generate_campaign_ai_report_endpoint(
    campaign_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    return ai_service.generate_campaign_ai_report(db, campaign_id)


@router.get("/{campaign_id}/ai-report", response_model=Optional[AIExecutiveReportRead])
def get_campaign_ai_report_endpoint(
    campaign_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    return ai_service.get_campaign_ai_report(db, campaign_id)
