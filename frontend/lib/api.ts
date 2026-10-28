"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Campaign,
  Post,
  Insight,
  DailyMetric,
  HourlyMetric,
  DashboardStats,
  DashboardOverview,
  CampaignDetail,
  UserProfile,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  CreatePostPayload,
  UpdatePostPayload,
  IntegrationConfigRead,
  IntegrationCredentialsPayload,
  OAuthAuthorizeResponse,
  SyncIntegrationResponse,
  AuthUser,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DATA_UPDATED_EVENT = "campaign-iq:data-updated";
const AUTH_UPDATED_EVENT = "campaign-iq:auth-updated";
const ACCESS_TOKEN_STORAGE_KEY = "ciq_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "ciq_refresh_token";
const AUTH_USER_STORAGE_KEY = "ciq_auth_user";

let refreshInFlight: Promise<boolean> | null = null;

export function notifyDataUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_UPDATED_EVENT));
  }
}

export function notifyAuthUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, auth.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, auth.refreshToken);
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(auth.user));
  notifyAuthUpdated();
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  notifyAuthUpdated();
}

function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getStoredAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function doRefreshSession(): Promise<boolean> {
  try {
    const refreshToken = getStoredRefreshToken();
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken || undefined }),
    });
    if (!res.ok) {
      clearAuthSession();
      return false;
    }
    const data: AuthResponse = await res.json();
    storeAuthSession(data);
    return true;
  } catch {
    return false;
  } finally {
    refreshInFlight = null;
  }
}

export function refreshAuthSession(): Promise<boolean> {
  refreshInFlight ??= doRefreshSession();
  return refreshInFlight;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  const data: AuthResponse = await res.json();
  storeAuthSession(data);
  return data;
}

export async function registerApi(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  const data: AuthResponse = await res.json();
  storeAuthSession(data);
  return data;
}

export async function logoutApi(): Promise<void> {
  const refreshToken = getStoredRefreshToken();
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken || undefined }),
    });
  } catch {
    // ignore network failure on logout
  } finally {
    clearAuthSession();
  }
}

export async function fetchMeApi(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    const refreshed = await refreshAuthSession();
    if (!refreshed) return null;
    const retryRes = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!retryRes.ok) return null;
    const user: AuthUser = await retryRes.json();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  }
  if (!res.ok) return null;
  const user: AuthUser = await res.json();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

export const emptyStats: DashboardStats = {
  totalCampaigns: 0,
  activeCampaigns: 0,
  completedCampaigns: 0,
  draftCampaigns: 0,
  totalPosts: 0,
  totalReach: 0,
  totalImpressions: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  avgEngagementRate: 0,
  avgEngagementScore: 0,
  totalGrowth: 0,
  topCampaign: null,
};

export async function checkHealthApi(): Promise<{
  status: string;
  database: string;
}> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_BASE_URL}/dashboard`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchCampaignDetail(id: number): Promise<CampaignDetail> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function createCampaignApi(
  payload: CreateCampaignPayload
): Promise<Campaign> {
  const res = await fetch(`${API_BASE_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  notifyDataUpdated();
  return data;
}

export async function updateCampaignApi(
  id: number,
  payload: UpdateCampaignPayload
): Promise<Campaign> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  notifyDataUpdated();
  return data;
}

export async function deleteCampaignApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  notifyDataUpdated();
}

export async function fetchPostDetail(id: number): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function createPostApi(payload: CreatePostPayload): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  notifyDataUpdated();
  return data;
}

export async function updatePostApi(
  id: number,
  payload: UpdatePostPayload
): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  notifyDataUpdated();
  return data;
}

export async function deletePostApi(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  notifyDataUpdated();
}

export async function fetchUsersApi(): Promise<UserProfile[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function saveUserApi(payload: {
  name: string;
  email: string;
  company: string;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // ignore JSON parse error
  }
  return `HTTP ${res.status}`;
}

export async function fetchIntegrationsApi(): Promise<IntegrationConfigRead[]> {
  const res = await fetch(`${API_BASE_URL}/integrations`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function saveIntegrationCredentialsApi(
  provider: string,
  payload: IntegrationCredentialsPayload
): Promise<IntegrationConfigRead> {
  const res = await fetch(
    `${API_BASE_URL}/integrations/${provider}/credentials`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function getOAuthAuthorizeUrlApi(
  provider: string
): Promise<OAuthAuthorizeResponse> {
  const res = await fetch(
    `${API_BASE_URL}/integrations/${provider}/oauth/authorize`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function testIntegrationConnectionApi(provider: string): Promise<{
  ok: boolean;
  mode: string;
  accountName?: string;
  externalAccountId?: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE_URL}/integrations/${provider}/test`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function syncIntegrationPostsApi(
  provider: string,
  payload: {
    campaignId?: number;
    campaignName?: string;
    platform?: string;
  } = {}
): Promise<SyncIntegrationResponse> {
  const res = await fetch(`${API_BASE_URL}/integrations/${provider}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  const data = await res.json();
  notifyDataUpdated();
  return data;
}

export async function lookupFollowersApi(
  provider: string,
  username: string
): Promise<{
  ok: boolean;
  followers: number;
  mode?: string;
  username?: string;
  message?: string;
}> {
  const clean = username.trim().replace(/^@/, '');
  const targetUrl = API_BASE_URL + '/integrations/' + provider.toLowerCase() + '/lookup-followers?username=' + encodeURIComponent(clean);
  const res = await fetch(targetUrl);
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}

export async function disconnectIntegrationApi(
  provider: string
): Promise<IntegrationConfigRead> {
  const res = await fetch(`${API_BASE_URL}/integrations/${provider}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}


export function getExportCsvUrl(campaignId?: number): string {
  if (campaignId !== undefined) {
    return `${API_BASE_URL}/export/campaign/${campaignId}/csv`;
  }
  return `${API_BASE_URL}/export/campaigns/csv`;
}


export function useCampaignData() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [engagementOverTime, setEngagementOverTime] = useState<DailyMetric[]>([]);
  const [hourlyInteractions, setHourlyInteractions] = useState<HourlyMetric[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchDashboardOverview();
      setCampaigns(data.campaigns);
      setPosts(data.posts);
      setInsights(data.insights);
      setEngagementOverTime(data.engagementOverTime);
      setHourlyInteractions(data.hourlyInteractions);
      setStats(data.stats);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (typeof window !== "undefined") {
      window.addEventListener(DATA_UPDATED_EVENT, refresh);
      return () => window.removeEventListener(DATA_UPDATED_EVENT, refresh);
    }
  }, [refresh]);

  return {
    campaigns,
    posts,
    insights,
    engagementOverTime,
    hourlyInteractions,
    stats,
    isConnected,
    isLoading,
    error,
    refresh,
  };
}
