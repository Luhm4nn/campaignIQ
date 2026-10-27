"use client";

import { StatsCard } from "@/components/dashboard/stats-card";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { formatNumber, cn } from "@/lib/utils";
import { useCampaignData } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Zap,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
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

export default function AnalyticsPage() {
  const {
    campaigns,
    posts,
    stats,
    engagementOverTime,
    hourlyInteractions,
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

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Performance Metrics</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep dive into your campaign performance metrics and trends.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Reach"
            value={formatNumber(stats.totalReach)}
            icon={Users}
            variant="primary"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Impressions"
            value={formatNumber(stats.totalImpressions)}
            icon={Eye}
            variant="success"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Growth"
            value={`${stats.totalGrowth.toFixed(1)}%`}
            change={stats.totalGrowth}
            changeLabel="overall"
            icon={TrendingUp}
            variant="accent"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
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
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden h-full">
            <div className="p-6 border-b border-border/30">
              <h3 className="text-lg font-semibold text-foreground">
                Platform Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Performance by social platform
              </p>
            </div>
            <div className="p-4 space-y-3">
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
                      className="group relative overflow-hidden rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all duration-300 hover:border-border"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-30 transition-opacity duration-300 group-hover:opacity-50",
                          platformColors[platform] || platformColors.instagram
                        )}
                      />
                      <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br",
                              platformColors[platform] ||
                                platformColors.instagram
                            )}
                          >
                            {platformIcons[platform] ||
                              platformIcons.instagram}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground capitalize">
                              {platform}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pStats.count} campaign
                              {pStats.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground tabular-nums">
                            {formatNumber(pStats.reach)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            reach &middot; {avgEngagement} avg score
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
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

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-6 border-b border-border/30">
          <h3 className="text-lg font-semibold text-foreground">
            Content Type Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Engagement analysis by content format
          </p>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["video", "image", "carousel", "text"].map((type, index) => {
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
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all duration-300 hover:border-border hover:translate-y-[-2px]"
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity duration-300 group-hover:opacity-40",
                      index === 0 && "from-primary/40 to-transparent",
                      index === 1 && "from-accent/40 to-transparent",
                      index === 2 && "from-success/40 to-transparent",
                      index === 3 && "from-warning/40 to-transparent"
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-foreground capitalize">
                        {type}
                      </span>
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                        {typePosts.length} posts
                      </span>
                    </div>
                    <p className="text-4xl font-bold text-foreground tabular-nums">
                      {avgScore}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average engagement score
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatNumber(totalLikes)} total likes
                      </p>
                    </div>
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
