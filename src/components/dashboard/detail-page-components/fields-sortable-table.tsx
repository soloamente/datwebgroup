"use client";

import * as React from "react";
import { type DocumentClassField } from "@/app/api/api"; // Assuming DocumentClassField is exported from here
import {
  DndContext,
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

// Drag Handle Component
function DragHandleFields({ id }: { id: number | string }) {
  // id can be string or number
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      ref={setNodeRef} // dnd-kit useSortable provides setNodeRef for the draggable element
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:bg-muted/50 hover:text-foreground size-8 cursor-grab transition-colors duration-200 active:cursor-grabbing"
      // isDragging can be used for styling if needed: data-dragging={isDragging}
    >
      <GripVerticalIcon className="size-4" />
      <span className="sr-only">Trascina per riordinare il campo</span>
    </Button>
  );
}

// Column Definitions for DocumentClassField
const fieldColumns: ColumnDef<DocumentClassField>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandleFields id={row.original.id} />,
    size: 50,
  },
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

// Draggable Row Component for Fields
function DraggableRowFields({
  row,
  onRowClick,
}: {
  row: Row<DocumentClassField>;
  onRowClick?: (field: DocumentClassField) => void;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id, // Ensure DocumentClassField has a unique `id`
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"} // TanStack Table selection state
      data-dragging={isDragging} // dnd-kit dragging state
      className="hover:bg-muted/30 border-border/50 relative cursor-pointer border-b transition-all duration-200 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[dragging=true]:shadow-lg"
      onClick={() => onRowClick?.(row.original)}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className="py-4"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Field Edit Drawer Component
function FieldEditDrawer({
  field,
  isOpen,
  onClose,
  onSave,
}: {
  field: DocumentClassField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedField: DocumentClassField) => void;
}) {
  const [editedField, setEditedField] =
    React.useState<DocumentClassField | null>(null);
  const [enumOptions, setEnumOptions] = React.useState<string>("");

  React.useEffect(() => {
    if (field) {
      setEditedField({ ...field });
      // Convert enum options to string for editing
      if (field.tipo === "enum" && field.options) {
        setEnumOptions(field.options.map((opt) => opt.label).join(", "));
      } else {
        setEnumOptions("");
      }
    }
  }, [field]);

  const handleSave = () => {
    if (!editedField) return;

    const updatedField = { ...editedField };

    // Parse enum options if field type is enum
    if (updatedField.tipo === "enum" && enumOptions.trim()) {
      const options = enumOptions.split(",").map((opt, index) => ({
        id: index + 1,
        label: opt.trim(),
        value: opt.trim().toLowerCase().replace(/\s+/g, "_"),
      }));
      updatedField.options = options;
    } else if (updatedField.tipo !== "enum") {
      updatedField.options = [];
    }

    onSave(updatedField);
    onClose();
  };

  if (!editedField) return null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed top-4 right-4 bottom-4 z-10 flex w-[420px] outline-none"
          style={
            {
              "--initial-transform": "calc(100% + 16px)",
            } as React.CSSProperties
          }
        >
          <div className="bg-background border-border flex h-full w-full grow flex-col rounded-xl border shadow-2xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b p-6">
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                    Informazioni Base
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="label" className="text-sm font-medium">
                        Etichetta
                      </Label>
                      <Input
                        id="label"
                        value={editedField.label}
                        onChange={(e) =>
                          setEditedField((prev) =>
                            prev ? { ...prev, label: e.target.value } : null,
                          )
                        }
                        placeholder="Inserisci l'etichetta del campo"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nome" className="text-sm font-medium">
                        Nome Tecnico
                      </Label>
                      <Input
                        id="nome"
                        value={editedField.nome}
                        onChange={(e) =>
                          setEditedField((prev) =>
                            prev ? { ...prev, nome: e.target.value } : null,
                          )
                        }
                        placeholder="Inserisci il nome tecnico"
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Field Type Section */}
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
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
                  </div>

                  {editedField.tipo === "enum" && (
                    <div>
                      <Label
                        htmlFor="enumOptions"
                        className="text-sm font-medium"
                      >
                        Opzioni Enum
                      </Label>
                      <Input
                        id="enumOptions"
                        value={enumOptions}
                        onChange={(e) => setEnumOptions(e.target.value)}
                        placeholder="Opzione 1, Opzione 2, Opzione 3"
                        className="mt-1"
                      />
                      <p className="text-muted-foreground mt-1 text-xs">
                        Separa le opzioni multiple con virgole
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

            {/* Footer */}
            <div className="border-border bg-muted/20 flex gap-3 border-t p-6">
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
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Main Sortable Table Component for Fields
interface FieldsSortableTableProps {
  initialFields: DocumentClassField[];
  onOrderChange?: (updatedFields: DocumentClassField[]) => void; // Optional: Callback for when order changes
  onFieldUpdate?: (updatedField: DocumentClassField) => void; // Optional: Callback for when field is updated
}

export function FieldsSortableTable({
  initialFields,
  onOrderChange,
  onFieldUpdate,
}: FieldsSortableTableProps) {
  const [fieldsData, setFieldsData] = React.useState<DocumentClassField[]>(
    () => initialFields,
  );
  const [editingField, setEditingField] =
    React.useState<DocumentClassField | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const sortableId = React.useId();

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

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingField(null);
  };

  const table = useReactTable({
    data: fieldsData,
    columns: fieldColumns,
    getRowId: (row) => row.id.toString(), // DocumentClassField must have a unique id
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit: handleEditField,
    },
    filterFns: {
      activeStatus: (row, columnId, filterValue) => true,
      dateRange: (row, columnId, filterValue) => true,
      documentClassDateRange: (row, columnId, filterValue) => true,
    },
    // No sorting/filtering/pagination from tanstack table itself for this simple version
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setFieldsData((currentFields) => {
        const oldIndex = fieldIds.indexOf(active.id);
        const newIndex = fieldIds.indexOf(over.id);
        const newOrder = arrayMove(currentFields, oldIndex, newIndex);
        if (onOrderChange) {
          onOrderChange(
            newOrder.map((field, index) => ({
              ...field,
              sort_order: index + 1,
            })),
          );
        }
        return newOrder;
      });
    }
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
        id={sortableId}
      >
        <SortableContext
          items={fieldIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="border-border bg-background overflow-hidden rounded-lg border">
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
                      Nessun campo configurato. Clicca su una riga per
                      modificare le proprietà del campo.
                    </TableCell>
                  </TableRow>
                ) : (
                  table
                    .getRowModel()
                    .rows.map((row) => (
                      <DraggableRowFields
                        key={row.id}
                        row={row}
                        onRowClick={handleEditField}
                      />
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>

      <FieldEditDrawer
        field={editingField}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveField}
      />
    </div>
  );
}
