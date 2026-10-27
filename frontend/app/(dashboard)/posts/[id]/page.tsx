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
  Sparkles,
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
        <p className="text-muted-foreground">Loading post details...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Post not found</p>
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="px-6 py-4 sm:px-12 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/campaigns/${post.campaignId}`}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Post Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {post.campaignName} &middot;{" "}
                <span className="capitalize">{post.platform}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-all"
            >
              <Edit3 className="h-4 w-4" />
              Edit Post
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/15 border border-destructive/30 text-sm font-medium text-destructive hover:bg-destructive/25 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 sm:px-12 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md bg-secondary text-foreground">
                    {post.mediaType}
                  </span>
                  <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md bg-primary/15 text-primary">
                    Classification: {post.performanceTier}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {post.content}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
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

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold text-foreground">
                      {post.likes.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      {post.comments.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Share2 className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-foreground">
                      {post.shares.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance & NLP Metrics
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Engagement Rate
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {post.engagementRate}%
                </p>
              </div>
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Reach</p>
                <p className="text-3xl font-bold text-foreground">
                  {post.reach.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Impressions
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {post.impressions.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Engagement Score
                </p>
                <p className="text-3xl font-bold text-primary">
                  {post.engagementScore}/100
                </p>
              </div>
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  VADER Sentiment
                </p>
                <p className="text-3xl font-bold text-foreground uppercase">
                  {post.sentimentLabel}
                </p>
              </div>
              <div className="glass rounded-lg p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Compound Score
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {post.sentimentCompound}
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Formula Evaluation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Engagement Rate = (({post.likes} + {post.comments} + {post.shares}
              ) / {post.reach}) &times; 100 ={" "}
              <span className="text-foreground font-semibold">
                {post.engagementRate}%
              </span>
              . Relative campaign percentile classification:{" "}
              <span className="text-foreground font-semibold uppercase">
                {post.performanceTier}
              </span>
              .
            </p>
          </div>
        </div>
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
