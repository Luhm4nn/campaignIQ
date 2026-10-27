"use client";

import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useCampaignData } from "@/lib/api";
import {
  Megaphone,
  PlayCircle,
  CheckCircle2,
  FileEdit,
  Zap,
} from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, stats } = useCampaignData();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span>Campaign Management</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and analyze all your marketing campaigns in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            icon={Megaphone}
            variant="primary"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Active"
            value={stats.activeCampaigns}
            icon={PlayCircle}
            variant="success"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Completed"
            value={stats.completedCampaigns}
            icon={CheckCircle2}
            variant="accent"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatsCard
            title="Avg. Score"
            value={stats.avgEngagementScore}
            icon={FileEdit}
            variant="warning"
          />
        </div>
      </div>

      <CampaignsTable data={campaigns} />
    </div>
  );
}
