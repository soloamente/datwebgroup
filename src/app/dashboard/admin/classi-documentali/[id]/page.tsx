"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useId } from "react";
import { CheckIcon, ChevronDownIcon, Trash2Icon } from "lucide-react";
import {
  userService,
  type DocumentClass,
  type DocumentClassField,
  type Sharer,
  docClassService,
  type AssignSharerRequest,
  type AvailableSharersResponse,
  type RemoveSharerResponse,
} from "@/app/api/api"; // Import necessary types
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from "@/components/animate-ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { Checkbox as AnimatedCheckbox } from "@/components/animate-ui/base/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldsSortableTable } from "@/components/dashboard/detail-page-components/fields-sortable-table"; // Import the new component
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation";
import { Badge } from "@/components/ui/badge";

// --- Copied type definitions from the list page for consistent transformation ---
// Define interfaces for the raw API response structure (for a list)
interface ApiDocumentClassField {
  id: number;
  name: string;
  label: string;
  data_type: string;
  required: number;
  is_primary_key: number;
  sort_order: number;
  options?: { id?: number; value: string; label: string }[] | null;
}

interface ApiDocumentClass {
  id: number;
  name: string;
  description: string;
  created_by: string;
  sharers_count: number;
  sharers: Sharer[];
  fields: ApiDocumentClassField[];
  created_at?: string;
  updated_at?: string;
}

// This ApiResponse is for a list of document classes
interface ApiListResponse {
  message: string;
  data: ApiDocumentClass[];
}
// --- End of copied type definitions ---

export default function DocumentClassDetailPage() {
  const params = useParams();
  const idFromRoute = params?.id as string;

  const [documentClass, setDocumentClass] = useState<DocumentClass | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSharers, setAvailableSharers] = useState<Sharer[]>([]);
  const [isLoadingSharers, setIsLoadingSharers] = useState(false);
  const [selectedSharerId, setSelectedSharerId] = useState<number | "">("");
  const [isSharerSelectOpen, setIsSharerSelectOpen] = useState(false);
  const sharerSelectId = useId();

  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sharerToDelete, setSharerToDelete] = useState<Sharer | null>(null);

  const [newField, setNewField] = useState({
    label: "",
    data_type: "string" as
      | "string"
      | "boolean"
      | "integer"
      | "decimal"
      | "date"
      | "datetime"
      | "enum",
    required: false,
    is_primary_key: false,
  });

  // --- State for editable fields in Basic Info tab ---
  const [editNome, setEditNome] = useState<string>("");
  const [editDescrizione, setEditDescrizione] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle

  // When documentClass changes, update local state for editing
  useEffect(() => {
    if (documentClass) {
      setEditNome(documentClass.nome);
      // Always set editDescrizione to a string (never null/undefined) for controlled Textarea
      setEditDescrizione(documentClass.descrizione ?? "");
      setIsEditing(false); // Exit edit mode on doc change
    }
  }, [documentClass]);

  // --- Handler to save changes to nome/descrizione ---
  const handleSaveBasicInfo = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!documentClass) return;
    setIsSaving(true);
    try {
      await docClassService.updateDocumentClass(documentClass.id, {
        name: editNome,
        description: editDescrizione,
      });
      setDocumentClass((prev) =>
        prev ? { ...prev, nome: editNome, descrizione: editDescrizione } : prev,
      );
      // Show toast message centered (requires Sonner v1.2.0+ or global config)
      toast.success("Classe documentale aggiornata con successo.", {
        position: "top-center", // If not supported, set globally in <Toaster position="top-center" />
      });
      setIsEditing(false); // Exit edit mode
    } catch (error) {
      console.error("Failed to update document class info:", error);
      toast.error("Impossibile aggiornare le informazioni");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Helper to check if fields have changed ---
  const isUnchanged =
    documentClass &&
    editNome === documentClass.nome &&
    editDescrizione === documentClass.descrizione;
  const isInvalid = editNome.trim() === "";

  // Helper function to format dates in a pretty format
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Non disponibile";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString; // fallback to original string if parsing fails
    }
  };

  // Function to fetch available sharers for assignment
  const fetchAvailableSharers = async (docClassId?: number) => {
    const classId = docClassId ?? documentClass?.id;
    if (!classId) return;

    setIsLoadingSharers(true);
    try {
      const response: AvailableSharersResponse =
        await docClassService.getAvailableSharers(classId);
      // Extract the data array from the API response
      const sharers = response.data || [];
      setAvailableSharers(sharers);
      console.log("Available sharers loaded:", sharers);
    } catch (error) {
      console.error("Failed to fetch available sharers:", error);
      toast.error("Impossibile caricare gli sharers disponibili");
    } finally {
      setIsLoadingSharers(false);
    }
  };

  useEffect(() => {
    if (idFromRoute) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch the entire list of document classes
          const response =
            (await userService.getDocumentClasses()) as unknown as ApiListResponse;

          if (response?.data && Array.isArray(response.data)) {
            // Transform the entire list first
            const transformedList: DocumentClass[] = response.data.map(
              (apiDoc: ApiDocumentClass): DocumentClass => ({
                id: apiDoc.id,
                nome: apiDoc.name,
                descrizione: apiDoc.description,
                campi:
                  apiDoc.fields?.map((field) => ({
                    id: field.id,
                    nome: field.name,
                    label: field.label,
                    tipo: field.data_type,
                    obbligatorio: field.required === 1,
                    is_primary_key: field.is_primary_key === 1,
                    sort_order: field.sort_order,
                    options: field.options,
                  })) ?? [],
                // Map sharers array directly from API response
                sharers: apiDoc.sharers ?? [],
                created_at: apiDoc.created_at ?? "",
                updated_at: apiDoc.updated_at ?? "",
              }),
            );

            // Find the specific document class by ID from the transformed list
            const numericId = Number(idFromRoute);
            const foundDoc = transformedList.find(
              (doc) => doc.id === numericId,
            );

            if (foundDoc) {
              setDocumentClass(foundDoc);
              console.log("Found and set document class:", foundDoc);

              // Automatically load available sharers when document class is found
              await fetchAvailableSharers(foundDoc.id);
            } else {
              throw new Error(
                `Document class with ID ${idFromRoute} not found in the list.`,
              );
            }
          } else {
            throw new Error(
              "Document class list data not found in API response or is malformed.",
            );
          }
        } catch (err) {
          console.error("Failed to fetch or find document class:", err);
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          setError(errorMessage);
          toast.error(`Failed to load document class: ${errorMessage}`);
        } finally {
          setIsLoading(false);
        }
      };
      void fetchData();
    }
  }, [idFromRoute]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Errore: {error}</p>
      </div>
    );
  }

  if (!documentClass) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Classe documentale non trovata.</p>
      </div>
    );
  }

  const handleAddField = async () => {
    try {
      const response = await docClassService.addField(documentClass.id, {
        name: newField.label.toLowerCase().replace(/\s+/g, "_"),
        label: newField.label,
        data_type: newField.data_type,
        required: newField.required,
        is_primary: newField.is_primary_key,
      });

      // Reset form
      setNewField({
        label: "",
        data_type: "string" as
          | "string"
          | "boolean"
          | "integer"
          | "decimal"
          | "date"
          | "datetime"
          | "enum",
        required: false,
        is_primary_key: false,
      });

      // Refresh the document class data
      const updatedResponse =
        (await userService.getDocumentClasses()) as unknown as ApiListResponse;
      const updatedDoc = updatedResponse.data.find(
        (doc: ApiDocumentClass) => doc.id === documentClass.id,
      );
      if (updatedDoc) {
        setDocumentClass({
          ...documentClass,
          campi: updatedDoc.fields.map((field: ApiDocumentClassField) => ({
            id: field.id,
            nome: field.name,
            label: field.label,
            tipo: field.data_type,
            obbligatorio: field.required === 1,
            is_primary_key: field.is_primary_key === 1,
            sort_order: field.sort_order,
            options: field.options,
          })),
        });
      }

      toast.success("Campo aggiunto con successo");
    } catch (error) {
      console.error("Failed to add field:", error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Show the specific error message from the API response
        const responseData = error.response.data as unknown;
        const errorMessage =
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData
            ? String((responseData as { message: unknown }).message)
            : "Errore di conflitto";
        toast.error(errorMessage);
      } else {
        toast.error("Impossibile aggiungere il campo");
      }
    }
  };

  // Function to assign a sharer to the document class
  const handleAssignSharer = async () => {
    if (!documentClass || !selectedSharerId) return;

    // Find the selected sharer in the available sharers list
    const selectedSharer = availableSharers.find(
      (sharer) => sharer.id === selectedSharerId,
    );

    if (!selectedSharer) {
      toast.error("Sharer selezionato non trovato");
      return;
    }

    try {
      const response = await docClassService.assignSharer(documentClass.id, {
        sharer_id: Number(selectedSharerId),
      });

      // Update the document class by adding the selected sharer to the existing list
      setDocumentClass((prev) => {
        if (!prev) return prev;

        const currentSharers = prev.sharers ?? [];
        const sharerAlreadyExists = currentSharers.some(
          (sharer) => sharer.id === selectedSharerId,
        );

        // Only add if not already present
        if (!sharerAlreadyExists) {
          return {
            ...prev,
            sharers: [...currentSharers, selectedSharer],
          };
        }
        return prev;
      });

      // Remove the assigned sharer from the available sharers list immediately
      setAvailableSharers((prev) =>
        prev.filter((sharer) => sharer.id !== selectedSharerId),
      );

      // Reset form
      setSelectedSharerId("");

      toast.success(response.message ?? "Sharer assegnato con successo");
    } catch (error) {
      console.error("Failed to assign sharer:", error);
      toast.error("Impossibile assegnare lo sharer");
    }
  };

  // Function to initiate sharer removal (opens confirmation dialog)
  const handleRemoveSharer = async (sharerId: number) => {
    if (!documentClass) return;

    // Find the sharer to be removed
    const sharerToRemove = documentClass.sharers?.find(
      (sharer) => sharer.id === sharerId,
    );

    if (!sharerToRemove) {
      toast.error("Sharer non trovato");
      return;
    }

    // Set the sharer to delete and open confirmation dialog
    setSharerToDelete(sharerToRemove);
    setIsDeleteDialogOpen(true);
  };

  // Function to perform the actual sharer removal
  const confirmRemoveSharer = async (): Promise<boolean> => {
    if (!documentClass || !sharerToDelete) return false;

    try {
      const response = await docClassService.removeFromSharer(
        documentClass.id,
        sharerToDelete.id,
      );

      // Update the document class by removing the sharer from the list
      setDocumentClass((prev) => {
        if (!prev) return prev;

        const updatedSharers =
          prev.sharers?.filter((sharer) => sharer.id !== sharerToDelete.id) ??
          [];

        return {
          ...prev,
          sharers: updatedSharers,
        };
      });

      // Add the removed sharer back to the available sharers list
      setAvailableSharers((prev) => [...prev, sharerToDelete]);

      toast.success(response.message ?? "Sharer rimosso con successo");

      // Refresh available sharers to ensure consistency
      await fetchAvailableSharers();

      return true;
    } catch (error) {
      console.error("Failed to remove sharer:", error);
      toast.error("Impossibile rimuovere lo sharer");
      return false;
    }
  };

  // Function to close the delete confirmation dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSharerToDelete(null);
  };

  // --- Handler to update fields order (sort_order) ---
  const handleFieldsOrderChange = async (
    updatedFields: DocumentClassField[],
  ) => {
    if (!documentClass) return;
    try {
      // Aggiorna il sort_order di ogni campo tramite API (in parallelo)
      await Promise.all(
        updatedFields.map((field, idx) =>
          docClassService.updateField(documentClass.id, field.id, {
            sort_order: idx + 1,
          }),
        ),
      );
      // Dopo l'aggiornamento, ricarica la document class con i dati aggiornati dal backend
      const response = await docClassService.getDocumentClassById(
        documentClass.id,
      );
      const updatedDoc = response.data;
      if (updatedDoc) {
        setDocumentClass((prev) =>
          prev
            ? {
                ...prev,
                campi: updatedDoc.fields.map(
                  (field: ApiDocumentClassField) => ({
                    id: field.id,
                    nome: field.name,
                    label: field.label,
                    tipo: field.data_type,
                    obbligatorio: field.required === 1,
                    is_primary_key: field.is_primary_key === 1,
                    sort_order: field.sort_order,
                    options: field.options,
                  }),
                ),
              }
            : prev,
        );
      }
      toast.success("Ordine dei campi aggiornato");
    } catch (error) {
      console.error(
        "Errore durante l'aggiornamento dell'ordine dei campi:",
        error,
      );
      toast.error("Impossibile aggiornare l'ordine dei campi");
    }
  };

  // --- Real-time update handler for single field update (e.g., sort_order change) ---
  const handleFieldUpdate = (updatedField: DocumentClassField) => {
    setDocumentClass((prev) =>
      prev
        ? {
            ...prev,
            campi: prev.campi
              .map((f) => (f.id === updatedField.id ? updatedField : f))
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
          }
        : prev,
    );
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl overflow-x-hidden p-6">
      {/* Simplified Header */}
      <div className="mb-8">
        <h1 className="text-3xl">{documentClass.nome}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {documentClass.descrizione}
        </p>
      </div>

      {/* Minimal Tabs */}
      <Tabs
        defaultValue="basic-info"
        className="bg-background w-full rounded-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-info">Generale</TabsTrigger>
          <TabsTrigger value="fields">
            Campi
            <Badge className="ml-2" variant="secondary">
              {documentClass.campi.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="sharers">
            Sharers
            <Badge className="ml-2" variant="secondary">
              {documentClass.sharers?.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="audit">Avanzate</TabsTrigger>
        </TabsList>

        <TabsContents className="bg-background mx-1 -mt-2 mb-1 h-full rounded-sm">
          {/* Basic Info Tab */}
          <TabsContent value="basic-info" className="space-y-6 p-6">
            {/* Card container for visual grouping - now full width, improved UI/UX */}
            <div
              className={cn(
                "w-full rounded-xl border p-0 shadow-sm transition-all duration-200",
                isEditing
                  ? "border-primary/70 ring-primary/20 bg-primary/5 ring-2"
                  : "border-card/60 bg-background",
              )}
            >
              {/* Card Header with icon, title, and edit button/indicator */}
              <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  {/* Info/Document icon */}
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-primary"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 8h8M8 12h8M8 16h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <h2 className="text-xl leading-tight font-semibold">
                      Informazioni generali
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Modifica i dettagli di base della classe documentale.
                    </p>
                  </div>
                </div>
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setIsEditing(true)}
                    aria-label="Modifica informazioni generali"
                  >
                    Modifica
                  </Button>
                ) : (
                  <span className="bg-primary/10 text-primary ml-auto animate-pulse rounded px-3 py-1 text-xs font-medium transition-all">
                    Modifica in corso…
                  </span>
                )}
              </div>
              {/* Form fields, responsive grid */}
              <form
                className="grid gap-6 px-6 py-8 md:grid-cols-2"
                onSubmit={handleSaveBasicInfo}
              >
                {/* Nome Field (editable or read-only) */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nome" className="text-sm">
                    Nome
                  </Label>
                  {isEditing ? (
                    <Input
                      id="nome"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="bg-background focus-visible:ring-primary"
                      aria-label="Nome della classe documentale"
                      autoFocus
                    />
                  ) : (
                    <div className="bg-muted/30 flex min-h-[2.5rem] items-center rounded border border-transparent px-2">
                      {documentClass.nome}
                    </div>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Nome della classe documentale.
                  </p>
                </div>
                {/* Descrizione Field (editable or read-only) */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="descrizione" className="text-sm font-medium">
                    Descrizione
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="descrizione"
                      // Defensive: always pass a string to value (never null)
                      value={editDescrizione ?? ""}
                      onChange={(e) => setEditDescrizione(e.target.value)}
                      className="bg-background focus-visible:ring-primary max-w-lg resize-none"
                      rows={3}
                      aria-label="Descrizione della classe documentale"
                    />
                  ) : (
                    <div className="bg-muted/30 flex min-h-[2.5rem] items-center rounded border border-transparent px-2">
                      {documentClass.descrizione?.trim() ? (
                        documentClass.descrizione
                      ) : (
                        <span className="text-muted-foreground">
                          Nessuna descrizione
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Breve descrizione della classe documentale.
                  </p>
                </div>
                {/* Action Buttons (Save/Cancel) - only in edit mode, full width on mobile, right-aligned on desktop */}
                {isEditing && (
                  <div className="col-span-2 flex flex-col items-stretch gap-2 pt-4 md:flex-row md:justify-end md:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-w-[90px]"
                      onClick={() => {
                        // Reset fields to original values and exit edit mode
                        setEditNome(documentClass.nome);
                        setEditDescrizione(documentClass.descrizione ?? "");
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                    >
                      Annulla
                    </Button>
                    <Button
                      type="submit"
                      className="min-w-[90px] text-white"
                      disabled={isSaving ?? isUnchanged ?? isInvalid}
                    >
                      {isSaving ? "Salvataggio..." : "Salva"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6 p-6">
            {/* Section header for Fields */}

            {/* Card for Add Field Form */}
            <div className="bg-background mb-4 rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <path
                    d="M12 4v16m8-8H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3 className="text-lg font-medium">Aggiungi Campo</h3>
              </div>
              <p className="text-muted-foreground mb-4 text-xs">
                Definisci un nuovo campo per questa classe documentale. Compila
                i dettagli e premi &quot;Aggiungi&quot;.
              </p>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Field label input */}
                <div className="space-y-2">
                  <Label htmlFor="new_field_label" className="text-xs">
                    Nome Etichetta
                  </Label>
                  <Input
                    type="text"
                    id="new_field_label"
                    className="h-8"
                    placeholder="Nome campo"
                    value={newField.label}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                </div>
                {/* Field type select */}
                <div className="space-y-2">
                  <Label htmlFor="new_field_data_type" className="text-xs">
                    Tipologia
                  </Label>
                  <select
                    id="new_field_data_type"
                    className="bg-background h-8 w-full rounded-md border px-3 text-sm"
                    value={newField.data_type}
                    onChange={(e) =>
                      setNewField((prev) => ({
                        ...prev,
                        data_type: e.target.value as typeof newField.data_type,
                      }))
                    }
                  >
                    <option value="string">Testo</option>
                    <option value="boolean">Binario (Si/No)</option>
                    <option value="integer">Numero Intero</option>
                    <option value="decimal">Numero Decimale</option>
                    <option value="date">Data</option>
                    <option value="datetime">Data e Ora</option>
                    <option value="enum">Lista Opzioni</option>
                  </select>
                </div>
                {/* Required and Primary Key checkboxes - improved UI/UX */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Obbligatorio Checkbox */}
                  <label className="group flex cursor-pointer items-center gap-2">
                    <AnimatedCheckbox
                      id="new_field_required"
                      checked={newField.required}
                      onCheckedChange={(checked) =>
                        setNewField((prev) => ({
                          ...prev,
                          required: !!checked,
                        }))
                      }
                      className="group-hover:ring-primary/40 focus-visible:ring-primary transition-all group-hover:ring-2"
                      aria-checked={newField.required}
                      aria-labelledby="label-required"
                    />
                    <span id="label-required" className="text-xs select-none">
                      Obbligatorio
                    </span>
                  </label>
                  {/* Chiave Primaria Checkbox */}
                  <label className="group flex cursor-pointer items-center gap-2">
                    <AnimatedCheckbox
                      id="new_field_is_primary_key"
                      checked={newField.is_primary_key}
                      onCheckedChange={(checked) =>
                        setNewField((prev) => ({
                          ...prev,
                          is_primary_key: !!checked,
                        }))
                      }
                      className="group-hover:ring-primary/40 focus-visible:ring-primary transition-all group-hover:ring-2"
                      aria-checked={newField.is_primary_key}
                      aria-labelledby="label-primary-key"
                    />
                    <span
                      id="label-primary-key"
                      className="text-xs select-none"
                    >
                      Chiave Primaria
                    </span>
                  </label>
                </div>
                {/* Add button */}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    void handleAddField();
                  }}
                  type="submit"
                  size="sm"
                  className="h-8 self-end text-white"
                >
                  Aggiungi
                </Button>
              </form>
            </div>
            {/* Card for Fields Table or Empty State */}
            <div className="bg-background rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 8h8M8 12h8M8 16h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3 className="text-lg font-medium">Elenco Campi</h3>
              </div>
              {documentClass.campi && documentClass.campi.length > 0 ? (
                <FieldsSortableTable
                  initialFields={[...documentClass.campi].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                  )}
                  documentClassId={documentClass.id}
                  onOrderChange={handleFieldsOrderChange}
                  onFieldUpdate={handleFieldUpdate}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  {/* Empty state icon */}
                  <svg
                    width="40"
                    height="40"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-muted-foreground"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 8h8M8 12h8M8 16h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-muted-foreground text-center text-sm">
                    Nessun campo definito per questa classe documentale.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sharers Tab */}
          <TabsContent value="sharers" className="space-y-6 p-6">
            {/* --- Associated Users Section --- */}
            <div className="bg-background mb-8 w-full rounded-xl border p-6 shadow-sm">
              {/* Section Header */}
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                {/* Icon for visual context */}
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M6.5 18a5.5 5.5 0 0 1 11 0"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Utenti associati
              </h2>

              <div className="space-y-6">
                {/* Sharers Table or Empty State */}
                {documentClass.sharers && documentClass.sharers.length > 0 ? (
                  <div className="w-full overflow-x-auto">
                    <div className="bg-background w-full min-w-[400px] overflow-hidden rounded-lg border shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-9 py-2">Nome</TableHead>
                            <TableHead className="h-9 py-2">Email</TableHead>
                            <TableHead className="h-9 w-20 py-2">
                              Azioni
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documentClass.sharers.map((sharer) => (
                            <TableRow
                              key={sharer.id}
                              className="group hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="flex items-center gap-2 py-2 font-medium">
                                {/* Avatar or Initials */}
                                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                                  {sharer.nominativo
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <span>{sharer.nominativo}</span>
                              </TableCell>
                              <TableCell className="py-2">
                                {sharer.email}
                              </TableCell>
                              <TableCell className="py-2">
                                {/* Remove button with tooltip */}
                                <div className="relative flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveSharer(sharer.id)
                                    }
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive h-8 w-8 p-0 focus-visible:ring-2"
                                    title={`Rimuovi ${sharer.nominativo} dalla classe documentale`}
                                    aria-label={`Rimuovi ${sharer.nominativo}`}
                                  >
                                    <Trash2Icon size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8">
                    {/* Unified Empty State Icon */}
                    <svg
                      width="40"
                      height="40"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="text-muted-foreground"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 15c.667-1 2-3 4-3s3.333 2 4 3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="9" cy="10" r="1" fill="currentColor" />
                      <circle cx="15" cy="10" r="1" fill="currentColor" />
                    </svg>
                    <p className="text-muted-foreground text-center text-sm">
                      Nessun utente associato a questa classe documentale.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* --- Assign Sharer Section --- */}
            <div className="bg-background w-full rounded-xl border p-6 shadow-sm">
              {/* Card Title and Description */}
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-primary"
                  >
                    <path
                      d="M12 4v16m8-8H4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {documentClass.sharers && documentClass.sharers.length > 0
                    ? "Aggiungi Sharer"
                    : "Assegna Sharer"}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Seleziona un utente da associare a questa classe documentale.
                  Gli utenti già associati non sono mostrati.
                </p>
              </div>
              {/* Assign Sharer Form */}
              <form
                className="bg-muted/30 border-muted flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAssignSharer();
                }}
                aria-label="Assegna uno sharer a questa classe documentale"
              >
                <div className="min-w-[220px] flex-1">
                  <Label
                    htmlFor={sharerSelectId}
                    className="mb-1 block text-sm"
                  >
                    Seleziona Sharer
                  </Label>
                  <Popover
                    open={isSharerSelectOpen}
                    onOpenChange={setIsSharerSelectOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id={sharerSelectId}
                        variant="outline"
                        role="combobox"
                        aria-expanded={isSharerSelectOpen}
                        className={cn(
                          "focus-visible:outline-primary h-11 w-full justify-between px-3 font-normal outline-offset-0 transition-all outline-none focus-visible:outline-2",
                          !selectedSharerId && "text-muted-foreground",
                        )}
                        tabIndex={0}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {selectedSharerId
                            ? (() => {
                                const sharer = availableSharers.find(
                                  (s) => s.id === selectedSharerId,
                                );
                                return sharer ? (
                                  <>
                                    <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                                      {sharer.nominativo
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </span>
                                    <span>
                                      {sharer.nominativo} ({sharer.email})
                                    </span>
                                  </>
                                ) : null;
                              })()
                            : "Seleziona uno sharer..."}
                        </span>
                        <ChevronDownIcon
                          size={18}
                          className="text-muted-foreground/80 ml-2 shrink-0"
                          aria-hidden="true"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      // Only the list should scroll, not the entire popover
                      className="border-input z-50 w-full max-w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Cerca sharer..." />
                        {/* Make the dropdown scrollable with the mouse wheel when there are many sharers */}
                        <CommandList
                          className="pointer-events-auto max-h-60 overflow-y-auto"
                          // Fallback: force scroll on wheel event for mouse wheel compatibility
                          onWheel={(e) => {
                            e.currentTarget.scrollTop += e.deltaY;
                          }}
                        >
                          <CommandEmpty>Nessun sharer trovato.</CommandEmpty>
                          <CommandGroup>
                            {availableSharers.map((sharer) => (
                              <CommandItem
                                key={sharer.id}
                                value={`${sharer.nominativo} ${sharer.email}`}
                                onSelect={() => {
                                  setSelectedSharerId(
                                    sharer.id === selectedSharerId
                                      ? ""
                                      : sharer.id,
                                  );
                                  setIsSharerSelectOpen(false);
                                }}
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                  {sharer.nominativo
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </span>
                                <span>{sharer.nominativo}</span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {sharer.email}
                                </span>
                                {selectedSharerId === sharer.id && (
                                  <CheckIcon
                                    size={16}
                                    className="text-primary ml-auto"
                                  />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="submit"
                  disabled={!selectedSharerId}
                  size="lg"
                  className="mt-2 h-11 w-full text-white md:mt-0 md:ml-4 md:w-auto"
                >
                  {isLoadingSharers ? (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                  ) : null}
                  {documentClass.sharers && documentClass.sharers.length > 0
                    ? "Aggiungi Sharer"
                    : "Assegna Sharer"}
                </Button>
              </form>
              {/* No sharers available state */}
              {!isLoadingSharers && availableSharers.length === 0 && (
                <div className="text-muted-foreground mt-6 flex flex-col items-center gap-2 text-sm">
                  <svg
                    width="28"
                    height="28"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 15c.667-1 2-3 4-3s3.333 2 4 3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="9" cy="10" r="1" fill="currentColor" />
                    <circle cx="15" cy="10" r="1" fill="currentColor" />
                  </svg>
                  Nessun sharer disponibile per l&apos;assegnazione.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-6 p-6">
            {/* Card for advanced info */}
            <div className="bg-background rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                {/* Icon for advanced info */}
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <path
                    d="M12 4v16m8-8H4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h2 className="text-lg font-semibold">Informazioni avanzate</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Created at info */}
                <div className="flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-muted-foreground"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 8h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Creato il
                    </p>
                    <p className="text-sm">
                      {formatDate(documentClass.created_at)}
                    </p>
                  </div>
                </div>
                {/* Updated at info */}
                <div className="flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-muted-foreground"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 16h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium">
                      Ultima modifica il
                    </p>
                    <p className="text-sm">
                      {formatDate(documentClass.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
      {/* Delete Confirmation Dialog */}
      {sharerToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onSuccess={closeDeleteDialog}
          fieldId={0} // Not used for sharer deletion
          optionId={0} // Not used for sharer deletion
          onConfirm={confirmRemoveSharer}
          isField={false}
          customMessage={`Sei sicuro di voler rimuovere ${sharerToDelete.nominativo} da questa classe documentale? L'utente non avrà più accesso ai documenti di questa classe.`}
        />
      )}
    </div>
  );
}
