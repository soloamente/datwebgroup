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
import { MdClass } from "react-icons/md";
import useAuthStore from "@/app/api/auth";
import {
  userService,
  type ViewerSharedBatchWithDetails,
  type ViewerFile,
} from "@/app/api/api";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { formatFullDate } from "@/lib/date-format";
import { IoDownloadOutline, IoExtensionPuzzle, IoEye } from "react-icons/io5";
import {
  BsFileEarmarkPdfFill,
  BsFileEarmarkTextFill,
  BsFileEarmarkExcelFill,
  BsFileEarmarkMedicalFill,
  BsFillFolderFill,
} from "react-icons/bs";
import { TbSquareRoundedArrowDownFilled } from "react-icons/tb";
import {
  FaArrowRightLong,
  FaArrowUpLong,
  FaArrowDownLong,
  FaArrowUp,
  FaArrowDown,
  FaArrowDownShortWide,
  FaArrowUpWideShort,
  FaArrowDownWideShort,
  FaArrowDownAZ,
  FaClock,
  FaUser,
  FaKey,
} from "react-icons/fa6";

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
          <Button onClick={handleBackToViewer} variant="secondary">
            Torna indietro
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
          <Button onClick={handleBackToViewer} variant="secondary">
            Torna indietro
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
            variant="outline"
            size="sm"
            onClick={handleBackToViewer}
            className="ring-border bg-card flex items-center space-x-2 border-none ring-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Torna indietro</span>
          </Button>
        </div>
      </div>

      {/* Files Section - Outside Card */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">File Allegati</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sort Controls */}

            <Select
              value={fileSortBy}
              onValueChange={(value: FileSortOption) => setFileSortBy(value)}
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
                  Dimensione <FaArrowDownWideShort className="opacity-70" />
                </SelectItem>
                <SelectItem value="size_smallest">
                  Dimensione <FaArrowUpWideShort className="opacity-70" />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sortedFiles.map((file) => (
              <div
                key={file.id}
                className="ring-border bg-card flex flex-col rounded-lg p-4 ring-1 transition-colors"
              >
                <div className="mb-8 flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.original_filename, file.mime_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="truncate text-sm font-medium">
                        {getFileNameWithoutExtension(file.original_filename)}
                      </p>
                      <Badge
                        variant={"outline"}
                        className="text-muted-foreground font-ingram ring-border ml-auto border-none text-xs ring-1"
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
        )}
      </div>

      {/* Batch Info Card */}
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
              <span className="text-muted-foreground text-sm">Condiso da</span>
              <div className="flex w-full items-center gap-2 rounded-lg border bg-black/5 p-3 text-sm dark:bg-white/5">
                <FaUser className="text-muted-foreground/70 h-4 w-4" />
                {batch.sharer.nominativo}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Condiso il</span>
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
                <span>{allFiles.length} file allegati</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Values Section */}
      {batch.documents?.[0]?.values && batch.documents[0].values.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Valori dei campi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {batch.documents[0].values.map((value) => (
                <div key={value.id} className="flex flex-col items-start gap-2">
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
      )}
    </div>
  );
}
