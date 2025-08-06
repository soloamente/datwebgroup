/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BatchDetailsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            disabled
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Torna ai Documenti</span>
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" disabled>
            <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
          </Button>
          <Button variant="ghost" size="sm" className="relative" disabled>
            <div className="h-5 w-5 animate-pulse rounded bg-gray-300"></div>
          </Button>
        </div>
      </div>

      {/* Batch Info Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-96 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="h-6 w-16 animate-pulse rounded bg-gray-300"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-300"></div>
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-64 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 rounded-lg border p-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-300"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-300"></div>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
