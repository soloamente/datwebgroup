import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Loading UI for Documenti Condivisi (per classe documentale)
// Mirrors the page header, stats grid and shared documents table controls
export default function CondivisiByClassLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="bg-card ring-border border-none ring-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table and filters area */}
      <Card className="bg-card ring-border border-none ring-1">
        <CardHeader className="mb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>
          <CardDescription className="text-muted-foreground">
            <Skeleton className="h-4 w-80" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table skeleton rows */}
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="ring-border border-border bg-muted/30 grid grid-cols-12 items-center gap-3 rounded-md border p-3 ring-1"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
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
