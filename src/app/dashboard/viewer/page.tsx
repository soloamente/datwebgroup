/* eslint-disable */
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
import { FaFilePdf } from "react-icons/fa";
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
import {
  IoEye,
  IoTime,
  IoDownloadOutline,
  IoExtensionPuzzle,
} from "react-icons/io5";
import {
  FaArrowRightLong,
  FaUser,
  FaKey,
  FaClock,
  FaArrowDownWideShort,
  FaArrowUpWideShort,
} from "react-icons/fa6";
import {
  BsFileEarmarkPdfFill,
  BsFileEarmarkTextFill,
  BsFileEarmarkExcelFill,
  BsFileEarmarkMedicalFill,
  BsFillFolderFill,
} from "react-icons/bs";
import { TbSquareRoundedArrowDownFilled } from "react-icons/tb";
import Image from "next/image";

type SortOption =
  | "date_newest"
  | "date_oldest"
  | "title_az"
  | "title_za"
  | "files_count";

type FileSortOption =
  | "name_az"
  | "name_za"
  | "size_largest"
  | "size_smallest"
  | "type_az"
  | "type_za";

export default function ViewerDashboard() {
  const [sharedBatches, setSharedBatches] = useState<
    ViewerSharedBatchWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date_newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [fileSortBy, setFileSortBy] = useState<FileSortOption>("name_az");
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

  // Helper function to get the appropriate file icon based on file type
  const getFileIcon = (fileName: string, mimeType: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    // Check for PDF files
    if (extension === "pdf" || mimeType.includes("pdf")) {
      return <BsFileEarmarkPdfFill className="text-muted-foreground h-8 w-8" />;
    }

    // Check for Excel files
    if (
      extension === "xlsx" ||
      extension === "xls" ||
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet")
    ) {
      return (
        <BsFileEarmarkExcelFill className="text-muted-foreground h-8 w-8" />
      );
    }

    // Check for Word/Document files
    if (
      extension === "doc" ||
      extension === "docx" ||
      mimeType.includes("word") ||
      mimeType.includes("document")
    ) {
      return (
        <BsFileEarmarkTextFill className="text-muted-foreground h-8 w-8" />
      );
    }

    // Default to text file icon for other document types
    return <BsFileEarmarkTextFill className="text-muted-foreground h-8 w-8" />;
  };

  const getFileExtension = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension ? extension.toUpperCase() : "FILE";
  };

  const getFileNameWithoutExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
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
        <div className="relative z-10 space-y-6 pb-96">
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

          {/* Files Section - Outside Card */}
          {batch.documents?.[0]?.files &&
            batch.documents[0].files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-2xl font-semibold">
                      File Allegati
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
                    {/* Sort Controls */}
                    <Select
                      value={fileSortBy}
                      onValueChange={(value: FileSortOption) =>
                        setFileSortBy(value)
                      }
                    >
                      <SelectTrigger className="ring-border bg-card border-none ring-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name_az">
                          Nome A <FaArrowRightLong className="opacity-70" /> Z
                        </SelectItem>
                        <SelectItem value="name_za">
                          Nome Z <FaArrowRightLong className="opacity-70" /> A
                        </SelectItem>
                        <SelectItem value="size_largest">
                          Dimensione{" "}
                          <FaArrowDownWideShort className="opacity-70" />
                        </SelectItem>
                        <SelectItem value="size_smallest">
                          Dimensione{" "}
                          <FaArrowUpWideShort className="opacity-70" />
                        </SelectItem>
                        <SelectItem value="type_az">
                          Tipo A <FaArrowRightLong className="opacity-70" /> Z
                        </SelectItem>
                        <SelectItem value="type_za">
                          Tipo Z <FaArrowRightLong className="opacity-70" /> A
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Search */}
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                      <Input
                        placeholder="Cerca file..."
                        className="ring-border bg-card rounded-lg border-none pl-10 ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {(() => {
                  // Filter files based on search term
                  const filteredFiles = batch.documents[0].files.filter(
                    (file) =>
                      file.original_filename
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  );

                  // Sort filtered files
                  const sortedFiles = getSortedFiles(filteredFiles);

                  return sortedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="text-muted-foreground mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-medium">
                        {searchTerm
                          ? "Nessun file trovato"
                          : "Nessun file disponibile"}
                      </h3>
                      <p className="text-muted-foreground text-center">
                        {searchTerm
                          ? "Prova a modificare i termini di ricerca"
                          : "Non ci sono file allegati a questa condivisione"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {sortedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="ring-border bg-card flex flex-col rounded-lg p-4 ring-1 transition-colors"
                        >
                          <div className="mb-8 flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getFileIcon(
                                file.original_filename,
                                file.mime_type,
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                  {getFileNameWithoutExtension(
                                    file.original_filename,
                                  )}
                                </p>
                                <Badge
                                  variant={"outline"}
                                  className="text-muted-foreground font-ingram ring-border flex-shrink-0 border-none text-xs ring-1"
                                >
                                  {getFileExtension(file.original_filename)}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewFile(file)}
                              className="ring-border flex-1 border-none ring-[1.5px]"
                            >
                              <IoEye className="text-muted-foreground h-5 w-5" />
                              Visualizza
                            </Button>
                            <Button
                              onClick={() => handleDownloadFile(file)}
                              className="bg-primary flex-1 gap-1 font-medium text-white"
                            >
                              <TbSquareRoundedArrowDownFilled className="h-5 w-5" />
                              Scarica
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}

          {/* Batch Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Informazioni</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-sm">
                      Condiviso da
                    </span>
                    <div className="flex w-full items-center gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                      <FaUser className="text-muted-foreground/70 h-4 w-4" />
                      {batch.sharer.nominativo}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-sm">
                      Condiviso il
                    </span>
                    <div className="flex w-full items-center gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                      <FaClock className="text-muted-foreground/70 h-4 w-4" />
                      {formatDate(batch.sent_at)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-sm">
                      Classe documentale
                    </span>
                    <div className="flex w-full items-center gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                      <BsFillFolderFill className="text-muted-foreground/70 h-4 w-4" />
                      <span>{batch.document_class.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-sm">
                      File allegati
                    </span>
                    <div className="flex w-full items-center gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                      <BsFileEarmarkMedicalFill className="text-muted-foreground/70 h-4 w-4" />
                      <span>
                        {batch.documents?.[0]?.files?.length || 0} file allegati
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Field Values Section */}
          {batch.documents?.[0]?.values &&
            batch.documents[0].values.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Valori dei campi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {batch.documents[0].values.map((value) => (
                        <div
                          key={value.id}
                          className="flex flex-col items-start gap-2"
                        >
                          <span className="text-muted-foreground text-sm">
                            {value.field.label}
                          </span>
                          <div className="flex w-full gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                            <FaKey className="text-muted-foreground/70 h-4 w-4" />
                            {getFieldValueDisplay(
                              value.value_text ??
                                value.value_int ??
                                value.value_dec ??
                                value.value_bool ??
                                formatFullDate(value.value_date ?? "") ??
                                formatFullDate(value.value_datetime ?? ""),
                            )}
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
          <div className="relative h-[1200px] w-full overflow-hidden">
            <div className="absolute right-0 -bottom-96 left-0 h-[1000px] w-full">
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
      <div className="relative z-10 space-y-10 pb-96">
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

      {/* Footer with Logo - Larger when documents are present */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
        <div
          className={`relative w-full overflow-hidden ${
            sharedBatches &&
            Array.isArray(sharedBatches) &&
            sharedBatches.length > 0
              ? "h-[1000px]"
              : "h-[700px]"
          }`}
        >
          <div
            className={`absolute right-0 left-0 w-full ${
              sharedBatches &&
              Array.isArray(sharedBatches) &&
              sharedBatches.length > 0
                ? "-bottom-80 h-[800px]"
                : "-bottom-56 h-[500px]"
            }`}
          >
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
