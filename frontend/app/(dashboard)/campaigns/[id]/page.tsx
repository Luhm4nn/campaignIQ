"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { TopPosts } from "@/components/dashboard/top-posts";
import { InsightCard } from "@/components/dashboard/insight-card";
import { PostFormModal } from "@/components/dashboard/post-form-modal";
import type { CampaignDetail } from "@/lib/types";
import {
  fetchCampaignDetail,
  updateCampaignApi,
  deleteCampaignApi,
  getExportCsvUrl,
} from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Target,
  TrendingUp,
  Calendar,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  tiktok: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

const platformColors: Record<string, string> = {
  twitter: "from-sky-500/20 to-sky-500/5 border-sky-500/30 text-sky-400",
  instagram: "from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400",
  linkedin: "from-blue-600/20 to-blue-600/5 border-blue-600/30 text-blue-400",
  facebook: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
  tiktok: "from-foreground/20 to-foreground/5 border-foreground/30 text-foreground",
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const campaignId = Number(id);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    if (isNaN(campaignId)) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetchCampaignDetail(campaignId);
      setDetail(res);
    } catch {
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading campaign details...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Campaign not found</p>
        <Link href="/campaigns" className="text-primary hover:underline text-sm">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const { campaign, posts, insights, engagementOverTime, hourlyInteractions } =
    detail;

  const handleStatusChange = async (newStatus: string) => {
    await updateCampaignApi(campaign.id, { status: newStatus });
    loadDetail();
  };

  const handleDeleteCampaign = async () => {
    await deleteCampaignApi(campaign.id);
    router.push("/campaigns");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {campaign.name}
              </h1>
              <select
                value={campaign.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none",
                  campaign.status === "active" &&
                    "bg-success/10 text-success border border-success/20",
                  campaign.status === "completed" &&
                    "bg-primary/10 text-primary border border-primary/20",
                  campaign.status === "paused" &&
                    "bg-warning/10 text-warning border border-warning/20",
                  campaign.status === "draft" &&
                    "bg-muted text-muted-foreground border border-border"
                )}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-gradient-to-r",
                  platformColors[campaign.platform] || platformColors.instagram
                )}
              >
                {platformIcons[campaign.platform] || platformIcons.instagram}
                <span className="capitalize font-medium">
                  {campaign.platform}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Started{" "}
                  {new Date(campaign.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleDeleteCampaign}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive hover:bg-destructive/20 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <a
              href={getExportCsvUrl(campaign.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium text-foreground hover:bg-secondary hover:border-border transition-all duration-300"
            >
              <ExternalLink className="h-4 w-4" />
              Export CSV
            </a>
            <button
              onClick={() => setPostModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-2">
          <StatsCard
            title="Likes"
            value={formatNumber(campaign.likes)}
            icon={Heart}
            variant="primary"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-2">
          <StatsCard
            title="Comments"
            value={formatNumber(campaign.comments)}
            icon={MessageCircle}
            variant="accent"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-2">
          <StatsCard
            title="Shares"
            value={formatNumber(campaign.shares)}
            icon={Share2}
            variant="warning"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Reach"
            value={formatNumber(campaign.reach)}
            icon={Eye}
            variant="success"
          />
        </div>
        <div className="col-span-12 md:col-span-12 lg:col-span-3">
          <StatsCard
            title="Engagement Rate"
            value={`${campaign.engagementRate}%`}
            change={campaign.growth}
            icon={Target}
            variant="primary"
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-12">
        <EngagementChart
          className="col-span-12 lg:col-span-7"
          data={engagementOverTime}
        />
        <HourlyChart
          className="col-span-12 lg:col-span-5"
          data={hourlyInteractions}
        />
      </div>

      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <TopPosts posts={posts} limit={10} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-5 border-b border-border/30 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    AI Recommendations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Computed from campaign posts
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {insights.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">
                  Add posts to this campaign to generate specific recommendations.
                </p>
              ) : (
                insights.slice(0, 3).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-5 border-b border-border/30">
              <h3 className="font-semibold text-foreground">
                Campaign Summary
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick overview of metrics
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Posts
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {campaign.postsCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Impressions
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatNumber(campaign.impressions)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  ${campaign.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Health Score
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${campaign.engagementScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {campaign.engagementScore}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold",
                    campaign.growth > 0
                      ? "text-success"
                      : campaign.growth < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {campaign.growth > 0 ? "+" : ""}
                  {campaign.growth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostFormModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onSaved={loadDetail}
        campaigns={[campaign]}
        defaultCampaignId={campaign.id}
      />
    </div>
  );
}
