from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.campaigns import Post
from app.services.analytics import compute_percentile_tiers


def get_campaign_rows(db: Session, campaign_id: Optional[int] = None) -> List[Dict]:
    query = db.query(Post)
    if campaign_id is not None:
        query = query.filter(Post.campaign_id == campaign_id)

    posts = query.order_by(Post.published_at.desc(), Post.id.desc()).all()
    tiers = compute_percentile_tiers(posts)
    rows: List[Dict] = []

    for p in posts:
        rows.append({
            "campaign_id": p.campaign_id,
            "campaign_name": p.campaign.name if p.campaign else "",
            "campaign_platform": p.campaign.platform if p.campaign else p.platform,
            "campaign_status": p.campaign.status if p.campaign else "",
            "post_id": p.id,
            "platform": p.platform,
            "media_type": p.media_type,
            "published_at": (
                p.published_at.isoformat()
                if isinstance(p.published_at, datetime)
                else str(p.published_at)
            ),
            "likes": p.likes or 0,
            "comments": p.comments or 0,
            "shares": p.shares or 0,
            "reach": p.reach or 0,
            "impressions": p.impressions or 0,
            "engagement_rate": round(p.engagement_rate or 0.0, 2),
            "engagement_score": p.engagement_score or 0,
            "sentiment_compound": round(p.sentiment_compound or 0.0, 3),
            "sentiment_label": p.sentiment_label or "neutro",
            "performance_tier": tiers.get(p.id, "normal"),
        })
    return rows
