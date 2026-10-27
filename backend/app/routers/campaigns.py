from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignRead,
    CampaignDetailResponse,
)
from app.services import campaigns as campaign_service

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("", response_model=List[CampaignRead])
def get_campaigns(db: Session = Depends(get_db)):
    return campaign_service.list_campaigns(db)


@router.get("/{campaign_id}", response_model=CampaignDetailResponse)
def get_campaign(campaign_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    detail = campaign_service.get_campaign_detail(db, campaign_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return detail


@router.post("", response_model=CampaignRead, status_code=201)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    return campaign_service.create_campaign(db, payload)


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
