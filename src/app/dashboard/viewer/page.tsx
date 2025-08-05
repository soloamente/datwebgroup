"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Eye, Download, Share2 } from "lucide-react";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";

interface ViewerStats {
  totalDocuments: number;
  sharedDocuments: number;
  downloadedDocuments: number;
  lastAccess: string;
}

export default function ViewerDashboard() {
  const [stats, setStats] = useState<ViewerStats>({
    totalDocuments: 0,
    sharedDocuments: 0,
    downloadedDocuments: 0,
    lastAccess: new Date().toLocaleDateString("it-IT"),
  });
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is a viewer
    if (!authStore.isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (authStore.user?.role !== "viewer") {
      router.push("/dashboard/admin"); // Redirect to appropriate dashboard
      return;
    }

    // Load viewer data
    loadViewerData();
  }, [authStore, router]);

  const loadViewerData = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to get viewer data
      // const response = await api.get("/viewer/dashboard");
      // setStats(response.data);

      // Mock data for now
      setStats({
        totalDocuments: 12,
        sharedDocuments: 8,
        downloadedDocuments: 5,
        lastAccess: new Date().toLocaleDateString("it-IT"),
      });
    } catch (error) {
      console.error("Error loading viewer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Viewer</h1>
          <p className="text-muted-foreground">
            Benvenuto, {authStore.user?.nominativo || "Viewer"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Viewer</Badge>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Ultimo accesso: {stats.lastAccess}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documenti Totali
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-muted-foreground text-xs">
              Documenti disponibili per la visualizzazione
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documenti Condivisi
            </CardTitle>
            <Share2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sharedDocuments}</div>
            <p className="text-muted-foreground text-xs">
              Documenti condivisi con te
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documenti Scaricati
            </CardTitle>
            <Download className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.downloadedDocuments}
            </div>
            <p className="text-muted-foreground text-xs">
              Documenti scaricati localmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            Accedi rapidamente alle funzionalità principali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="flex h-20 flex-col items-center justify-center space-y-2">
              <Eye className="h-6 w-6" />
              <span>Visualizza Documenti</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-20 flex-col items-center justify-center space-y-2"
            >
              <Download className="h-6 w-6" />
              <span>Scarica Documenti</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-20 flex-col items-center justify-center space-y-2"
            >
              <Users className="h-6 w-6" />
              <span>Profilo Utente</span>
            </Button>

            <Button
              variant="outline"
              className="flex h-20 flex-col items-center justify-center space-y-2"
            >
              <FileText className="h-6 w-6" />
              <span>Cronologia</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Recenti</CardTitle>
          <CardDescription>
            Le tue ultime attività sui documenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="rounded-full bg-blue-100 p-2">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  Documento "Report_2024.pdf" visualizzato
                </p>
                <p className="text-muted-foreground text-sm">2 ore fa</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="rounded-full bg-green-100 p-2">
                <Download className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  Documento "Presentazione.pptx" scaricato
                </p>
                <p className="text-muted-foreground text-sm">1 giorno fa</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="rounded-full bg-purple-100 p-2">
                <Share2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  Nuovo documento condiviso: "Contratto.pdf"
                </p>
                <p className="text-muted-foreground text-sm">3 giorni fa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
