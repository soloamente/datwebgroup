"use client";

import {
  type DocumentClassDetails,
  type SharedDocument,
  type ViewerInfo,
} from "@/app/api/api";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedUniqueValues,
  type FilterFn,
} from "@tanstack/react-table";
import { useRouter, useParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiSearch2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiFilter3Line,
  RiMoreLine,
  RiEyeLine,
  RiFileTextLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react";
import { AvatarGroup } from "@/components/animate-ui/components/avatar-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CloseIcon from "@/components/icons/close";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

import {
  DateRangeFilter,
  type DateField,
} from "@/components/filters/date-range-filter";
import {
  ViewerFilter,
  type ViewerOption,
} from "@/components/filters/viewer-filter";
import { DynamicFieldFilter } from "@/components/filters/dynamic-field-filter";

import { formatDynamicDate } from "@/lib/date-format";
import { toast } from "sonner";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  useCallback,
  useTransition,
} from "react";
import { cn } from "@/lib/utils";

export interface AttachedFile {
  id: number;
  original_filename: string;
  mime_type: string;
  size: number;
}

// Document type within the documents array
export interface DocumentWithMetadata {
  id: number;
  metadata: Record<string, unknown>;
  files: AttachedFile[];
}

// Enriched document type for the table
export interface EnrichedDocument extends SharedDocument {
  batchId: number;
  title: string;
  status: string;
  sent_at: string;
  viewers: ViewerInfo[];
  documents: DocumentWithMetadata[];
}

// Augment TanStack Table types for custom filter functions
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FilterFns {
    viewer: FilterFn<EnrichedDocument>;
    boolean: FilterFn<EnrichedDocument>;
    enum: FilterFn<EnrichedDocument>;
    numberEquals: FilterFn<EnrichedDocument>;
    dateEquals: FilterFn<EnrichedDocument>;
    docDateRange: FilterFn<EnrichedDocument>;
    textContains: FilterFn<EnrichedDocument>;
  }
}

// Helper to get initials from a name
const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 0) return "?";
  if (names.length === 1) return names[0]?.charAt(0).toUpperCase() ?? "?";
  return (
    (names[0]?.charAt(0).toUpperCase() ?? "") +
    (names[names.length - 1]?.charAt(0).toUpperCase() ?? "")
  );
};

// Custom filter functions
const safeToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
};

const globalFilterFn: FilterFn<EnrichedDocument> = (
  row,
  _,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  if (!searchValue) return true;
  if (
    row.original.viewers.some(
      (v) =>
        v.nominativo.toLowerCase().includes(searchValue) ||
        v.email.toLowerCase().includes(searchValue) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        v.codice_fiscale?.toLowerCase().includes(searchValue) ||
        v.partita_iva?.toLowerCase().includes(searchValue),
    )
  )
    return true;
  // Search through metadata of all documents
  if (row.original.documents) {
    for (const doc of row.original.documents) {
      if (doc.metadata) {
        for (const key in doc.metadata) {
          if (
            safeToString(doc.metadata[key]).toLowerCase().includes(searchValue)
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const docDateRangeFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  value,
) => {
  const dateValue = row.getValue(columnId);
  const { from, to } = value as DayPickerDateRange;
  if (!from && !to) return true;
  if (!dateValue) return false;

  const cellDate = new Date(dateValue as string);
  if (from && to) {
    const adjustedEnd = new Date(to);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate >= from && cellDate <= adjustedEnd;
  }
  if (from) return cellDate >= from;
  if (to) {
    const adjustedEnd = new Date(to);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate <= adjustedEnd;
  }
  return true;
};

const viewerFilterFn: FilterFn<EnrichedDocument> = (
  row,
  _,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  return row.original.viewers.some((v) =>
    filterValue.includes(v.id.toString()),
  );
};

const booleanFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string[],
) => {
  // If no filter is selected or all three are selected, show all rows.
  if (!filterValue || filterValue.length === 0 || filterValue.length === 3) {
    return true;
  }

  const value = row.getValue(columnId);

  let normalizedValue: "true" | "false" | "null";

  if (value === true || value === 1) {
    normalizedValue = "true";
  } else if (value === false || value === 0) {
    normalizedValue = "false";
  } else if (value === null || value === undefined) {
    normalizedValue = "null";
  } else {
    // Should not be hit for a boolean field, but as a fallback, don't match.
    return false;
  }

  return filterValue.includes(normalizedValue);
};

const enumFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const value = row.getValue(columnId);
  if (filterValue.includes("null")) {
    if (value === null || value === undefined) return true;
  }
  return (
    typeof value === "string" &&
    filterValue.some((filterVal) => filterVal === value)
  );
};

const numberEqualsFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string,
) => {
  if (!filterValue) return true;
  const rowValue = row.getValue(columnId);
  if (rowValue === null || rowValue === undefined) return false;
  const filterNum = parseFloat(filterValue);
  if (isNaN(filterNum)) return true;

  const rowValueStr = safeToString(rowValue);
  if (rowValueStr === "") return false;

  if (typeof rowValue === "number") {
    return rowValue === filterNum;
  }
  if (typeof rowValue === "string") {
    const rowNum = parseFloat(rowValueStr);
    return !isNaN(rowNum) && rowNum === filterNum;
  }

  return false;
};

const textContainsFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string,
) => {
  if (!filterValue) return true;
  const rowValue = row.getValue(columnId);
  const rowValueStr = safeToString(rowValue);
  if (rowValueStr === "") return false;

  return rowValueStr.toLowerCase().includes(filterValue.toLowerCase());
};

const dateEqualsFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string,
) => {
  if (!filterValue) return true;
  const dateValue = row.getValue(columnId);
  if (!dateValue) return false;
  try {
    const cellDate = new Date(dateValue as string);
    const filterDate = new Date(filterValue);
    return cellDate.toDateString() === filterDate.toDateString();
  } catch (e) {
    return false;
  }
};

// Row Actions component
function RowActions({
  document,
  onViewDetails,
}: {
  document: EnrichedDocument;
  onViewDetails: () => void;
}) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const resetDialogStates = useCallback(() => {
    setShowDeleteDialog(false);
    setDropdownOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    startUpdateTransition(async () => {
      try {
        toast.success(`Documento "${document.id}" eliminato (simulato).`);
      } catch (error) {
        console.error("Failed to delete document:", error);
        toast.error("Impossibile eliminare il documento.");
      }
      resetDialogStates();
    });
  }, [document.id, resetDialogStates]);

  const handleDownload = useCallback(() => {
    if (document.files && document.files.length > 0) {
      toast.success(
        `Download di ${document.files.length} file avviato (simulato).`,
      );
    } else {
      toast.warning("Nessun file da scaricare per questo documento.");
    }
    resetDialogStates();
  }, [document.files, resetDialogStates]);

  const handleViewDetails = useCallback(() => {
    onViewDetails();
    resetDialogStates();
  }, [onViewDetails, resetDialogStates]);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <RiMoreLine size={16} />
            <span className="sr-only">Apri menu azioni</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleViewDetails}
              disabled={isUpdatePending}
            >
              <RiEyeLine size={16} className="mr-2" />
              Visualizza Dettagli
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownload}
              disabled={isUpdatePending}
            >
              <RiFileTextLine size={16} className="mr-2" />
              Scarica Allegati
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            disabled={isUpdatePending}
            className="text-destructive focus:text-destructive"
          >
            <RiDeleteBinLine size={16} className="mr-2" />
            Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <div className="flex items-start gap-4">
            <div className="border-destructive/20 bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full border">
              <RiDeleteBinLine className="text-destructive size-5" />
            </div>
            <div className="space-y-2">
              <AlertDialogHeader>
                <AlertDialogTitle>Elimina documento</AlertDialogTitle>
                <AlertDialogDescription>
                  Stai per eliminare il documento con ID {document.id}. Questa
                  azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={resetDialogStates}
              disabled={isUpdatePending}
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdatePending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isUpdatePending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Column definitions
const getColumns = (
  docClassDetails: DocumentClassDetails,
  onViewDetails: (doc: EnrichedDocument) => void,
): ColumnDef<EnrichedDocument>[] => {
  return [
    {
      accessorKey: "sent_at",
      header: "Data Invio",
      cell: ({ row }) => formatDynamicDate(row.getValue("sent_at")),
      filterFn: "docDateRange",
    },
    {
      accessorKey: "viewers",
      header: "Destinatari",
      cell: ({ row }) => {
        const viewers = row.original.viewers;
        if (!viewers || viewers.length === 0) return "N/A";
        const visibleAvatars = viewers.slice(0, 5);
        const hiddenCount = viewers.length - visibleAvatars.length;

        const avatarElements = visibleAvatars.map((viewer) => (
          <Avatar key={viewer.id} className="size-8 border-2">
            <TooltipContent>{viewer.nominativo}</TooltipContent>
            <AvatarFallback>{getInitials(viewer.nominativo)}</AvatarFallback>
          </Avatar>
        ));

        if (hiddenCount > 0) {
          avatarElements.push(
            <Avatar
              key="overflow"
              className="size-8 border-2 bg-gray-200 dark:bg-gray-700"
            >
              <TooltipContent>
                {viewers
                  .slice(5)
                  .map((v) => v.nominativo)
                  .join(", ")}
              </TooltipContent>
              <AvatarFallback className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                +{hiddenCount}
              </AvatarFallback>
            </Avatar>,
          );
        }

        return <AvatarGroup>{avatarElements}</AvatarGroup>;
      },
      filterFn: "viewer",
    },
    ...((docClassDetails?.fields.map((field) => ({
      id: `metadata.${field.name}`,
      accessorFn: (row: EnrichedDocument) => {
        if (row.documents?.[0]?.metadata) {
          return row.documents[0].metadata[field.name];
        }
        return undefined;
      },
      header: field.label,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const value = getValue();
        if (value === null || value === undefined) return "-";
        if (field.data_type === "boolean") return value ? "Sì" : "No";
        if (field.data_type === "date" || field.data_type === "datetime")
          return formatDynamicDate(value as string);
        if (typeof value === "number" || typeof value === "string")
          return String(value);
        return "-";
      },
      filterFn:
        field.data_type === "boolean"
          ? "boolean"
          : field.data_type === "enum"
            ? "enum"
            : ["integer", "decimal"].includes(field.data_type)
              ? "numberEquals"
              : ["date", "datetime"].includes(field.data_type)
                ? "dateEquals"
                : ["char", "string", "text"].includes(field.data_type)
                  ? "textContains"
                  : undefined,
    })) as ColumnDef<EnrichedDocument>[]) ?? []),
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          document={row.original}
          onViewDetails={() => onViewDetails(row.original)}
        />
      ),
    },
  ];
};

// Table props
export interface SharedDocumentsTableProps {
  data: EnrichedDocument[];
  docClassDetails: DocumentClassDetails;
  isLoading?: boolean;
}

export function SharedDocumentsTable({
  data,
  docClassDetails,
  isLoading = false,
}: SharedDocumentsTableProps) {
  const tableId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});
  const [dateField, setDateField] = useState<string>("sent_at");
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>();
  const [selectedViewers, setSelectedViewers] = useState<string[]>([]);
  const [dynamicColumnFilters, setDynamicColumnFilters] = useState<
    Record<string, string | string[] | undefined>
  >({});

  const handleViewDetails = (batch: EnrichedDocument) => {
    router.push(`/dashboard/sharer/documenti/condivisi/${slug}/${batch.id}`);
  };

  const columns = useMemo(
    () => getColumns(docClassDetails, handleViewDetails),
    [docClassDetails, slug],
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    filterFns: {
      viewer: viewerFilterFn,
      boolean: booleanFilterFn,
      enum: enumFilterFn,
      numberEquals: numberEqualsFilterFn,
      dateEquals: dateEqualsFilterFn,
      docDateRange: docDateRangeFilterFn,
      textContains: textContainsFilterFn,
      // Add dummy filters to satisfy TypeScript
      activeStatus: (() => true) as FilterFn<EnrichedDocument>,
      dateRange: (() => true) as FilterFn<EnrichedDocument>,
      documentClassDateRange: (() => true) as FilterFn<EnrichedDocument>,
      documentClassSharer: (() => true) as FilterFn<EnrichedDocument>,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn,
    enableRowSelection: true,
  });

  // Handle dynamic filter changes
  const handleDynamicFilterChange = (
    columnId: string,
    value: string | string[] | undefined,
  ) => {
    setDynamicColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // Update column filters when dynamic filters change
  useEffect(() => {
    const dynamicFilters = Object.entries(dynamicColumnFilters)
      .map(([id, value]) =>
        value !== undefined && value !== null && value !== ""
          ? { id: `metadata.${id}`, value }
          : null,
      )
      .filter(Boolean) as ColumnFiltersState;

    const newColumnFilters = [
      { id: "sent_at", value: dateRange },
      { id: "viewers", value: selectedViewers },
      ...dynamicFilters,
    ].filter(
      (f) =>
        f.value !== undefined &&
        f.value !== null &&
        (Array.isArray(f.value) ? f.value.length > 0 : true),
    );

    setColumnFilters(newColumnFilters);
  }, [dateRange, selectedViewers, dynamicColumnFilters]);

  const handleResetFilters = () => {
    setGlobalFilter("");
    setDateRange(undefined);
    setSelectedViewers([]);
    setDynamicColumnFilters({});
  };

  const hasActiveFilters =
    !!globalFilter ||
    !!dateRange ||
    selectedViewers.length > 0 ||
    Object.values(dynamicColumnFilters).some((v) => !!v);

  const uniqueViewers: ViewerOption[] = useMemo(() => {
    const viewerSet = new Map<string, { id: string; nominativo: string }>();
    data.forEach((doc) => {
      doc.viewers.forEach((viewer) => {
        const viewerId = viewer.id.toString();
        if (!viewerSet.has(viewerId)) {
          viewerSet.set(viewerId, {
            id: viewerId,
            nominativo: viewer.nominativo,
          });
        }
      });
    });
    return Array.from(viewerSet.values());
  }, [data]);

  const dateFields: DateField[] = useMemo(
    () => [{ value: "sent_at", label: "Data di invio" }],
    [],
  );

  const selectedRows = table.getSelectedRowModel().rows;
  const numSelected = selectedRows.length;

  return (
    <div className="space-y-4">
      {/* Filters/Header Section */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          {/* Left: Search & Reset */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id={`${tableId}-input`}
                ref={inputRef}
                className={cn(
                  "bg-background border-muted/30 focus:ring-primary/20 h-10 w-full rounded-full border pl-9 text-base shadow-sm transition-all focus:ring-2 sm:w-72",
                  Boolean(globalFilter) && "pr-9",
                )}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Cerca documenti..."
                type="text"
                aria-label="Cerca documenti"
              />
              <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                <RiSearch2Line size={18} aria-hidden="true" />
              </div>
              {Boolean(globalFilter) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full px-2 py-0 hover:bg-transparent"
                  onClick={() => {
                    setGlobalFilter("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Cancella ricerca"
                >
                  <CloseIcon size={16} strokeWidth={2.2} />
                </Button>
              )}
            </div>
          </div>

          {/* Right: Filters */}
          <div className="flex items-center gap-3">
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              availableDateFields={dateFields}
              dateField={dateField}
              onDateFieldChange={setDateField}
            />
            <ViewerFilter
              selectedViewers={selectedViewers}
              onSelectedViewersChange={setSelectedViewers}
              availableViewers={uniqueViewers}
            />
            {docClassDetails?.fields
              .filter((field) => !field.is_primary_key)
              .map((field) => (
                <DynamicFieldFilter
                  key={field.name}
                  field={field}
                  value={dynamicColumnFilters[field.name]}
                  onChange={(value) =>
                    handleDynamicFilterChange(field.name, value)
                  }
                />
              ))}
            {/* Toggle columns visibility */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-muted/30 hover:border-primary/40 rounded-full"
                  aria-label="Mostra/nascondi colonne"
                >
                  <RiFilter3Line size={16} className="" />
                  Colonne
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 rounded-2xl">
                <div className="space-y-2">
                  <div className="text-muted-foreground/60 px-1 text-xs font-medium tracking-wider uppercase">
                    Colonne
                  </div>
                  <div className="space-y-1">
                    {table
                      .getAllColumns()
                      .filter(
                        (column) =>
                          typeof column.accessorFn !== "undefined" &&
                          column.getCanHide(),
                      )
                      .map((column) => (
                        <div
                          key={column.id}
                          className="hover:bg-muted/40 flex items-center gap-2 rounded-lg p-1.5 transition-colors"
                        >
                          <Checkbox
                            id={column.id}
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                            className="size-4"
                          />
                          <Label
                            htmlFor={column.id}
                            className="grow cursor-pointer text-sm font-normal"
                          >
                            {typeof column.columnDef.header === "string"
                              ? column.columnDef.header
                              : column.id}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Actions */}
          <div className="flex items-center gap-2">
            {numSelected > 0 && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <RiDeleteBinLine size={16} className="mr-2" />
                      Elimina Selezionati ({numSelected})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Stai per eliminare {numSelected} document
                        {numSelected === 1 ? "o" : "i"}. Questa azione non può
                        essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          toast.error("Eliminazione non implementata.");
                          table.resetRowSelection();
                        }}
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.resetRowSelection()}
                >
                  Deseleziona ({numSelected})
                </Button>
              </>
            )}
          </div>

          {/* Right: Reset filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleResetFilters}
            >
              <RiFilter3Line size={16} />
              Reset filtri
            </Button>
          )}
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-card border-muted/30 overflow-x-auto rounded-2xl border shadow-sm">
        <Table className="min-w-full">
          <TableHeader className="bg-card/95 border-muted/30 sticky top-0 z-10 border-b backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-0 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="text-muted-foreground bg-card/95 h-14 px-5 text-left align-middle text-sm font-semibold tracking-wide uppercase"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors select-none"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Ordina per ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : "colonna"}`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: (
                            <RiArrowUpSLine
                              size={16}
                              className="text-muted-foreground"
                            />
                          ),
                          desc: (
                            <RiArrowDownSLine
                              size={16}
                              className="text-muted-foreground"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center align-middle"
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-muted-foreground text-base">
                      Caricamento...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/40 border-muted/20 group h-16 cursor-pointer border-b transition-colors last:border-b-0"
                  onClick={() => {
                    handleViewDetails(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="group-hover:text-foreground max-w-xs truncate px-5 py-4 align-middle text-base transition-colors"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center align-middle"
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <RiFileTextLine
                      size={40}
                      className="text-muted-foreground/40"
                    />
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-base">
                        Nessun documento trovato
                      </p>
                      {dateRange && (
                        <p className="text-muted-foreground/80 text-xs">
                          Prova a modificare i filtri di ricerca
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination Section --- */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex justify-center pt-2">
          {/* Paginazione centrata */}
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-muted/30 rounded-lg"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Pagina precedente"
                >
                  <RiArrowLeftSLine size={18} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <div className="flex items-center gap-2 px-3">
                  <span className="text-sm">
                    Pagina {table.getState().pagination.pageIndex + 1} di{" "}
                    {table.getPageCount()}
                  </span>
                </div>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-muted/30 rounded-lg"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Pagina successiva"
                >
                  <RiArrowRightSLine size={18} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
