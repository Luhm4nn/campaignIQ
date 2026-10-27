from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserUpdate, UserRead
from app.services import users as user_service
from app.db.dbsession import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserRead)
def create_or_update_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_or_update_user(db, user_in)


@router.get("", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return user_service.get_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserRead)
def get_user_endpoint(user_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user_endpoint(
    payload: UserUpdate,
    user_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
):
    user = user_service.update_user(db, user_id, payload)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
