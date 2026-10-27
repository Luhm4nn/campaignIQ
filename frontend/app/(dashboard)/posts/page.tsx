"use client";

import { useState } from "react";
import Link from "next/link";
import { PostCard } from "@/components/dashboard/post-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PostFormModal } from "@/components/dashboard/post-form-modal";
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
  Zap,
  Search,
  Plus,
} from "lucide-react";

export default function PostsPage() {
  const { posts, campaigns, stats, refresh } = useCampaignData();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [postModalOpen, setPostModalOpen] = useState(false);

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

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Content Library</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Posts
          </h1>
          <p className="text-muted-foreground">
            Browse, register, and analyze all your published content across platforms.
          </p>
        </div>

        {campaigns.length > 0 ? (
          <button
            onClick={() => setPostModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        ) : (
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Create Campaign First
          </Link>
        )}
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={FileText}
            variant="primary"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Likes"
            value={formatNumber(stats.totalLikes)}
            icon={Heart}
            variant="success"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Comments"
            value={formatNumber(stats.totalComments)}
            icon={MessageCircle}
            variant="accent"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Score"
            value={avgEngagement}
            icon={Share2}
            variant="warning"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-card">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="h-10 pl-10 pr-8 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={String(campaign.id)}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredPosts.length} posts
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/50">
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300",
              viewMode === "grid"
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300",
              viewMode === "list"
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        )}
      >
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/50 py-20 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No posts found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {campaigns.length === 0
              ? "Create a campaign first, then register posts to analyze their VADER sentiment and engagement."
              : "Register a new post or adjust your search filters."}
          </p>
        </div>
      )}

      <PostFormModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onSaved={refresh}
        campaigns={campaigns}
      />
    </div>
  );
}
