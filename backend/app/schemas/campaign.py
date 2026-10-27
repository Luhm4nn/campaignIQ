from typing import Optional, List
from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = ""
    platform: str = "instagram"
    campaignType: str = "Awareness"
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    budget: float = 0.0
    followersStart: int = 0
    followersEnd: int = 0
    status: str = "active"


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None
    campaignType: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    budget: Optional[float] = None
    followersStart: Optional[int] = None
    followersEnd: Optional[int] = None
    status: Optional[str] = None


class CampaignRead(BaseModel):
    id: int
    name: str
    description: str
    platform: str
    campaignType: str
    budget: float
    followersStart: int
    followersEnd: int
    startDate: str
    endDate: Optional[str] = None
    status: str
    postsCount: int
    engagementScore: int
    growth: float
    reach: int
    impressions: int
    likes: int
    comments: int
    shares: int
    engagementRate: float


class PostCreate(BaseModel):
    campaignId: int
    content: str = Field(..., min_length=1)
    platform: Optional[str] = None
    mediaType: str = "image"
    publishedAt: Optional[str] = None
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    impressions: Optional[int] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    mediaType: Optional[str] = None
    publishedAt: Optional[str] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    reach: Optional[int] = None
    impressions: Optional[int] = None


class PostRead(BaseModel):
    id: int
    campaignId: int
    campaignName: str
    content: str
    platform: str
    mediaType: str
    publishedAt: str
    likes: int
    comments: int
    shares: int
    reach: int
    impressions: int
    engagementRate: float
    engagementScore: int
    sentimentCompound: float
    sentimentLabel: str
    performanceTier: str


class InsightRead(BaseModel):
    id: str
    type: str
    category: str
    title: str
    description: str
    metric: str
    change: Optional[float] = None
    detailedAnalysis: str
    recommendation: str
    lastAnalysis: str
    analysisFrequency: str


class DailyMetricRead(BaseModel):
    date: str
    engagement: int
    reach: int
    impressions: int


class HourlyMetricRead(BaseModel):
    hour: int
    interactions: int


class DashboardStatsRead(BaseModel):
    totalCampaigns: int
    activeCampaigns: int
    completedCampaigns: int
    draftCampaigns: int
    totalPosts: int
    totalReach: int
    totalImpressions: int
    totalLikes: int
    totalComments: int
    totalShares: int
    avgEngagementRate: float
    avgEngagementScore: int
    totalGrowth: float
    topCampaign: Optional[CampaignRead] = None


class DashboardOverviewResponse(BaseModel):
    stats: DashboardStatsRead
    campaigns: List[CampaignRead]
    posts: List[PostRead]
    insights: List[InsightRead]
    engagementOverTime: List[DailyMetricRead]
    hourlyInteractions: List[HourlyMetricRead]


class CampaignDetailResponse(BaseModel):
    campaign: CampaignRead
    posts: List[PostRead]
    insights: List[InsightRead]
    engagementOverTime: List[DailyMetricRead]
    hourlyInteractions: List[HourlyMetricRead]
