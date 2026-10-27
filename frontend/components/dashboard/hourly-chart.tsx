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
import type { HourlyMetric } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const defaultHours: HourlyMetric[] = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  interactions: 0,
}));

export function HourlyChart({
  className,
  data = defaultHours,
}: {
  className?: string;
  data?: HourlyMetric[];
}) {
  const chartData = data.length === 24 ? data : defaultHours;
  const maxValue = Math.max(0, ...chartData.map((d) => d.interactions));
  const peakHours =
    maxValue > 0
      ? chartData
          .filter((d) => d.interactions >= maxValue * 0.85)
          .map((d) => d.hour)
      : [];

  const bestHour =
    maxValue > 0
      ? chartData.reduce((best, curr) =>
          curr.interactions > best.interactions ? curr : best
        ).hour
      : null;

  const bestWindowLabel =
    bestHour !== null
      ? `${String(bestHour).padStart(2, "0")}:00 - ${String(
          (bestHour + 1) % 24
        ).padStart(2, "0")}:00`
      : "No data yet";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-border",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-success/10 via-success/5 to-transparent opacity-60" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Interactions by Hour
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">
                Best time:{" "}
                <span className="text-success font-semibold">
                  {bestWindowLabel}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              <span className="text-muted-foreground font-medium">Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
              <span className="text-muted-foreground font-medium">Peak</span>
            </div>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.78 0.14 190)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.78 0.14 190)"
                    stopOpacity={0.5}
                  />
                </linearGradient>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="oklch(0.72 0.16 155)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="oklch(0.72 0.16 155)"
                    stopOpacity={0.5}
                  />
                </linearGradient>
                <filter id="hourlyGlow">
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
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 10 }}
                tickFormatter={(value) => `${value}h`}
                interval={3}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.55 0.02 250)", fontSize: 10 }}
                width={35}
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
                labelFormatter={(value) => `${value}:00`}
                cursor={{ fill: "oklch(0.22 0.02 250 / 0.5)" }}
              />
              <Bar
                dataKey="interactions"
                radius={[4, 4, 0, 0]}
                filter="url(#hourlyGlow)"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      peakHours.includes(entry.hour)
                        ? "url(#peakGradient)"
                        : "url(#hourlyGradient)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
