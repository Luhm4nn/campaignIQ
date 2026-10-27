from typing import Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.schemas.user import UserCreate, UserUpdate


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def create_or_update_user(db: Session, user_in: UserCreate) -> User:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        existing.name = user_in.name.strip()
        existing.company = (user_in.company or "").strip()
        db.commit()
        db.refresh(existing)
        return existing

    db_user = User(
        name=user_in.name.strip(),
        email=user_in.email.strip(),
        company=(user_in.company or "").strip(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, payload: UserUpdate) -> Optional[User]:
    user = get_user(db, user_id)
    if not user:
        return None
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.email is not None:
        user.email = payload.email.strip()
    if payload.company is not None:
        user.company = payload.company.strip()
    db.commit()
    db.refresh(user)
    return user
