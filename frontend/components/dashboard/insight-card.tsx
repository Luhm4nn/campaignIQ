"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
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
        return <CheckCircle2 className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Sparkles className="h-5 w-5" />;
      case "tip":
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColors = () => {
    switch (insight.type) {
      case "success":
        return {
          gradient: "from-success/20 via-success/5 to-transparent",
          iconBg: "bg-success/10 border-success/30",
          icon: "text-success",
          glow: "group-hover:shadow-[0_0_40px_-10px_var(--success)]",
          pulse: "bg-success",
        };
      case "warning":
        return {
          gradient: "from-warning/20 via-warning/5 to-transparent",
          iconBg: "bg-warning/10 border-warning/30",
          icon: "text-warning",
          glow: "group-hover:shadow-[0_0_40px_-10px_var(--warning)]",
          pulse: "bg-warning",
        };
      case "info":
        return {
          gradient: "from-primary/20 via-primary/5 to-transparent",
          iconBg: "bg-primary/10 border-primary/30",
          icon: "text-primary",
          glow: "group-hover:shadow-[0_0_40px_-10px_var(--primary)]",
          pulse: "bg-primary",
        };
      case "tip":
        return {
          gradient: "from-accent/20 via-accent/5 to-transparent",
          iconBg: "bg-accent/10 border-accent/30",
          icon: "text-accent",
          glow: "group-hover:shadow-[0_0_40px_-10px_var(--accent)]",
          pulse: "bg-accent",
        };
      default:
        return {
          gradient: "from-muted via-muted/50 to-transparent",
          iconBg: "bg-muted border-border",
          icon: "text-muted-foreground",
          glow: "",
          pulse: "bg-muted-foreground",
        };
    }
  };

  const colors = getColors();

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border hover:translate-y-[-2px]",
        onClick && "cursor-pointer",
        colors.glow,
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500 group-hover:opacity-100",
          colors.gradient
        )}
      />

      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <div className={cn("h-2 w-2 rounded-full animate-pulse", colors.pulse)} />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Live
        </span>
      </div>

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
              "group-hover:scale-110",
              colors.iconBg,
              colors.icon
            )}
          >
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2 pr-12">
              <h4 className="font-semibold text-foreground leading-tight line-clamp-1">
                {insight.title}
              </h4>
              {insight.metric && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shrink-0",
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
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {insight.description}
            </p>

            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium transition-all duration-300",
                "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                colors.icon
              )}
            >
              <span>View details</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
