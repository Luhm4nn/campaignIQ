from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.dbsession import Base
from datetime import datetime


class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    posts = relationship("Post", back_populates="campaign")


class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), index=True, nullable=False)
    external_id = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    post_date = Column(DateTime, nullable=False)
    likes = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    sentiment_compound = Column(Float, nullable=True)
    campaign = relationship("Campaign", back_populates="posts")
