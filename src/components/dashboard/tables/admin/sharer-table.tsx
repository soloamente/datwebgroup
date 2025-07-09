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
import { Checkbox } from "@/components/animate-ui/base/checkbox";
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
  useLayoutEffect,
} from "react";

import {
  type DocumentClass,
  type Sharer,
  type Viewer,
  userService,
} from "@/app/api/api";
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
import CloseIcon from "@/components/icons/close";
import { StatusIcon } from "@/components/icons/status";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { addMonths } from "date-fns";
import {
  type DateField,
  DateRangeFilter,
} from "@/components/filters/date-range-filter";
import Image from "next/image";

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
const globalFilterFn: FilterFn<Sharer | Viewer> = (
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
const dateRangeFilterFn: FilterFn<Sharer | Viewer> = (
  row,
  columnId,
  value: DayPickerDateRange | undefined,
) => {
  // If no filter value is provided or both dates are undefined, show all rows
  if (!value) return true;
  if (!value.from && !value.to) return true;

  const { from: start, to: end } = value;
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
    header: "",
    accessorKey: "logo_url",
    cell: ({ row }) => {
      const logoUrl = row.getValue("logo_url");
      const nominativo = row.getValue("nominativo");
      if (typeof logoUrl === "string") {
        return (
          <Image
            src={logoUrl}
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            alt={`Logo di ${nominativo}`}
            width={40}
            height={40}
            className="rounded-full"
          />
        );
      }
      return null;
    },
    size: 60,
    enableSorting: false,
  },
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
  const isMobile = useIsMobile();

  // Add state for date filters
  const [dateField, setDateField] = useState<"created_at" | "updated_at">(
    "created_at",
  );
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>();

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
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    filterFns: {
      activeStatus: activeStatusFilterFn,
      dateRange: dateRangeFilterFn,
    },
    enableRowSelection: true,
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

  // Apply the filter when the dateRange or dateField changes
  useEffect(() => {
    // Apply filter to the selected date field column
    table.getColumn("created_at")?.setFilterValue(undefined);
    table.getColumn("updated_at")?.setFilterValue(undefined);

    if (dateRange) {
      table.getColumn(dateField)?.setFilterValue(dateRange);
    }
  }, [dateRange, dateField, table]);

  const availableDateFields: DateField[] = [
    { value: "created_at", label: "Data di creazione" },
    { value: "updated_at", label: "Data di aggiornamento" },
  ];

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number>();

  // Update popover width when button content changes
  useLayoutEffect(() => {
    if (buttonRef.current) {
      setPopoverWidth(buttonRef.current.getBoundingClientRect().width);
    }
  }, [selectedStatuses.length, globalFilter]);

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
                  "bg-background border-muted/30 focus:ring-primary/20 h-10 w-full rounded-full border pl-9 text-base shadow-sm transition-all focus:ring-2 sm:w-64",
                  Boolean(globalFilter) && "pr-9",
                )}
                value={globalFilter ?? ""}
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
                  className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full px-2 py-0 hover:bg-transparent"
                  onClick={() => {
                    setGlobalFilter("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Cancella ricerca"
                >
                  <CloseIcon
                    size={16}
                    strokeColor="currentColor"
                    strokeWidth={2.2}
                  />
                </Button>
              )}
            </div>
          </div>
          {/* Right: Filters */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="w-fit">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    ref={buttonRef}
                    variant="outline"
                    className="border-muted/30 hover:border-primary/40 w-full rounded-full"
                  >
                    <StatusIcon
                      className="text-muted-foreground/60 -ms-1.5 size-5.5"
                      ariaLabel="Filtra per stato"
                      focusable={false}
                    />
                    Filtra per stato
                    {selectedStatuses.length > 0 && (
                      <span className="border-border bg-background text-muted-foreground/70 -me-1.5 ml-1 items-center rounded-full border px-2 py-[3px] text-xs">
                        {selectedStatuses.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  style={popoverWidth ? { width: popoverWidth } : undefined}
                  className="rounded-2xl p-2"
                  align="end"
                >
                  <div className="space-y-2">
                    <div className="text-muted-foreground/60 px-1 text-xs font-medium tracking-wider uppercase">
                      Stato
                    </div>
                    <div className="space-y-0.5">
                      {uniqueStatusValues.map((value, i) => (
                        <div
                          key={String(value)}
                          className="hover:bg-muted/30 flex items-center gap-2 rounded-lg p-1.5 transition-colors"
                        >
                          <Checkbox
                            id={`${id}-${i}`}
                            checked={selectedStatuses.includes(value)}
                            onCheckedChange={(checked: boolean) =>
                              handleStatusChange(checked, value)
                            }
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary size-3.5 hover:cursor-pointer"
                          />
                          <Label
                            htmlFor={`${id}-${i}`}
                            className="flex grow cursor-pointer items-center justify-between gap-1 text-sm font-normal"
                          >
                            {value ? "Attivo" : "Inattivo"}

                            <span className="border-border bg-background text-muted-foreground/70 items-center rounded-full border px-1.5 py-0.5 text-xs">
                              {statusCounts.get(value) ?? 0}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Quick actions */}
                    <div className="border-t pt-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          table.getColumn("active")?.setFilterValue(undefined);
                        }}
                        className="h-7 w-full rounded-lg text-xs"
                      >
                        Reimposta
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Date Filter */}
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              dateField={dateField}
              onDateFieldChange={(field) =>
                setDateField(field as "created_at" | "updated_at")
              }
              availableDateFields={availableDateFields}
            />
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
