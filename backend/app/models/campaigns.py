from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.dbsession import Base


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False, default="")
    platform = Column(String, nullable=False, default="instagram")
    campaign_type = Column(String, nullable=False, default="Awareness")
    status = Column(String, nullable=False, default="active")
    budget = Column(Float, nullable=False, default=0.0)
    followers_start = Column(Integer, nullable=False, default=0)
    followers_end = Column(Integer, nullable=False, default=0)
    start_date = Column(DateTime, nullable=False, default=utcnow_naive)
    end_date = Column(DateTime, nullable=True)
    external_id = Column(String, index=True, nullable=True)
    target_keywords = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=utcnow_naive)

    posts = relationship(
        "Post",
        back_populates="campaign",
        cascade="all, delete-orphan",
        order_by="Post.published_at.desc()",
    )


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    external_id = Column(String, index=True, nullable=True)
    permalink = Column(String, nullable=True)
    content = Column(String, nullable=False)
    platform = Column(String, nullable=False, default="instagram")
    media_type = Column(String, nullable=False, default="image")
    published_at = Column(DateTime, nullable=False, default=utcnow_naive)
    likes = Column(Integer, nullable=False, default=0)
    comments = Column(Integer, nullable=False, default=0)
    shares = Column(Integer, nullable=False, default=0)
    reach = Column(Integer, nullable=False, default=0)
    impressions = Column(Integer, nullable=False, default=0)
    sentiment_compound = Column(Float, nullable=False, default=0.0)
    sentiment_label = Column(String, nullable=False, default="neutro")
    engagement_rate = Column(Float, nullable=False, default=0.0)
    engagement_score = Column(Integer, nullable=False, default=0)

    campaign = relationship("Campaign", back_populates="posts")

