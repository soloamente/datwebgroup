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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiSearch2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDeleteBinLine,
  RiFilter3Line,
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
  ActionsDropdown,
  type ActionsDropdownAction,
} from "@/components/ui/actions-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
import React, { useEffect, useMemo, useRef, useState, useId } from "react";

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
  const handleDownload = () => {
    if (document.files && document.files.length > 0) {
      toast.success(
        `Download di ${document.files.length} file avviato (simulato).`,
      );
    } else {
      toast.warning("Nessun file da scaricare per questo documento.");
    }
  };
  const handleDelete = () =>
    toast.error(`Eliminazione del documento ${document.id} non implementata.`);

  const actions: ActionsDropdownAction[] = [
    {
      label: "Visualizza Dettagli",
      onClick: onViewDetails,
    },
    { label: "Scarica Allegati", onClick: handleDownload },
    {
      label: "Elimina Documento",
      onClick: handleDelete,
      destructive: true,
    },
  ];

  return <ActionsDropdown actions={actions} />;
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
  filters: {
    globalFilter: string;
    dateRange: DayPickerDateRange | undefined;
    selectedViewers: string[];
    dynamicColumnFilters: Record<string, string | string[] | undefined>;
  };
  setFilters: {
    setGlobalFilter: (value: string) => void;
    setDateRange: (value: DayPickerDateRange | undefined) => void;
    setSelectedViewers: (value: string[]) => void;
    setDynamicColumnFilters: (
      value: React.SetStateAction<
        Record<string, string | string[] | undefined>
      >,
    ) => void;
  };
}

export function SharedDocumentsTable({
  data,
  docClassDetails,
  filters,
  setFilters,
}: SharedDocumentsTableProps) {
  const tableId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [dateField, setDateField] = useState<string>("sent_at");
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const handleViewDetails = (batch: EnrichedDocument) => {
    router.push(`/dashboard/sharer/documenti/condivisi/${slug}/${batch.id}`);
  };

  const columns = useMemo(
    () => getColumns(docClassDetails, handleViewDetails),
    [docClassDetails, slug],
  );

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const dynamicFilters = Object.entries(filters.dynamicColumnFilters)
      .map(([id, value]) =>
        value !== undefined && value !== null && value !== ""
          ? { id: `metadata.${id}`, value }
          : null,
      )
      .filter(Boolean) as ColumnFiltersState;
    return [
      { id: "sent_at", value: filters.dateRange },
      { id: "viewers", value: filters.selectedViewers },
      ...dynamicFilters,
    ].filter(
      (f) =>
        f.value !== undefined &&
        f.value !== null &&
        (Array.isArray(f.value) ? f.value.length > 0 : true),
    );
  }, [filters]);

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
      // Re-add dummy filters with <unknown> to satisfy TS and linter
      activeStatus: (() => true) as FilterFn<unknown>,
      dateRange: (() => true) as FilterFn<unknown>,
      documentClassDateRange: (() => true) as FilterFn<unknown>,
      documentClassSharer: (() => true) as FilterFn<unknown>,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter: filters.globalFilter,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilters.setGlobalFilter,
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

  const handleDynamicFilterChange = (
    columnId: string,
    value: string | string[] | undefined,
  ) => {
    setFilters.setDynamicColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters.setGlobalFilter("");
    setFilters.setDateRange(undefined);
    setFilters.setSelectedViewers([]);
    setFilters.setDynamicColumnFilters({});
  };

  const hasActiveFilters =
    !!filters.globalFilter ||
    !!filters.dateRange ||
    filters.selectedViewers.length > 0 ||
    Object.values(filters.dynamicColumnFilters).some((v) => !!v);

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

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="relative">
              <Input
                id={`${tableId}-input`}
                ref={inputRef}
                className="bg-background border-muted/30 focus:ring-primary/20 h-10 w-full rounded-full border pl-9 text-base shadow-sm transition-all focus:ring-2 sm:w-72"
                value={filters.globalFilter ?? ""}
                onChange={(e) => setFilters.setGlobalFilter(e.target.value)}
                placeholder="Cerca..."
              />
              <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <RiSearch2Line size={18} />
              </div>
              {!!filters.globalFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0 -translate-y-1/2"
                  onClick={() => setFilters.setGlobalFilter("")}
                >
                  <CloseIcon className="size-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DateRangeFilter
                dateRange={filters.dateRange}
                onDateRangeChange={setFilters.setDateRange}
                availableDateFields={dateFields}
                dateField={dateField}
                onDateFieldChange={setDateField}
              />
              <ViewerFilter
                selectedViewers={filters.selectedViewers}
                onSelectedViewersChange={setFilters.setSelectedViewers}
                availableViewers={uniqueViewers}
              />
              {docClassDetails?.fields
                .filter((field) => !field.is_primary_key)
                .map((field) => (
                  <DynamicFieldFilter
                    key={field.name}
                    field={field}
                    value={filters.dynamicColumnFilters[field.name]}
                    onChange={(value) =>
                      handleDynamicFilterChange(field.name, value)
                    }
                  />
                ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.error("Eliminazione non implementata.")
                    }
                  >
                    <RiDeleteBinLine size={16} className="mr-2" />
                    Elimina ({table.getSelectedRowModel().rows.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => table.resetRowSelection()}
                  >
                    Deseleziona
                  </Button>
                </>
              ) : null}
            </div>
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
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{ asc: " 🔼", desc: " 🔽" }[
                              header.column.getIsSorted() as string
                            ] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-24 text-center"
                    >
                      Nessun documento trovato.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} di{" "}
              {table.getFilteredRowModel().rows.length} righe selezionate.
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Pagina {table.getState().pagination.pageIndex + 1} di{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <RiArrowRightSLine className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
