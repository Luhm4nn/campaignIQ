"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import type { Insight } from "@/lib/types";

interface InsightCardProps {
  insight: Insight;
  className?: string;
  onClick?: () => void;
}

export function InsightCard({ insight, className, onClick }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      case "tip":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getColors = () => {
    switch (insight.type) {
      case "success":
        return {
          iconBg: "bg-success/10 border-success/20",
          icon: "text-success",
        };
      case "warning":
        return {
          iconBg: "bg-warning/10 border-warning/20",
          icon: "text-warning",
        };
      case "info":
        return {
          iconBg: "bg-primary/10 border-primary/20",
          icon: "text-primary",
        };
      case "tip":
        return {
          iconBg: "bg-accent/10 border-accent/20",
          icon: "text-accent",
        };
      default:
        return {
          iconBg: "bg-secondary border-border",
          icon: "text-muted-foreground",
        };
    }
  };

  const colors = getColors();

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-secondary/30",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            colors.iconBg,
            colors.icon
          )}
        >
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
              {insight.title}
            </h4>
            {insight.metric && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium shrink-0 border",
                  colors.iconBg,
                  colors.icon
                )}
              >
                {insight.change !== undefined &&
                  insight.change !== null &&
                  (insight.change > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : insight.change < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null)}
                {insight.metric}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {insight.description}
          </p>

          {onClick && (
            <div className="flex items-center gap-1 pt-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              <span>Inspect details</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
