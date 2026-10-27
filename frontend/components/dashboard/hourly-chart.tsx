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
        "rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Interactions by Hour
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Optimal window:{" "}
              <span className="text-foreground font-medium">
                {bestWindowLabel}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary/60" />
            <span className="text-muted-foreground font-medium">Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground font-medium">Peak</span>
          </div>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b95a5", fontSize: 11 }}
              tickFormatter={(value) => `${value}h`}
              interval={3}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b95a5", fontSize: 11 }}
              width={35}
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
                color: "#58a6ff",
                fontWeight: 500,
                padding: "2px 0",
              }}
              formatter={(value: any) => [
                Number(value).toLocaleString(),
                "Interactions",
              ]}
              labelFormatter={(value) => `${value}:00 hs`}
              cursor={{ fill: "rgba(255, 255, 255, 0.06)" }}
            />
            <Bar dataKey="interactions" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    peakHours.includes(entry.hour)
                      ? "oklch(0.7 0.15 155)"
                      : "oklch(0.68 0.14 250 / 0.55)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
