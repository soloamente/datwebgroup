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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
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

  return (
    <div className="w-full p-6">
      {/* Simplified Header */}
      <div className="mb-8">
        <h1 className="text-3xl">{documentClass.nome}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {documentClass.descrizione}
        </p>
      </div>

      {/* Minimal Tabs */}
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-full">
          <TabsTrigger value="basic-info">Generale</TabsTrigger>
          <TabsTrigger value="fields">
            Campi ({documentClass.campi.length})
          </TabsTrigger>
          <TabsTrigger value="sharers">
            Sharers ({documentClass.sharers?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="audit">Avanzate</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="id" className="text-sm">
                  ID
                </Label>
                <Input
                  id="id"
                  type="number"
                  defaultValue={documentClass.id}
                  className="bg-muted/50"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="nome" className="text-sm">
                  Nome
                </Label>
                <Input
                  id="nome"
                  defaultValue={documentClass.nome}
                  className="bg-background"
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="descrizione" className="text-sm font-medium">
                  Descrizione
                </Label>
                <Textarea
                  id="descrizione"
                  defaultValue={documentClass.descrizione}
                  className="bg-background max-w-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Campi</h2>

            {/* Simplified Add Field Form */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-sm font-medium">Aggiungi Campo</h3>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        data_type: e.target.value as
                          | "string"
                          | "boolean"
                          | "integer"
                          | "decimal"
                          | "date"
                          | "datetime"
                          | "enum",
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

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_field_required"
                      checked={newField.required}
                      onCheckedChange={(checked) =>
                        setNewField((prev) => ({
                          ...prev,
                          required: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="new_field_required" className="text-xs">
                      Obbligatorio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new_field_is_primary_key"
                      checked={newField.is_primary_key}
                      onCheckedChange={(checked) =>
                        setNewField((prev) => ({
                          ...prev,
                          is_primary_key: !!checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="new_field_is_primary_key"
                      className="text-xs"
                    >
                      Chiave Primaria
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    void handleAddField();
                  }}
                  type="submit"
                  size="sm"
                  className="h-8 self-end"
                >
                  Aggiungi
                </Button>
              </form>
            </div>

            {documentClass.campi && documentClass.campi.length > 0 ? (
              <FieldsSortableTable
                initialFields={documentClass.campi}
                documentClassId={documentClass.id}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                Nessun campo definito per questa classe documentale.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sharers" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Utenti associati</h2>

            {/* Current Sharers Display */}
            {documentClass.sharers && documentClass.sharers.length > 0 ? (
              <div className="bg-background overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-9 py-2">Nome</TableHead>
                      <TableHead className="h-9 py-2">Email</TableHead>
                      <TableHead className="h-9 w-20 py-2">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentClass.sharers.map((sharer) => (
                      <TableRow key={sharer.id}>
                        <TableCell className="py-2 font-medium">
                          {sharer.nominativo}
                        </TableCell>
                        <TableCell className="py-2">{sharer.email}</TableCell>
                        <TableCell className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSharer(sharer.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            title={`Rimuovi ${sharer.nominativo} dalla classe documentale`}
                          >
                            <Trash2Icon size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Nessun utente associato a questa classe documentale.
                </p>
              </div>
            )}

            {/* Assign New Sharer Form */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-sm font-medium">
                {documentClass.sharers && documentClass.sharers.length > 0
                  ? "Aggiungi Sharer"
                  : "Assegna Sharer"}
              </h3>

              <div className="space-y-4">
                {isLoadingSharers ? (
                  <p className="text-muted-foreground text-sm">
                    Caricamento sharers...
                  </p>
                ) : availableSharers.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={sharerSelectId} className="text-sm">
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
                            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                          >
                            <span
                              className={cn(
                                "truncate",
                                !selectedSharerId && "text-muted-foreground",
                              )}
                            >
                              {selectedSharerId
                                ? availableSharers.find(
                                    (sharer) => sharer.id === selectedSharerId,
                                  )?.nominativo +
                                  " (" +
                                  availableSharers.find(
                                    (sharer) => sharer.id === selectedSharerId,
                                  )?.email +
                                  ")"
                                : "Seleziona uno sharer..."}
                            </span>
                            <ChevronDownIcon
                              size={16}
                              className="text-muted-foreground/80 shrink-0"
                              aria-hidden="true"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Cerca sharer..." />
                            <CommandList>
                              <CommandEmpty>
                                Nessun sharer trovato.
                              </CommandEmpty>
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
                                  >
                                    {sharer.nominativo} ({sharer.email})
                                    {selectedSharerId === sharer.id && (
                                      <CheckIcon
                                        size={16}
                                        className="ml-auto"
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
                      onClick={handleAssignSharer}
                      disabled={!selectedSharerId}
                      size="sm"
                    >
                      {documentClass.sharers && documentClass.sharers.length > 0
                        ? "Aggiungi Sharer"
                        : "Assegna Sharer"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nessun sharer disponibile per l&apos;assegnazione.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Informazioni avanzate</h2>
            <div className="grid gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Creato il
                </p>
                <p className="text-sm">
                  {formatDate(documentClass.created_at)}
                </p>
              </div>
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
        </TabsContent>
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
