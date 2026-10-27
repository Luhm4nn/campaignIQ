"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EngagementChart({
  className,
  data = [],
}: {
  className?: string;
  data?: DailyMetric[];
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent opacity-60" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Engagement Trends
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregated interactions and reach by publication date
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              <span className="text-muted-foreground font-medium">
                Engagement
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              <span className="text-muted-foreground font-medium">Reach</span>
            </div>
          </div>
        </div>

        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-border/40 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground">
                No time-series data available yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Publish posts to a campaign to visualize engagement and reach evolution
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="engagementGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="oklch(0.78 0.14 190)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="50%"
                      stopColor="oklch(0.78 0.14 190)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.78 0.14 190)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="reachGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="oklch(0.7 0.18 320)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="50%"
                      stopColor="oklch(0.7 0.18 320)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.7 0.18 320)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="oklch(0.22 0.02 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 11 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`
                  }
                  dx={-5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.14 0.015 250)",
                    border: "1px solid oklch(0.22 0.02 250)",
                    borderRadius: "12px",
                    color: "oklch(0.95 0.01 250)",
                    boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{
                    color: "oklch(0.55 0.02 250)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="oklch(0.78 0.14 190)"
                  strokeWidth={2.5}
                  fill="url(#engagementGradient)"
                  filter="url(#glow)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "oklch(0.78 0.14 190)",
                    strokeWidth: 2,
                    stroke: "oklch(0.12 0.015 250)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="oklch(0.7 0.18 320)"
                  strokeWidth={2.5}
                  fill="url(#reachGradient)"
                  filter="url(#glow)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "oklch(0.7 0.18 320)",
                    strokeWidth: 2,
                    stroke: "oklch(0.12 0.015 250)",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
