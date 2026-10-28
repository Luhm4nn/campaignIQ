"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Calendar,
  Globe,
  Users,
  Check,
  Sparkles,
  Hash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createCampaignApi, lookupFollowersApi } from "@/lib/api";

const platforms = ["YouTube", "Twitter", "Instagram", "TikTok"];
const campaignTypes = [
  "Product Launch",
  "Awareness",
  "Engagement",
  "Conversion",
  "Retention",
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingFollowers, setFetchingFollowers] = useState(false);
  const [followerFetchMsg, setFollowerFetchMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "",
    targetHandle: "",
    targetKeywords: "",
    campaignType: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    budget: "",
    followersStart: "",
    status: "active",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlatformSelect = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platform: prev.platform === platform ? "" : platform,
    }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      campaignType: prev.campaignType === type ? "" : type,
    }));
  };

  const autoFetchFollowers = async (platformName?: string, handle?: string) => {
    const plat = platformName || formData.platform;
    const user = handle || formData.targetHandle;
    if (!plat || !user.trim()) return;

    try {
      setFetchingFollowers(true);
      setFollowerFetchMsg(null);
      const res = await lookupFollowersApi(plat, user);
      if (res.ok && res.followers > 0) {
        setFormData((prev) => ({
          ...prev,
          followersStart: String(res.followers),
        }));
        setFollowerFetchMsg(`Sugerido automáticamente: ${res.followers.toLocaleString()} seguidores.`);
      } else {
        setFollowerFetchMsg(res.message || "No se pudo detectar el conteo exacto.");
      }
    } catch (err) {
      setFollowerFetchMsg("No se pudo autodetectar el perfil (puedes ingresarlo a mano).");
    } finally {
      setFetchingFollowers(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const startCount = formData.followersStart
        ? parseInt(formData.followersStart, 10)
        : 0;

      const created = await createCampaignApi({
        name: formData.name.trim(),
        description: formData.description.trim(),
        platform: formData.platform.toLowerCase(),
        campaignType: formData.campaignType,
        targetHandle: formData.targetHandle.trim() || undefined,
        targetKeywords: formData.targetKeywords.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        followersStart: startCount,
        followersEnd: startCount, // Al crearse, el punto actual arranca idéntico al inicial
        status: formData.status,
      });
      router.push(`/campaigns/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error creating campaign"
      );
      setSubmitting(false);
    }
  };

  const isStep1Complete =
    formData.name.trim() && formData.description.trim() && formData.platform;
  const isStep2Complete = formData.campaignType && formData.startDate;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="p-2 hover:bg-secondary rounded-lg border border-border transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              New Campaign
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step} of 3 &middot;{" "}
              {step === 1
                ? "Identity & Channel"
                : step === 2
                ? "Schedule & Parameters"
                : "Review & Launch"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step
                  ? "bg-gradient-to-r from-primary to-accent"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-fadeIn">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/50" />
            <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Q3 Product Launch"
                className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your campaign goals and target audience..."
                rows={3}
                className="w-full p-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Select Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformSelect(platform)}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      formData.platform === platform
                        ? "btn-gradient text-white border-transparent shadow-xs"
                        : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {formData.platform && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2">
                  <label className="block text-xs font-semibold text-primary flex items-center gap-1.5">
                    <span>⚡ Auto-Scraping Activo: @Usuario o Canal ({formData.platform})</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetHandle}
                    onChange={(e) => handleInputChange("targetHandle", e.target.value)}
                    placeholder={
                      formData.platform === "YouTube"
                        ? "ej: @NASA o @mrbeast"
                        : formData.platform === "Twitter"
                        ? "ej: @NASA o @OpenAI"
                        : "ej: @nike o tu @cuenta"
                    }
                    className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Al avanzar, CampaignIQ consultará automáticamente el perfil en vivo para sugerir tus seguidores actuales de partida.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    <span>Filtro de Asignación por Hashtags / Palabras Clave (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetKeywords}
                    onChange={(e) => handleInputChange("targetKeywords", e.target.value)}
                    placeholder="ej: #artemis, orion, lanzamiento, promo"
                    className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Separa por comas. Si gestionas múltiples campañas en la misma cuenta, el scraper solo asignará a esta campaña los posts que incluyan estos hashtags o términos. Si lo dejas vacío, asocia todo el canal.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!isStep1Complete}
                onClick={async () => {
                  setStep(2);
                  if (formData.targetHandle.trim() && !formData.followersStart) {
                    await autoFetchFollowers();
                  }
                }}
                className={`py-2.5 px-6 rounded-lg text-sm font-medium transition-all ${
                  isStep1Complete
                    ? "btn-gradient text-white cursor-pointer"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-fadeIn">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/50" />
            <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Campaign Objective
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {campaignTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      formData.campaignType === type
                        ? "btn-gradient text-white border-transparent shadow-xs"
                        : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    handleInputChange("endDate", e.target.value)
                  }
                  className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Budget (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.budget}
                  onChange={(e) =>
                    handleInputChange("budget", e.target.value)
                  }
                  placeholder="0"
                  className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Seguidores Actuales (Punto de partida)
                  </label>
                  {formData.targetHandle && (
                    <button
                      type="button"
                      onClick={() => autoFetchFollowers()}
                      disabled={fetchingFollowers}
                      className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {fetchingFollowers ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Consultando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Recalcular en vivo
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.followersStart}
                    onChange={(e) =>
                      handleInputChange("followersStart", e.target.value)
                    }
                    placeholder="ej: 5000"
                    className="w-full h-10 px-3.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {fetchingFollowers && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {followerFetchMsg && (
                  <p className="text-[11px] text-primary/80 mt-1.5">
                    {followerFetchMsg}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tu cuenta arranca con esta cantidad. A medida que la campaña progrese, el sistema calculará automáticamente la ganancia.
                </p>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!isStep2Complete}
                onClick={() => setStep(3)}
                className={`py-2.5 px-6 rounded-lg text-sm font-medium transition-all ${
                  isStep2Complete
                    ? "btn-gradient text-white cursor-pointer"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                Review
              </button>
            </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden animate-fadeIn">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary/50" />
            <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Campaign Name
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Platform
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.platform} {formData.targetHandle ? `(${formData.targetHandle})` : ""}
                </p>
              </div>
              {formData.targetKeywords && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Filtro Keywords
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formData.targetKeywords}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Objective
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formData.campaignType}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Budget
                </p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  ${formData.budget || "0"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Seguidores de Inicio
                </p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {formData.followersStart ? parseInt(formData.followersStart, 10).toLocaleString() : "0"}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {formData.description}
              </p>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="py-2.5 px-5 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateCampaign}
                disabled={submitting}
                className="py-2.5 px-6 rounded-lg text-sm font-medium btn-gradient text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                {submitting ? "Creating..." : "Create Campaign"}
              </button>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
