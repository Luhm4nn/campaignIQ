from datetime import datetime, timezone
from typing import List, Dict, Tuple
from collections import defaultdict
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from app.models.campaigns import Post
from app.schemas.campaign import (
    CampaignRead,
    PostRead,
    InsightRead,
    DailyMetricRead,
    HourlyMetricRead,
)

analyzer = SentimentIntensityAnalyzer()
analyzer.lexicon.update({
    "excelente": 3.2,
    "increible": 3.0,
    "increíble": 3.0,
    "genial": 2.8,
    "exito": 2.7,
    "éxito": 2.7,
    "mejor": 2.5,
    "bueno": 2.0,
    "buena": 2.0,
    "positivo": 2.2,
    "gracias": 2.0,
    "innovacion": 2.1,
    "innovación": 2.1,
    "crecimiento": 2.0,
    "oferta": 1.5,
    "descuento": 1.5,
    "nuevo": 1.2,
    "nueva": 1.2,
    "malo": -2.5,
    "mala": -2.5,
    "peor": -3.0,
    "error": -2.2,
    "problema": -2.0,
    "caida": -2.0,
    "caída": -2.0,
    "negativo": -2.2,
    "lento": -1.5,
    "fallo": -2.4,
})


def get_sentiment_label(compound: float) -> str:
    if compound >= 0.05:
        return "positivo"
    if compound <= -0.05:
        return "negativo"
    return "neutro"


def analyze_text_sentiment(text: str) -> Tuple[float, str]:
    if not text or not text.strip():
        return 0.0, "neutro"
    scores = analyzer.polarity_scores(text)
    compound = round(float(scores.get("compound", 0.0)), 3)
    return compound, get_sentiment_label(compound)


def calculate_post_metrics(
    content: str,
    likes: int,
    comments: int,
    shares: int,
    reach: int,
    impressions: int | None = None,
) -> Dict[str, float | int | str]:
    safe_likes = max(0, likes)
    safe_comments = max(0, comments)
    safe_shares = max(0, shares)
    safe_reach = max(0, reach)
    total_interactions = safe_likes + safe_comments + safe_shares

    if safe_reach == 0 and total_interactions > 0:
        safe_reach = total_interactions * 10

    safe_impressions = (
        max(safe_reach, impressions)
        if impressions is not None and impressions > 0
        else int(safe_reach * 1.8)
    )

    engagement_rate = (
        round((total_interactions / safe_reach) * 100.0, 2)
        if safe_reach > 0
        else 0.0
    )
    sentiment_compound, sentiment_label = analyze_text_sentiment(content)

    if safe_reach == 0 and total_interactions == 0:
        engagement_score = 0
    else:
        normalized_eng = min(100.0, engagement_rate * 8.0)
        sentiment_norm = ((sentiment_compound + 1.0) / 2.0) * 100.0
        engagement_score = min(
            100, max(1, round((normalized_eng * 0.7) + (sentiment_norm * 0.3)))
        )

    return {
        "likes": safe_likes,
        "comments": safe_comments,
        "shares": safe_shares,
        "reach": safe_reach,
        "impressions": safe_impressions,
        "engagement_rate": engagement_rate,
        "sentiment_compound": sentiment_compound,
        "sentiment_label": sentiment_label,
        "engagement_score": engagement_score,
    }


def compute_percentile_tiers(posts: List[Post]) -> Dict[int, str]:
    if not posts:
        return {}
    sorted_rates = sorted(p.engagement_rate for p in posts)
    n = len(sorted_rates)
    p33 = sorted_rates[int(n * 0.33)]
    p66 = sorted_rates[int(n * 0.66)]

    tiers: Dict[int, str] = {}
    for p in posts:
        if p.engagement_rate >= p66 and p.engagement_rate > 0:
            tiers[p.id] = "buena"
        elif p.engagement_rate >= p33 and p.engagement_rate > 0:
            tiers[p.id] = "normal"
        else:
            tiers[p.id] = "mala"
    return tiers


def compute_engagement_over_time(posts: List[Post]) -> List[DailyMetricRead]:
    if not posts:
        return []

    grouped: Dict[str, Dict[str, int]] = defaultdict(
        lambda: {"engagement": 0, "reach": 0, "impressions": 0}
    )
    for post in posts:
        dt = post.published_at if isinstance(post.published_at, datetime) else datetime.now(timezone.utc).replace(tzinfo=None)
        key = dt.strftime("%Y-%m-%d")
        grouped[key]["engagement"] += (post.likes or 0) + (post.comments or 0) + (post.shares or 0)
        grouped[key]["reach"] += post.reach or 0
        grouped[key]["impressions"] += post.impressions or 0

    result: List[DailyMetricRead] = []
    for date_key in sorted(grouped.keys()):
        dt_obj = datetime.strptime(date_key, "%Y-%m-%d")
        label = dt_obj.strftime("%d %b")
        metrics = grouped[date_key]
        result.append(
            DailyMetricRead(
                date=label,
                engagement=metrics["engagement"],
                reach=metrics["reach"],
                impressions=metrics["impressions"],
            )
        )
    return result


def compute_hourly_interactions(posts: List[Post]) -> List[HourlyMetricRead]:
    hourly_totals: Dict[int, int] = {h: 0 for h in range(24)}
    for post in posts:
        dt = post.published_at if isinstance(post.published_at, datetime) else datetime.now(timezone.utc).replace(tzinfo=None)
        interactions = (post.likes or 0) + (post.comments or 0) + (post.shares or 0)
        hourly_totals[dt.hour] += interactions

    return [
        HourlyMetricRead(hour=h, interactions=hourly_totals[h])
        for h in range(24)
    ]


def generate_dynamic_insights(
    campaigns: List[CampaignRead],
    posts: List[PostRead],
) -> List[InsightRead]:
    insights: List[InsightRead] = []
    now_label = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    if not campaigns and not posts:
        return insights

    if posts:
        hourly: Dict[int, List[int]] = defaultdict(list)
        for p in posts:
            try:
                dt = datetime.fromisoformat(p.publishedAt.replace("Z", ""))
                hourly[dt.hour].append(p.likes + p.comments + p.shares)
            except ValueError:
                continue

        if hourly:
            avg_by_hour = {
                h: sum(vals) / len(vals) for h, vals in hourly.items() if vals
            }
            best_hour = max(avg_by_hour, key=avg_by_hour.get)
            overall_avg = sum(avg_by_hour.values()) / max(1, len(avg_by_hour))
            diff_pct = (
                round(((avg_by_hour[best_hour] - overall_avg) / overall_avg) * 100, 1)
                if overall_avg > 0
                else 0.0
            )
            window_str = f"{best_hour:02d}:00 - {(best_hour + 1) % 24:02d}:00"
            insights.append(
                InsightRead(
                    id="insight-optimal-hour",
                    type="success",
                    category="Performance",
                    title="Optimal Posting Window",
                    description=f"Posts published around {window_str} generate the highest average interactions ({int(avg_by_hour[best_hour])} per post).",
                    metric=window_str,
                    change=diff_pct,
                    detailedAnalysis=f"Based on {len(posts)} published posts in the database, the {window_str} slot outperforms the average hourly interaction rate by {diff_pct}%.",
                    recommendation=f"Prioritize scheduling high-impact publications within the {window_str} window to maximize organic reach.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time on post updates",
                )
            )

        format_rates: Dict[str, List[float]] = defaultdict(list)
        for p in posts:
            format_rates[p.mediaType].append(p.engagementRate)

        if format_rates:
            avg_format = {
                fmt: sum(vals) / len(vals) for fmt, vals in format_rates.items()
            }
            best_fmt = max(avg_format, key=avg_format.get)
            worst_fmt = min(avg_format, key=avg_format.get)
            best_val = round(avg_format[best_fmt], 2)
            gain = (
                round(((avg_format[best_fmt] - avg_format[worst_fmt]) / max(0.1, avg_format[worst_fmt])) * 100, 1)
                if len(avg_format) > 1 and avg_format[worst_fmt] > 0
                else best_val
            )
            insights.append(
                InsightRead(
                    id="insight-content-format",
                    type="tip",
                    category="Content Strategy",
                    title=f"Best Format: {best_fmt.capitalize()}",
                    description=f"Content in '{best_fmt}' format achieves an average engagement rate of {best_val}% across your campaigns.",
                    metric=f"{best_val}% ER",
                    change=gain,
                    detailedAnalysis=f"Comparing {len(format_rates)} active media types across {len(posts)} posts, '{best_fmt}' leads interaction efficiency.",
                    recommendation=f"Increase the proportion of '{best_fmt}' publications in upcoming campaigns to raise overall campaign health scores.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time",
                )
            )

        positive_posts = [p for p in posts if p.sentimentLabel == "positivo"]
        negative_posts = [p for p in posts if p.sentimentLabel == "negativo"]
        pos_pct = round((len(positive_posts) / len(posts)) * 100, 1)
        neg_pct = round((len(negative_posts) / len(posts)) * 100, 1)

        if pos_pct >= 50.0:
            insights.append(
                InsightRead(
                    id="insight-sentiment-health",
                    type="success",
                    category="Sentiment",
                    title="Positive Audience Sentiment",
                    description=f"{pos_pct}% of your analyzed posts register a positive VADER compound score.",
                    metric=f"{pos_pct}% Positive",
                    change=pos_pct,
                    detailedAnalysis=f"Out of {len(posts)} posts analyzed with VADER NLP, {len(positive_posts)} are positive, {len(posts) - len(positive_posts) - len(negative_posts)} neutral, and {len(negative_posts)} negative.",
                    recommendation="Maintain the current tone and value proposition in your copywriting, as it resonates positively with your audience.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time VADER NLP",
                )
            )
        else:
            insights.append(
                InsightRead(
                    id="insight-sentiment-alert",
                    type="warning",
                    category="Sentiment",
                    title="Sentiment Optimization Needed",
                    description=f"Only {pos_pct}% of posts score as positive ({neg_pct}% negative). Copywriting tone can be improved.",
                    metric=f"{pos_pct}% Positive",
                    change=-neg_pct,
                    detailedAnalysis=f"VADER sentiment analysis detected {len(negative_posts)} negative and {len(posts) - len(positive_posts) - len(negative_posts)} neutral publications out of {len(posts)} total.",
                    recommendation="Incorporate more action-oriented, benefit-driven language in your post descriptions to improve audience reception.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time VADER NLP",
                )
            )

    if campaigns:
        plat_reach: Dict[str, int] = defaultdict(int)
        plat_rates: Dict[str, List[float]] = defaultdict(list)
        for c in campaigns:
            plat_reach[c.platform] += c.reach
            if c.engagementRate > 0:
                plat_rates[c.platform].append(c.engagementRate)

        if plat_rates:
            avg_plat = {pl: sum(v) / len(v) for pl, v in plat_rates.items()}
            top_plat = max(avg_plat, key=avg_plat.get)
            top_plat_er = round(avg_plat[top_plat], 2)
            insights.append(
                InsightRead(
                    id="insight-platform-leader",
                    type="info",
                    category="Platform",
                    title=f"Leading Channel: {top_plat.capitalize()}",
                    description=f"{top_plat.capitalize()} delivers an average engagement rate of {top_plat_er}% with {plat_reach[top_plat]:,} total reach.",
                    metric=top_plat.capitalize(),
                    change=top_plat_er,
                    detailedAnalysis=f"Across {len(campaigns)} campaigns, {top_plat.capitalize()} shows the strongest conversion of reach into active interactions.",
                    recommendation=f"Consider allocating a larger share of your budget toward {top_plat.capitalize()} campaigns.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time",
                )
            )

        empty_or_draft = [c for c in campaigns if c.postsCount == 0 or c.status == "draft"]
        if empty_or_draft:
            names = ", ".join(c.name for c in empty_or_draft[:3])
            insights.append(
                InsightRead(
                    id="insight-campaigns-attention",
                    type="warning",
                    category="Operations",
                    title="Campaigns Without Active Content",
                    description=f"{len(empty_or_draft)} campaign(s) ({names}) are in draft status or have 0 published posts.",
                    metric=f"{len(empty_or_draft)} pending",
                    change=-float(len(empty_or_draft)),
                    detailedAnalysis=f"Campaigns without published posts have a health score of 0 and do not contribute to organic reach or engagement metrics.",
                    recommendation="Publish initial content to these campaigns or update their status to start tracking performance.",
                    lastAnalysis=now_label,
                    analysisFrequency="Real-time",
                )
            )

    return insights
