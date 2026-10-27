"use client";

import { CampaignsSkeleton } from "@/components/ui/skeleton";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useCampaignData } from "@/lib/api";
import {
  Megaphone,
  PlayCircle,
  CheckCircle2,
  BarChart2,
} from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, stats, isLoading } = useCampaignData();

  if (isLoading) {
    return <CampaignsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Campaign Management
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Campaigns
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create, manage, and analyze all your marketing campaigns in one place.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            icon={Megaphone}
            variant="primary"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Active"
            value={stats.activeCampaigns}
            icon={PlayCircle}
            variant="success"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Completed"
            value={stats.completedCampaigns}
            icon={CheckCircle2}
            variant="accent"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Score"
            value={stats.avgEngagementScore}
            icon={BarChart2}
            variant="warning"
          />
        </div>
      </div>

      <CampaignsTable data={campaigns} />
    </div>
  );
}
