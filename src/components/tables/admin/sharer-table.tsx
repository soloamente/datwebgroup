"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFnOption,
} from "@tanstack/react-table";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiBardLine,
  RiFilter3Line,
  RiSearch2Line,
  RiVerifiedBadgeFill,
  RiCheckLine,
  RiMoreLine,
  RiCalendarLine,
} from "@remixicon/react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Sharer, type Viewer, userService } from "@/app/api/api";
import { toast } from "sonner";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { ChangePasswordDialog } from "@/components/change-password-dialog";
import { SendUsernameDialog } from "@/components/send-username-dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Filter function that correctly handles active status boolean
const activeStatusFilterFn: FilterFn<Sharer | Viewer> = (
  row,
  columnId,
  filterValue: boolean[],
) => {
  if (!filterValue?.length) return true;
  const status = Boolean(row.getValue(columnId));
  return filterValue.includes(status);
};

// Global filter function for text search across multiple fields
const globalFilterFn: FilterFn<Sharer> = (
  row,
  columnId,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  if (!searchValue) return true;

  const username = String(row.getValue("username") || "").toLowerCase();
  const nominativo = String(row.getValue("nominativo") || "").toLowerCase();
  const email = String(row.getValue("email") || "").toLowerCase();

  return (
    username.includes(searchValue) ||
    nominativo.includes(searchValue) ||
    email.includes(searchValue)
  );
};

// Add date range filter function
const dateRangeFilterFn: FilterFn<Sharer> = (
  row,
  columnId,
  value: [Date | undefined, Date | undefined] | undefined,
) => {
  // If no filter value is provided or both dates are undefined, show all rows
  if (!value) return true;
  if (!value[0] && !value[1]) return true;

  const [start, end] = value;
  const dateValue = row.getValue(columnId);
  if (!dateValue) return false;

  const cellDate = new Date(dateValue as string);

  if (start && end) {
    // Adjust end date to include the whole day
    const adjustedEnd = new Date(end);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate >= start && cellDate <= adjustedEnd;
  } else if (start) {
    return cellDate >= start;
  } else if (end) {
    // Adjust end date to include the whole day
    const adjustedEnd = new Date(end);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate <= adjustedEnd;
  }

  return true;
};

interface GetColumnsProps {
  data: Sharer[];
  onStatusChange: () => void;
}

const getColumns = ({
  data,
  onStatusChange,
}: GetColumnsProps): ColumnDef<Sharer>[] => [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Seleziona tutti"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Seleziona riga"
  //     />
  //   ),
  //   size: 28,
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    header: "Username",
    accessorKey: "username",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("username")}</div>
    ),
    size: 120,
    enableHiding: false,
  },
  {
    header: "Nome",
    accessorKey: "nominativo",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nominativo")}</div>
    ),
    size: 180,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <span className="text-muted-foreground block truncate lowercase">
        {row.getValue("email")}
      </span>
    ),
    size: 180,
  },
  {
    header: "Stato",
    accessorKey: "active",
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue("active"));
      return (
        <Badge
          variant={`${isActive ? "outline" : "outline"}`}
          className={cn(
            "gap-1 rounded-full",
            !isActive ? "text-muted-foreground" : "text-white",
          )}
        >
          {isActive ? (
            <div
              className="size-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
          ) : (
            <div
              className="size-2 rounded-full bg-red-500"
              aria-hidden="true"
            />
          )}
          {isActive ? "Attivo" : "Inattivo"}
        </Badge>
      );
    },
    size: 110,
    filterFn: activeStatusFilterFn,
  },
  // {
  //   header: "Ruolo",
  //   accessorKey: "role",
  //   cell: ({ row }) => (
  //     <span className="text-muted-foreground capitalize">
  //       {row.getValue("role")}
  //     </span>
  //   ),
  //   size: 110,
  // },
  {
    header: "Creato il",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at");
      if (typeof dateValue !== "string") return <span>-</span>;

      const date = new Date(dateValue);
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <span className="text-muted-foreground">{formattedDate}</span>;
    },
    size: 140,
    filterFn: "dateRange",
  },
  {
    header: "Aggiornato il",
    accessorKey: "updated_at",
    cell: ({ row }) => {
      const dateValue = row.getValue("updated_at");
      if (typeof dateValue !== "string") return <span>-</span>;

      const date = new Date(dateValue);
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <span className="text-muted-foreground">{formattedDate}</span>;
    },
    size: 140,
    filterFn: "dateRange",
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => (
      <RowActions
        data={data}
        sharer={row.original}
        onStatusChange={onStatusChange}
      />
    ),
    size: 60,
    enableHiding: false,
  },
];

// Change the SharerTable component signature to accept props
interface SharerTableProps {
  data: Sharer[];
  isLoading: boolean;
  onStatusChange: () => void;
}

export default function SharerTable({
  data,
  isLoading,
  onStatusChange,
}: SharerTableProps) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Add state for date filters
  const [dateField, setDateField] = useState<"created_at" | "updated_at">(
    "created_at",
  );
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "username",
      desc: false,
    },
  ]);

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    // Instead of updating internal state, call onStatusChange to refresh data from parent
    onStatusChange();
    table.resetRowSelection();
  };

  // Update columns to use onStatusChange prop
  const columns = useMemo(
    () =>
      getColumns({
        data,
        onStatusChange,
      }),
    [data, onStatusChange],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    filterFns: {
      activeStatus: activeStatusFilterFn,
      dateRange: dateRangeFilterFn,
    },
  });

  // Extract complex expressions into separate variables
  const activeColumn = table.getColumn("active");
  const activeFacetedValues = activeColumn?.getFacetedUniqueValues();
  const activeFilterValue = activeColumn?.getFilterValue();

  // Update useMemo hooks with simplified dependencies
  const uniqueStatusValues = useMemo(() => {
    if (!activeColumn) return [];
    // Ensure we're properly handling boolean values
    const values = Array.from(activeFacetedValues?.keys() ?? []).map(
      (value) => value === true || value === "true" || value === 1,
    );
    // Remove duplicates and sort
    return [...new Set(values)].sort();
  }, [activeColumn, activeFacetedValues]);

  const statusCounts = useMemo(() => {
    if (!activeColumn) return new Map<boolean, number>();

    const countsMap = new Map<boolean, number>();

    Array.from(activeFacetedValues?.entries() ?? []).forEach(([key, value]) => {
      const boolKey = key === true || key === "true" || key === 1;
      const existingCount = countsMap.get(boolKey) ?? 0;
      countsMap.set(boolKey, existingCount + value);
    });

    return countsMap;
  }, [activeColumn, activeFacetedValues]);

  const selectedStatuses = useMemo(() => {
    return (activeFilterValue as boolean[]) ?? [];
  }, [activeFilterValue]);

  const handleStatusChange = (checked: boolean, value: boolean) => {
    const filterValue = table
      .getColumn("active")
      ?.getFilterValue() as boolean[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      // Only add if not already present
      if (!newFilterValue.includes(value)) {
        newFilterValue.push(value);
      }
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("active")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  // Add useEffect to update the filter when dateRange changes
  useEffect(() => {
    if (dateRange[0] || dateRange[1]) {
      table.getColumn(dateField)?.setFilterValue(dateRange);
    } else {
      table.getColumn(dateField)?.setFilterValue(undefined);
    }
  }, [dateRange, dateField, table]);

  // Add date filter display
  const getDateFilterDisplay = useCallback(() => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "dd/MM/yyyy")} - ${format(dateRange[1], "dd/MM/yyyy")}`;
    }
    if (dateRange[0]) {
      return `Da ${format(dateRange[0], "dd/MM/yyyy")}`;
    }
    if (dateRange[1]) {
      return `Fino a ${format(dateRange[1], "dd/MM/yyyy")}`;
    }
    return "Filtra per data";
  }, [dateRange]);

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Filter by name */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer bg-background from-accent/60 to-accent min-w-72 bg-gradient-to-br ps-9",
                Boolean(globalFilter) && "pe-9",
              )}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Cerca per username, nome o email"
              type="text"
              aria-label="Cerca per username, nome o email"
            />
            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
              <RiSearch2Line size={20} aria-hidden="true" />
            </div>
            {Boolean(globalFilter) && (
              <button
                className="text-muted-foreground/60 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cancella filtro"
                onClick={() => {
                  setGlobalFilter("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <RiCloseCircleLine size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto" variant="outline">
                  <RiDeleteBinLine
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Elimina
                  <span className="border-border bg-background text-muted-foreground/70 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="border-border flex size-9 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <RiErrorWarningLine className="opacity-80" size={16} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sei assolutamente sicuro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. Eliminerà
                      permanentemente {table.getSelectedRowModel().rows.length}{" "}
                      {table.getSelectedRowModel().rows.length === 1
                        ? "riga selezionata"
                        : "righe selezionate"}
                      .
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRows}>
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Filter by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <RiFilter3Line
                  className="text-muted-foreground/60 -ms-1.5 size-5"
                  size={20}
                  aria-hidden="true"
                />
                Filtra per stato
                {selectedStatuses.length > 0 && (
                  <span className="border-border bg-background text-muted-foreground/70 ms-3 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="end">
              <div className="space-y-3">
                <div className="text-muted-foreground/60 text-xs font-medium uppercase">
                  Stato
                </div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => (
                    <div
                      key={String(value)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) =>
                          handleStatusChange(checked, value)
                        }
                      />
                      <Label
                        htmlFor={`${id}-${i}`}
                        className="flex grow justify-between gap-2 font-normal"
                      >
                        {value ? "Attivo" : "Inattivo"}{" "}
                        <span className="text-muted-foreground ms-2 text-xs">
                          {statusCounts.get(value)}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* New filter button */}
          <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <RiCalendarLine
                  className="text-muted-foreground/60 -ms-1.5 size-5"
                  size={20}
                  aria-hidden="true"
                />
                {getDateFilterDisplay()}
                {(dateRange[0] ?? dateRange[1]) && (
                  <span className="border-border bg-background text-muted-foreground/70 ms-3 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {dateRange[0] && dateRange[1] ? "2" : "1"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground/60 text-xs font-medium uppercase">
                    Campo
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        dateField === "created_at" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setDateField("created_at")}
                      className="text-xs"
                    >
                      Data creazione
                    </Button>
                    <Button
                      variant={
                        dateField === "updated_at" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setDateField("updated_at")}
                      className="text-xs"
                    >
                      Data aggiornamento
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground/60 text-xs font-medium uppercase">
                    Periodo
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-muted-foreground mb-1 text-xs">
                          Da
                        </div>
                        <Calendar
                          locale={it}
                          mode="single"
                          selected={dateRange[0]}
                          onSelect={(date) =>
                            setDateRange([date, dateRange[1]])
                          }
                          disabled={(date) =>
                            dateRange[1] ? date > dateRange[1] : false
                          }
                          initialFocus
                        />
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1 text-xs">
                          A
                        </div>
                        <Calendar
                          locale={it}
                          mode="single"
                          selected={dateRange[1]}
                          onSelect={(date) =>
                            setDateRange([dateRange[0], date])
                          }
                          disabled={(date) =>
                            dateRange[0] ? date < dateRange[0] : false
                          }
                          initialFocus
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange([undefined, undefined]);
                      table.getColumn(dateField)?.setFilterValue(undefined);
                    }}
                  >
                    Reimposta
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDateFilterOpen(false);
                    }}
                  >
                    Applica
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* New filter button */}
          <Button variant="outline">
            <RiBardLine
              className="text-muted-foreground/60 -ms-1.5 size-5"
              size={20}
              aria-hidden="true"
            />
            Nuovo Filtro
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table className="table-fixed border-separate border-spacing-0 [&_tr:not(:last-child)_td]:border-b">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="bg-sidebar border-border relative h-9 border-y select-none first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center gap-2 select-none",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          // Enhanced keyboard handling for sorting
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: (
                            <RiArrowUpSLine
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <RiArrowDownSLine
                              className="shrink-0 opacity-60"
                              size={16}
                              aria-hidden="true"
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
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
        <TableBody>
          {isLoading ? (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-accent/50 h-px border-0 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="h-[inherit] last:py-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nessun risultato.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <tbody aria-hidden="true" className="table-row h-1"></tbody>
      </Table>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
            aria-live="polite"
          >
            Pagina{" "}
            <span className="text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            di <span className="text-foreground">{table.getPageCount()}</span>
          </p>
          <Pagination className="w-auto">
            <PaginationContent className="gap-3">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Vai alla pagina precedente"
                >
                  Precedente
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Vai alla pagina successiva"
                >
                  Successiva
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function RowActions({
  data,
  sharer,
  onStatusChange,
}: {
  data: Sharer[];
  sharer: Sharer;
  onStatusChange: () => void;
}) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showSendUsernameDialog, setShowSendUsernameDialog] = useState(false);

  const handleStatusToggle = async () => {
    try {
      const response = await userService.toggleSharerStatus(sharer.id);
      toast.success(response.message);
      onStatusChange();
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Impossibile cambiare lo stato");
    }
  };

  const handleDelete = () => {
    startUpdateTransition(() => {
      const updatedData = data.filter((dataItem) => dataItem.id !== sharer.id);
      onStatusChange();
      setShowDeleteDialog(false);
    });
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    onStatusChange();
  };

  const handleChangePassword = () => {
    setShowChangePasswordDialog(true);
  };

  const handleCloseChangePasswordDialog = () => {
    setShowChangePasswordDialog(false);
  };

  const handleSendUsername = () => {
    setShowSendUsernameDialog(true);
  };

  const handleCloseSendUsernameDialog = () => {
    setShowSendUsernameDialog(false);
    toast.success("Username inviato con successo.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground/60 shadow-none"
              aria-label="Modifica elemento"
            >
              <RiMoreLine className="size-5" size={20} aria-hidden="true" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(sharer.email)}
              disabled={isUpdatePending}
            >
              Copia Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} disabled={isUpdatePending}>
              Modifica Utente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleChangePassword}
              disabled={isUpdatePending}
            >
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSendUsername}
              disabled={isUpdatePending}
            >
              Invia Username
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusToggle()}
            disabled={isUpdatePending}
            className={cn(
              "dark:data-[variant=destructive]:focus:bg-destructive/10",
              sharer.active ? "text-red-500" : "text-green-500",
            )}
          >
            {sharer.active ? "Disattiva utente" : "Attiva utente"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Eliminerà permanentemente
              questo utente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isUpdatePending}
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-white shadow-xs"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        user={sharer}
        onUserUpdate={handleCloseEditDialog}
      />

      <ChangePasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={handleCloseChangePasswordDialog}
        user={sharer}
      />

      <SendUsernameDialog
        isOpen={showSendUsernameDialog}
        onClose={handleCloseSendUsernameDialog}
        user={sharer}
        onUsernameSent={handleCloseSendUsernameDialog}
      />
    </>
  );
}

// Declare custom filter functions
declare module "@tanstack/react-table" {
  interface FilterFns {
    // eslint-disable-next-line
    activeStatus: FilterFn<Sharer | Viewer>;
    // eslint-disable-next-line
    dateRange: FilterFn<Sharer | Viewer>;
  }
}
