"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

const colors = [
  "oklch(0.78 0.14 190)",
  "oklch(0.7 0.18 320)",
  "oklch(0.72 0.16 155)",
  "oklch(0.82 0.14 85)",
  "oklch(0.68 0.2 30)",
  "oklch(0.75 0.12 250)",
];

export function PerformanceChart({
  className,
  campaignsData = [],
}: {
  className?: string;
  campaignsData?: Campaign[];
}) {
  const data = campaignsData.slice(0, 6).map((c) => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "..." : c.name,
    score: c.engagementScore,
    growth: c.growth,
  }));

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent opacity-60" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Campaign Performance
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Health scores by campaign
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Live</span>
          </div>
        </div>

        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-border/40 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground">
                No campaigns registered yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create a campaign to compare performance scores
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                barCategoryGap="25%"
              >
                <defs>
                  {colors.map((color, i) => (
                    <linearGradient
                      key={i}
                      id={`barGradient${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                  <filter id="barGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 10 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 11 }}
                  domain={[0, 100]}
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
                  cursor={{ fill: "oklch(0.22 0.02 250 / 0.5)" }}
                />
                <Bar
                  dataKey="score"
                  radius={[8, 8, 0, 0]}
                  filter="url(#barGlow)"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#barGradient${index % colors.length})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
