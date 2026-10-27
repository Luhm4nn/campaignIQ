"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  Target,
  Calendar,
  Globe,
  Users,
} from "lucide-react";
import Link from "next/link";
import { createCampaignApi } from "@/lib/api";

const platforms = ["Twitter", "Instagram", "LinkedIn", "TikTok", "Facebook"];
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
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "",
    campaignType: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    budget: "",
    followersStart: "",
    followersEnd: "",
    status: "active",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePlatformSelect = (platform: string) => {
    setFormData({
      ...formData,
      platform: formData.platform === platform ? "" : platform,
    });
  };

  const handleTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      campaignType: formData.campaignType === type ? "" : type,
    });
  };

  const handleCreateCampaign = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const created = await createCampaignApi({
        name: formData.name.trim(),
        description: formData.description.trim(),
        platform: formData.platform.toLowerCase(),
        campaignType: formData.campaignType,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        followersStart: formData.followersStart
          ? parseInt(formData.followersStart, 10)
          : 0,
        followersEnd: formData.followersEnd
          ? parseInt(formData.followersEnd, 10)
          : 0,
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="px-6 py-4 sm:px-12 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/campaigns"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                New Campaign
              </h1>
              <p className="text-sm text-muted-foreground">Step {step} of 3</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-12 lg:px-16 pb-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-12 sm:px-12 lg:px-16">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Spring Product Launch"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your campaign goals and strategy..."
                  rows={4}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Select Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformSelect(platform)}
                      className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                        formData.platform === platform
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-foreground hover:border-primary/50"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  disabled={!isStep1Complete}
                  onClick={() => setStep(2)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    isStep1Complete
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Campaign Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {campaignTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                        formData.campaignType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-foreground hover:border-primary/50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
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
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Initial Followers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.followersStart}
                    onChange={(e) =>
                      handleInputChange("followersStart", e.target.value)
                    }
                    placeholder="1000"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Current Followers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.followersEnd}
                    onChange={(e) =>
                      handleInputChange("followersEnd", e.target.value)
                    }
                    placeholder="1250"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isStep2Complete}
                  onClick={() => setStep(3)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    isStep2Complete
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="glass rounded-lg p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Campaign Name
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {formData.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Platform
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {formData.platform}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Campaign Type
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {formData.campaignType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Budget
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      ${formData.budget || "0"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Description
                  </p>
                  <p className="text-foreground">{formData.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreateCampaign}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {submitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
