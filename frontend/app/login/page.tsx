"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
  Building2,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  ChevronDown,
  AlertCircle,
  Loader2,
  TrendingUp,
  Download,
  Search,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loginApi, registerApi, fetchMeApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // Auth mode: "login" or "register"
  const [mode, setMode] = useState<"login" | "register">("login");
  // Stepper state for register (1, 2, 3)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Login form state
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [regCompany, setRegCompany] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    fetchMeApi()
      .then((user) => {
        if (user) {
          router.replace("/");
        }
      })
      .catch(() => {});
  }, [router]);

  const switchMode = (target: "login" | "register") => {
    setError(null);
    setMode(target);
    if (target === "register") {
      setRegStep(1);
    }
  };

  // Password strength helper
  const passLengthOk = regPassword.length >= 6;
  const passHasNumber = /\d/.test(regPassword);
  const passHasUpper = /[A-Z]/.test(regPassword);
  const passMatches =
    regPassword.length > 0 && regPassword === regConfirmPassword;
  const strengthScore =
    (passLengthOk ? 1 : 0) +
    (passHasNumber ? 1 : 0) +
    (passHasUpper ? 1 : 0) +
    (regPassword.length >= 10 ? 1 : 0);

  const isRegStep1Valid =
    regName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
  const isRegStep2Valid = passLengthOk && passMatches;

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !loginPassword) {
      setError("Please enter your email/username and password to continue.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await loginApi({
        identifier: identifier.trim(),
        password: loginPassword,
      });
      setIsExiting(true);
      setTimeout(() => {
        router.push("/");
      }, 260);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in"
      );
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!isRegStep1Valid) {
        setError("Please enter your full name and a valid email address.");
        return;
      }
      setError(null);
      setRegStep(2);
      return;
    }
    if (regStep === 2) {
      if (!isRegStep2Valid) {
        setError(
          "Password must be at least 6 characters long and both fields must match."
        );
        return;
      }
      setError(null);
      setRegStep(3);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await registerApi({
        name: regName.trim(),
        email: regEmail.trim(),
        username: regUsername.trim() || undefined,
        password: regPassword,
        company: regCompany.trim() || "Pro Workspace",
      });
      setIsExiting(true);
      setTimeout(() => {
        router.push("/");
      }, 260);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account"
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Ambient Background Fades & Radial Halos */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-36 -left-36 h-[38rem] w-[38rem] rounded-full blur-3xl transition-opacity duration-700",
            isExiting ? "opacity-0" : "opacity-20"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.14 190 / 0.28) 0%, transparent 70%)",
          }}
        />
        <div
          className={cn(
            "absolute top-1/3 left-1/4 h-[34rem] w-[34rem] rounded-full blur-3xl transition-opacity duration-700",
            isExiting ? "opacity-0" : "opacity-15"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.19 325 / 0.25) 0%, transparent 72%)",
          }}
        />
        <div
          className={cn(
            "absolute -bottom-40 right-10 h-[36rem] w-[36rem] rounded-full blur-3xl transition-opacity duration-700",
            isExiting ? "opacity-0" : "opacity-20"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.14 190 / 0.22) 0%, oklch(0.68 0.19 325 / 0.16) 45%, transparent 72%)",
          }}
        />
        {/* Subtle grid pattern with fade */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Main Split-Screen Container */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-[1380px] px-6 lg:px-12 transition-opacity duration-300",
          isExiting ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 min-h-screen items-start">
          {/* =================================================================
              LEFT COLUMN: SCROLLABLE SHOWCASE WITH FADE
             ================================================================= */}
          <div className="lg:col-span-7 py-10 lg:py-16 space-y-16">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient text-white shadow-md">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-semibold tracking-tight text-foreground">
                    Campaign<span className="text-gradient font-bold">IQ</span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Performance &amp; Sentiment Intelligence
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Pro Access Included
              </span>
            </div>

            {/* Hero Section */}
            <section className="space-y-6 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/80 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Live Extraction Engine &middot; VADER NLP &middot; AI Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.12] text-balance">
                Turn every social post into{" "}
                <span className="text-gradient">
                  actionable intelligence
                </span>{" "}
                in real time.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed text-balance">
                Connect any <b>Instagram</b>, <b>TikTok</b>, <b>YouTube</b>, or{" "}
                <b>X / Twitter</b> account without credential sharing. Spot top-performing
                creative immediately, score audience sentiment with NLP, and
                export analysis-ready datasets in seconds.
              </p>

              {/* Integrated Live Intelligence Console Strip */}
              <div className="rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_32px_-12px_rgba(0,0,0,0.6)]">
                <div className="grid sm:grid-cols-3 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                  {/* Pod 1: Live Networks */}
                  <div className="space-y-2.5 sm:pr-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        Multi-Channel Sync
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success border border-success/30">
                        Live 120ms
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/80 border border-border/80 text-[11px] font-medium text-foreground">
                        <Instagram className="h-3 w-3 text-primary" /> IG
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/80 border border-border/80 text-[11px] font-medium text-foreground">
                        <Globe className="h-3 w-3 text-accent" /> TikTok
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/80 border border-border/80 text-[11px] font-medium text-foreground">
                        <Youtube className="h-3 w-3 text-destructive" /> YT
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/80 border border-border/80 text-[11px] font-medium text-foreground">
                        <Twitter className="h-3 w-3 text-primary" /> X
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Automatic ingestion directly via public APIs &amp; scrapers.
                    </p>
                  </div>

                  {/* Pod 2: Sentiment Spectrum */}
                  <div className="space-y-2.5 pt-4 sm:pt-0 sm:px-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-accent" />
                        VADER NLP Polarity
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        +0.84 Score
                      </span>
                    </div>
                    {/* Polarity Spectrum Track */}
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-secondary/90 overflow-hidden flex">
                        <div className="h-full bg-success" style={{ width: "72%" }} title="72% Positive" />
                        <div className="h-full bg-warning" style={{ width: "18%" }} title="18% Neutral" />
                        <div className="h-full bg-destructive" style={{ width: "10%" }} title="10% Negative" />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>72% Positive</span>
                        <span>18% Neutral</span>
                        <span>10% Negative</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Compound sentiment classification calculated per post.
                    </p>
                  </div>

                  {/* Pod 3: AI Intelligence Engine */}
                  <div className="space-y-2.5 pt-4 sm:pt-0 sm:pl-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        AI Analytics
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 uppercase">
                        Active
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-success" />
                      Executive Insights
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Generates optimal posting windows &amp; creative winners.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <ChevronDown className="h-4 w-4 text-primary animate-gentle-slide" />
                <span>Explore the four core capabilities below</span>
              </div>
            </section>

            {/* Section 1: Spot top-performing posts immediately */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  Spot top-performing posts immediately
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                  No manual spreadsheet math. CampaignIQ benchmarks reach against engagement rate to isolate viral hits from baseline content in seconds.
                </p>
              </div>

              {/* Comparative Post Specimens */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {/* Specimen A: High Performer */}
                <div className="rounded-xl border border-border/80 bg-card/90 overflow-hidden glow-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  {/* Top Performance Rail */}
                  <div className="h-1.5 w-full bg-secondary/80">
                    <div className="h-full bg-success" style={{ width: "94%" }} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-foreground">
                        <Instagram className="h-3.5 w-3.5 text-primary" />
                        Instagram Reel
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-success/15 text-success border border-success/30 font-mono">
                        94 / 100
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        Q4 Flagship Platform Walkthrough
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        &ldquo;Introducing our real-time social telemetry suite: monitor baseline audience shifts across all channels...&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-secondary/40 border border-border/60 text-center font-mono text-xs">
                      <div>
                        <span className="block text-[10px] text-muted-foreground">Reach</span>
                        <span className="font-semibold text-foreground">142.8K</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">ER Rate</span>
                        <span className="font-semibold text-success">8.4%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">VADER</span>
                        <span className="font-semibold text-primary">+0.88</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                      <span className="flex items-center gap-1 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Breakout Performance
                      </span>
                      <span>Top 2% of campaign</span>
                    </div>
                  </div>
                </div>

                {/* Specimen B: Baseline Content */}
                <div className="rounded-xl border border-border/80 bg-card/90 overflow-hidden glow-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] opacity-90">
                  {/* Top Benchmark Rail */}
                  <div className="h-1.5 w-full bg-secondary/80">
                    <div className="h-full bg-primary/70" style={{ width: "48%" }} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-xs font-medium text-foreground">
                        <Youtube className="h-3.5 w-3.5 text-destructive" />
                        YouTube Keynote
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-secondary text-muted-foreground border border-border/80 font-mono">
                        48 / 100
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        Quarterly Engineering Townhall
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        &ldquo;Deep dive into the architectural milestones, API contracts, and infrastructure security roadmap...&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-secondary/40 border border-border/60 text-center font-mono text-xs">
                      <div>
                        <span className="block text-[10px] text-muted-foreground">Reach</span>
                        <span className="font-semibold text-foreground">28.4K</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">ER Rate</span>
                        <span className="font-semibold text-muted-foreground">2.4%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">VADER</span>
                        <span className="font-semibold text-muted-foreground">+0.22</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                      <span className="text-muted-foreground">Standard Baseline</span>
                      <span>Average engagement</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Auto-scrape @handles and isolate campaign hashtags */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  Auto-scrape @handles and isolate campaign hashtags
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                  Link any public profile without asking for credentials. CampaignIQ snapshots baseline followers on day one and isolates metrics only for publications that match your target campaign hashtags.
                </p>
              </div>

              {/* Target Channel Resolution Specimen */}
              <div className="rounded-xl border border-border/80 bg-card/85 p-5 space-y-4 glow-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-semibold text-foreground">
                        @acme_hq
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        1,420,000 baseline followers captured
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Filter:</span>
                    <span className="px-2.5 py-1 rounded-md bg-secondary border border-border font-mono text-xs font-semibold text-primary">
                      #LaunchCampaign26
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <Instagram className="h-3.5 w-3.5 text-primary" />
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Instagram</p>
                    <p className="text-[10px] text-muted-foreground">24 posts matched</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <Globe className="h-3.5 w-3.5 text-accent" />
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">TikTok</p>
                    <p className="text-[10px] text-muted-foreground">16 clips matched</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <Youtube className="h-3.5 w-3.5 text-destructive" />
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">YouTube</p>
                    <p className="text-[10px] text-muted-foreground">6 videos matched</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <Twitter className="h-3.5 w-3.5 text-primary" />
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">X / Twitter</p>
                    <p className="text-[10px] text-muted-foreground">8 threads matched</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: AI-driven analysis based on real campaign data */}
            <section className="space-y-4 pt-6 border-t border-border/60">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  AI-driven analysis based on real campaign data
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                  Turn raw engagement telemetry and VADER polarity signals into clear executive recommendations, creative format winners, and optimal posting schedules.
                </p>
              </div>

              {/* Executive AI Briefing Specimen */}
              <div className="rounded-xl border border-border/80 bg-card/85 p-5 space-y-4 glow-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">
                        Executive Intelligence Briefing
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Generated automatically from real post telemetry
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 uppercase font-mono">
                    Model: Synthesis
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
                      <TrendingUp className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Creative Format Velocity</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Short-form video drove <b>3.4x higher comment retention</b> than static multi-image carousels across the same audience cohort.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Sliders className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Timing Optimization</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Peak interaction windows cluster on <b>Thursdays between 18:30 and 21:00 UTC</b>, delivering +38% reach acceleration.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
                      <BarChart3 className="h-3 w-3" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Sentiment Distribution</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <b>89% positive sentiment</b> centered on usability demos; negative mentions were strictly confined to regional availability inquiries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: One-click clean CSV exports for Power BI & Excel */}
            <section className="space-y-4 pt-6 border-t border-border/60 pb-12">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
                  One-click clean CSV exports for Power BI &amp; Excel
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                  Need to blend campaign data into your company&apos;s data warehouse or executive spreadsheets? Export structured, UTF-8 encoded datasets with pre-computed metrics in one click.
                </p>
              </div>

              {/* Data Table Specimen */}
              <div className="rounded-xl border border-border/80 bg-card/85 p-5 space-y-3.5 glow-card shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-success" />
                    <span className="text-xs font-mono font-medium text-foreground">
                      campaign_export_q4.csv
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border text-xs font-medium text-foreground">
                    <Download className="h-3 w-3 text-primary" />
                    <span>Download Ready</span>
                  </span>
                </div>

                {/* Tabular Rows Preview */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border/60">
                        <th className="py-1.5 pr-4 font-medium">POST_ID</th>
                        <th className="py-1.5 px-4 font-medium">NETWORK</th>
                        <th className="py-1.5 px-4 font-medium text-right">REACH</th>
                        <th className="py-1.5 px-4 font-medium text-right">ER_RATE</th>
                        <th className="py-1.5 pl-4 font-medium text-right">VADER_SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-foreground">
                      <tr>
                        <td className="py-2 pr-4 text-muted-foreground">#post_9821</td>
                        <td className="py-2 px-4">instagram</td>
                        <td className="py-2 px-4 text-right">142,840</td>
                        <td className="py-2 px-4 text-right text-success font-semibold">8.4%</td>
                        <td className="py-2 pl-4 text-right text-primary font-semibold">+0.88</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-muted-foreground">#post_9822</td>
                        <td className="py-2 px-4">tiktok</td>
                        <td className="py-2 px-4 text-right">98,200</td>
                        <td className="py-2 px-4 text-right text-success font-semibold">6.2%</td>
                        <td className="py-2 pl-4 text-right text-primary font-semibold">+0.74</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 text-muted-foreground">#post_9823</td>
                        <td className="py-2 px-4">youtube</td>
                        <td className="py-2 px-4 text-right">28,400</td>
                        <td className="py-2 px-4 text-right text-muted-foreground">2.4%</td>
                        <td className="py-2 pl-4 text-right text-muted-foreground">+0.22</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================================
              RIGHT COLUMN: FIXED LOGIN / STEPPER REGISTER MODAL
             ================================================================= */}
          <div className="lg:col-span-5 pb-12 lg:py-0">
            <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(36vw,500px)] xl:w-[510px] z-30">
              <div className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden">
                {/* Top Gradient Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

                <div className="p-6 sm:p-8 space-y-6">
                {/* Mode Switcher Tabs (Login vs Register) */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary/80 border border-border/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      mode === "login"
                        ? "bg-card text-foreground shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      mode === "register"
                        ? "bg-card text-foreground shadow-xs border border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Create Pro Account
                  </button>
                </div>

                {/* Modal Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
                      {mode === "login"
                        ? "Welcome back!"
                        : regStep === 1
                        ? "Create your Pro account"
                        : regStep === 2
                        ? "Set up your security"
                        : "Customize your Workspace"}
                    </h2>
                    {mode === "register" && (
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        Step {regStep} of 3
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed text-balance">
                    {mode === "login"
                      ? "Enter your email or username to access your analytics workspace."
                      : regStep === 1
                      ? "Basic profile details to activate your unlimited Pro account."
                      : regStep === 2
                      ? "Your password is encrypted with PBKDF2-SHA256 and brute-force protection."
                      : "Final step: set your brand, team, or agency name."}
                  </p>
                </div>

                {/* Stepper Progress Bar for Register Mode */}
                {mode === "register" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-label={`Go to step ${s}`}
                          onClick={() => {
                            if (s < regStep) setRegStep(s as 1 | 2 | 3);
                          }}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            s <= regStep
                              ? "bg-primary shadow-xs"
                              : "bg-secondary/80"
                          )}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span
                        className={cn(
                          regStep >= 1 && "text-foreground font-medium"
                        )}
                      >
                        1. Identity
                      </span>
                      <span
                        className={cn(
                          regStep >= 2 && "text-foreground font-medium"
                        )}
                      >
                        2. Password
                      </span>
                      <span
                        className={cn(
                          regStep >= 3 && "text-foreground font-medium"
                        )}
                      >
                        3. Pro Workspace
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive animate-fadeIn shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ===========================================================
                    LOGIN FORM
                   =========================================================== */}
                {mode === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-muted-foreground">
                        Email or Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="you@domain.com or @username"
                          autoComplete="username"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-muted-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showLoginPass ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                        />
                        <button
                          type="button"
                          aria-label={showLoginPass ? "Hide password" : "Show password"}
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {showLoginPass ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl btn-gradient text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-3 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">
                        Don&apos;t have an account yet?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("register")}
                          className="text-primary font-semibold hover:underline cursor-pointer"
                        >
                          Sign up in 3 steps &rarr;
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* ===========================================================
                      REGISTER STEPPER FORM (3 STEPS IN-PLACE)
                     =========================================================== */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
                    {regStep === 1 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="e.g., Alex Morgan"
                              autoFocus
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="you@domain.com"
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Username (Optional, for quick sign-in)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                              @
                            </span>
                            <input
                              type="text"
                              value={regUsername}
                              onChange={(e) => setRegUsername(e.target.value)}
                              placeholder="alexmorgan"
                              className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!isRegStep1Valid}
                          className={cn(
                            "w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                            isRegStep1Valid
                              ? "btn-gradient text-white cursor-pointer"
                              : "bg-secondary text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          <span>Next: Security</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {regStep === 2 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Create Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type={showRegPass ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              autoFocus
                              className="w-full h-11 pl-10 pr-10 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                            <button
                              type="button"
                              aria-label={showRegPass ? "Hide password" : "Show password"}
                              onClick={() => setShowRegPass(!showRegPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                              {showRegPass ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type={showRegPass ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) =>
                                setRegConfirmPassword(e.target.value)
                              }
                              placeholder="Re-enter your password"
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                          </div>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">
                              Password strength
                            </span>
                            <span className="font-medium text-foreground">
                              {strengthScore <= 1
                                ? "Basic"
                                : strengthScore <= 2
                                ? "Medium"
                                : "Strong"}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4].map((lvl) => (
                              <div
                                key={lvl}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-colors",
                                  lvl <= strengthScore
                                    ? "bg-gradient-to-r from-primary to-accent"
                                    : "bg-secondary"
                                )}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground pt-1">
                            <span
                              className={cn(
                                passLengthOk && "text-success font-medium"
                              )}
                            >
                              ✓ 6+ characters
                            </span>
                            <span
                              className={cn(
                                passMatches && "text-success font-medium"
                              )}
                            >
                              ✓ Passwords match
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setRegStep(1)}
                            className="h-11 px-4 rounded-xl bg-secondary/80 border border-border/80 text-xs font-medium text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={!isRegStep2Valid}
                            className={cn(
                              "flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                              isRegStep2Valid
                                ? "btn-gradient text-white cursor-pointer"
                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            <span>Next: Workspace</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {regStep === 3 && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Brand, Company, or Agency
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={regCompany}
                              onChange={(e) => setRegCompany(e.target.value)}
                              placeholder="e.g., Acme Growth Studio"
                              autoFocus
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input/90 border border-border/80 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all"
                            />
                          </div>
                        </div>

                        {/* Summary + Pro Badge Card */}
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              Assigned Plan
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-primary/20 text-primary border border-primary/30">
                              UNLIMITED PRO
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Account for <b>{regName}</b> ({regEmail}). Includes
                            unlimited campaigns, multi-network live scraping,
                            VADER NLP sentiment engine, and CSV exports.
                          </p>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setRegStep(2)}
                            disabled={loading}
                            className="h-11 px-4 rounded-xl bg-secondary/80 border border-border/80 text-xs font-medium text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl btn-gradient text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Creating account...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                <span>Create Account &amp; Enter</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border text-center">
                      <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="text-primary font-semibold hover:underline cursor-pointer"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </form>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
