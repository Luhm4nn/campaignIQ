"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { InsightCard } from "@/components/dashboard/insight-card";
import { useCampaignData } from "@/lib/api";
import {
  Megaphone,
  TrendingUp,
  Target,
  Award,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { campaigns, insights, stats, engagementOverTime, isLoading } = useCampaignData();
  const router = useRouter();
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 4);
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <span>Workspace Overview</span>
            {dateString && (
              <>
                <span>&middot;</span>
                <span>{dateString}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Performance Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consolidated campaign telemetry, engagement metrics, and VADER sentiment signals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            All Campaigns
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            icon={Megaphone}
            variant="primary"
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Engagement"
            value={`${stats.avgEngagementRate}%`}
            icon={Target}
            variant="success"
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Growth"
            value={`${stats.totalGrowth}%`}
            change={stats.totalGrowth}
            changeLabel="overall"
            icon={TrendingUp}
            variant="accent"
          />
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Top Health Score"
            value={stats.topCampaign?.engagementScore ?? 0}
            icon={Award}
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
        <div className="col-span-12 lg:col-span-5">
          <div className="h-full rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Top Performers
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Campaigns ranked by composite health score
                </p>
              </div>
              <Link
                href="/campaigns"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {topCampaigns.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No campaigns created yet
                  </p>
                  <Link
                    href="/campaigns/new"
                    className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    Create your first campaign &rarr;
                  </Link>
                </div>
              ) : (
                topCampaigns.map((campaign, i) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="group flex items-center gap-3.5 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary border border-border text-xs font-medium text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {campaign.postsCount} posts &middot; {campaign.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground tabular-nums">
                        {campaign.engagementScore}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          campaign.growth > 0
                            ? "text-success"
                            : campaign.growth < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {campaign.growth > 0 ? "+" : ""}
                        {campaign.growth}%
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Analytical Signals & Recommendations
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Computed from engagement metrics and VADER sentiment analysis
                </p>
              </div>
              <Link
                href="/insights"
                className="text-xs font-medium text-primary hover:underline"
              >
                All insights
              </Link>
            </div>
            <div className="p-5">
              {insights.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border py-10 px-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No analytical insights generated yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Create a campaign and publish posts to activate VADER sentiment and optimal hour analysis
                  </p>
                </div>
              ) : (
                <div className="grid gap-3.5 md:grid-cols-2">
                  {insights.slice(0, 4).map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onClick={() => router.push("/insights")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
