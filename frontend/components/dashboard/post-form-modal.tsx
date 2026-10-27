"use client";

import { useState, useEffect } from "react";
import type { Campaign, Post } from "@/lib/types";
import { createPostApi, updatePostApi } from "@/lib/api";

interface PostFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  campaigns: Campaign[];
  defaultCampaignId?: number;
  editPost?: Post | null;
}

const mediaTypes = ["image", "video", "carousel", "text"] as const;

export function PostFormModal({
  open,
  onClose,
  onSaved,
  campaigns,
  defaultCampaignId,
  editPost,
}: PostFormModalProps) {
  const [campaignId, setCampaignId] = useState<number>(
    defaultCampaignId || (campaigns[0]?.id ?? 0)
  );
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<string>("image");
  const [publishedAt, setPublishedAt] = useState<string>("");
  const [likes, setLikes] = useState<string>("0");
  const [comments, setComments] = useState<string>("0");
  const [shares, setShares] = useState<string>("0");
  const [reach, setReach] = useState<string>("1000");
  const [impressions, setImpressions] = useState<string>("1800");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (editPost) {
      setCampaignId(editPost.campaignId);
      setContent(editPost.content);
      setMediaType(editPost.mediaType);
      setPublishedAt(editPost.publishedAt.slice(0, 16));
      setLikes(String(editPost.likes));
      setComments(String(editPost.comments));
      setShares(String(editPost.shares));
      setReach(String(editPost.reach));
      setImpressions(String(editPost.impressions));
    } else {
      setCampaignId(defaultCampaignId || (campaigns[0]?.id ?? 0));
      setContent("");
      setMediaType("image");
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setPublishedAt(now.toISOString().slice(0, 16));
      setLikes("0");
      setComments("0");
      setShares("0");
      setReach("1000");
      setImpressions("1800");
    }
    setError(null);
  }, [editPost, defaultCampaignId, campaigns, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Post content is required");
      return;
    }
    if (!editPost && !campaignId) {
      setError("Please select a campaign first");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (editPost) {
        await updatePostApi(editPost.id, {
          content: content.trim(),
          mediaType,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
          likes: Math.max(0, parseInt(likes || "0", 10)),
          comments: Math.max(0, parseInt(comments || "0", 10)),
          shares: Math.max(0, parseInt(shares || "0", 10)),
          reach: Math.max(0, parseInt(reach || "0", 10)),
          impressions: Math.max(0, parseInt(impressions || "0", 10)),
        });
      } else {
        await createPostApi({
          campaignId,
          content: content.trim(),
          mediaType,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
          likes: Math.max(0, parseInt(likes || "0", 10)),
          comments: Math.max(0, parseInt(comments || "0", 10)),
          shares: Math.max(0, parseInt(shares || "0", 10)),
          reach: Math.max(0, parseInt(reach || "0", 10)),
          impressions: Math.max(0, parseInt(impressions || "0", 10)),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative rounded-xl bg-card max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-border shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editPost ? "Edit Post" : "Register New Post"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              VADER sentiment and engagement rate will be calculated automatically
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editPost && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Campaign
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.platform})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Post Content / Copy
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the publication text to analyze sentiment and engagement..."
              className="w-full p-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Media Format
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground capitalize focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {mediaTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Published Date & Time
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Likes
              </label>
              <input
                type="number"
                min={0}
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Comments
              </label>
              <input
                type="number"
                min={0}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Shares
              </label>
              <input
                type="number"
                min={0}
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Reach
              </label>
              <input
                type="number"
                min={0}
                value={reach}
                onChange={(e) => setReach(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Impressions
              </label>
              <input
                type="number"
                min={0}
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
            >
              {submitting
                ? "Saving..."
                : editPost
                ? "Update Post"
                : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
