"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { fetchMeApi, getStoredAuthUser } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    const cached = getStoredAuthUser();
    if (cached) {
      setChecked(true);
    }

    fetchMeApi()
      .then((user) => {
        if (!active) return;
        if (!user) {
          router.replace("/login");
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        if (!active) return;
        if (!cached) {
          router.replace("/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg btn-gradient animate-pulse" />
          <p className="text-xs text-muted-foreground">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />
      <main className="relative pl-[240px]">
        <div className="min-h-screen max-w-[1440px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
