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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Eye,
  Download,
  Search,
  Clock,
  User,
  File,
  ArrowLeft,
  Share2,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import useAuthStore from "@/app/api/auth";
import {
  userService,
  type ViewerSharedBatchWithDetails,
  type ViewerFile,
} from "@/app/api/api";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type FileSortOption =
  | "name_az"
  | "name_za"
  | "size_largest"
  | "size_smallest"
  | "type_az"
  | "type_za";

export default function BatchDetailsPage() {
  const [batch, setBatch] = useState<ViewerSharedBatchWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileSortBy, setFileSortBy] = useState<FileSortOption>("name_az");
  const authStore = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  useEffect(() => {
    // Check if auth store is properly loaded
    const checkAuth = () => {
      if (authStore.isAuthenticated()) {
        setIsAuthLoading(false);
        if (authStore.user?.role !== "viewer") {
          router.push("/dashboard/admin");
          return;
        }
        void loadBatchDetails();
      } else {
        // If not authenticated, redirect to login
        router.push("/login");
      }
    };

    // Small delay to ensure auth store is hydrated
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [authStore, router, batchId]);

  const loadBatchDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Get all batches with details and find the specific one
      const batches = await userService.getViewerSharedBatchesWithDetails();
      const foundBatch = Array.isArray(batches)
        ? batches.find((b) => b.id.toString() === batchId)
        : null;

      if (foundBatch) {
        setBatch(foundBatch);
      } else {
        setErrorMessage("Batch non trovato");
      }
    } catch (err) {
      console.error("Error loading batch details:", err);
      setErrorMessage("Errore nel caricamento dei dettagli del batch");
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "dd MMM yyyy 'alle' HH:mm", {
        locale: it,
      });
    } catch {
      return dateString;
    }
  };

  const handleDownloadFile = async (file: ViewerFile) => {
    try {
      const blob = await userService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const handleViewFile = async (file: ViewerFile) => {
    try {
      const response = await userService.getFileViewUrl(file.id);
      window.open(response.view_url, "_blank");
    } catch (err) {
      console.error("Error getting file view URL:", err);
    }
  };

  const handleBackToViewer = () => {
    router.push("/dashboard/viewer");
  };

  // Helper function to get field value display
  const getFieldValueDisplay = (
    value: string | number | boolean | null | undefined,
  ) => {
    if (value === null || value === undefined) return "Non specificato";
    if (typeof value === "boolean") return value ? "Sì" : "No";
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") {
      // Try to parse as date
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return format(date, "dd/MM/yyyy", { locale: it });
        }
      } catch {
        // Not a date, return as is
      }
      return value;
    }
    return String(value);
  };

  // Sort files based on selected option
  const getSortedFiles = (files: ViewerFile[]) => {
    const sortedFiles = [...files];

    switch (fileSortBy) {
      case "name_az":
        return sortedFiles.sort((a, b) =>
          a.original_filename.localeCompare(b.original_filename),
        );

      case "name_za":
        return sortedFiles.sort((a, b) =>
          b.original_filename.localeCompare(a.original_filename),
        );

      case "size_largest":
        return sortedFiles.sort((a, b) => b.size - a.size);

      case "size_smallest":
        return sortedFiles.sort((a, b) => a.size - b.size);

      case "type_az":
        return sortedFiles.sort((a, b) =>
          a.mime_type.localeCompare(b.mime_type),
        );

      case "type_za":
        return sortedFiles.sort((a, b) =>
          b.mime_type.localeCompare(a.mime_type),
        );

      default:
        return sortedFiles;
    }
  };

  // Show loading while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Check if user is available
  if (!authStore.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">
            Errore: Dati utente non disponibili
          </p>
          <Button onClick={() => router.push("/login")} variant="outline">
            Torna al Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Caricamento dettagli...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">{errorMessage}</p>
          <Button onClick={loadBatchDetails} variant="outline">
            Riprova
          </Button>
          <Button onClick={handleBackToViewer} variant="outline">
            Torna ai Documenti
          </Button>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">Batch non trovato</p>
          <Button onClick={handleBackToViewer} variant="outline">
            Torna ai Documenti
          </Button>
        </div>
      </div>
    );
  }

  // Get user display name safely
  const getUserDisplayName = () => {
    return authStore.user?.nominativo ?? authStore.user?.username ?? "Viewer";
  };

  const getUserInitial = () => {
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Get all files from all documents
  const allFiles = batch.documents?.flatMap((doc) => doc.files || []) || [];

  // Filter files based on search term
  const filteredFiles = allFiles.filter((file) =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort filtered files
  const sortedFiles = getSortedFiles(filteredFiles);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToViewer}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Torna ai Documenti</span>
          </Button>
        </div>
      </div>

      {/* Batch Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{batch.title}</CardTitle>
              <CardDescription className="mt-2">
                Condiviso da {batch.sharer.nominativo} il{" "}
                {formatDate(batch.sent_at)}
              </CardDescription>
              {batch.document_class && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-muted-foreground text-sm">
                    Classe documentale: {batch.document_class.name}
                  </span>
                </div>
              )}
            </div>
            <Badge variant={batch.status === "sent" ? "default" : "secondary"}>
              {batch.status === "sent" ? "Inviato" : batch.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatDate(batch.sent_at)}</span>
            </div>

            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{allFiles.length} file allegati</span>
            </div>

            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{batch.viewers?.length || 0} viewer</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Values Section */}
      {batch.documents?.[0]?.values && batch.documents[0].values.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valori dei campi</CardTitle>
            <CardDescription>Dettagli del documento condiviso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {batch.documents[0].values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {value.field.label}:
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {getFieldValueDisplay(
                      value.value_text ??
                        value.value_int ??
                        value.value_dec ??
                        value.value_bool ??
                        value.value_date ??
                        value.value_datetime,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>File Allegati</CardTitle>
              <CardDescription>
                {sortedFiles.length} di {allFiles.length} file disponibili per
                il download
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="text-muted-foreground h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Ordina:
                </span>
              </div>
              <Select
                value={fileSortBy}
                onValueChange={(value: FileSortOption) => setFileSortBy(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_az">Nome A-Z</SelectItem>
                  <SelectItem value="name_za">Nome Z-A</SelectItem>
                  <SelectItem value="size_largest">Dimensione ↓</SelectItem>
                  <SelectItem value="size_smallest">Dimensione ↑</SelectItem>
                  <SelectItem value="type_az">Tipo A-Z</SelectItem>
                  <SelectItem value="type_za">Tipo Z-A</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Cerca file..."
                  className="w-64 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                {searchTerm ? "Nessun file trovato" : "Nessun file disponibile"}
              </h3>
              <p className="text-muted-foreground text-center">
                {searchTerm
                  ? "Prova a modificare i termini di ricerca"
                  : "Non ci sono file allegati a questa condivisione"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className="hover:bg-muted/50 flex items-center space-x-4 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <File className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="truncate font-medium">
                        {file.original_filename}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {file.pivot.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {formatFileSize(file.size)} • {file.mime_type}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFile(file)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizza
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Scarica
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
