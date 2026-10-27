import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-secondary/70", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-2 pb-2 border-b border-border">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI Stats cards skeleton */}
      <div className="grid gap-4 grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-7 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
        <div className="col-span-12 lg:col-span-5 rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CampaignsSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2 pb-2 border-b border-border">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2 pb-2 border-b border-border">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-4"
          >
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-12 rounded-md" />
            </div>
            <Skeleton className="h-14 w-full rounded-md" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="grid gap-4 grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, sectionIdx) => (
          <div
            key={sectionIdx}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="p-5 grid gap-3.5 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-xl border border-border bg-card p-5 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-3 pb-3 border-b border-border">
        <Skeleton className="h-4 w-32" />
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-7 rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
        <div className="col-span-12 lg:col-span-5 rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
