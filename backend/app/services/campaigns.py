from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.campaigns import Campaign, Post
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignRead,
    CampaignDetailResponse,
    PostCreate,
    PostUpdate,
    PostRead,
    InsightRead,
    DashboardStatsRead,
    DashboardOverviewResponse,
)
from app.services.analytics import (
    calculate_post_metrics,
    compute_percentile_tiers,
    compute_engagement_over_time,
    compute_hourly_interactions,
    generate_dynamic_insights,
)


def parse_iso_datetime(value: Optional[str], fallback: Optional[datetime] = None) -> Optional[datetime]:
    if not value or not value.strip():
        return fallback
    try:
        return datetime.fromisoformat(value.replace("Z", ""))
    except ValueError:
        return fallback


def serialize_post(post: Post, tier: str = "normal") -> PostRead:
    published_str = (
        post.published_at.strftime("%Y-%m-%dT%H:%M:%SZ")
        if isinstance(post.published_at, datetime)
        else str(post.published_at)
    )
    campaign_name = post.campaign.name if post.campaign else f"Campaign #{post.campaign_id}"
    return PostRead(
        id=post.id,
        campaignId=post.campaign_id,
        campaignName=campaign_name,
        content=post.content,
        platform=(post.platform or "instagram").lower(),
        mediaType=(post.media_type or "image").lower(),
        publishedAt=published_str,
        likes=post.likes or 0,
        comments=post.comments or 0,
        shares=post.shares or 0,
        reach=post.reach or 0,
        impressions=post.impressions or 0,
        engagementRate=round(post.engagement_rate or 0.0, 2),
        engagementScore=post.engagement_score or 0,
        sentimentCompound=round(post.sentiment_compound or 0.0, 3),
        sentimentLabel=post.sentiment_label or "neutro",
        performanceTier=tier,
        externalId=getattr(post, "external_id", None),
        permalink=getattr(post, "permalink", None),
    )


def serialize_campaign(campaign: Campaign) -> CampaignRead:
    posts = campaign.posts or []
    posts_count = len(posts)
    likes = sum(p.likes or 0 for p in posts)
    comments = sum(p.comments or 0 for p in posts)
    shares = sum(p.shares or 0 for p in posts)
    reach = sum(p.reach or 0 for p in posts)
    impressions = sum(p.impressions or 0 for p in posts)
    total_interactions = likes + comments + shares

    engagement_rate = (
        round((total_interactions / reach) * 100.0, 2) if reach > 0 else 0.0
    )

    if posts_count == 0:
        engagement_score = 0
    else:
        positive_count = sum(1 for p in posts if p.sentiment_label == "positivo")
        positive_pct = (positive_count / posts_count) * 100.0
        normalized_eng = min(100.0, engagement_rate * 8.0)
        engagement_score = min(
            100, max(1, round((normalized_eng * 0.6) + (positive_pct * 0.4)))
        )

    if (campaign.followers_start or 0) > 0 and (campaign.followers_end or 0) > 0:
        growth = round(
            ((campaign.followers_end - campaign.followers_start) / campaign.followers_start)
            * 100.0,
            1,
        )
    elif posts_count >= 2:
        ordered = sorted(posts, key=lambda x: x.published_at or datetime.min)
        mid = max(1, posts_count // 2)
        first_half = ordered[:mid]
        second_half = ordered[mid:]
        first_avg = sum((p.likes + p.comments + p.shares) for p in first_half) / len(first_half)
        second_avg = sum((p.likes + p.comments + p.shares) for p in second_half) / len(second_half)
        growth = (
            round(((second_avg - first_avg) / first_avg) * 100.0, 1)
            if first_avg > 0
            else 0.0
        )
    else:
        growth = 0.0

    start_str = (
        campaign.start_date.strftime("%Y-%m-%d")
        if isinstance(campaign.start_date, datetime)
        else str(campaign.start_date or "")
    )
    end_str = (
        campaign.end_date.strftime("%Y-%m-%d")
        if isinstance(campaign.end_date, datetime)
        else (str(campaign.end_date) if campaign.end_date else None)
    )

    return CampaignRead(
        id=campaign.id,
        name=campaign.name,
        description=campaign.description or "",
        platform=(campaign.platform or "instagram").lower(),
        campaignType=campaign.campaign_type or "Awareness",
        budget=round(campaign.budget or 0.0, 2),
        followersStart=campaign.followers_start or 0,
        followersEnd=campaign.followers_end or 0,
        startDate=start_str,
        endDate=end_str,
        status=(campaign.status or "active").lower(),
        postsCount=posts_count,
        engagementScore=engagement_score,
        growth=growth,
        reach=reach,
        impressions=impressions,
        likes=likes,
        comments=comments,
        shares=shares,
        engagementRate=engagement_rate,
        externalId=getattr(campaign, "external_id", None),
        targetKeywords=getattr(campaign, "target_keywords", None),
    )


def list_campaigns(db: Session) -> List[CampaignRead]:
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc(), Campaign.id.desc()).all()
    return [serialize_campaign(c) for c in campaigns]


def get_campaign_by_id(db: Session, campaign_id: int) -> Optional[Campaign]:
    return db.query(Campaign).filter(Campaign.id == campaign_id).first()


def get_campaign_detail(db: Session, campaign_id: int) -> Optional[CampaignDetailResponse]:
    campaign = get_campaign_by_id(db, campaign_id)
    if not campaign:
        return None
    campaign_read = serialize_campaign(campaign)
    posts = campaign.posts or []
    tiers = compute_percentile_tiers(posts)
    posts_read = [serialize_post(p, tiers.get(p.id, "normal")) for p in posts]
    insights = generate_dynamic_insights([campaign_read], posts_read)
    return CampaignDetailResponse(
        campaign=campaign_read,
        posts=posts_read,
        insights=insights,
        engagementOverTime=compute_engagement_over_time(posts),
        hourlyInteractions=compute_hourly_interactions(posts),
    )


def create_campaign(db: Session, payload: CampaignCreate) -> CampaignRead:
    start_dt = parse_iso_datetime(
        payload.startDate,
        fallback=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    end_dt = parse_iso_datetime(payload.endDate, fallback=None)

    campaign = Campaign(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else "",
        platform=payload.platform.strip().lower(),
        campaign_type=payload.campaignType.strip() if payload.campaignType else "Awareness",
        status=payload.status.strip().lower() if payload.status else "active",
        budget=max(0.0, payload.budget or 0.0),
        followers_start=max(0, payload.followersStart or 0),
        followers_end=max(0, payload.followersEnd or 0),
        start_date=start_dt,
        end_date=end_dt,
        external_id=payload.externalId.strip() if payload.externalId else None,
        target_keywords=payload.targetKeywords.strip() if payload.targetKeywords else None,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    # Automatic scraping trigger if targetHandle or name contains @handle (skip when called from sync_integration_posts itself)
    is_internal_sync = bool(payload.externalId and payload.externalId.startswith("live_"))
    handle_to_scrape = (payload.targetHandle or "").strip()
    if not handle_to_scrape and "@" in payload.name and not is_internal_sync:
        for word in payload.name.split():
            if word.startswith("@") and len(word) > 1:
                handle_to_scrape = word
                break

    if handle_to_scrape and not is_internal_sync and campaign.platform in ("youtube", "twitter", "instagram", "tiktok"):
        try:
            from app.services.integrations import sync_integration_posts
            from app.schemas.integration import SyncRequest
            sync_integration_posts(
                db,
                provider=campaign.platform,
                payload=SyncRequest(
                    campaignId=campaign.id,
                    campaignName=handle_to_scrape,
                    platform=campaign.platform,
                ),
            )
            db.refresh(campaign)
        except Exception as e:
            # Continue gracefully even if immediate scrape fails
            pass

    return serialize_campaign(campaign)



def update_campaign(
    db: Session, campaign_id: int, payload: CampaignUpdate
) -> Optional[CampaignRead]:
    campaign = get_campaign_by_id(db, campaign_id)
    if not campaign:
        return None

    if payload.name is not None:
        campaign.name = payload.name.strip()
    if payload.description is not None:
        campaign.description = payload.description.strip()
    if payload.platform is not None:
        campaign.platform = payload.platform.strip().lower()
    if payload.campaignType is not None:
        campaign.campaign_type = payload.campaignType.strip()
    if payload.status is not None:
        campaign.status = payload.status.strip().lower()
    if payload.budget is not None:
        campaign.budget = max(0.0, payload.budget)
    if payload.followersStart is not None:
        campaign.followers_start = max(0, payload.followersStart)
    if payload.followersEnd is not None:
        campaign.followers_end = max(0, payload.followersEnd)
    if payload.startDate is not None:
        parsed_start = parse_iso_datetime(payload.startDate)
        if parsed_start:
            campaign.start_date = parsed_start
    if payload.endDate is not None:
        campaign.end_date = parse_iso_datetime(payload.endDate)
    if payload.targetKeywords is not None:
        campaign.target_keywords = payload.targetKeywords.strip() if payload.targetKeywords else None

    db.commit()
    db.refresh(campaign)
    return serialize_campaign(campaign)


def delete_campaign(db: Session, campaign_id: int) -> bool:
    campaign = get_campaign_by_id(db, campaign_id)
    if not campaign:
        return False
    db.delete(campaign)
    db.commit()
    return True


def list_posts(
    db: Session,
    campaign_id: Optional[int] = None,
    search: Optional[str] = None,
) -> List[PostRead]:
    query = db.query(Post)
    if campaign_id is not None:
        query = query.filter(Post.campaign_id == campaign_id)
    if search and search.strip():
        query = query.filter(Post.content.ilike(f"%{search.strip()}%"))

    posts = query.order_by(Post.published_at.desc(), Post.id.desc()).all()
    tiers = compute_percentile_tiers(posts)
    return [serialize_post(p, tiers.get(p.id, "normal")) for p in posts]


def get_post_by_id(db: Session, post_id: int) -> Optional[PostRead]:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    campaign_posts = (
        db.query(Post).filter(Post.campaign_id == post.campaign_id).all()
    )
    tiers = compute_percentile_tiers(campaign_posts)
    return serialize_post(post, tiers.get(post.id, "normal"))


def create_post(db: Session, payload: PostCreate) -> Optional[PostRead]:
    campaign = get_campaign_by_id(db, payload.campaignId)
    if not campaign:
        return None

    published_dt = parse_iso_datetime(
        payload.publishedAt,
        fallback=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    platform = (payload.platform or campaign.platform or "instagram").strip().lower()
    media_type = (payload.mediaType or "image").strip().lower()

    metrics = calculate_post_metrics(
        content=payload.content,
        likes=payload.likes,
        comments=payload.comments,
        shares=payload.shares,
        reach=payload.reach,
        impressions=payload.impressions,
    )

    external_id = payload.externalId.strip() if payload.externalId else None
    permalink = payload.permalink.strip() if payload.permalink else None

    if external_id:
        existing_post = (
            db.query(Post)
            .filter(Post.campaign_id == campaign.id, Post.external_id == external_id)
            .first()
        )
        if existing_post:
            existing_post.content = payload.content.strip()
            existing_post.platform = platform
            existing_post.media_type = media_type
            existing_post.published_at = published_dt
            existing_post.likes = int(metrics["likes"])
            existing_post.comments = int(metrics["comments"])
            existing_post.shares = int(metrics["shares"])
            existing_post.reach = int(metrics["reach"])
            existing_post.impressions = int(metrics["impressions"])
            existing_post.engagement_rate = float(metrics["engagement_rate"])
            existing_post.sentiment_compound = float(metrics["sentiment_compound"])
            existing_post.sentiment_label = str(metrics["sentiment_label"])
            existing_post.engagement_score = int(metrics["engagement_score"])
            if permalink:
                existing_post.permalink = permalink
            db.commit()
            db.refresh(existing_post)
            return get_post_by_id(db, existing_post.id)

    post = Post(
        campaign_id=campaign.id,
        external_id=external_id,
        permalink=permalink,
        content=payload.content.strip(),
        platform=platform,
        media_type=media_type,
        published_at=published_dt,
        likes=int(metrics["likes"]),
        comments=int(metrics["comments"]),
        shares=int(metrics["shares"]),
        reach=int(metrics["reach"]),
        impressions=int(metrics["impressions"]),
        engagement_rate=float(metrics["engagement_rate"]),
        sentiment_compound=float(metrics["sentiment_compound"]),
        sentiment_label=str(metrics["sentiment_label"]),
        engagement_score=int(metrics["engagement_score"]),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return get_post_by_id(db, post.id)



def update_post(
    db: Session, post_id: int, payload: PostUpdate
) -> Optional[PostRead]:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    content = payload.content.strip() if payload.content is not None else post.content
    likes = payload.likes if payload.likes is not None else post.likes
    comments = payload.comments if payload.comments is not None else post.comments
    shares = payload.shares if payload.shares is not None else post.shares
    reach = payload.reach if payload.reach is not None else post.reach
    impressions = payload.impressions if payload.impressions is not None else post.impressions

    if payload.mediaType is not None:
        post.media_type = payload.mediaType.strip().lower()
    if payload.publishedAt is not None:
        parsed_pub = parse_iso_datetime(payload.publishedAt)
        if parsed_pub:
            post.published_at = parsed_pub

    metrics = calculate_post_metrics(
        content=content,
        likes=likes,
        comments=comments,
        shares=shares,
        reach=reach,
        impressions=impressions,
    )

    post.content = content
    post.likes = int(metrics["likes"])
    post.comments = int(metrics["comments"])
    post.shares = int(metrics["shares"])
    post.reach = int(metrics["reach"])
    post.impressions = int(metrics["impressions"])
    post.engagement_rate = float(metrics["engagement_rate"])
    post.sentiment_compound = float(metrics["sentiment_compound"])
    post.sentiment_label = str(metrics["sentiment_label"])
    post.engagement_score = int(metrics["engagement_score"])

    db.commit()
    db.refresh(post)
    return get_post_by_id(db, post.id)


def delete_post(db: Session, post_id: int) -> bool:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False
    db.delete(post)
    db.commit()
    return True


def list_insights(db: Session) -> List[InsightRead]:
    campaigns = list_campaigns(db)
    posts = list_posts(db)
    return generate_dynamic_insights(campaigns, posts)


def get_dashboard_overview(db: Session) -> DashboardOverviewResponse:
    campaigns = list_campaigns(db)
    all_posts_orm = db.query(Post).order_by(Post.published_at.desc(), Post.id.desc()).all()
    tiers = compute_percentile_tiers(all_posts_orm)
    posts = [serialize_post(p, tiers.get(p.id, "normal")) for p in all_posts_orm]
    insights = generate_dynamic_insights(campaigns, posts)

    active_campaigns = sum(1 for c in campaigns if c.status == "active")
    completed_campaigns = sum(1 for c in campaigns if c.status == "completed")
    draft_campaigns = sum(1 for c in campaigns if c.status == "draft")

    total_reach = sum(c.reach for c in campaigns)
    total_impressions = sum(c.impressions for c in campaigns)
    total_likes = sum(c.likes for c in campaigns)
    total_comments = sum(c.comments for c in campaigns)
    total_shares = sum(c.shares for c in campaigns)

    active_or_completed = [c for c in campaigns if c.status != "draft" and c.postsCount > 0]
    avg_eng_rate = (
        round(
            sum(c.engagementRate for c in active_or_completed) / len(active_or_completed),
            2,
        )
        if active_or_completed
        else 0.0
    )
    avg_eng_score = (
        round(sum(c.engagementScore for c in campaigns) / len(campaigns))
        if campaigns
        else 0
    )
    total_growth = (
        round(
            sum(c.growth for c in active_or_completed) / len(active_or_completed),
            1,
        )
        if active_or_completed
        else 0.0
    )
    top_campaign = (
        max(campaigns, key=lambda c: (c.engagementScore, c.engagementRate))
        if campaigns
        else None
    )

    stats = DashboardStatsRead(
        totalCampaigns=len(campaigns),
        activeCampaigns=active_campaigns,
        completedCampaigns=completed_campaigns,
        draftCampaigns=draft_campaigns,
        totalPosts=len(posts),
        totalReach=total_reach,
        totalImpressions=total_impressions,
        totalLikes=total_likes,
        totalComments=total_comments,
        totalShares=total_shares,
        avgEngagementRate=avg_eng_rate,
        avgEngagementScore=avg_eng_score,
        totalGrowth=total_growth,
        topCampaign=top_campaign,
    )

    return DashboardOverviewResponse(
        stats=stats,
        campaigns=campaigns,
        posts=posts,
        insights=insights,
        engagementOverTime=compute_engagement_over_time(all_posts_orm),
        hourlyInteractions=compute_hourly_interactions(all_posts_orm),
    )
