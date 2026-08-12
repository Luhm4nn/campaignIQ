from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.campaigns import Post
from datetime import datetime


def get_campaign_rows(db: Session, campaign_id: int) -> List[Dict]:
    posts = db.query(Post).filter(Post.campaign_id == campaign_id).order_by(Post.post_date.desc()).all()
    rows = []
    for p in posts:
        reach = p.reach or 1
        engagement_rate = round(( (p.likes or 0) + (p.comments_count or 0) + (p.shares or 0) ) / reach * 100, 3)
        sc = p.sentiment_compound if p.sentiment_compound is not None else 0.0
        if sc >= 0.05:
            sentiment_label = "positivo"
        elif sc <= -0.05:
            sentiment_label = "negativo"
        else:
            sentiment_label = "neutro"

        rows.append({
            "campaign_id": campaign_id,
            "post_id": p.id,
            "external_id": p.external_id,
            "platform": p.platform,
            "post_date": (p.post_date.isoformat() if isinstance(p.post_date, datetime) else str(p.post_date)),
            "likes": p.likes or 0,
            "comments": p.comments_count or 0,
            "shares": p.shares or 0,
            "reach": reach,
            "engagement_rate": engagement_rate,
            "sentiment_compound": sc,
            "sentiment_label": sentiment_label,
        })
    return rows
