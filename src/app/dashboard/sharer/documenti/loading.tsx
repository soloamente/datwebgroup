import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

// Loading UI for Nuova Condivisione (wizard a step)
export default function DocumentiLoading() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <main className="flex h-full flex-col">
        {/* Header */}
        <header className="flex-shrink-0 border-b p-4 lg:px-8 lg:py-6">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="mt-2 h-4 w-16" />
                  </div>
                  {i < 3 && <div className="bg-muted mx-2 h-1 w-16" />}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-56" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-80" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simulated area for dropzone / form / list */}
              <div className="ring-border bg-muted/30 flex h-[220px] w-full items-center justify-center rounded-lg ring-1">
                <Skeleton className="h-6 w-56" />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </CardFooter>
          </Card>

          {/* Summary panel (when step 4) */}
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-28" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </main>
    </div>
  );
}
