export type PlatformType =
  | "youtube"
  | "twitter"
  | "instagram"
  | "tiktok";

export type CampaignStatus =
  | "active"
  | "completed"
  | "paused"
  | "draft"
  | "scheduled";

export type MediaType = "image" | "video" | "text" | "carousel";

export type InsightType = "success" | "warning" | "info" | "tip";

export interface Campaign {
  id: number;
  name: string;
  description: string;
  platform: PlatformType;
  campaignType: string;
  budget: number;
  followersStart: number;
  followersEnd: number;
  startDate: string;
  endDate?: string | null;
  status: CampaignStatus;
  postsCount: number;
  engagementScore: number;
  growth: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  externalId?: string | null;
  targetKeywords?: string | null;
}

export interface Post {
  id: number;
  campaignId: number;
  campaignName: string;
  content: string;
  platform: PlatformType;
  mediaType: MediaType;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  engagementScore: number;
  sentimentCompound: number;
  sentimentLabel: "positivo" | "neutro" | "negativo";
  performanceTier: "buena" | "normal" | "mala";
  externalId?: string | null;
  permalink?: string | null;
}

export interface DailyMetric {
  date: string;
  engagement: number;
  reach: number;
  impressions: number;
}

export interface HourlyMetric {
  hour: number;
  interactions: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  category: string;
  title: string;
  description: string;
  metric: string;
  change?: number | null;
  detailedAnalysis: string;
  recommendation: string;
  lastAnalysis: string;
  analysisFrequency: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  draftCampaigns: number;
  totalPosts: number;
  totalReach: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  avgEngagementScore: number;
  totalGrowth: number;
  topCampaign: Campaign | null;
}

export interface DashboardOverview {
  stats: DashboardStats;
  campaigns: Campaign[];
  posts: Post[];
  insights: Insight[];
  engagementOverTime: DailyMetric[];
  hourlyInteractions: HourlyMetric[];
}

export interface CampaignDetail {
  campaign: Campaign;
  posts: Post[];
  insights: Insight[];
  engagementOverTime: DailyMetric[];
  hourlyInteractions: HourlyMetric[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  company: string;
  username?: string | null;
  plan?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  username?: string | null;
  company: string;
  plan: string;
  isActive: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  company?: string;
  username?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface CreateCampaignPayload {
  name: string;
  description: string;
  platform: string;
  campaignType: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  followersStart?: number;
  followersEnd?: number;
  status: string;
  externalId?: string;
  targetHandle?: string;
  targetKeywords?: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  platform?: string;
  campaignType?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  followersStart?: number;
  followersEnd?: number;
  status?: string;
  targetKeywords?: string;
}

export interface CreatePostPayload {
  campaignId: number;
  content: string;
  platform?: string;
  mediaType: string;
  publishedAt?: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions?: number;
  externalId?: string;
  permalink?: string;
}

export interface UpdatePostPayload {
  content?: string;
  mediaType?: string;
  publishedAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
}

export interface IntegrationConfigRead {
  id: number;
  provider: string;
  displayName: string;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasAccessToken: boolean;
  clientIdMasked: string;
  clientSecretMasked: string;
  accessTokenMasked: string;
  clientIdHash: string;
  externalAccountId: string;
  externalAccountName: string;
  status: "connected" | "configured" | "disconnected" | string;
  lastSyncAt?: string | null;
  oauthCallbackUrl: string;
}

export interface IntegrationCredentialsPayload {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  externalAccountId?: string;
  externalAccountName?: string;
}

export interface OAuthAuthorizeResponse {
  provider: string;
  authUrl: string;
  mode: string;
  state: string;
}

export interface SyncIntegrationResponse {
  provider: string;
  campaignId: number;
  campaignName: string;
  importedPosts: number;
  updatedPosts: number;
  sourceMode: string;
  message: string;
}

