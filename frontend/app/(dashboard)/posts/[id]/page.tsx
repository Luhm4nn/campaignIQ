"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Calendar,
  Calculator,
  Trash2,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { fetchPostDetail, deletePostApi } from "@/lib/api";
import { PostFormModal } from "@/components/dashboard/post-form-modal";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const postId = Number(id);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadPost = useCallback(async () => {
    if (isNaN(postId)) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchPostDetail(postId);
      setPost(data);
    } catch {
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading post details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-sm text-muted-foreground">Post not found</p>
        <Link href="/posts" className="text-primary hover:underline text-sm">
          Back to Posts
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    await deletePostApi(post.id);
    router.push(`/campaigns/${post.campaignId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href={`/campaigns/${post.campaignId}`}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Post Details
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.campaignName} &middot;{" "}
              <span className="capitalize">{post.platform}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-gradient text-xs font-medium text-white cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Post
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-destructive/10 border border-destructive/25 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="w-full h-1.5 bg-secondary/80 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              post.engagementScore >= 85
                ? "from-success via-primary to-success"
                : post.engagementScore >= 60
                ? "from-primary via-accent to-primary"
                : "from-warning via-destructive to-warning"
            }`}
            style={{ width: `${Math.max(20, Math.min(100, post.engagementScore))}%` }}
          />
        </div>
        <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground">
              {post.mediaType}
            </span>
            <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
              Tier: {post.performanceTier}
            </span>
          </div>
          <h2 className="text-lg font-medium text-foreground leading-relaxed mb-3">
            {post.content}
          </h2>
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Published on{" "}
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-5 border-t border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-semibold text-foreground tabular-nums">
                {post.likes.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-semibold text-foreground tabular-nums">
                {post.comments.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-semibold text-foreground tabular-nums">
                {post.shares.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Shares</p>
          </div>
        </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Performance & NLP Metrics
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-primary to-accent" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">
                Engagement Rate
              </p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {post.engagementRate}%
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-success to-primary" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">Reach</p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {post.reach.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-accent to-primary" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">Impressions</p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {post.impressions.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-primary to-accent" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">
                Engagement Score
              </p>
              <p className="text-2xl font-semibold text-primary tabular-nums">
                {post.engagementScore}/100
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-success to-primary" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">
                VADER Sentiment
              </p>
              <p className="text-2xl font-semibold text-foreground capitalize">
                {post.sentimentLabel}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden glow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-warning to-primary" />
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-1">
                Compound Score
              </p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {post.sentimentCompound}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Calculator className="h-4 w-4 text-primary" />
          <span>Formula Evaluation</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Engagement Rate = (({post.likes} + {post.comments} + {post.shares}) /{" "}
          {post.reach}) &times; 100 ={" "}
          <span className="text-foreground font-medium">
            {post.engagementRate}%
          </span>
          . Relative campaign percentile classification:{" "}
          <span className="text-foreground font-medium uppercase">
            {post.performanceTier}
          </span>
          .
        </p>
      </div>

      <PostFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={loadPost}
        campaigns={[]}
        editPost={post}
      />
    </div>
  );
}
