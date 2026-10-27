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
  Twitter,
  Instagram,
  ArrowUpRight,
  Clock,
  Youtube,
} from "lucide-react";

const mediaTypeIcons: Record<string, React.ReactNode> = {
  image: <Image className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  text: <FileText className="h-3.5 w-3.5" />,
  carousel: <LayoutGrid className="h-3.5 w-3.5" />,
};

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

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 85)
      return "bg-success/10 text-success border-success/20";
    if (score >= 60)
      return "bg-primary/10 text-primary border-primary/20";
    return "bg-warning/10 text-warning border-warning/20";
  };

  return (
    <Link
      href={`/posts/${post.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-secondary/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center justify-center h-7 w-7 rounded-md border border-border bg-secondary text-muted-foreground">
            {platformIcons[post.platform] || platformIcons.instagram}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
            {mediaTypeIcons[post.mediaType] || mediaTypeIcons.image}
            <span className="capitalize">{post.mediaType}</span>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-medium capitalize border",
              post.sentimentLabel === "positivo" &&
                "bg-success/10 text-success border-success/20",
              post.sentimentLabel === "negativo" &&
                "bg-destructive/10 text-destructive border-destructive/20",
              post.sentimentLabel === "neutro" &&
                "bg-secondary text-muted-foreground border-border"
            )}
          >
            {post.sentimentLabel}
          </span>
          {post.externalId && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
              Synced
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold border tabular-nums",
            getScoreBadge(post.engagementScore)
          )}
        >
          {post.engagementScore}
          <span className="opacity-60 font-normal">/100</span>
        </div>
      </div>

      <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-4">
        {post.content}
      </p>

      <div className="flex items-center justify-between mb-3.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-muted-foreground">Campaign:</span>
          <span className="font-medium text-foreground truncate">
            {post.campaignName}
          </span>
        </div>
        <span className="text-muted-foreground font-medium tabular-nums">
          {post.engagementRate}% ER
        </span>
      </div>

      <div className="flex items-center gap-5 border-t border-border pt-3.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
          <span className="text-xs font-medium text-foreground tabular-nums">
            {formatNumber(post.likes)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium text-foreground tabular-nums">
            {formatNumber(post.comments)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" />
          <span className="text-xs font-medium text-foreground tabular-nums">
            {formatNumber(post.shares)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
        </div>
      </div>
    </Link>
  );
}
