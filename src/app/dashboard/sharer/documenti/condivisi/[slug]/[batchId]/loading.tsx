import { Skeleton } from "@/components/ui/skeleton";

export default function BatchDetailsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="space-y-6 rounded-lg border p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <div className="space-y-4 lg:col-span-3">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border bg-zinc-50/50 p-4 sm:grid-cols-2 dark:bg-zinc-900/50">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 lg:col-span-2">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6 lg:col-span-1">
          {/* Info Card Skeleton */}
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-4 p-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>

          {/* Viewers Card Skeleton */}
          <div className="rounded-lg border">
            <div className="border-b p-4">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-4 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
