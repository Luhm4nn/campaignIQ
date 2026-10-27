"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Sparkles,
  Megaphone,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  tiktok: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
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

interface CampaignsTableProps {
  data?: Campaign[];
  showHeader?: boolean;
  limit?: number;
}

export function CampaignsTable({
  data = [],
  showHeader = true,
  limit,
}: CampaignsTableProps) {
  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                All Campaigns
              </h2>
              <p className="text-xs text-muted-foreground">
                {displayData.length} total campaigns
              </p>
            </div>
          </div>
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      )}

      {displayData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/50 py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
            <Megaphone className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No campaigns registered yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mb-6">
            Create your first campaign to start tracking social media publications, engagement rates, and VADER sentiment analysis.
          </p>
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/30 bg-secondary/30">
            <div className="col-span-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campaign
            </div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Score
            </div>
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Growth
            </div>
          </div>

          <div className="divide-y divide-border/30">
            {displayData.map((campaign, index) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-300 hover:bg-secondary/30"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
                      index === 0 &&
                        "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                      index !== 0 && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {campaign.postsCount} posts &middot; {campaign.campaignType}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-gradient-to-r text-xs font-medium",
                      platformColors[campaign.platform] ||
                        platformColors.instagram
                    )}
                  >
                    {platformIcons[campaign.platform] ||
                      platformIcons.instagram}
                    <span className="capitalize">{campaign.platform}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                      campaign.status === "active" &&
                        "bg-success/10 text-success border border-success/20",
                      campaign.status === "completed" &&
                        "bg-primary/10 text-primary border border-primary/20",
                      campaign.status === "scheduled" &&
                        "bg-warning/10 text-warning border border-warning/20",
                      campaign.status === "paused" &&
                        "bg-warning/10 text-warning border border-warning/20",
                      campaign.status === "draft" &&
                        "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        campaign.status === "active" &&
                          "bg-success animate-pulse",
                        campaign.status === "completed" && "bg-primary",
                        campaign.status === "scheduled" && "bg-warning",
                        campaign.status === "paused" && "bg-warning",
                        campaign.status === "draft" && "bg-muted-foreground"
                      )}
                    />
                    <span className="capitalize">{campaign.status}</span>
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${campaign.engagementScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums w-8">
                      {campaign.engagementScore}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                      campaign.growth > 0 && "bg-success/10 text-success",
                      campaign.growth < 0 &&
                        "bg-destructive/10 text-destructive",
                      campaign.growth === 0 && "bg-muted text-muted-foreground"
                    )}
                  >
                    {campaign.growth > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : campaign.growth < 0 ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    <span>
                      {campaign.growth > 0 ? "+" : ""}
                      {campaign.growth}%
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
