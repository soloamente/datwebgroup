import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/tabs";

export default function DashboardLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="w-full">
        {/* Statistics Chart Skeleton */}
        <Card className="bg-card ring-border mb-6 w-full border-none ring-1">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle className="text-2xl">Statistiche</CardTitle>
              <CardDescription className="text-muted-foreground">
                <Skeleton className="h-4 w-48" />
              </CardDescription>
            </div>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent className="px-4">
            <Tabs value="year" className="w-full">
              <div className="px-0">
                <TabsList className="ring-border bg-muted/30 grid w-auto grid-cols-3 rounded-lg p-1 ring-1">
                  <TabsTrigger value="week" disabled>
                    Settimana
                  </TabsTrigger>
                  <TabsTrigger value="month" disabled>
                    Mese
                  </TabsTrigger>
                  <TabsTrigger value="year" disabled>
                    Anno
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="year" className="mt-4">
                <div className="flex h-[250px] w-full items-center justify-center">
                  <div className="text-muted-foreground">
                    Caricamento grafico...
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-end justify-between">
            <div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="text-muted-foreground text-right text-sm">
              <p>Ultimo aggiornamento</p>
              <p>Oggi, --:--</p>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Statistics Cards Skeleton */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="bg-card ring-border border-none ring-1"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Shares and Pie Chart Section Skeleton */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: recent shares grid skeleton */}
          <div className="flex-1">
            <Card className="bg-card ring-border border-none ring-1">
              <CardHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Condivisioni Recenti
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-[200px] rounded-md" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Card
                      key={index}
                      className="group bg-card ring-border relative h-full cursor-pointer overflow-hidden rounded-xl ring-1 backdrop-blur-sm"
                    >
                      {/* Status indicator skeleton */}
                      <div className="absolute top-3 right-3 z-40">
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>

                      <CardHeader className="mb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20 rounded-md" />
                      </CardHeader>

                      <CardContent className="space-y-4 pb-4">
                        {/* Recipients count skeleton */}
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div>
                            <Skeleton className="mb-1 h-8 w-8" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>

                        {/* Files count skeleton */}
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-4 w-12" />
                        </div>

                        {/* Recipients avatars skeleton */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex -space-x-2">
                              {Array.from({ length: 3 }).map(
                                (_, avatarIndex) => (
                                  <Skeleton
                                    key={avatarIndex}
                                    className="border-border h-8 w-8 rounded-full border-2"
                                  />
                                ),
                              )}
                            </div>
                          </div>

                          {/* Arrow indicator skeleton */}
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: pie chart card skeleton */}
          <div className="flex-shrink-0">
            <Card className="bg-card ring-border h-full w-full max-w-sm border-none ring-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Skeleton className="h-5 w-40" />
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <Skeleton className="h-4 w-56" />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Skeleton className="h-56 w-56 rounded-full" />
                <div className="grid w-full grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-sm" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Skeleton className="h-4 w-24" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
