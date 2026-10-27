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
  Trophy,
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

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-success to-success/70";
    if (score >= 60) return "from-primary to-accent";
    return "from-warning to-warning/70";
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden h-full">
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30">
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top Posts</h3>
            <p className="text-xs text-muted-foreground">
              Highest performing content
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No posts published in this campaign yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Use the &quot;New Post&quot; button to register content and calculate engagement metrics
            </p>
          </div>
        ) : (
          sortedPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="group relative overflow-hidden flex gap-4 rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all duration-300 hover:border-border hover:bg-secondary/50 cursor-pointer"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  index === 0 &&
                    "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                  index !== 0 &&
                    "bg-secondary text-muted-foreground border border-border/50"
                )}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                      {mediaTypeIcons[post.mediaType] || mediaTypeIcons.image}
                      <span className="capitalize">{post.mediaType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-destructive/10">
                      <Heart className="h-3 w-3 text-destructive" />
                    </div>
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      {formatNumber(post.likes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10">
                      <MessageCircle className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      {formatNumber(post.comments)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-accent/10">
                      <Share2 className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      {formatNumber(post.shares)}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {post.engagementRate}% ER
                    </span>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold bg-gradient-to-r text-primary-foreground",
                        getScoreGradient(post.engagementScore)
                      )}
                    >
                      {post.engagementScore}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
