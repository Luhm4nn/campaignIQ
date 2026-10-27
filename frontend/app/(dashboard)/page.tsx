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
  Trophy,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { campaigns, insights, stats, engagementOverTime } = useCampaignData();
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 3);
  const [greeting, setGreeting] = useState("Welcome");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const currentHour = new Date().getHours();
    setGreeting(
      currentHour < 12
        ? "Good morning"
        : currentHour < 18
        ? "Good afternoon"
        : "Good evening"
    );
    setDateString(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {dateString || "Loading..."}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {greeting}, <span className="text-gradient">Creator</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your campaigns today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium text-foreground hover:bg-secondary hover:border-border transition-all duration-300"
          >
            View all campaigns
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            icon={Megaphone}
            variant="primary"
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Engagement"
            value={`${stats.avgEngagementRate}%`}
            icon={Target}
            variant="success"
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Growth"
            value={`${stats.totalGrowth}%`}
            change={stats.totalGrowth}
            changeLabel="overall"
            icon={TrendingUp}
            variant="accent"
          />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Top Score"
            value={stats.topCampaign?.engagementScore ?? 0}
            icon={Trophy}
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
          <div className="h-full rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Top Performers
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your best campaigns by health score
                  </p>
                </div>
                <Link
                  href="/campaigns"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {topCampaigns.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No campaigns created yet
                  </p>
                  <Link
                    href="/campaigns/new"
                    className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Create your first campaign &rarr;
                  </Link>
                </div>
              ) : (
                topCampaigns.map((campaign, i) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-all duration-300"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold",
                        i === 0 &&
                          "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                        i !== 0 && "bg-secondary text-foreground"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {campaign.postsCount} posts &middot; {campaign.platform}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {campaign.engagementScore}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium",
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    AI Insights
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time recommendations computed from your campaign metrics
                  </p>
                </div>
              </div>
              <Link
                href="/insights"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all insights
              </Link>
            </div>
            {insights.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No analytical insights generated yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Create a campaign and publish posts to activate VADER sentiment and horario óptimo analysis
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {insights.slice(0, 4).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
