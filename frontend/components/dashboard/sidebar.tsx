"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  BarChart3,
  Lightbulb,
  Settings,
  Sparkles,
  Zap,
  Plus,
  Crown,
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
    icon: Lightbulb,
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
    label: "Pricing",
    href: "/pricing",
    icon: Crown,
    variant: "secondary" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-4 bottom-4 z-40 flex w-[220px] flex-col rounded-2xl glass overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      {/* Logo */}
      <div className="relative flex items-center gap-3 p-5 border-b border-border/30">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        <div>
          <span className="text-base font-bold text-foreground tracking-tight">
            CampaignIQ
          </span>
          <span className="block text-[10px] font-medium text-primary uppercase tracking-widest">
            Intelligence
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="relative flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-90" />
              )}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-secondary/50 transition-colors duration-300" />
              )}
              <item.icon className={cn(
                "relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive && "text-primary-foreground"
              )} />
              <span className="relative">{item.label}</span>
              {isActive && (
                <Sparkles className="relative ml-auto h-3 w-3 text-primary-foreground/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Items */}
      <div className="relative border-t border-border/30 p-3 space-y-2">
        {actionItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                item.variant === "primary"
                  ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="relative border-t border-border/30 p-3">
        <Link
          href="/settings"
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
            pathname === "/settings"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {pathname === "/settings" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-90" />
          )}
          {pathname !== "/settings" && (
            <div className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-secondary/50 transition-colors duration-300" />
          )}
          <Settings className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative">Settings</span>
        </Link>
        
        {/* Pro Badge */}
        <div className="mt-3 mx-1 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Pro Plan</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Unlimited campaigns & AI insights
          </p>
        </div>
      </div>
    </aside>
  );
}
