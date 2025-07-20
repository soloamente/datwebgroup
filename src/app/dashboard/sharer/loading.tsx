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
        <Card className="mb-6 w-full border-neutral-800 bg-neutral-900/50 text-white">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1.5">
              <CardTitle className="text-2xl">Record massimi</CardTitle>
              <CardDescription className="text-neutral-400">
                <Skeleton className="h-4 w-48 bg-neutral-700" />
              </CardDescription>
            </div>
            <Skeleton className="h-6 w-16 bg-neutral-700" />
          </CardHeader>
          <CardContent className="px-4">
            <Tabs value="year" className="w-full">
              <div className="px-0">
                <TabsList className="grid w-auto grid-cols-3 rounded-lg bg-neutral-800/60 p-1">
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
                  <div className="text-neutral-400">Caricamento grafico...</div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex items-end justify-between">
            <div>
              <Skeleton className="h-8 w-20 bg-neutral-700" />
            </div>
            <div className="text-right text-sm text-neutral-400">
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
              className="border-neutral-800 bg-neutral-900/50 text-white"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24 bg-neutral-700" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-16 bg-neutral-700" />
                <Skeleton className="h-3 w-20 bg-neutral-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Users Section Skeleton */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-neutral-800 bg-neutral-900/50 text-white">
            <CardHeader>
              <CardTitle className="text-xl">Condivisioni recenti</CardTitle>
              <CardDescription className="text-neutral-400">
                Le tue ultime condivisioni di documenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-neutral-700" />
                      <Skeleton className="h-3 w-1/2 bg-neutral-700" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-neutral-700" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
