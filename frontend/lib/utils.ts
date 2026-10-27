import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-success/20 text-success",
    completed: "bg-primary/20 text-primary",
    paused: "bg-warning/20 text-warning",
    scheduled: "bg-warning/20 text-warning",
    draft: "bg-muted text-muted-foreground",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}
