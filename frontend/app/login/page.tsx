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
            isExiting ? "opacity-0" : "opacity-35"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.14 190 / 0.45) 0%, transparent 70%)",
          }}
        />
        <div
          className={cn(
            "absolute top-1/3 left-1/4 h-[34rem] w-[34rem] rounded-full blur-3xl transition-opacity duration-700",
            isExiting ? "opacity-0" : "opacity-25"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.68 0.19 325 / 0.42) 0%, transparent 72%)",
          }}
        />
        <div
          className={cn(
            "absolute -bottom-40 right-10 h-[36rem] w-[36rem] rounded-full blur-3xl transition-opacity duration-700",
            isExiting ? "opacity-0" : "opacity-30"
          )}
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.14 190 / 0.32) 0%, oklch(0.68 0.19 325 / 0.22) 45%, transparent 72%)",
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

            {/* Section 1: Hero Statement + Live Preview */}
            <section className="space-y-6 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
                Live Scraping &middot; VADER NLP &middot; AI Insights
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
                Turn every social post into{" "}
                <span className="text-gradient">
                  actionable intelligence
                </span>{" "}
                in real time.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Connect any <b>Instagram</b>, <b>TikTok</b>, <b>YouTube</b>, or{" "}
                <b>X / Twitter</b> account without complex setups. Spot top-performing
                content at a glance, measure audience sentiment with NLP, and
                uncover your peak engagement windows.
              </p>

              {/* Quick KPI Strip */}
              <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-md overflow-hidden glow-card">
                  <div className="h-1 w-full bg-gradient-to-r from-success via-primary to-success" />
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Live Scraping</span>
                      <Zap className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      4 Networks
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      IG, TikTok, YouTube &amp; X with real metrics
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-md overflow-hidden glow-card">
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>NLP Engine</span>
                      <BarChart3 className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      VADER Score
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Automated polarity classification per post
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-md overflow-hidden glow-card">
                  <div className="h-1 w-full bg-gradient-to-r from-accent via-primary to-success" />
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>AI Intelligence</span>
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      AI Analysis
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Smart reports &amp; data-driven recommendations
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <ChevronDown className="h-4 w-4 text-primary animate-bounce" />
                <span>Scroll down to explore how it works</span>
              </div>
            </section>

            {/* Section 1: Instant Visual Readability & Engagement Index */}
            <section className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    01 &middot; Instant Visual Readability
                  </span>
                  <h2 className="text-xl font-semibold text-foreground mt-1">
                    Spot top-performing posts immediately
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quickly identify which publications are driving real traction across your campaigns through a unified{" "}
                <span className="text-foreground font-medium">
                  composite engagement index
                </span>{" "}
                and automated performance tiering.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                {/* Sample High Performer Card */}
                <div className="rounded-xl border border-border bg-card/90 overflow-hidden glow-card">
                  <div className="h-1.5 w-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-success via-primary to-success"
                      style={{ width: "94%" }}
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Instagram className="h-3.5 w-3.5 text-primary" />
                        Q4 Product Launch Reel
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-success/10 text-success border border-success/25">
                        94 pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      &ldquo;Introducing our next-generation platform with
                      real-time telemetry...&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                      <span>ER: 8.4% &middot; Positive Sentiment</span>
                      <span className="text-success font-medium">
                        High Performer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sample Solid Engagement Card */}
                <div className="rounded-xl border border-border bg-card/90 overflow-hidden glow-card">
                  <div className="h-1.5 w-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                      style={{ width: "74%" }}
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Youtube className="h-3.5 w-3.5 text-accent" />
                        Full Keynote Walkthrough
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/25">
                        74 pts
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      &ldquo;Deep dive into the key performance milestones for
                      this season...&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                      <span>ER: 5.1% &middot; Positive Sentiment</span>
                      <span className="text-primary font-medium">
                        Solid Engagement
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Multi-channel Auto-Scraping & Keywords */}
            <section className="space-y-4 pt-4 border-t border-border/60">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  02 &middot; Auto-Scraping &amp; Hashtag Filtering
                </span>
                <h2 className="text-xl font-semibold text-foreground mt-1">
                  Enter a @handle, filter by hashtag, and let the engine do the rest
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When launching a campaign, CampaignIQ automatically fetches live
                follower counts as your baseline, imports real posts, and tracks
                organic audience growth over time.
              </p>

              <div className="rounded-xl border border-border bg-card/85 p-5 space-y-3 glow-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium">
                    <Instagram className="h-3.5 w-3.5 text-primary" />{" "}
                    Instagram
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium">
                    <Youtube className="h-3.5 w-3.5 text-destructive" />{" "}
                    YouTube
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium">
                    <Twitter className="h-3.5 w-3.5 text-primary" /> Twitter / X
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium">
                    <Globe className="h-3.5 w-3.5 text-accent" /> TikTok
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports multi-campaign attribution on the same social account
                  by isolating posts that match your target hashtags or keywords.
                </p>
              </div>
            </section>

            {/* Section 3: AI-Driven Analysis & Reports */}
            <section className="space-y-4 pt-4 border-t border-border/60">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  03 &middot; AI-Driven Analysis &amp; Smart Reports
                </span>
                <h2 className="text-xl font-semibold text-foreground mt-1">
                  AI-driven analysis based on your real campaign data
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn raw engagement telemetry and VADER sentiment signals into
                executive recommendations, optimal posting windows, and
                automated performance summaries tailored to your audience.
              </p>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-border bg-card/85 overflow-hidden glow-card">
                  <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Automated Executive Insights</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Detects content format winners, audience sentiment shifts,
                      and peak hourly interaction windows automatically.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card/85 overflow-hidden glow-card">
                  <div className="h-1 w-full bg-gradient-to-r from-accent to-success" />
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <BarChart3 className="h-3.5 w-3.5 text-accent" />
                      <span>Data-Backed Recommendations</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Actionable next steps generated directly from empirical
                      reach, engagement rate, and polarity scores.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Export CSVs for Power BI or Excel */}
            <section className="space-y-4 pt-4 border-t border-border/60 pb-12">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-success">
                  04 &middot; BI &amp; Spreadsheet Ready
                </span>
                <h2 className="text-xl font-semibold text-foreground mt-1">
                  Export clean CSVs for Power BI or Excel in one click
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need to blend campaign metrics into your company&apos;s BI
                pipelines? Download structured, UTF-8 encoded datasets for
                individual campaigns or your entire workspace, ready to plug
                straight into <b>Power BI</b>, <b>Excel</b>, or{" "}
                <b>Looker Studio</b>.
              </p>
            </section>
          </div>

          {/* =================================================================
              RIGHT COLUMN: FIXED LOGIN / STEPPER REGISTER MODAL
             ================================================================= */}
          <div className="lg:col-span-5 pb-12 lg:py-0">
            <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(36vw,500px)] xl:w-[510px] z-30">
              <div className="relative rounded-2xl border border-border/90 bg-card/90 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden">
                {/* Top Gradient Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

                <div className="p-6 sm:p-8 space-y-6">
                {/* Mode Switcher Tabs (Login vs Register) */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary/80 border border-border">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      mode === "login"
                        ? "btn-gradient text-white shadow-xs"
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
                        ? "btn-gradient text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Create Pro Account
                  </button>
                </div>

                {/* Modal Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
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
                  <p className="text-xs text-muted-foreground">
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
                          onClick={() => {
                            if (s < regStep) setRegStep(s as 1 | 2 | 3);
                          }}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            s <= regStep
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-secondary"
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
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs text-destructive animate-fadeIn">
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
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <button
                          type="button"
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
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                              className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                              className="w-full h-11 pl-10 pr-10 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPass(!showRegPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-2">
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
                            className="h-11 px-4 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        {/* Summary + Pro Badge Card */}
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              Assigned Plan
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold btn-gradient text-white">
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
                            className="h-11 px-4 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
