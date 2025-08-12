/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BatchDetailsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="ring-border bg-card flex items-center space-x-2 border-none ring-1"
            disabled
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Torna indietro</span>
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>

      {/* Files Section - Controls and Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-6 w-40" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-56 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="ring-border bg-card flex flex-col rounded-lg p-4 ring-1"
            >
              <div className="mb-8 flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-full rounded" />
                <Skeleton className="h-9 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Info Card */}
      <Card className="bg-card ring-border border-none ring-1">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Values Section */}
      <Card className="bg-card ring-border border-none ring-1">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
