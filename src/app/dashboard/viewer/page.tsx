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
  Calendar,
  FileText,
  Users,
  Eye,
  Download,
  Share2,
  Upload,
  Folder,
  File,
  MoreVertical,
  Search,
  Grid3X3,
  Bell,
  Clock,
  User,
  ArrowUpDown,
} from "lucide-react";
import { FaTag, FaFilePdf } from "react-icons/fa";
import useAuthStore from "@/app/api/auth";
import {
  userService,
  type ViewerSharedBatchWithDetails,
  type ViewerFile,
} from "@/app/api/api";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { formatFullDate } from "@/lib/date-format";
import { motion, AnimatePresence } from "motion/react";
import { Stack } from "@/components/ui/stack";
import { IoEye, IoTime } from "react-icons/io5";
import { FaArrowRightLong, FaUser } from "react-icons/fa6";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import Image from "next/image";

type SortOption =
  | "date_newest"
  | "date_oldest"
  | "title_az"
  | "title_za"
  | "files_count";

export default function ViewerDashboard() {
  const [sharedBatches, setSharedBatches] = useState<
    ViewerSharedBatchWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date_newest");
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if auth store is properly loaded
    const checkAuth = () => {
      if (authStore.isAuthenticated()) {
        setIsAuthLoading(false);
        if (authStore.user?.role !== "viewer") {
          router.push("/dashboard/admin");
          return;
        }
        void loadViewerData();
      } else {
        // If not authenticated, redirect to login
        router.push("/login");
      }
    };

    // Small delay to ensure auth store is hydrated
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [authStore, router]);

  const loadViewerData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const batches = await userService.getViewerSharedBatchesWithDetails();
      // Ensure batches is always an array
      setSharedBatches(Array.isArray(batches) ? batches : []);
    } catch (err) {
      console.error("Error loading viewer data:", err);
      setErrorMessage("Errore nel caricamento dei documenti condivisi");
      // Set empty array on error to prevent undefined issues
      setSharedBatches([]);
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

  const formatDate = (dateString: string): string => formatFullDate(dateString);

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

  // Sort batches based on selected option
  const getSortedBatches = () => {
    if (!sharedBatches || !Array.isArray(sharedBatches)) return [];

    const sortedBatches = [...sharedBatches];

    switch (sortBy) {
      case "date_newest":
        return sortedBatches.sort(
          (a, b) =>
            new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
        );

      case "date_oldest":
        return sortedBatches.sort(
          (a, b) =>
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
        );

      case "title_az":
        return sortedBatches.sort((a, b) => a.title.localeCompare(b.title));

      case "title_za":
        return sortedBatches.sort((a, b) => b.title.localeCompare(a.title));

      case "files_count":
        return sortedBatches.sort((a, b) => {
          const aFilesCount =
            a.documents?.reduce(
              (acc, doc) => acc + (doc.files?.length || 0),
              0,
            ) || 0;
          const bFilesCount =
            b.documents?.reduce(
              (acc, doc) => acc + (doc.files?.length || 0),
              0,
            ) || 0;
          return bFilesCount - aFilesCount;
        });

      default:
        return sortedBatches;
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
          <p className="text-muted-foreground">Caricamento documenti...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-destructive">{errorMessage}</p>
          <Button onClick={loadViewerData} variant="outline">
            Riprova
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

  // Se c'è solo un batch, mostra direttamente i file
  if (
    sharedBatches &&
    Array.isArray(sharedBatches) &&
    sharedBatches.length === 1
  ) {
    const batch = sharedBatches[0];
    if (!batch?.documents) return null;
    const allFiles = batch.documents.flatMap((doc) => doc.files || []);

    return (
      <div className="relative">
        <div className="space-y-6 pb-96">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">Documenti Condivisi</h1>
                <p className="text-muted-foreground">
                  Benvenuto, {getUserDisplayName()}
                </p>
              </div>
            </div>
          </div>

          {/* Batch Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{batch.title}</CardTitle>
                    <CardDescription>
                      Condiviso da {batch.sharer.nominativo} il{" "}
                      {formatDate(batch.sent_at)}
                    </CardDescription>
                    {batch.document_class && (
                      <div className="mt-2 flex items-center space-x-2">
                        <FaTag className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-sm">
                          Classe documentale: {batch.document_class.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={batch.status === "sent" ? "default" : "secondary"}
                  >
                    {batch.status === "sent" ? "Inviato" : batch.status}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Field Values */}
          {batch.documents?.[0]?.values &&
            batch.documents[0].values.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Valori dei campi</CardTitle>
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
              </motion.div>
            )}

          {/* Files List */}
          {batch.documents?.[0]?.files &&
            batch.documents[0].files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>File Allegati</CardTitle>
                        <CardDescription>
                          {batch.documents[0].files.length} file disponibili per
                          il download
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                          <Input
                            placeholder="Cerca file..."
                            className="w-64 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {batch.documents[0].files.map((file) => (
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
                  </CardContent>
                </Card>
              </motion.div>
            )}
        </div>

        {/* Footer with Logo */}
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
          <div className="relative h-96 w-full overflow-hidden">
            <div className="absolute right-0 bottom-0 left-0 h-80 w-full">
              <Image
                src="/logo_positivo.png"
                alt="Logo"
                fill
                className="object-contain opacity-10 grayscale filter"
              />
              {/* Enhanced gradient overlay */}
              <div className="from-background via-background/90 absolute inset-0 bg-gradient-to-t to-transparent" />
              {/* Additional colorful gradient overlay */}
              <div className="from-primary/5 via-primary/2 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="from-secondary/5 to-secondary/2 absolute inset-0 bg-gradient-to-tr via-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se ci sono più batch, mostra i batch raggruppati
  const sortedBatches = getSortedBatches();

  return (
    <div className="relative">
      <div className="space-y-10 pb-96">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Documenti Condivisi</h1>
              <p className="text-muted-foreground">
                Benvenuto, {getUserDisplayName()}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-end gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="ring-border w-fit cursor-pointer border-none ring-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_newest" className="cursor-pointer">
                  Data più recente
                </SelectItem>
                <SelectItem value="date_oldest" className="cursor-pointer">
                  Data più vecchia
                </SelectItem>
                <SelectItem value="title_az" className="cursor-pointer">
                  Titolo A <FaArrowRightLong className="opacity-70" /> Z
                </SelectItem>
                <SelectItem value="title_za" className="cursor-pointer">
                  Titolo Z <FaArrowRightLong className="opacity-70" /> A
                </SelectItem>
                <SelectItem value="files_count" className="cursor-pointer">
                  Numero file
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Batches Grid */}
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedBatches.map((batch, index) => {
              const totalFiles =
                batch.documents?.reduce(
                  (acc, doc) => acc + (doc.files?.length || 0),
                  0,
                ) || 0;

              return (
                <motion.div
                  key={`${batch.id}-${sortBy}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <div className="text-card-foreground flex flex-col rounded-xl border bg-black/5 px-1 pb-1 shadow-sm transition-shadow hover:shadow-md dark:bg-white/5">
                    <header className="flex flex-col items-center justify-center gap-2 px-6 py-2 text-sm">
                      <h2 className="font-medium uppercase">
                        {batch.document_class && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm opacity-60">
                              {batch.document_class.singular_name}
                            </span>
                          </div>
                        )}
                      </h2>
                      {/* <p className="">Condiviso da {batch.sharer.nominativo}</p> */}
                    </header>
                    <div className="bg-background ring-border rounded-lg px-6 py-4 ring-1">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FaUser className="h-4 w-4" />
                          Condiviso da<span>{batch.sharer.nominativo}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <IoTime className="h-4 w-4" />
                          <span>{formatDate(batch.sent_at)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <BsFileEarmarkPdfFill className="h-4 w-4" />
                          <span>{totalFiles} file allegati</span>
                        </div>

                        <Button
                          className="mt-2 w-full rounded-sm"
                          onClick={() => {
                            // Navigate to batch details
                            router.push(`/dashboard/viewer/batch/${batch.id}`);
                          }}
                        >
                          <IoEye className="h-5 w-5" />
                          Visualizza Dettagli
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {(!sharedBatches ||
          !Array.isArray(sharedBatches) ||
          sharedBatches.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Nessun documento condiviso
              </h3>
              <p className="text-muted-foreground text-center">
                Non hai ancora documenti condivisi con te. Contatta il tuo
                sharer per ricevere documenti.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with Logo */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
        <div className="relative h-screen w-full overflow-hidden">
          <div className="absolute right-0 -bottom-110 left-0 h-screen w-full">
            <Image
              src="/logo_positivo.png"
              alt="Logo"
              fill
              className="object-contain dark:opacity-50 dark:grayscale"
            />
            {/* Enhanced gradient overlay */}
            <div className="from-background via-background/90 absolute inset-0 bg-gradient-to-b to-transparent" />
            {/* Additional colorful gradient overlay */}
            <div className="from-primary/5 via-primary/2 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
