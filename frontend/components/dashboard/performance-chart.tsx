"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        "rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Campaign Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comparative health scores across campaigns
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border border-border">
          Score / 100
        </span>
      </div>

      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-border rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">
              No campaigns registered
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create a campaign to compare performance scores
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a5", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8b95a5", fontSize: 11 }}
                domain={[0, 100]}
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
                formatter={(value: any) => [`${value} pts`, "Score"]}
                cursor={{ fill: "rgba(255, 255, 255, 0.06)" }}
              />
              <Bar
                dataKey="score"
                fill="oklch(0.68 0.14 250)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
