"use client";

import { cn } from "@/lib/utils";
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
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

import { type Sharer, type Viewer, userService } from "@/app/api/api";
import { toast } from "sonner";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { ResetPasswordDialog } from "@/components/reset-passoword";
import { SendUsernameDialog } from "@/components/send-username-dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CrossCircle } from "@/components/icons/cross-circle";
import { CheckCircle } from "@/components/icons/check-circle";
import { PencilEdit } from "@/components/icons/pencil-edit";
import { CopyIcon } from "@/components/icons/copy";
import { Stack } from "@/components/ui/stack";
import { EmailIcon } from "@/components/icons/email";
import {
  ActionsDropdown,
  type ActionsDropdownAction,
} from "@/components/ui/actions-dropdown";

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
          variant={`${isActive ? "attivo" : "secondary"}`}
          className={cn("flex items-center rounded-full", !isActive ? "" : "")}
        >
          {isActive ? (
            <CheckCircle className="size-2 rounded-full" />
          ) : (
            <CrossCircle className="size-2 rounded-full" />
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
      documentClassDateRange: dateRangeFilterFn,
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
      {/* Filters/Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          {/* Left: Search & Reset */}
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "bg-background border-muted/30 focus:ring-primary/20 h-10 w-full rounded-lg border pl-9 text-base shadow-sm transition-all focus:ring-2 sm:w-80",
                  Boolean(globalFilter) && "pr-9",
                )}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Cerca per username o nome"
                type="text"
                aria-label="Cerca per username o nome"
              />
              <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                <RiSearch2Line size={18} aria-hidden="true" />
              </div>
              {Boolean(globalFilter) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center px-2 py-0 hover:bg-transparent"
                  onClick={() => {
                    setGlobalFilter("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Cancella ricerca"
                >
                  <RiCloseCircleLine size={16} />
                </Button>
              )}
            </div>
          </div>
          {/* Right: Filters */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-muted/30 hover:border-primary/40 rounded-lg"
                >
                  <RiFilter3Line
                    className="text-muted-foreground/60 -ms-1.5 size-5"
                    size={20}
                    aria-hidden="true"
                  />
                  Filtra per stato
                  {selectedStatuses.length > 0 && (
                    <span className="border-border bg-background text-muted-foreground/70 ml-2 h-5 max-h-full items-center rounded border px-1 text-xs font-medium">
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
            {/* Date Filter */}
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-muted/30 hover:border-primary/40 rounded-lg"
                >
                  <RiCalendarLine
                    className="text-muted-foreground/60 -ms-1.5 size-5"
                    size={20}
                    aria-hidden="true"
                  />
                  {getDateFilterDisplay()}
                  {(dateRange[0] ?? dateRange[1]) && (
                    <span className="border-border bg-background text-muted-foreground/70 ml-2 h-5 max-h-full items-center rounded border px-1 text-xs font-medium">
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
          </div>
        </div>
        {/* Delete selected */}
        {table.getSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RiDeleteBinLine size={16} className="mr-2" />
                  Elimina Selezionati
                  <Badge
                    variant="secondary"
                    className="bg-destructive-foreground text-destructive ml-2"
                  >
                    {table.getSelectedRowModel().rows.length}
                  </Badge>
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
          </div>
        )}
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
                    <RiBardLine
                      size={40}
                      className="text-muted-foreground/40"
                    />
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-base">
                        Nessun risultato trovato
                      </p>
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

  // Reset all dialog states when any dialog closes
  const resetDialogStates = () => {
    setShowDeleteDialog(false);
    setShowEditDialog(false);
    setShowChangePasswordDialog(false);
    setShowSendUsernameDialog(false);
    // Force cleanup of any lingering overlay
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      resetDialogStates();
    };
  }, []);

  // Action handlers
  const handleCopyEmail = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    void (async () => {
      try {
        await navigator.clipboard.writeText(sharer.email);
        resetDialogStates();
      } catch (error) {
        console.error("Failed to copy email:", error);
        toast.error("Impossibile copiare l'email");
      }
    })();
  };

  const handleEdit = () => {
    resetDialogStates();
    setShowEditDialog(true);
  };

  const handleChangePassword = () => {
    resetDialogStates();
    setShowChangePasswordDialog(true);
  };

  const handleSendUsername = () => {
    resetDialogStates();
    setShowSendUsernameDialog(true);
  };

  const handleStatusToggle = () => {
    // Destructive action: toggle user status
    userService
      .toggleSharerStatus(sharer.id)
      .then((response) => {
        toast.success(response.message);
        onStatusChange();
        resetDialogStates();
      })
      .catch((error) => {
        console.error("Failed to toggle status:", error);
        toast.error("Impossibile cambiare lo stato");
      });
  };

  // Define actions for the dropdown
  const actions: ActionsDropdownAction[] = [
    {
      label: "Copia Email",
      icon: <CopyIcon />,
      onClick: handleCopyEmail,
      disabled: isUpdatePending,
      ariaLabel: "Copia Email",
    },
    {
      label: "Modifica Utente",
      icon: <PencilEdit />,
      onClick: handleEdit,
      disabled: isUpdatePending,
      ariaLabel: "Modifica Utente",
    },
    {
      label: "Reset Password",
      onClick: handleChangePassword,
      disabled: isUpdatePending,
      ariaLabel: "Reset Password",
    },
    {
      label: "Invia Username",
      icon: <EmailIcon />,
      onClick: handleSendUsername,
      disabled: isUpdatePending,
      ariaLabel: "Invia Username",
    },
    {
      label: sharer.active ? "Disattiva utente" : "Attiva utente",
      onClick: handleStatusToggle,
      disabled: isUpdatePending,
      destructive: true,
      ariaLabel: sharer.active ? "Disattiva utente" : "Attiva utente",
    },
  ];

  return (
    <>
      {/* Reusable, accessible actions dropdown */}
      <ActionsDropdown actions={actions} triggerAriaLabel="Azioni utente" />

      {/* Dialogs for edit, password reset, and send username */}
      <EditUserDialog
        isOpen={showEditDialog}
        onClose={() => {
          resetDialogStates();
          onStatusChange();
        }}
        user={sharer}
        onUserUpdate={() => {
          resetDialogStates();
          onStatusChange();
        }}
      />

      <ResetPasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={resetDialogStates}
        user={sharer}
        onPasswordReset={resetDialogStates}
      />

      <SendUsernameDialog
        isOpen={showSendUsernameDialog}
        onClose={resetDialogStates}
        user={sharer}
        onUsernameSent={resetDialogStates}
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
