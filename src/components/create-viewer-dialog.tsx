/* eslint-disable */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  userService,
  type CreateViewerData,
  type ExtractInfoFromDocumentsResponse,
  type ExtractedUser,
  type ExtractionError,
} from "@/app/api/api";
import { toast } from "sonner";
import {
  AtSignIcon,
  Loader2,
  UserPlus,
  FileUp,
  X,
  ArrowLeft,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "@/app/api/auth"; // Import the auth store
import { AxiosError } from "axios";
import Image from "next/image";

interface CreateViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewerCreated: () => void; // Renamed callback prop
}

interface ApiResponse {
  data?: {
    message?: string;
  };
}

export function CreateViewerDialog({
  isOpen,
  onClose,
  onViewerCreated, // Use renamed prop
}: CreateViewerDialogProps) {
  const [viewMode, setViewMode] = useState<"upload" | "form" | "select">(
    "upload",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [extractedUsers, setExtractedUsers] = useState<ExtractedUser[]>([]);
  const [extractionErrors, setExtractionErrors] = useState<ExtractionError[]>(
    [],
  );
  const [userFieldErrors, setUserFieldErrors] = useState<
    Record<number, Record<string, string>>
  >({});
  const [selectedUser, setSelectedUser] = useState<ExtractedUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<ExtractedUser | null>(
    null,
  );

  // Pagination states for user selection
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(1); // One user per page in form mode
  const [createdUsers, setCreatedUsers] = useState<Set<number>>(new Set()); // Track created user indices

  // Pagination calculations
  const totalPages = extractedUsers.length; // Each user gets their own page
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = extractedUsers.slice(startIndex, endIndex);
  const [formData, setFormData] = useState({
    nominativo: "",
    email: "",
    codice_fiscale: "",
    partita_iva: "",
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({
    nominativo: null,
    email: null,
    codice_fiscale: null,
    partita_iva: null,
    form: null,
  });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get auth state

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
    if (isFileLoading) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (isFileLoading) return;
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 30) {
      toast.error("Puoi caricare al massimo 30 file.");
      return;
    }

    setIsFileLoading(true);

    // Simulate loading to show animation
    setTimeout(() => {
      // Accept images and PDF files
      const validFiles = newFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        const isValidSize = file.size <= 12 * 1024 * 1024; // 12MB max

        if (!isValidSize) {
          toast.error(
            `Il file ${file.name} supera i 12MB di dimensione massima.`,
          );
        }

        return (isImage || isPDF) && isValidSize;
      });

      if (validFiles.length !== newFiles.length) {
        toast.error(
          "Puoi caricare solo file di tipo immagine (JPG, JPEG, PNG) o PDF. Dimensione massima: 12MB per file.",
        );
        setIsFileLoading(false);
        return;
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);

      // Create previews only for image files
      const imageFiles = validFiles.filter((file) =>
        file.type.startsWith("image/"),
      );
      const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      setIsFileLoading(false);
    }, 0);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
    setPreviews((prevPreviews) => {
      const urlToRevoke = prevPreviews[indexToRemove];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      return prevPreviews.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleUserSelection = (user: ExtractedUser) => {
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      nominativo: user.nominativo,
      codice_fiscale: user.codice_fiscale,
    }));
    validateField("nominativo", user.nominativo);
    validateField("codice_fiscale", user.codice_fiscale);
    setViewMode("form");
  };

  const handleNavigateToUser = (userIndex: number) => {
    const user = extractedUsers[userIndex];
    if (user) {
      setSelectedUser(user);
      setFormData((prev) => ({
        ...prev,
        nominativo: user.nominativo,
        codice_fiscale: user.codice_fiscale,
      }));
      validateField("nominativo", user.nominativo);
      validateField("codice_fiscale", user.codice_fiscale);

      // Set field errors for this user
      const currentUserFieldErrors = userFieldErrors[userIndex] || {};
      setErrors((prev) => ({
        ...prev,
        nominativo: currentUserFieldErrors.nominativo || null,
        codice_fiscale: currentUserFieldErrors.codice_fiscale || null,
        partita_iva: currentUserFieldErrors.partita_iva || null,
      }));
    }
  };

  const handlePreviousUser = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const userIndex = newPage - 1; // Since usersPerPage = 1, userIndex = page - 1
      handleNavigateToUser(userIndex);
    }
  };

  const handleNextUser = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const userIndex = newPage - 1; // Since usersPerPage = 1, userIndex = page - 1
      handleNavigateToUser(userIndex);
    }
  };

  const handleSkipToNextUncreated = () => {
    // Find next uncreated user
    const nextUncreatedIndex = extractedUsers.findIndex(
      (_, index) => index > currentPage - 1 && !createdUsers.has(index),
    );

    if (nextUncreatedIndex !== -1) {
      const newPage = nextUncreatedIndex + 1;
      setCurrentPage(newPage);
      handleNavigateToUser(nextUncreatedIndex);
    }
  };

  const handleExtractData = async () => {
    if (files.length === 0) {
      toast.error("Per favore carica almeno un documento.");
      return;
    }
    setIsExtracting(true);
    try {
      const data = await userService.extractInfoFromDocuments(files);

      // Combine successful extractions with partial extractions (from errors)
      const allUsers: ExtractedUser[] = [...data.utenti];
      const fieldErrors: Record<number, Record<string, string>> = {};

      // Process errors to create partial users
      data.errori.forEach((error, index) => {
        if (error.nominativo) {
          // Create a partial user from the error
          const partialUser: ExtractedUser = {
            nominativo: error.nominativo,
            codice_fiscale: error.codice_fiscale || "",
          };
          allUsers.push(partialUser);

          // Store field errors for this user
          const userIndex = allUsers.length - 1;
          fieldErrors[userIndex] = {};

          if (!error.codice_fiscale) {
            fieldErrors[userIndex].codice_fiscale = error.errore;
          }
        }
      });

      setExtractedUsers(allUsers);
      setExtractionErrors(data.errori);
      setUserFieldErrors(fieldErrors);

      if (allUsers.length === 0) {
        toast.error(
          "Nessun utente trovato nei documenti. Controlla gli errori per maggiori dettagli.",
        );
        return;
      }

      // Reset pagination state
      setCurrentPage(1);

      // Always go to form mode with pagination
      if (allUsers.length > 0) {
        const firstUser = allUsers[0];
        if (firstUser) {
          setSelectedUser(firstUser);
          setFormData((prev) => ({
            ...prev,
            nominativo: firstUser.nominativo,
            codice_fiscale: firstUser.codice_fiscale,
          }));
          validateField("nominativo", firstUser.nominativo);
          validateField("codice_fiscale", firstUser.codice_fiscale);
          toast.success(
            `${allUsers.length} utenti estratti (alcuni con campi mancanti)!`,
          );
          setViewMode("form");
        }
      }

      // Show error notifications if there are extraction errors
      if (data.errori.length > 0) {
        // Show individual error notifications directly
        data.errori.forEach((error, index) => {
          setTimeout(() => {
            const errorMessage = error.nominativo
              ? `${error.nominativo}: ${error.errore}`
              : error.errore;

            toast.error(errorMessage, {
              description: error.codice_fiscale
                ? `CF: ${error.codice_fiscale}`
                : undefined,
              duration: 5000,
            });
          }, index * 500); // Stagger notifications to avoid overwhelming the user
        });
      }
    } catch (err: unknown) {
      let errorMessage = "Errore durante l&apos;estrazione dei dati.";
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as {
          message?: string;
          error?: string;
        };
        errorMessage = errorData.message ?? errorData.error ?? errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const isValidEmail = (email: string) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCodiceFiscale = (cf: string): string | null => {
    if (!cf) return null;
    const cfRegex = /^[A-Z0-9]{16}$/i;
    if (!cfRegex.test(cf))
      return "Il Codice Fiscale deve contenere 16 caratteri alfanumerici.";
    return null;
  };

  const validatePartitaIva = (piva: string): string | null => {
    if (!piva) return null;
    const pivaRegex = /^[0-9]{11}$/;
    if (!pivaRegex.test(piva)) return "La Partita IVA deve contenere 11 cifre.";
    return null;
  };

  const validateField = (name: string, value: string) => {
    let errorMessage: string | null = null;
    switch (name) {
      case "nominativo":
        if (!value.trim()) errorMessage = "Il nominativo è obbligatorio.";
        break;
      case "email":
        if (!isValidEmail(value)) errorMessage = "Formato email non valido.";
        break;
      case "codice_fiscale":
        errorMessage = validateCodiceFiscale(value);
        break;
      case "partita_iva":
        errorMessage = validatePartitaIva(value);
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCreateViewerSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Azione non autorizzata. Effettua il login.");
      return;
    }

    // Full form validation on submit
    const newErrors: Record<string, string | null> = {
      nominativo: !formData.nominativo.trim()
        ? "Il nominativo è obbligatorio."
        : null,
      email: !isValidEmail(formData.email) ? "Formato email non valido." : null,
      codice_fiscale: validateCodiceFiscale(formData.codice_fiscale),
      partita_iva: validatePartitaIva(formData.partita_iva),
      form: null,
    };

    if (!formData.codice_fiscale && !formData.partita_iva) {
      newErrors.form =
        "Devi fornire almeno il Codice Fiscale o la Partita IVA.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== null);
    if (hasErrors) {
      toast.error(
        "Per favore correggi gli errori nel form prima di procedere.",
      );
      return;
    }

    setIsLoading(true);

    const data: CreateViewerData = {
      nominativo: formData.nominativo,
      email: formData.email,
      codice_fiscale: formData.codice_fiscale || undefined,
      partita_iva: formData.partita_iva || undefined,
    };

    try {
      const response = await userService.createViewer(data);
      toast.success("Cliente creato con successo!");

      // Mark current user as created
      const currentUserIndex = currentPage - 1;
      setCreatedUsers((prev) => new Set([...prev, currentUserIndex]));

      // The createViewer function already downloads the credentials as a PDF
      // No need for additional download call

      // Check if there are more users to process
      const hasMoreUsers = currentUserIndex < extractedUsers.length - 1;

      if (hasMoreUsers) {
        // Move to next user
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        const nextUserIndex = nextPage - 1;
        const nextUser = extractedUsers[nextUserIndex];

        if (nextUser) {
          setSelectedUser(nextUser);
          setFormData((prev) => ({
            ...prev,
            nominativo: nextUser.nominativo,
            codice_fiscale: nextUser.codice_fiscale,
            email: "", // Reset email for next user
            partita_iva: "", // Reset partita_iva for next user
          }));
          validateField("nominativo", nextUser.nominativo);
          validateField("codice_fiscale", nextUser.codice_fiscale);
          setErrors({
            nominativo: null,
            email: null,
            codice_fiscale: null,
            partita_iva: null,
            form: null,
          });
          toast.success(
            `Passando al prossimo utente (${nextPage}/${extractedUsers.length})`,
          );
        }
      } else {
        // All users processed
        toast.success("Tutti gli utenti sono stati creati con successo!");
      }
    } catch (err: unknown) {
      let errorMessage =
        "Si è verificato un errore durante la creazione del viewer.";

      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as {
          message?: string;
          error?: string;
        };
        errorMessage = errorData.message ?? errorData.error ?? errorMessage;
      }

      setErrors((prev) => ({ ...prev, form: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = React.useMemo(() => {
    return (
      formData.nominativo.trim() !== "" &&
      isValidEmail(formData.email) &&
      (formData.codice_fiscale || formData.partita_iva) &&
      !errors.codice_fiscale &&
      !errors.partita_iva
    );
  }, [formData, errors]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nominativo: "",
        email: "",
        codice_fiscale: "",
        partita_iva: "",
      });
      setErrors({
        nominativo: null,
        email: null,
        codice_fiscale: null,
        partita_iva: null,
        form: null,
      });
      setFiles([]);
      setPreviews((currentPreviews) => {
        currentPreviews.forEach((p) => URL.revokeObjectURL(p));
        return [];
      });
      setExtractedUsers([]);
      setExtractionErrors([]);
      setUserFieldErrors({});
      setSelectedUser(null);
      setShowUserDetails(null);
      setIsExtracting(false);
      setViewMode("upload");
      // Reset pagination state
      setCurrentPage(1);
      setCreatedUsers(new Set());
    }
  }, [isOpen]);

  const renderUploadStep = () => (
    <div className="space-y-4 pt-4">
      {files.length === 0 && (
        <div className="space-y-4">
          <Label>Carica Documento (Fronte/Retro)</Label>
          <div
            className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${isFileLoading ? "bg-muted/50 cursor-wait" : "hover:bg-muted/50 cursor-pointer"}`}
            onDragOver={isFileLoading ? undefined : handleDragOver}
            onDragLeave={isFileLoading ? undefined : handleDragLeave}
            onDrop={isFileLoading ? undefined : handleDrop}
            onClick={
              isFileLoading
                ? undefined
                : () => document.getElementById("file-upload")?.click()
            }
          >
            {isFileLoading ? (
              <>
                <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
                <p className="text-muted-foreground mt-2 text-center text-sm">
                  Caricamento file...
                </p>
              </>
            ) : (
              <>
                <FileUp className="text-muted-foreground h-10 w-10" />
                <p className="text-muted-foreground mt-2 text-center text-sm">
                  Trascina i file qui o clicca per selezionare.
                  <br />
                  (Max 30 file, immagini e PDF)
                </p>
              </>
            )}

            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileSelect}
              disabled={
                isExtracting || isLoading || files.length >= 30 || isFileLoading
              }
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <Label>Documenti Caricati ({files.length}/30)</Label>
          <div className="grid grid-cols-2 gap-4">
            {files.map((file, index) => {
              const imageIndex = files
                .slice(0, index)
                .filter((f) => f.type.startsWith("image/")).length;
              return (
                <div key={index} className="relative">
                  {file.type.startsWith("image/") && previews[imageIndex] ? (
                    <Image
                      src={previews[imageIndex]}
                      alt={`preview ${index + 1}`}
                      width={300}
                      height={128}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-32 w-full items-center justify-center rounded-lg">
                      <div className="text-center">
                        <FileUp className="text-muted-foreground mx-auto h-8 w-8" />
                        <p className="text-muted-foreground mt-1 text-xs">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white transition-transform hover:scale-110"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isExtracting || isLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          {files.length < 30 && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                document.getElementById("file-upload-more")?.click()
              }
            >
              <FileUp className="mr-2 h-4 w-4" />
              Aggiungi altro file
              <input
                id="file-upload-more"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={
                  isExtracting ||
                  isLoading ||
                  files.length >= 30 ||
                  isFileLoading
                }
              />
            </Button>
          )}
        </div>
      )}
      <DialogFooter className="flex-col gap-3 pt-8 sm:flex-row sm:justify-end sm:space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setViewMode("form")}
          className="w-full rounded-xl py-6 text-base sm:w-auto sm:py-2"
        >
          Compila Manualmente
        </Button>
        <Button
          type="button"
          onClick={handleExtractData}
          disabled={
            isExtracting || isLoading || files.length === 0 || isFileLoading
          }
          className="w-full rounded-xl py-6 text-base sm:w-auto sm:py-2"
        >
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Estrazione...
            </>
          ) : (
            "Estrai Dati e procedi"
          )}
        </Button>
      </DialogFooter>
    </div>
  );

  const renderUserSelectionStep = () => (
    <div className="space-y-4 pt-4">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Utenti Trovati ({extractedUsers.length})
          </h3>
          <p className="text-muted-foreground text-sm">
            Seleziona l&apos;utente corretto per continuare
          </p>
        </div>

        <div className="space-y-3">
          {currentUsers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Nessun utente trovato nei documenti.
              </p>
            </div>
          ) : (
            currentUsers.map((user, index) => {
              const globalIndex = startIndex + index;
              return (
                <div
                  key={globalIndex}
                  className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                  onClick={() => handleUserSelection(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{user.nominativo}</p>
                      <p className="text-muted-foreground text-sm">
                        CF: {user.codice_fiscale}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Dati estratti da {files.length} documento
                        {files.length !== 1 ? "i" : ""} • Utente{" "}
                        {globalIndex + 1} di {extractedUsers.length}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserDetails(user);
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Dettagli
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelection(user);
                        }}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        Seleziona
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-muted-foreground text-sm">
              Pagina {currentPage} di {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {extractionErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-600">
              Errori durante l&apos;estrazione:
            </h4>
            <div className="space-y-1">
              {extractionErrors.map((error, index) => (
                <div key={index} className="rounded bg-orange-50 p-2 text-sm">
                  <p className="text-orange-800">
                    {error.nominativo && `Nominativo: ${error.nominativo}`}
                    {error.codice_fiscale && ` CF: ${error.codice_fiscale}`}
                  </p>
                  <p className="text-orange-600">{error.errore}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setViewMode("upload")}
          className="rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna Indietro
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setViewMode("form")}
          className="rounded-xl"
        >
          Compila Manualmente
        </Button>
      </DialogFooter>
    </div>
  );

  const renderFormStep = () => {
    const currentUserIndex = currentPage - 1; // Since usersPerPage = 1, userIndex = page - 1
    const currentUser = extractedUsers[currentUserIndex];
    const isCurrentUserCreated = createdUsers.has(currentUserIndex);
    const currentUserFieldErrors = userFieldErrors[currentUserIndex] || {};

    return (
      <form onSubmit={handleCreateViewerSubmit} className="space-y-4 pt-4">
        {/* User Navigation Header */}
        {extractedUsers.length > 1 && (
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Utente {currentUserIndex + 1} di {extractedUsers.length}
              </span>
              {currentUser && (
                <span className="text-muted-foreground text-xs">
                  • {currentUser.nominativo}
                </span>
              )}
              {isCurrentUserCreated && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  ✓ Creato
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviousUser}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground text-sm">
                {currentPage} di {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextUser}
                disabled={currentPage === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nominativo">
              Nominativo <span className="text-red-600">*</span>
            </Label>
            <Input
              id="nominativo"
              name="nominativo"
              className="ring-border rounded-xl border-none ring-1"
              placeholder="Nominativo"
              value={formData.nominativo}
              onChange={handleInputChange}
              required
              disabled={isLoading || isExtracting}
            />
            {errors.nominativo && (
              <p className="text-sm text-red-600">{errors.nominativo}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-600">*</span>
            </Label>
            <div className="relative flex items-center">
              <Input
                id="email"
                name="email"
                type="email"
                className="peer ring-border rounded-xl border-none ps-9 ring-1"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading || isExtracting}
                autoFocus
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <AtSignIcon size={16} aria-hidden="true" />
              </div>
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codice_fiscale">
                Codice Fiscale{" "}
                <span className="text-muted-foreground text-xs">
                  (opzionale)
                </span>
              </Label>
              <Input
                id="codice_fiscale"
                name="codice_fiscale"
                placeholder="Codice Fiscale"
                value={formData.codice_fiscale}
                onChange={handleInputChange}
                disabled={isLoading || isExtracting}
                className="ring-border rounded-xl border-none ring-1"
              />
              {(errors.codice_fiscale ||
                currentUserFieldErrors.codice_fiscale) && (
                <p className="text-sm text-red-600">
                  {currentUserFieldErrors.codice_fiscale ||
                    errors.codice_fiscale}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partita_iva">
                Partita IVA{" "}
                <span className="text-muted-foreground text-xs">
                  (opzionale)
                </span>
              </Label>
              <Input
                id="partita_iva"
                name="partita_iva"
                className="ring-border rounded-xl border-none ring-1"
                placeholder="Partita IVA"
                value={formData.partita_iva}
                onChange={handleInputChange}
                disabled={isLoading || isExtracting}
              />
              {errors.partita_iva && (
                <p className="text-sm text-red-600">{errors.partita_iva}</p>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-center text-xs">
            È obbligatorio fornire almeno uno tra Codice Fiscale e Partita IVA.
          </p>
          {errors.form && (
            <p className="text-center text-sm text-red-600">{errors.form}</p>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewMode("upload")}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna Indietro
            </Button>
            {isCurrentUserCreated && extractedUsers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipToNextUncreated}
                className="rounded-xl"
              >
                Salta al prossimo
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              isLoading || !isFormValid || isExtracting || isCurrentUserCreated
            }
            className="w-full rounded-xl sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cliente...
              </>
            ) : isCurrentUserCreated ? (
              <>✓ Cliente già creato</>
            ) : (
              `Crea cliente ${extractedUsers.length > 1 ? `(${currentPage}/${extractedUsers.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-4xl px-8 shadow-lg sm:max-w-[550px]">
          <div className="relative">
            <div
              className={`space-y-4 ${isExtracting ? "pointer-events-none blur-sm" : ""}`}
            >
              <DialogHeader className="flex flex-col items-center space-y-1.5 pt-6">
                <UserPlus className="h-12 w-12" />
                <div className="flex flex-col items-center space-y-0.5">
                  <DialogTitle className="text-foreground text-2xl font-semibold">
                    Crea cliente
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-md">
                    {viewMode === "upload"
                      ? "Carica documenti per estrarre i dati (max 30 file)"
                      : viewMode === "select"
                        ? "Seleziona l&apos;utente corretto"
                        : "Compila i dati per creare il cliente"}
                  </DialogDescription>
                </div>
              </DialogHeader>

              {viewMode === "upload"
                ? renderUploadStep()
                : viewMode === "select"
                  ? renderUserSelectionStep()
                  : renderFormStep()}
            </div>
            {isExtracting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                <p className="mt-4 text-lg font-semibold">
                  Estrazione dati in corso...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog
        open={!!showUserDetails}
        onOpenChange={() => setShowUserDetails(null)}
      >
        <DialogContent className="rounded-4xl px-8 shadow-lg sm:max-w-[500px]">
          <DialogHeader className="flex flex-col items-center space-y-1.5 pt-6">
            <UserPlus className="h-12 w-12" />
            <div className="flex flex-col items-center space-y-0.5">
              <DialogTitle className="text-foreground text-2xl font-semibold">
                Dettagli Utente
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-md">
                Informazioni estratte dai documenti
              </DialogDescription>
            </div>
          </DialogHeader>

          {showUserDetails && (
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Nominativo
                  </Label>
                  <div className="rounded-lg border p-3">
                    <p className="font-medium">{showUserDetails.nominativo}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Codice Fiscale
                  </Label>
                  <div className="rounded-lg border p-3">
                    <p className="font-mono text-sm">
                      {showUserDetails.codice_fiscale}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-600">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Informazioni estratte
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Questi dati sono stati estratti automaticamente da{" "}
                        {files.length} documento{files.length !== 1 ? "i" : ""}{" "}
                        caricato{files.length !== 1 ? "i" : ""}. Verifica che
                        siano corretti prima di procedere con la creazione del
                        cliente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserDetails(null)}
                  className="rounded-xl"
                >
                  Chiudi
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (showUserDetails) {
                      handleUserSelection(showUserDetails);
                      setShowUserDetails(null);
                    }
                  }}
                  className="rounded-xl"
                >
                  Seleziona questo utente
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
