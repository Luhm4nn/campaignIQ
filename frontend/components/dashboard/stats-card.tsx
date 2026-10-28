"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "accent";
  size?: "default" | "large";
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
  variant = "default",
  size = "default",
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0)
      return <Minus className="h-3 w-3" />;
    return change > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  const getIconStyles = () => {
    switch (variant) {
      case "primary":
        return "text-primary bg-primary/10 border-primary/20";
      case "success":
        return "text-success bg-success/10 border-success/20";
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "accent":
        return "text-accent bg-accent/10 border-accent/20";
      default:
        return "text-muted-foreground bg-secondary border-border";
    }
  };

  const getTopBarGradient = () => {
    switch (variant) {
      case "primary":
        return "from-primary via-primary/70 to-transparent";
      case "success":
        return "from-success via-primary/70 to-transparent";
      case "warning":
        return "from-warning via-warning/70 to-transparent";
      case "accent":
        return "from-accent via-primary/70 to-transparent";
      default:
        return "from-border via-border/50 to-transparent";
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden h-full rounded-xl border border-border bg-card glow-card flex flex-col justify-between",
        size === "large" ? "p-6" : "p-5",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-85 group-hover:opacity-100 transition-opacity",
          getTopBarGradient()
        )}
      />
      <div className="flex items-start justify-between gap-3 h-full">
        <div className="space-y-2 flex-1 min-w-0 flex flex-col justify-between h-full">
          <p className="text-xs font-medium text-muted-foreground tracking-wide">
            {title}
          </p>
          <p
            className={cn(
              "font-semibold tracking-tight text-foreground tabular-nums",
              size === "large" ? "text-3xl" : "text-2xl"
            )}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                  change > 0
                    ? "bg-success/10 text-success"
                    : change < 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {getTrendIcon()}
                <span>
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105",
              getIconStyles()
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
