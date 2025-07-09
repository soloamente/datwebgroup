"use client";

import * as React from "react";
import { type DocumentClassField } from "@/app/api/api"; // Assuming DocumentClassField is exported from here
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { GripVerticalIcon, Edit, Save, X } from "lucide-react";
import { Drawer } from "vaul";
import { type Tag, TagInput } from "emblor";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { docClassService } from "@/app/api/api";
import { AxiosError } from "axios";

// Add type for enum option
interface EnumOption {
  id: number;
  value: string;
  label: string;
}

// Fix: Replace DraggableRowFields with StaticRowFields and ensure alignment
function StaticRowFields({
  row,
  onRowClick,
}: {
  row: Row<DocumentClassField>;
  onRowClick?: (field: DocumentClassField) => void;
}) {
  return (
    <TableRow
      className="hover:bg-muted/30 border-border/50 cursor-pointer border-b transition-all duration-200"
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className="px-4 py-4 text-left align-middle"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Column Definitions for DocumentClassField
const fieldColumns: ColumnDef<DocumentClassField>[] = [
  {
    accessorKey: "label",
    header: () => <div className="text-sm font-semibold">Etichetta</div>,
    cell: ({ row }) => (
      <div className="text-sm font-medium">{row.getValue("label")}</div>
    ),
  },
  {
    accessorKey: "nome",
    header: () => <div className="text-sm font-semibold">Nome Tecnico</div>,
    cell: ({ row }) => {
      const value = row.getValue("nome");
      return (
        <div className="text-muted-foreground font-mono text-sm">
          {typeof value === "string" ? value : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "tipo",
    header: () => <div className="text-sm font-semibold">Tipo</div>,
    cell: ({ row }) => {
      const value = row.getValue("tipo");
      return (
        <div className="bg-muted inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
          {typeof value === "string" ? value : ""}
        </div>
      );
    },
  },
  {
    id: "enumOptions",
    header: () => <div className="text-sm font-semibold">Opzioni Enum</div>,
    cell: ({ row }) => {
      const campo = row.original;
      if (campo.tipo === "enum" && campo.options && campo.options.length > 0) {
        return (
          <div className="text-muted-foreground max-w-[200px] truncate text-xs">
            {campo.options.map((opt) => opt.label).join(", ")}
          </div>
        );
      }
      return <span className="text-muted-foreground text-xs">-</span>;
    },
  },
  {
    accessorKey: "obbligatorio",
    header: () => (
      <div className="text-center text-sm font-semibold">Obbligatorio</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("obbligatorio") ? (
          <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Sì
          </div>
        ) : (
          <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            No
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "is_primary_key",
    header: () => (
      <div className="text-center text-sm font-semibold">Chiave Primaria</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("is_primary_key") ? (
          <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            Sì
          </div>
        ) : (
          <div className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            No
          </div>
        )}
      </div>
    ),
  },

  // sort_order can be displayed if needed, but dnd handles actual order
  // {
  //   accessorKey: 'sort_order',
  //   header: 'Order',
  //   cell: ({ row }) => row.getValue('sort_order'),
  // },
];

// Field Edit Drawer Component
function FieldEditDrawer({
  field,
  isOpen,
  onClose,
  onSave,
  onDelete,
  documentClassId,
}: {
  field: DocumentClassField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedField: DocumentClassField) => void;
  onDelete: (fieldId: number) => Promise<boolean>;
  documentClassId: number;
}) {
  const [editedField, setEditedField] =
    React.useState<DocumentClassField | null>(null);
  const [enumOptions, setEnumOptions] = React.useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
    null,
  );
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [fieldToDelete, setFieldToDelete] = React.useState<{
    fieldId: number;
    optionId: number;
  } | null>(null);
  const [deleteFieldDialogOpen, setDeleteFieldDialogOpen] =
    React.useState(false);
  const enumOptionsId = React.useId();

  // Add debug logging
  React.useEffect(() => {
    console.log("tagToDelete state changed:", tagToDelete);
  }, [tagToDelete]);

  React.useEffect(() => {
    if (field) {
      setEditedField({ ...field });
      // Convert enum options to Tag array for editing
      if (field.tipo === "enum" && field.options) {
        setEnumOptions(
          field.options.map((opt, index) => ({
            id: opt.id?.toString() ?? index.toString(), // Use real ID if available, otherwise fallback to index
            text: opt.label,
          })),
        );
      } else {
        setEnumOptions([]);
      }
    }
  }, [field]);

  const handleSave = async () => {
    if (!editedField) return;

    try {
      // Prepare the data for the API call according to UpdateDocumentClassFieldRequest interface
      const updateData = {
        label: editedField.label,
        required: editedField.obbligatorio,
        is_primary: editedField.is_primary_key,
        sort_order: editedField.sort_order,
      };

      // Call the API to update the field
      const response = await docClassService.updateField(
        documentClassId,
        editedField.id,
        updateData,
      );

      // Show success message
      toast.success(response.message);

      // Update the local state with the response data
      const updatedField = { ...editedField };

      // Parse enum options if field type is enum (for local state consistency)
      if (updatedField.tipo === "enum" && enumOptions.length > 0) {
        const options = enumOptions.map((tag) => {
          const parsedId = parseInt(tag.id);
          return {
            id: !isNaN(parsedId) ? parsedId : undefined, // Only set ID if it's a valid number
            label: tag.text,
            value: tag.text.toLowerCase().replace(/\s+/g, "_"),
          };
        });
        updatedField.options = options;
      } else if (updatedField.tipo !== "enum") {
        updatedField.options = [];
      }

      // Call the parent callback with the updated field
      onSave(updatedField);
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update field:", error);

      // Handle different types of errors based on the API documentation
      let errorMessage = "Errore durante l'aggiornamento del campo";

      if (error instanceof AxiosError && error.response) {
        // Handle Axios errors with response
        switch (error.response.status) {
          case 409:
            errorMessage =
              (error.response.data as { message?: string })?.message ??
              "Conflitto: operazione non consentita";
            break;
          case 404:
            errorMessage = "Campo o classe documentale non trovata";
            break;
          case 422:
            errorMessage = "Dati non validi";
            break;
          default:
            errorMessage =
              (error.response.data as { message?: string })?.message ??
              errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleDeleteField = async () => {
    if (!editedField) return false;
    return onDelete(editedField.id);
  };

  const handleDeleteOption = React.useCallback(async () => {
    if (!fieldToDelete || !tagToDelete) {
      console.log("Missing fieldToDelete or tagToDelete:", {
        fieldToDelete,
        tagToDelete,
      });
      return false;
    }

    try {
      console.log("Making delete request for:", {
        fieldId: fieldToDelete.fieldId,
        optionId: fieldToDelete.optionId,
      });
      const response = await docClassService.deleteEnumOption(
        fieldToDelete.fieldId,
        fieldToDelete.optionId,
      );
      console.log("Delete option response:", response);

      if (response.requires_confirmation) {
        console.log("Confirmation required, making second request");
        // If confirmation is required, show the confirmation dialog again with force=true
        const confirmResponse = await docClassService.deleteEnumOption(
          fieldToDelete.fieldId,
          fieldToDelete.optionId,
          true,
        );
        console.log("Confirmation response:", confirmResponse);
        toast.success(confirmResponse.message);
      } else {
        console.log("No confirmation required");
        toast.success(response.message);
      }

      // Update the fields data to remove the deleted option
      setEditedField((prev) => {
        if (!prev?.options) return prev;
        return {
          ...prev,
          options: prev.options.filter((opt, index) => {
            // If options have real IDs, filter by ID, otherwise filter by index
            if (opt.id !== undefined) {
              return opt.id !== fieldToDelete.optionId;
            } else {
              return index !== fieldToDelete.optionId;
            }
          }),
        };
      });

      // Note: enumOptions has already been updated by TagInput, so no need to filter again

      // Clear all states
      setFieldToDelete(null);
      setTagToDelete(null);
      setDeleteDialogOpen(false);

      console.log("Deletion completed successfully");
      return true;
    } catch (error: unknown) {
      console.error("Failed to delete enum option:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossibile eliminare l'opzione";
      toast.error(errorMessage);
      // Don't close the dialog on error
      return false;
    }
  }, [fieldToDelete, tagToDelete]);

  if (!editedField) return null;

  return (
    <>
      <Drawer.Root open={isOpen} onOpenChange={onClose} direction="right">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed top-4 right-4 bottom-4 z-50 flex w-[420px] outline-none"
            style={
              {
                "--initial-transform": "calc(100% + 16px)",
              } as React.CSSProperties
            }
          >
            <div className="bg-background border-border flex h-full w-full flex-col rounded-xl border shadow-2xl">
              {/* Header */}
              <div className="border-border flex flex-shrink-0 items-center justify-between border-b p-6">
                <Drawer.Title className="text-lg font-semibold">
                  Modifica Campo
                </Drawer.Title>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-muted"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Content - Scrollable Area */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Informazioni Base
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor="label"
                            className="text-sm font-medium"
                          >
                            Etichetta
                          </Label>
                          <Input
                            id="label"
                            value={editedField.label}
                            onChange={(e) =>
                              setEditedField((prev) =>
                                prev
                                  ? { ...prev, label: e.target.value }
                                  : null,
                              )
                            }
                            placeholder="Inserisci l'etichetta del campo"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Field Type Section */}
                    <div className="space-y-4">
                      {/* <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Tipo Campo
                      </h3>

                      <div>
                        <Label htmlFor="tipo" className="text-sm font-medium">
                          Tipo di Dato
                        </Label>
                        <Select
                          defaultValue={editedField.tipo}
                          onValueChange={(value) =>
                            setEditedField((prev) =>
                              prev ? { ...prev, tipo: value } : null,
                            )
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleziona il tipo di campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Testo</SelectItem>
                            <SelectItem value="number">Numero</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                            <SelectItem value="boolean">Booleano</SelectItem>
                            <SelectItem value="enum">Enum</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}

                      {editedField.tipo === "enum" && (
                        <div>
                          <Label
                            htmlFor={enumOptionsId}
                            className="text-sm font-medium"
                          >
                            Opzioni Enum
                          </Label>
                          <TagInput
                            id={enumOptionsId}
                            tags={enumOptions}
                            onTagAdd={async (tag) => {
                              try {
                                const response =
                                  await docClassService.addEnumOption(
                                    editedField?.id ?? 0,
                                    tag,
                                  );

                                // Add the new option to the editedField with the real ID from API
                                setEditedField((prev) => {
                                  if (!prev) return prev;
                                  const newOption = {
                                    id: response.data.id,
                                    label: response.data.label,
                                    value: response.data.value,
                                  };
                                  return {
                                    ...prev,
                                    options: [
                                      ...(prev.options ?? []),
                                      newOption,
                                    ],
                                  };
                                });

                                // Update the tag with the real ID from the API
                                setEnumOptions((prev) => [
                                  ...prev.filter((t) => t.text !== tag),
                                  {
                                    id: response.data.id.toString(),
                                    text: response.data.label,
                                  },
                                ]);

                                toast.success(response.message);
                              } catch (error) {
                                console.error(
                                  "Failed to add enum option:",
                                  error,
                                );
                                toast.error(
                                  "Errore durante l'aggiunta dell'opzione",
                                );
                              }
                            }}
                            onTagRemove={async (tagId: string) => {
                              // Find the tag to be removed by text content
                              const tagToRemove = enumOptions.find(
                                (tag) => tag.text === tagId,
                              );

                              if (!tagToRemove) {
                                return;
                              }

                              // Find the option from the original field options
                              const tagIndex = parseInt(tagToRemove.id);
                              let optionId: number | undefined;
                              let option:
                                | { id?: number; value: string; label: string }
                                | undefined;

                              // First try to find by real ID if available
                              if (!isNaN(tagIndex) && editedField?.options) {
                                // Check if the tag ID corresponds to a real option ID
                                option = editedField.options.find(
                                  (opt) => opt.id === tagIndex,
                                );

                                if (option?.id !== undefined) {
                                  optionId = option.id;
                                } else {
                                  // Fallback to index-based approach
                                  option = editedField.options[tagIndex];
                                  if (option) {
                                    // Use index as option ID for APIs that expect it
                                    optionId = tagIndex;
                                  }
                                }
                              }

                              if (
                                option &&
                                editedField?.id &&
                                optionId !== undefined
                              ) {
                                // Set up the confirmation dialog - tag is already removed from UI by TagInput
                                setTagToDelete(tagToRemove);
                                setFieldToDelete({
                                  fieldId: editedField.id,
                                  optionId,
                                });
                                setDeleteDialogOpen(true);
                              } else {
                                toast.error("Opzione non trovata");
                                // Restore the tag if we can't process the deletion
                                setEnumOptions((prev) => [
                                  ...prev,
                                  tagToRemove,
                                ]);
                              }
                            }}
                            setTags={(newTags) => {
                              setEnumOptions(newTags);
                            }}
                            placeholder="Aggiungi un'opzione"
                            styleClasses={{
                              tagList: {
                                container: "gap-1",
                              },
                              input:
                                "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                              tag: {
                                body: "relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
                                closeButton:
                                  "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
                              },
                            }}
                            activeTagIndex={activeTagIndex}
                            setActiveTagIndex={setActiveTagIndex}
                            inlineTags={false}
                            inputFieldPosition="top"
                            className="mt-1"
                          />
                          <p className="text-muted-foreground mt-1 text-xs">
                            Aggiungi le opzioni per questo campo enum premendo
                            Invio
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Field Properties Section */}
                    <div className="space-y-4">
                      <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Proprietà
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-4">
                          <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                            <Checkbox
                              id="obbligatorio"
                              checked={editedField.obbligatorio}
                              onCheckedChange={(checked) =>
                                setEditedField((prev) =>
                                  prev
                                    ? { ...prev, obbligatorio: !!checked }
                                    : null,
                                )
                              }
                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                            />
                            <div className="grid gap-1.5 font-normal">
                              <p className="text-sm leading-none font-medium">
                                Campo Obbligatorio
                              </p>
                              <p className="text-muted-foreground text-sm">
                                Questo campo deve essere compilato durante la
                                creazione dei record
                              </p>
                            </div>
                          </Label>

                          <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                            <Checkbox
                              id="is_primary_key"
                              checked={editedField.is_primary_key}
                              onCheckedChange={(checked) =>
                                setEditedField((prev) =>
                                  prev
                                    ? { ...prev, is_primary_key: !!checked }
                                    : null,
                                )
                              }
                              className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                            />
                            <div className="grid gap-1.5 font-normal">
                              <p className="text-sm leading-none font-medium">
                                Chiave Primaria
                              </p>
                              <p className="text-muted-foreground text-sm">
                                Usa questo campo come identificatore univoco
                              </p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Section */}
                    {editedField.sort_order !== undefined && (
                      <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                          Avanzate
                        </h3>

                        <div>
                          <Label
                            htmlFor="sort_order"
                            className="text-sm font-medium"
                          >
                            Ordine di Ordinamento
                          </Label>
                          <Input
                            id="sort_order"
                            type="number"
                            value={editedField.sort_order}
                            onChange={(e) =>
                              setEditedField((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      sort_order: parseInt(e.target.value) || 0,
                                    }
                                  : null,
                              )
                            }
                            placeholder="Inserisci l'ordine di ordinamento"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-border bg-muted/20 flex flex-shrink-0 gap-3 border-t p-6">
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-foreground flex-1 rounded-xl"
                >
                  Salva
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl"
                >
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteFieldDialogOpen(true)}
                  className="flex-1 rounded-xl"
                >
                  Elimina
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          // If user cancels, restore the tag back to the UI
          if (tagToDelete) {
            setEnumOptions((prev) => [...prev, tagToDelete]);
          }
          setDeleteDialogOpen(false);
          setTagToDelete(null);
          setFieldToDelete(null);
        }}
        onSuccess={() => {
          // On successful deletion, just clean up states without restoring the tag
          setDeleteDialogOpen(false);
          setTagToDelete(null);
          setFieldToDelete(null);
        }}
        fieldId={fieldToDelete?.fieldId ?? 0}
        optionId={fieldToDelete?.optionId ?? 0}
        onConfirm={handleDeleteOption}
      />

      <DeleteConfirmationDialog
        isOpen={deleteFieldDialogOpen}
        onClose={() => setDeleteFieldDialogOpen(false)}
        fieldId={editedField?.id ?? 0}
        optionId={0}
        onConfirm={handleDeleteField}
        isField={true}
      />
    </>
  );
}

// Main Sortable Table Component for Fields
interface FieldsSortableTableProps {
  initialFields: DocumentClassField[];
  onOrderChange?: (updatedFields: DocumentClassField[]) => void;
  onFieldUpdate?: (updatedField: DocumentClassField) => void;
  maxHeight?: string;
  documentClassId: number;
}

export function FieldsSortableTable({
  initialFields,
  onOrderChange,
  onFieldUpdate,
  maxHeight = "600px",
  documentClassId,
}: FieldsSortableTableProps) {
  const [fieldsData, setFieldsData] = React.useState<DocumentClassField[]>(
    () => initialFields,
  );
  const [editingField, setEditingField] =
    React.useState<DocumentClassField | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [fieldToDelete, setFieldToDelete] = React.useState<{
    fieldId: number;
    optionId: number;
  } | null>(null);
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null);
  const sortableId = React.useId();

  const handleDeleteOption = React.useCallback(async () => {
    if (!fieldToDelete || !tagToDelete) {
      console.log("Missing fieldToDelete or tagToDelete:", {
        fieldToDelete,
        tagToDelete,
      });
      return false;
    }

    try {
      console.log("Making delete request for:", {
        fieldId: fieldToDelete.fieldId,
        optionId: fieldToDelete.optionId,
      });
      const response = await docClassService.deleteEnumOption(
        fieldToDelete.fieldId,
        fieldToDelete.optionId,
      );
      console.log("Delete option response:", response);

      if (response.requires_confirmation) {
        console.log("Confirmation required, making second request");
        // If confirmation is required, show the confirmation dialog again with force=true
        const confirmResponse = await docClassService.deleteEnumOption(
          fieldToDelete.fieldId,
          fieldToDelete.optionId,
          true,
        );
        console.log("Confirmation response:", confirmResponse);
        toast.success(confirmResponse.message);
      } else {
        console.log("No confirmation required");
        toast.success(response.message);
      }

      // Update the fields data to remove the deleted option
      setFieldsData((prevFields) =>
        prevFields.map((field) => {
          if (field.id === fieldToDelete.fieldId && field.options) {
            return {
              ...field,
              options: field.options.filter((opt, index) => {
                // If options have real IDs, filter by ID, otherwise filter by index
                if (opt.id !== undefined) {
                  return opt.id !== fieldToDelete.optionId;
                } else {
                  return index !== fieldToDelete.optionId;
                }
              }),
            };
          }
          return field;
        }),
      );

      // Clear all states
      setFieldToDelete(null);
      setTagToDelete(null);
      setDeleteDialogOpen(false);

      console.log("Deletion completed successfully");
      return true;
    } catch (error: unknown) {
      console.error("Failed to delete enum option:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossibile eliminare l'opzione";
      toast.error(errorMessage);
      // Don't close the dialog on error
      return false;
    }
  }, [fieldToDelete, tagToDelete]);

  React.useEffect(() => {
    setFieldsData(initialFields); // Sync with prop changes if necessary
  }, [initialFields]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {}),
  );

  const fieldIds = React.useMemo<UniqueIdentifier[]>(
    () => fieldsData.map(({ id }) => id),
    [fieldsData],
  );

  const handleEditField = (field: DocumentClassField) => {
    setEditingField(field);
    setIsDrawerOpen(true);
  };

  const handleSaveField = (updatedField: DocumentClassField) => {
    setFieldsData((prevFields) =>
      prevFields.map((field) =>
        field.id === updatedField.id ? updatedField : field,
      ),
    );

    if (onFieldUpdate) {
      onFieldUpdate(updatedField);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      const response = await docClassService.deleteField(
        documentClassId,
        fieldId,
      );

      if (response.requires_confirmation) {
        // If confirmation is required, show the confirmation dialog again with force=true
        const confirmResponse = await docClassService.deleteField(
          documentClassId,
          fieldId,
          true,
        );
        toast.success(confirmResponse.message);
      } else {
        toast.success(response.message);
      }

      // Update the fields data after successful deletion
      setFieldsData((prevFields) =>
        prevFields.filter((field) => field.id !== fieldId),
      );
      handleCloseDrawer();
      return true;
    } catch (error: unknown) {
      console.error("Failed to delete field:", error);
      let errorMessage =
        error instanceof Error
          ? error.message
          : "Impossibile eliminare il campo";
      // Custom error message for primary key constraint (409)
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status === 409
      ) {
        errorMessage = "Impossibile eliminare un campo con chiave primaria";
      }
      toast.error(errorMessage);
      return false;
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingField(null);
  };

  const handleOpenDeleteDialog = (fieldId: number, optionId: number) => {
    setFieldToDelete({ fieldId, optionId });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setFieldToDelete(null);
  };

  const table = useReactTable({
    data: fieldsData,
    columns: fieldColumns,
    getRowId: (row) => row.id.toString(), // DocumentClassField must have a unique id
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit: handleEditField,
    },
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    filterFns: {
      activeStatus: (row, columnId, filterValue) => true,
      dateRange: (row, columnId, filterValue) => true,
      documentClassDateRange: (row, columnId, filterValue) => true,
    },
    // No sorting/filtering/pagination from tanstack table itself for this simple version
  });

  return (
    <div className="w-full">
      <div
        className="border-border bg-background overflow-y-auto rounded-lg border"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border bg-muted/30 border-b"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="px-4 py-4 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={fieldColumns.length}
                  className="text-muted-foreground py-12 text-center"
                >
                  Nessun campo configurato. Clicca su una riga per modificare le
                  proprietà del campo.
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <StaticRowFields
                    key={row.id}
                    row={row}
                    onRowClick={handleEditField}
                  />
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <FieldEditDrawer
        field={editingField}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
        documentClassId={documentClassId}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setFieldToDelete(null);
        }}
        fieldId={fieldToDelete?.fieldId ?? 0}
        optionId={fieldToDelete?.optionId ?? 0}
        onConfirm={handleDeleteOption}
      />
    </div>
  );
}
