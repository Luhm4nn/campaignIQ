"use client";

import { useState } from "react";
import { InsightCard } from "@/components/dashboard/insight-card";
import { useCampaignData } from "@/lib/api";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Brain,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/types";

interface InsightModalProps {
  open: boolean;
  insight: Insight | null;
  onClose: () => void;
}

function InsightModal({ open, insight, onClose }: InsightModalProps) {
  if (!open || !insight) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {insight.title}
            </h2>
            <p className="text-muted-foreground">{insight.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Key Metric</p>
          <p className="text-3xl font-bold text-primary">{insight.metric}</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Detailed Analysis
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.detailedAnalysis}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Recommendation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.recommendation}
            </p>
          </div>

          <div className="bg-secondary/50 border border-border/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Last analysis:{" "}
                <span className="text-foreground font-medium">
                  {insight.lastAnalysis}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Analysis frequency:{" "}
                <span className="text-foreground font-medium">
                  {insight.analysisFrequency}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { insights: allInsights } = useCampaignData();
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const successInsights = allInsights.filter((i) => i.type === "success");
  const warningInsights = allInsights.filter((i) => i.type === "warning");
  const tipInsights = allInsights.filter((i) => i.type === "tip");
  const infoInsights = allInsights.filter((i) => i.type === "info");

  const summaryCards = [
    {
      label: "Positive Trends",
      count: successInsights.length,
      icon: TrendingUp,
      color: "success",
    },
    {
      label: "Needs Attention",
      count: warningInsights.length,
      icon: Clock,
      color: "warning",
    },
    {
      label: "Tips",
      count: tipInsights.length,
      icon: Lightbulb,
      color: "accent",
    },
    {
      label: "Opportunities",
      count: infoInsights.length,
      icon: Target,
      color: "primary",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>AI & Statistical Analysis</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Insights
          </h1>
          <p className="text-muted-foreground">
            Recommendations dynamically computed from your campaigns and VADER sentiment analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Live Engine Active
          </span>
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="col-span-12 md:col-span-6 lg:col-span-3"
          >
            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-500",
                "hover:border-border hover:translate-y-[-2px]",
                card.color === "success" &&
                  "hover:shadow-[0_0_40px_-10px_var(--success)]",
                card.color === "warning" &&
                  "hover:shadow-[0_0_40px_-10px_var(--warning)]",
                card.color === "accent" &&
                  "hover:shadow-[0_0_40px_-10px_var(--accent)]",
                card.color === "primary" &&
                  "hover:shadow-[0_0_40px_-10px_var(--primary)]"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity duration-300 group-hover:opacity-40",
                  card.color === "success" && "from-success/40 to-transparent",
                  card.color === "warning" && "from-warning/40 to-transparent",
                  card.color === "accent" && "from-accent/40 to-transparent",
                  card.color === "primary" && "from-primary/40 to-transparent"
                )}
              />

              <div className="relative flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110",
                    card.color === "success" &&
                      "bg-success/10 border-success/30 text-success",
                    card.color === "warning" &&
                      "bg-warning/10 border-warning/30 text-warning",
                    card.color === "accent" &&
                      "bg-accent/10 border-accent/30 text-accent",
                    card.color === "primary" &&
                      "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  <card.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-foreground tabular-nums">
                    {card.count}
                  </p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allInsights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 py-16 px-4 text-center">
          <p className="text-lg font-semibold text-foreground">
            No insights generated yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Create campaigns and publish posts so the analytical engine can evaluate optimal posting hours, media format performance, and VADER sentiment trends.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {successInsights.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/30 bg-success/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 border border-success/30">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Positive Trends
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      High-performing patterns detected in your data
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-2">
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
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/30 bg-warning/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 border border-warning/30">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Needs Attention
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Areas that require optimization
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-2">
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
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/30 bg-accent/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/30">
                    <Lightbulb className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Tips & Recommendations
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Format and content suggestions
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-2">
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
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/30 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Growth Opportunities
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Channel allocation insights
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-2">
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
