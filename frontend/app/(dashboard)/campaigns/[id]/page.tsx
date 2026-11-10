"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { TopPosts } from "@/components/dashboard/top-posts";
import { InsightCard } from "@/components/dashboard/insight-card";
import { CampaignDetailSkeleton } from "@/components/ui/skeleton";
import type { CampaignDetail, AIExecutiveReport } from "@/lib/types";
import {
  fetchCampaignDetail,
  updateCampaignApi,
  deleteCampaignApi,
  getExportCsvUrl,
  syncIntegrationPostsApi,
  generateCampaignAiReportApi,
} from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Target,
  TrendingUp,
  Calendar,
  Twitter,
  Instagram,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Youtube,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Bot,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-3.5 w-3.5" />,
  instagram: <Instagram className="h-3.5 w-3.5" />,
  youtube: <Youtube className="h-3.5 w-3.5" />,
  tiktok: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const campaignId = Number(id);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<AIExecutiveReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (isNaN(campaignId)) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetchCampaignDetail(campaignId);
      setDetail(res);
      if (res?.campaign?.aiReport) {
        setAiReport(res.campaign.aiReport);
      }
    } catch {
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (isLoading) {
    return <CampaignDetailSkeleton />;
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-sm text-muted-foreground">Campaign not found</p>
        <Link href="/campaigns" className="text-primary hover:underline text-sm">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const { campaign, posts, insights, engagementOverTime, hourlyInteractions } =
    detail;

  const handleStatusChange = async (newStatus: string) => {
    await updateCampaignApi(campaign.id, { status: newStatus });
    loadDetail();
  };

  const handleDeleteCampaign = async () => {
    await deleteCampaignApi(campaign.id);
    router.push("/campaigns");
  };

  const handleSyncFromMetaGraph = async () => {
    try {
      setIsSyncing(true);
      setSyncNotice(null);
      const providerKey = ["instagram", "tiktok", "twitter", "youtube"].includes(
        campaign.platform
      )
        ? campaign.platform
        : "instagram";
      const res = await syncIntegrationPostsApi(providerKey, {
        campaignId: campaign.id,
        platform: campaign.platform,
      });
      setSyncNotice(res.message);
      await loadDetail();
    } catch (err) {
      setSyncNotice(
        err instanceof Error ? err.message : "Error syncing with API"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateAiReport = async () => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);
      const rep = await generateCampaignAiReportApi(campaign.id);
      setAiReport(rep);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Error generating AI report"
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 pb-3 border-b border-border">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Campaigns
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {campaign.name}
              </h1>
              <select
                value={campaign.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer focus:outline-none border",
                  campaign.status === "active" &&
                    "bg-success/10 text-success border-success/20",
                  campaign.status === "completed" &&
                    "bg-primary/10 text-primary border-primary/20",
                  campaign.status === "paused" &&
                    "bg-warning/10 text-warning border-warning/20",
                  campaign.status === "draft" &&
                    "bg-secondary text-muted-foreground border-border"
                )}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-border bg-secondary text-foreground">
                {platformIcons[campaign.platform] || platformIcons.instagram}
                <span className="capitalize font-medium">
                  {campaign.platform}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Started{" "}
                  {new Date(campaign.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={handleDeleteCampaign}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/25 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary/15 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isGeneratingReport ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isGeneratingReport
                ? "Consultando Google Gemini Flash..."
                : aiReport
                ? "Regenerar con IA"
                : "Generar Reporte con IA"}
            </button>
            <button
              onClick={handleSyncFromMetaGraph}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg btn-gradient text-xs font-medium text-white cursor-pointer"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")}
              />
              {isSyncing ? "Syncing API..." : "Deep Sync API"}
            </button>

            <a
              href={getExportCsvUrl(campaign.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Export CSV
            </a>
          </div>
        </div>
        {syncNotice && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/25 text-xs font-medium text-success">
            {syncNotice}
          </div>
        )}
        {reportError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Fallo de Conexión con IA
            </div>
            <p className="text-xs text-destructive/90">{reportError}</p>
          </div>
        )}
      </div>

      {/* Real-time AI consultation progress banner */}
      {isGeneratingReport && (
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 space-y-2 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Consultando Google Gemini Flash
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono uppercase font-bold">
                  En progreso
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Enviando dataset de rendimiento y análisis VADER a la API de Google para generar el diagnóstico estratégico...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Executive Report Panel */}
      {aiReport && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs animate-fadeIn">
          <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    AI Executive Growth Briefing
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Generado el {new Date(aiReport.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30 uppercase tracking-wide flex items-center gap-1.5">
                <Bot className="h-3 w-3" />
                {aiReport.modelUsed.startsWith("gemini")
                  ? `Google ${aiReport.modelUsed}`
                  : "Fallback Analítico"}
              </span>
            </div>

            <div className="grid lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {aiReport.executiveSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Sentiment &amp; NLP Diagnosis
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {aiReport.sentimentDiagnosis}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2.5">
                  <h3 className="text-xs font-semibold text-success flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Winning Content Patterns
                  </h3>
                  <ul className="space-y-1.5">
                    {aiReport.winningContentPatterns.map((pat, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">&bull;</span>
                        <span>{pat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {aiReport.weaknessesAndRisks.length > 0 && (
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2.5">
                    <h3 className="text-xs font-semibold text-warning flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Friction Points &amp; Risks
                    </h3>
                    <ul className="space-y-1.5">
                      {aiReport.weaknessesAndRisks.map((w, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-warning mt-0.5">&bull;</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {aiReport.tacticalRecommendations.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Tactical Action Plan
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {aiReport.tacticalRecommendations.map((act, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-border bg-secondary/20 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {act.title}
                        </h4>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded text-[10px] font-bold uppercase",
                            act.impact.toLowerCase() === "high"
                              ? "bg-destructive/15 text-destructive border border-destructive/25"
                              : "bg-primary/15 text-primary border border-primary/25"
                          )}
                        >
                          {act.impact}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {act.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiReport.nextPostIdeas.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="h-3.5 w-3.5 text-accent" />
                  Recommended Next Post Concepts
                </h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {aiReport.nextPostIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-card/60 text-xs text-foreground/90 flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-12">
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <StatsCard
            title="Likes"
            value={formatNumber(campaign.likes)}
            icon={Heart}
            variant="primary"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <StatsCard
            title="Comments"
            value={formatNumber(campaign.comments)}
            icon={MessageCircle}
            variant="accent"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <StatsCard
            title="Shares"
            value={formatNumber(campaign.shares)}
            icon={Share2}
            variant="warning"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatsCard
            title="Reach"
            value={formatNumber(campaign.reach)}
            icon={Eye}
            variant="success"
          />
        </div>
        <div className="col-span-12 sm:col-span-12 lg:col-span-3">
          <StatsCard
            title="Engagement Rate"
            value={`${campaign.engagementRate}%`}
            change={campaign.growth}
            icon={Target}
            variant="primary"
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-12">
        <EngagementChart
          className="col-span-12 lg:col-span-7"
          data={engagementOverTime}
        />
        <HourlyChart
          className="col-span-12 lg:col-span-5"
          data={hourlyInteractions}
        />
      </div>

      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <TopPosts posts={posts} limit={10} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Recommendations
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Computed from campaign posts
              </p>
            </div>
            <div className="p-4 space-y-3">
              {insights.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">
                  Add posts to this campaign to generate specific recommendations.
                </p>
              ) : (
                insights.slice(0, 3).map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onClick={() => router.push("/insights")}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                Campaign Summary
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick overview of metrics
              </p>
            </div>
            <div className="p-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Posts</span>
                <span className="font-medium text-foreground tabular-nums">
                  {campaign.postsCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impressions</span>
                <span className="font-medium text-foreground tabular-nums">
                  {formatNumber(campaign.impressions)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium text-foreground tabular-nums">
                  ${campaign.budget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Health Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${campaign.engagementScore}%` }}
                    />
                  </div>
                  <span className="font-semibold text-foreground tabular-nums">
                    {campaign.engagementScore}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Growth</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium tabular-nums",
                    campaign.growth > 0
                      ? "text-success"
                      : campaign.growth < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {campaign.growth > 0 ? "+" : ""}
                  {campaign.growth}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
