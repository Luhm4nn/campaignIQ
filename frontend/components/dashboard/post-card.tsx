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
  Linkedin,
  Facebook,
  ArrowUpRight,
  Clock,
} from "lucide-react";

const mediaTypeIcons: Record<string, React.ReactNode> = {
  image: <Image className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  text: <FileText className="h-3.5 w-3.5" />,
  carousel: <LayoutGrid className="h-3.5 w-3.5" />,
};

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
  twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  linkedin: "bg-blue-600/10 text-blue-400 border-blue-600/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tiktok: "bg-foreground/10 text-foreground border-foreground/20",
};

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-success to-success/70";
    if (score >= 60) return "from-primary to-accent";
    return "from-warning to-warning/70";
  };

  return (
    <Link
      href={`/posts/${post.id}`}
      className={cn(
        "group block relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border hover:translate-y-[-2px]",
        "hover:shadow-[0_0_40px_-10px_var(--primary)]",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
          getScoreGradient(post.engagementScore)
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg border",
                platformColors[post.platform] || platformColors.instagram
              )}
            >
              {platformIcons[post.platform] || platformIcons.instagram}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 text-xs text-muted-foreground">
              {mediaTypeIcons[post.mediaType] || mediaTypeIcons.image}
              <span className="capitalize">{post.mediaType}</span>
            </div>
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase",
                post.sentimentLabel === "positivo" &&
                  "bg-success/15 text-success",
                post.sentimentLabel === "negativo" &&
                  "bg-destructive/15 text-destructive",
                post.sentimentLabel === "neutro" &&
                  "bg-secondary text-muted-foreground"
              )}
            >
              {post.sentimentLabel}
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold bg-gradient-to-r text-primary-foreground",
              getScoreGradient(post.engagementScore)
            )}
          >
            {post.engagementScore}
            <span className="text-primary-foreground/70 font-normal">/100</span>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-4">
          {post.content}
        </p>

        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground">Campaign:</span>
            <span className="font-medium text-primary truncate">
              {post.campaignName}
            </span>
          </div>
          <span className="text-muted-foreground tabular-nums">
            {post.engagementRate}% ER
          </span>
        </div>

        <div className="flex items-center gap-4 border-t border-border/30 pt-4">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-destructive/10">
              <Heart className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {formatNumber(post.likes)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {formatNumber(post.comments)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10">
              <Share2 className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {formatNumber(post.shares)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span>View details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
