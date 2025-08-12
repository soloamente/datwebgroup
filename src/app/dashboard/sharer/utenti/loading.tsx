import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Loading UI for Gestione Clienti (Utenti)
// Mirrors the page layout: header with CTA, small stats, and the viewer table
export default function UtentiLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 md:p-6">
      {/* Page header skeleton */}
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="bg-card ring-border border-none ring-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card className="bg-card ring-border border-none ring-1">
        <CardHeader className="gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {/* Table header */}
          <div className="border-border bg-muted/30 ring-border mb-2 grid grid-cols-12 items-center gap-2 rounded-md border p-3 ring-1">
            <Skeleton className="col-span-4 h-4" />
            <Skeleton className="col-span-2 h-4" />
            <Skeleton className="col-span-2 h-4" />
            <Skeleton className="col-span-2 h-4" />
            <Skeleton className="col-span-2 h-4" />
          </div>
          {/* Table rows */}
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border-border bg-card/50 ring-border grid grid-cols-12 items-center gap-2 rounded-md border p-3 ring-1"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
