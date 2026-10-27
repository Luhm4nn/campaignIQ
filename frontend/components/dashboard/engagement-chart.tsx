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
        "rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Engagement & Reach
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated daily interactions and unique reach
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground font-medium">
              Engagement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-muted-foreground font-medium">Reach</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-border rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">
              No time-series data available
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Publish posts to a campaign to visualize engagement and reach trends
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
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
                    stopColor="oklch(0.68 0.14 250)"
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.68 0.14 250)"
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
                    stopColor="oklch(0.64 0.12 215)"
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.64 0.12 215)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a5", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a5", fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : `${value}`
                }
                dx={-4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  color: "#f0f6fc",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  padding: "10px 14px",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: "#f0f6fc",
                  marginBottom: 6,
                  fontWeight: 600,
                  fontSize: "13px",
                }}
                itemStyle={{
                  color: "#f0f6fc",
                  fontWeight: 500,
                  padding: "2px 0",
                }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="oklch(0.68 0.14 250)"
                strokeWidth={2}
                fill="url(#engagementGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "oklch(0.68 0.14 250)",
                  strokeWidth: 2,
                  stroke: "oklch(0.145 0.006 255)",
                }}
              />
              <Area
                type="monotone"
                dataKey="reach"
                stroke="oklch(0.64 0.12 215)"
                strokeWidth={2}
                fill="url(#reachGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "oklch(0.64 0.12 215)",
                  strokeWidth: 2,
                  stroke: "oklch(0.145 0.006 255)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
