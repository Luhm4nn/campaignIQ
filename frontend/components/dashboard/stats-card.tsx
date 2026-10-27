"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

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

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
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

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-muted-foreground";
    return change > 0 ? "text-success" : "text-destructive";
  };

  const getGradient = () => {
    switch (variant) {
      case "primary":
        return "from-primary/20 via-primary/5 to-transparent";
      case "success":
        return "from-success/20 via-success/5 to-transparent";
      case "warning":
        return "from-warning/20 via-warning/5 to-transparent";
      case "accent":
        return "from-accent/20 via-accent/5 to-transparent";
      default:
        return "from-secondary/40 via-secondary/10 to-transparent";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
        return "text-primary";
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "accent":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case "primary":
        return "group-hover:shadow-[0_0_30px_-5px_var(--primary)]";
      case "success":
        return "group-hover:shadow-[0_0_30px_-5px_var(--success)]";
      case "warning":
        return "group-hover:shadow-[0_0_30px_-5px_var(--warning)]";
      case "accent":
        return "group-hover:shadow-[0_0_30px_-5px_var(--accent)]";
      default:
        return "";
    }
  };

  const numericValue = typeof value === "string" 
    ? parseFloat(value.replace(/[^0-9.]/g, "")) 
    : value;
  const isNumeric = !isNaN(numericValue) && typeof value === "number";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border hover:translate-y-[-2px]",
        getGlowColor(),
        className
      )}
    >
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500 group-hover:opacity-100",
        getGradient()
      )} />
      
      {/* Decorative orb */}
      {Icon && (
        <div className={cn(
          "absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-all duration-500",
          variant === "primary" && "bg-primary/20 group-hover:bg-primary/30",
          variant === "success" && "bg-success/20 group-hover:bg-success/30",
          variant === "warning" && "bg-warning/20 group-hover:bg-warning/30",
          variant === "accent" && "bg-accent/20 group-hover:bg-accent/30",
          variant === "default" && "bg-muted/20 group-hover:bg-muted/30"
        )} />
      )}

      <div className={cn(
        "relative",
        size === "large" ? "p-8" : "p-5"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className={cn(
              "font-bold tracking-tight text-foreground tabular-nums",
              size === "large" ? "text-4xl" : "text-3xl"
            )}>
              {isNumeric ? <AnimatedNumber value={numericValue} /> : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    change > 0 ? "bg-success/10 text-success" : change < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  )}
                >
                  {getTrendIcon()}
                  <span>
                    {change > 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </span>
                </div>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm transition-all duration-300",
                "group-hover:scale-110 group-hover:border-border",
                getIconColor()
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
