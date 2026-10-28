"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  BarChart3,
  LineChart,
  Settings,
  Plus,
  CreditCard,
  Activity,
  LogOut,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/types";
import { getStoredAuthUser, fetchMeApi, logoutApi } from "@/lib/api";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: Megaphone,
  },
  {
    label: "Content",
    href: "/posts",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: LineChart,
  },
];

const actionItems = [
  {
    label: "New Campaign",
    href: "/campaigns/new",
    icon: Plus,
    variant: "primary" as const,
  },
  {
    label: "Plans & Billing",
    href: "/pricing",
    icon: CreditCard,
    variant: "secondary" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getStoredAuthUser());
    fetchMeApi()
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => {});

    const onAuthUpdate = () => {
      const stored = getStoredAuthUser();
      if (stored) {
        setUser(stored);
      }
    };
    window.addEventListener("campaign-iq:auth-updated", onAuthUpdate);
    return () =>
      window.removeEventListener("campaign-iq:auth-updated", onAuthUpdate);
  }, []);

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutApi();
      // Keep the loader active during the transition into /login
      router.replace("/login");
    } catch {
      router.replace("/login");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PR";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient text-white shadow-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight leading-none">
              Campaign<span className="text-gradient font-bold">IQ</span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground mt-1">
              Analytics Suite
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">
              Platform
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-secondary text-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:translate-x-0.5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action Items */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-2">
              Workspace
            </p>
            <div className="space-y-1.5">
              {actionItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      item.variant === "primary"
                        ? "btn-gradient text-white"
                        : isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:translate-x-0.5"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border p-3 space-y-2.5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Settings
              className={cn(
                "h-4 w-4 shrink-0",
                pathname === "/settings" ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span>Settings & API</span>
          </Link>

          {/* User Profile & Pro Badge */}
          {user && (
            <div className="rounded-xl bg-secondary/40 border border-border overflow-hidden">
              <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg btn-gradient text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase btn-gradient text-white">
                        <Sparkles className="h-2.5 w-2.5" />
                        {user.plan || "pro"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  disabled={isLoggingOut}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!isLoggingOut) setShowLogoutModal(false);
            }}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.65)] overflow-hidden animate-scaleIn">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 border border-destructive/30 text-destructive">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Sign out of CampaignIQ?
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your active session and refresh tokens will be revoked safely.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg btn-gradient text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase btn-gradient text-white">
                    {user.plan || "pro"}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="h-10 px-4 rounded-xl bg-secondary border border-border text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleConfirmLogout}
                  className="h-10 px-5 rounded-xl btn-gradient text-xs font-semibold text-white inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 min-w-[140px]"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Confirm Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
