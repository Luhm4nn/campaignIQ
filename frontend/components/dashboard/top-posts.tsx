"use client";

import Link from "next/link";
import { cn, formatNumber } from "@/lib/utils";
import type { Post } from "@/lib/types";
import {
  Heart,
  MessageCircle,
  Share2,
  Image,
  Video,
  FileText,
  LayoutGrid,
  ArrowUpRight,
} from "lucide-react";

const mediaTypeIcons: Record<string, React.ReactNode> = {
  image: <Image className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  text: <FileText className="h-3.5 w-3.5" />,
  carousel: <LayoutGrid className="h-3.5 w-3.5" />,
};

interface TopPostsProps {
  posts: Post[];
  limit?: number;
}

export function TopPosts({ posts, limit = 5 }: TopPostsProps) {
  const sortedPosts = [...posts]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);

  const getScoreBadge = (score: number) => {
    if (score >= 85)
      return "bg-success/15 text-success border-success/30";
    if (score >= 60)
      return "bg-primary/15 text-primary border-primary/30";
    return "bg-warning/15 text-warning border-warning/30";
  };

  const getTopBarGradient = (score: number) => {
    if (score >= 85) return "from-success via-primary to-success/80";
    if (score >= 60) return "from-primary via-primary/80 to-accent";
    return "from-warning via-warning/80 to-destructive/80";
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Top Posts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Highest performing content in this campaign
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {sortedPosts.length} items
        </span>
      </div>
      <div className="p-3.5 space-y-2.5">
        {sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No posts published in this campaign yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Use the &quot;New Post&quot; button to register content and calculate engagement metrics
            </p>
          </div>
        ) : (
          sortedPosts.map((post, index) => {
            const barWidth = Math.max(18, Math.min(100, post.engagementScore));
            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group relative overflow-hidden flex gap-4 rounded-xl border border-border bg-secondary/20 p-4 pt-5 glow-card hover:bg-secondary/40 cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-secondary/80 overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-gradient-to-r transition-all duration-500 group-hover:brightness-125",
                      getTopBarGradient(post.engagementScore)
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums mt-0.5",
                    index === 0
                      ? "btn-gradient border-0 text-white"
                      : "bg-secondary border border-border text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground shrink-0">
                      {mediaTypeIcons[post.mediaType] || mediaTypeIcons.image}
                      <span className="capitalize">{post.mediaType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-accent/80" />
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatNumber(post.likes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-primary/80" />
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatNumber(post.comments)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5 text-success/80" />
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {formatNumber(post.shares)}
                      </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {post.engagementRate}% ER
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border tabular-nums",
                          getScoreBadge(post.engagementScore)
                        )}
                      >
                        {post.engagementScore}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
