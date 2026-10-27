from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.dbsession import Base


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class IntegrationConfig(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False, default="")
    client_id_encrypted = Column(String, nullable=False, default="")
    client_id_hash = Column(String, index=True, nullable=False, default="")
    client_secret_encrypted = Column(String, nullable=False, default="")
    access_token_encrypted = Column(String, nullable=False, default="")
    external_account_id = Column(String, index=True, nullable=False, default="")
    external_account_name = Column(String, nullable=False, default="")
    status = Column(String, nullable=False, default="disconnected")
    oauth_state = Column(String, index=True, nullable=True)
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utcnow_naive)
    updated_at = Column(DateTime, nullable=False, default=utcnow_naive, onupdate=utcnow_naive)
