from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.dbsession import Base


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, nullable=False, default="")
    created_at = Column(DateTime, nullable=False, default=utcnow_naive)
