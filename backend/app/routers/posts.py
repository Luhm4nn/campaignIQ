from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.schemas.campaign import PostCreate, PostUpdate, PostRead
from app.services import campaigns as campaign_service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=List[PostRead])
def get_posts(
    campaign_id: Optional[int] = Query(None, ge=1),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return campaign_service.list_posts(db, campaign_id=campaign_id, search=search)


@router.get("/{post_id}", response_model=PostRead)
def get_post(post_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    post = campaign_service.get_post_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostRead, status_code=201)
def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    created = campaign_service.create_post(db, payload)
    if not created:
        raise HTTPException(status_code=404, detail="Target campaign not found")
    return created


@router.patch("/{post_id}", response_model=PostRead)
def update_post(
    payload: PostUpdate,
    post_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    updated = campaign_service.update_post(db, post_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated


@router.delete("/{post_id}")
def delete_post(post_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    deleted = campaign_service.delete_post(db, post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}
