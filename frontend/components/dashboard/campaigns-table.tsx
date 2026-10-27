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
  Megaphone,
  Youtube,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-3.5 w-3.5" />,
  instagram: <Instagram className="h-3.5 w-3.5" />,
  youtube: <Youtube className="h-4 w-4" />,
  tiktok: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
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
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              All Campaigns
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayData.length} registered campaigns
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      )}

      {displayData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-14 px-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary border border-border mb-3">
            <Megaphone className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            No campaigns registered
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mb-5">
            Create your first campaign to start tracking social media publications, engagement rates, and VADER sentiment analysis.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-secondary/40">
            <div className="col-span-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Campaign
            </div>
            <div className="col-span-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Platform
            </div>
            <div className="col-span-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="col-span-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">
              Score
            </div>
            <div className="col-span-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">
              Growth
            </div>
          </div>

          <div className="divide-y divide-border">
            {displayData.map((campaign, index) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group grid grid-cols-12 gap-4 px-5 py-3.5 items-center transition-colors hover:bg-secondary/30"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground border border-border tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {campaign.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {campaign.postsCount} posts &middot; {campaign.campaignType}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-secondary/50 text-xs font-medium text-foreground">
                    <span className="text-muted-foreground">
                      {platformIcons[campaign.platform] ||
                        platformIcons.instagram}
                    </span>
                    <span className="capitalize">{campaign.platform}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
                      campaign.status === "active" &&
                        "bg-success/10 text-success border-success/20",
                      campaign.status === "completed" &&
                        "bg-primary/10 text-primary border-primary/20",
                      campaign.status === "scheduled" &&
                        "bg-warning/10 text-warning border-warning/20",
                      campaign.status === "paused" &&
                        "bg-warning/10 text-warning border-warning/20",
                      campaign.status === "draft" &&
                        "bg-secondary text-muted-foreground border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        campaign.status === "active" && "bg-success",
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
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${campaign.engagementScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground tabular-nums w-7">
                      {campaign.engagementScore}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium tabular-nums",
                      campaign.growth > 0 && "bg-success/10 text-success",
                      campaign.growth < 0 &&
                        "bg-destructive/10 text-destructive",
                      campaign.growth === 0 &&
                        "bg-secondary text-muted-foreground"
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
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
