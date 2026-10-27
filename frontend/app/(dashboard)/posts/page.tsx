"use client";

import { ContentSkeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import Link from "next/link";
import { PostCard } from "@/components/dashboard/post-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { formatNumber, cn } from "@/lib/utils";
import { useCampaignData } from "@/lib/api";
import {
  FileText,
  Grid3X3,
  List,
  Heart,
  Share2,
  MessageCircle,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

export default function PostsPage() {
  const { posts, campaigns, stats, refresh, isLoading } = useCampaignData();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts
    .filter(
      (p) =>
        selectedCampaign === "all" ||
        p.campaignId === Number(selectedCampaign)
    )
    .filter(
      (p) =>
        searchQuery === "" ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const avgEngagement =
    posts.length > 0
      ? Math.round(
          posts.reduce((sum, p) => sum + p.engagementScore, 0) / posts.length
        )
      : 0;

  if (isLoading) {
    return <ContentSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Content Library
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse, register, and analyze all your published content across platforms.
          </p>
        </div>

        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Feed
        </button>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={FileText}
            variant="primary"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Likes"
            value={formatNumber(stats.totalLikes)}
            icon={Heart}
            variant="success"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Comments"
            value={formatNumber(stats.totalComments)}
            icon={MessageCircle}
            variant="accent"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Score"
            value={avgEngagement}
            icon={Share2}
            variant="warning"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="h-9 pl-8 pr-7 rounded-lg bg-input border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={String(campaign.id)}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
            {filteredPosts.length} results
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border">
          <button
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-3"
        )}
      >
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 px-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary border border-border mb-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            No posts found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {campaigns.length === 0
              ? "Create a campaign first, then register posts to analyze their VADER sentiment and engagement."
              : "Las publicaciones se sincronizan automáticamente desde tus redes sociales conectadas."}
          </p>
        </div>
      )}

    </div>
  );
}
