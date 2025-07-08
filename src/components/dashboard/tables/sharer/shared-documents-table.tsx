"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  FilterFns,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";
import { Button } from "@/components/ui/button";
import {
  RiSearch2Line,
  RiMoreLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import {
  type DateField,
  DateRangeFilter,
} from "@/components/filters/date-range-filter";
import {
  ViewerFilter,
  type ViewerOption,
} from "@/components/filters/viewer-filter";
import { DynamicFieldFilter } from "@/components/filters/dynamic-field-filter";
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

import {
  type DocumentClassDetails,
  type SharedDocument,
  type ViewerInfo,
} from "@/app/api/api";
import { formatDynamicDate } from "@/lib/date-format";

// This is needed to augment the TanStack Table types
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FilterFns {
    viewer: FilterFn<unknown>;
    boolean: FilterFn<unknown>;
  }
}

// Enriched document type
interface EnrichedDocument extends SharedDocument {
  batchId: number;
  sent_at: string;
  viewers: ViewerInfo[];
}

const getInitials = (name: string) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length === 0) return "?";
  if (names.length === 1) return names[0]?.charAt(0).toUpperCase() ?? "?";
  return (
    (names[0]?.charAt(0).toUpperCase() ?? "") +
    (names.length > 1
      ? (names[names.length - 1]?.charAt(0).toUpperCase() ?? "")
      : "")
  );
};

// Global filter function for text search across multiple fields
const globalFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  if (!searchValue) return true;

  // Search in recipients
  const hasMatchingViewer = row.original.viewers.some((viewer) =>
    viewer.nominativo.toLowerCase().includes(searchValue),
  );
  if (hasMatchingViewer) return true;

  // Search in metadata
  for (const key in row.original.metadata) {
    const value = row.original.metadata[key];
    if (String(value).toLowerCase().includes(searchValue)) {
      return true;
    }
  }

  return false;
};

// Date range filter function
const dateRangeFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  value: DayPickerDateRange | undefined,
) => {
  if (!value || (!value.from && !value.to)) {
    return true;
  }

  const dateValue = row.getValue(columnId);
  if (!dateValue) return false;

  const cellDate = new Date(dateValue as string);

  if (value.from && value.to) {
    const adjustedEnd = new Date(value.to);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate >= value.from && cellDate <= adjustedEnd;
  }
  if (value.from) {
    return cellDate >= value.from;
  }
  if (value.to) {
    const adjustedEnd = new Date(value.to);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate <= adjustedEnd;
  }
  return true;
};

// Viewer filter function
const viewerFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const rowViewers = row.original.viewers;
  return rowViewers.some((viewer) =>
    filterValue.includes(viewer.id.toString()),
  );
};

const booleanFilterFn: FilterFn<EnrichedDocument> = (
  row,
  columnId,
  filterValue: string,
) => {
  if (filterValue === "all") return true;
  const value = row.getValue(columnId);
  const filterBool = filterValue === "true";
  if (typeof value === "boolean") {
    return value === filterBool;
  }
  if (typeof value === "number") {
    return (value === 1) === filterBool;
  }
  // Fallback for string values like "true" or "false"
  if (typeof value === "string") {
    return value.toLowerCase() === filterValue;
  }
  return false;
};

// Function to generate columns dynamically
const getColumns = (
  docClassDetails: DocumentClassDetails | null,
): ColumnDef<EnrichedDocument>[] => {
  if (!docClassDetails) return [];

  const dynamicColumns: ColumnDef<EnrichedDocument>[] =
    docClassDetails.fields.map((field) => ({
      accessorKey: `metadata.${field.name}`,
      header: field.label,
      cell: ({ row }) => {
        const value = row.original.metadata[field.name];
        if (value === null || typeof value === "undefined") return "-";

        switch (field.data_type) {
          case "date":
          case "datetime":
            return formatDynamicDate(value.toString());
          case "boolean":
            const docString = value.toString().toLowerCase();
            return docString === "true" || docString === "1" ? "Sì" : "No";
          default:
            return value.toString();
        }
      },
      filterFn:
        field.data_type === "boolean"
          ? "boolean"
          : field.data_type === "enum"
            ? "equals"
            : "includesString",
    }));

  return [
    ...dynamicColumns,
    {
      accessorKey: "sent_at",
      header: "Data Invio",
      cell: ({ row }) => formatDynamicDate(row.original.sent_at),
      filterFn: "dateRange",
    },
    {
      accessorKey: "viewers",
      header: "Destinatari",
      cell: ({ row }) => (
        <AvatarGroup>
          {row.original.viewers.map((viewer) => (
            <Avatar
              key={viewer.id}
              className="border-background h-8 w-8 border-2"
            >
              <AvatarFallback>{getInitials(viewer.nominativo)}</AvatarFallback>
              <AvatarGroupTooltip>{viewer.nominativo}</AvatarGroupTooltip>
            </Avatar>
          ))}
        </AvatarGroup>
      ),
      filterFn: "viewer",
    },
    {
      accessorKey: "files",
      header: () => <div className="text-right">Allegati</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original.files.length}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <RowActions document={row.original} />,
      size: 40,
      enableSorting: false,
    },
  ];
};

function RowActions({ document }: { document: EnrichedDocument }) {
  const handleViewDetails = () => {
    toast.info("Visualizzazione dettagli non ancora implementata.", {
      description: `ID Documento: ${document.id}`,
    });
  };

  const handleDownload = () => {
    toast.info("Download non ancora implementato.", {
      description: `ID Documento: ${document.id}`,
    });
  };

  const actions: ActionsDropdownAction[] = [
    { label: "Visualizza Dettagli", onClick: handleViewDetails },
    { label: "Scarica Documento", onClick: handleDownload },
  ];

  return (
    <div className="flex justify-end">
      <ActionsDropdown actions={actions} />
    </div>
  );
}

interface SharedDocumentsTableProps {
  data: EnrichedDocument[];
  docClassDetails: DocumentClassDetails | null;
  isLoading: boolean;
}

export function SharedDocumentsTable({
  data,
  docClassDetails,
  isLoading,
}: SharedDocumentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>(
    undefined,
  );
  const [dateField, setDateField] = useState<string>("sent_at");
  const [selectedViewers, setSelectedViewers] = useState<string[]>([]);
  const [dynamicColumnFilters, setDynamicColumnFilters] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo(() => getColumns(docClassDetails), [docClassDetails]);

  useEffect(() => {
    // Reset all filter and sorting states when the document class changes to prevent
    // trying to operate on columns that no longer exist from a previous class.
    setDynamicColumnFilters({});
    setDateField("sent_at");
    setDateRange(undefined);
    setSorting([]);
  }, [docClassDetails?.id]);

  const availableViewers = useMemo(() => {
    const allViewers = data.flatMap((doc) => doc.viewers);
    const uniqueViewers = Array.from(
      new Map(allViewers.map((v) => [v.id, v])).values(),
    );
    return uniqueViewers.map((v) => ({
      id: v.id.toString(),
      nominativo: v.nominativo,
    }));
  }, [data]);

  const availableDateFields: DateField[] = useMemo(() => {
    const fields =
      docClassDetails?.fields
        .filter((f) => f.data_type === "date" || f.data_type === "datetime")
        .map((f) => ({ value: `metadata.${f.name}`, label: f.label })) ?? [];
    return [{ value: "sent_at", label: "Data Invio" }, ...fields];
  }, [docClassDetails]);

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (selectedViewers.length > 0) {
      filters.push({ id: "viewers", value: selectedViewers });
    }
    if (dateRange) {
      filters.push({ id: dateField, value: dateRange });
    }
    for (const [key, value] of Object.entries(dynamicColumnFilters)) {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        filters.push({ id: key, value });
      }
    }
    return filters;
  }, [selectedViewers, dateRange, dateField, dynamicColumnFilters]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    filterFns: {
      dateRange: dateRangeFilterFn,
      viewer: viewerFilterFn,
      boolean: booleanFilterFn,
      activeStatus: () => true,
      documentClassDateRange: () => true,
      documentClassSharer: () => true,
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleDynamicFilterChange = (
    columnId: string,
    value: string | undefined,
  ) => {
    setDynamicColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-md" />
        <div className="flex items-center justify-end space-x-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateField={dateField}
          onDateFieldChange={setDateField}
          availableDateFields={availableDateFields}
        />
        <ViewerFilter
          selectedViewers={selectedViewers}
          onSelectedViewersChange={setSelectedViewers}
          availableViewers={availableViewers}
        />
        {docClassDetails?.fields
          .filter(
            (field) =>
              field.data_type !== "date" && field.data_type !== "datetime",
          )
          .map((field) => {
            const columnId = `metadata.${field.name}`;
            return (
              <DynamicFieldFilter
                key={columnId}
                field={field}
                value={dynamicColumnFilters[columnId]}
                onChange={(value) => handleDynamicFilterChange(columnId, value)}
              />
            );
          })}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? `${header.getSize()}px`
                              : undefined,
                        }}
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
        </CardContent>
      </Card>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <RiArrowLeftSLine size={20} />
          Precedente
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Successivo
          <RiArrowRightSLine size={20} />
        </Button>
      </div>
    </div>
  );
}
