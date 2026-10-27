"use client";

import { DashboardSkeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { formatNumber } from "@/lib/utils";
import { useCampaignData } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  tiktok: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

export default function AnalyticsPage() {
  const {
    campaigns,
    posts,
    stats,
    engagementOverTime,
    hourlyInteractions,
    isLoading,
  } = useCampaignData();

  const totalInteractions =
    stats.totalLikes + stats.totalComments + stats.totalShares;

  const platformStats = campaigns.reduce((acc, campaign) => {
    if (!acc[campaign.platform]) {
      acc[campaign.platform] = { count: 0, reach: 0, engagement: 0 };
    }
    acc[campaign.platform].count++;
    acc[campaign.platform].reach += campaign.reach;
    acc[campaign.platform].engagement += campaign.engagementScore;
    return acc;
  }, {} as Record<string, { count: number; reach: number; engagement: number }>);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Performance Telemetry
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Deep dive into your campaign performance metrics, platform reach, and hourly engagement windows.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Reach"
            value={formatNumber(stats.totalReach)}
            icon={Users}
            variant="primary"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Impressions"
            value={formatNumber(stats.totalImpressions)}
            icon={Eye}
            variant="success"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Growth"
            value={`${stats.totalGrowth.toFixed(1)}%`}
            change={stats.totalGrowth}
            changeLabel="overall"
            icon={TrendingUp}
            variant="accent"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Interactions"
            value={formatNumber(totalInteractions)}
            icon={BarChart3}
            variant="warning"
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-12">
        <EngagementChart
          className="col-span-12 lg:col-span-7"
          data={engagementOverTime}
        />
        <PerformanceChart
          className="col-span-12 lg:col-span-5"
          campaignsData={campaigns}
        />
      </div>

      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Platform Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Performance and reach distribution by social channel
              </p>
            </div>
            <div className="p-5 space-y-3">
              {Object.keys(platformStats).length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No platform data available yet
                </div>
              ) : (
                Object.entries(platformStats).map(([platform, pStats]) => {
                  const avgEngagement = Math.round(
                    pStats.engagement / pStats.count
                  );
                  const maxReach = Math.max(
                    1,
                    ...Object.values(platformStats).map((s) => s.reach)
                  );
                  const reachPercent = (pStats.reach / maxReach) * 100;

                  return (
                    <div
                      key={platform}
                      className="rounded-lg border border-border bg-secondary/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground">
                            {platformIcons[platform] ||
                              platformIcons.instagram}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {platform}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pStats.count} campaign
                              {pStats.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground tabular-nums">
                            {formatNumber(pStats.reach)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            reach &middot; {avgEngagement} avg score
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${reachPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <HourlyChart data={hourlyInteractions} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Content Format Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Engagement score and interaction volume by media format
          </p>
        </div>
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["video", "image", "carousel", "text"].map((type) => {
              const typePosts = posts.filter((p) => p.mediaType === type);
              const avgScore =
                typePosts.length > 0
                  ? Math.round(
                      typePosts.reduce((sum, p) => sum + p.engagementScore, 0) /
                        typePosts.length
                    )
                  : 0;
              const totalLikes = typePosts.reduce((sum, p) => sum + p.likes, 0);

              return (
                <div
                  key={type}
                  className="rounded-lg border border-border bg-secondary/20 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {type}
                    </span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border tabular-nums">
                      {typePosts.length} posts
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {avgScore}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Avg. engagement score
                  </p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                      {formatNumber(totalLikes)} total likes
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
