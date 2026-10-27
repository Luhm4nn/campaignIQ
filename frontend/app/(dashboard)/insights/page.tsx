"use client";

import { useState, useEffect } from "react";
import { InsightCard } from "@/components/dashboard/insight-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { InsightsSkeleton } from "@/components/ui/skeleton";
import { useCampaignData } from "@/lib/api";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import type { Insight } from "@/lib/types";

interface InsightModalProps {
  open: boolean;
  insight: Insight | null;
  onClose: () => void;
}

function InsightModal({ open, insight, onClose }: InsightModalProps) {
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);
  if (!open || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative rounded-xl bg-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {insight.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {insight.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Key Metric</p>
          <p className="text-2xl font-semibold text-primary tabular-nums">
            {insight.metric}
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">
              Detailed Analysis
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.detailedAnalysis}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">
              Recommendation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          <div className="bg-secondary/30 border border-border rounded-lg p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Last analysis:{" "}
                <span className="text-foreground font-medium">
                  {insight.lastAnalysis}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Analysis frequency:{" "}
                <span className="text-foreground font-medium">
                  {insight.analysisFrequency}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { insights: allInsights, isLoading } = useCampaignData();
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  const successInsights = allInsights.filter((i) => i.type === "success");
  const warningInsights = allInsights.filter((i) => i.type === "warning");
  const tipInsights = allInsights.filter((i) => i.type === "tip");
  const infoInsights = allInsights.filter((i) => i.type === "info");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Statistical & NLP Engine
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Actionable signals dynamically computed from your campaigns and VADER sentiment analysis.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border self-start sm:self-auto">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            Engine Active
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Positive Trends"
            value={successInsights.length}
            icon={TrendingUp}
            variant="success"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Needs Attention"
            value={warningInsights.length}
            icon={AlertTriangle}
            variant="warning"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Tips & Formats"
            value={tipInsights.length}
            icon={Lightbulb}
            variant="accent"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Opportunities"
            value={infoInsights.length}
            icon={Target}
            variant="primary"
          />
        </div>
      </div>

      {allInsights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-14 px-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            No insights generated yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Create campaigns and publish posts so the analytical engine can evaluate optimal posting hours, media format performance, and VADER sentiment trends.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {successInsights.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 border border-success/20">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Positive Trends
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    High-performing patterns detected in your data
                  </p>
                </div>
              </div>
              <div className="p-5 grid gap-3.5 md:grid-cols-2">
                {successInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => setSelectedInsight(insight)}
                  />
                ))}
              </div>
            </div>
          )}

          {warningInsights.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Needs Attention
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Areas that require optimization
                  </p>
                </div>
              </div>
              <div className="p-5 grid gap-3.5 md:grid-cols-2">
                {warningInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => setSelectedInsight(insight)}
                  />
                ))}
              </div>
            </div>
          )}

          {tipInsights.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                  <Lightbulb className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Tips & Recommendations
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Format and content suggestions
                  </p>
                </div>
              </div>
              <div className="p-5 grid gap-3.5 md:grid-cols-2">
                {tipInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => setSelectedInsight(insight)}
                  />
                ))}
              </div>
            </div>
          )}

          {infoInsights.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Growth Opportunities
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Channel allocation insights
                  </p>
                </div>
              </div>
              <div className="p-5 grid gap-3.5 md:grid-cols-2">
                {infoInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => setSelectedInsight(insight)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <InsightModal
        open={!!selectedInsight}
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />
    </div>
  );
}
