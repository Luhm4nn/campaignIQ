"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

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

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground tracking-tight leading-none">
            CampaignIQ
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
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
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
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
          <div className="space-y-1">
            {actionItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    item.variant === "primary"
                      ? "bg-primary/10 text-primary hover:bg-primary/15 border border-primary/25"
                      : isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
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
      <div className="border-t border-border p-3 space-y-2">
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

        <div className="px-3 py-2.5 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Data Engine
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Ready
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            VADER NLP &middot; RapidAPI Sync
          </p>
        </div>
      </div>
    </aside>
  );
}
