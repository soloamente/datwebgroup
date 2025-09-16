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
  type RowData,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type Viewer,
  type Sharer,
  userService,
  type DocumentClass,
} from "@/app/api/api";
import { toast } from "sonner";
import { EditViewerDialog } from "@/components/edit-viewer-dialog";
import { SendUsernameDialog } from "@/components/send-username-dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  type DateField,
  DateRangeFilter,
} from "@/components/filters/date-range-filter";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import CloseIcon from "@/components/icons/close";

const dummyFilter: FilterFn<RowData> = () => true;

// Global filter function for text search across multiple fields
const globalFilterFn: FilterFn<Viewer> = (
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
  data: Viewer[];
  onStatusChange: () => void;
}

const getColumns = ({
  data,
  onStatusChange,
}: GetColumnsProps): ColumnDef<Viewer>[] => [
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
        viewer={row.original}
        onStatusChange={onStatusChange}
      />
    ),
    size: 60,
    enableHiding: false,
  },
];

// Change the ViewerTable component signature to accept props
interface ViewerTableProps {
  data: Viewer[];
  isLoading: boolean;
  onStatusChange: () => void;
}

export default function ViewerTable({
  data,
  isLoading,
  onStatusChange,
}: ViewerTableProps) {
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
    globalFilterFn,
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
      dateRange: dateRangeFilterFn,
      activeStatus: dummyFilter,
      documentClassDateRange: dummyFilter,
      documentClassSharer: dummyFilter,
    },
  });

  // Add useEffect to update the filter when dateRange changes
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
                "bg-card focus:ring-primary/20 ring-border h-10 w-full rounded-full border-none pl-9 text-base ring-1 transition-all focus:ring-2 sm:w-70",
                Boolean(globalFilter) && "pr-9",
              )}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Cerca per username, nome o email"
              type="text"
              aria-label="Cerca per username, nome o email"
            />
            <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <RiSearch2Line size={18} aria-hidden="true" />
            </div>
            {Boolean(globalFilter) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full px-2 py-0 hover:bg-transparent"
                onClick={() => {
                  setGlobalFilter("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                aria-label="Cancella filtro"
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

          {/* Toggle columns visibility */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="ring-border bg-card rounded-full border-none ring-1"
                aria-label="Mostra/nascondi colonne"
              >
                <RiFilter3Line size={16} />
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

      {/* Table */}
      <div className="ring-border isolate overflow-hidden overflow-x-auto rounded-2xl ring-1">
        <Table className="bg-muted/20 min-w-full border-separate border-spacing-0">
          <TableHeader className="sticky top-0 z-10 text-sm [&_tr]:border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-0 hover:bg-transparent"
              >
                {headerGroup.headers.map((header, headerIdx) => {
                  const isFirst = headerIdx === 0;
                  const isLast = headerIdx === headerGroup.headers.length - 1;
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className={cn(
                        "text-muted-foreground overflow-hidden px-5 text-left align-middle",
                        isFirst && "rounded-tl-2xl rounded-bl-2xl",
                        isLast && "rounded-tr-2xl rounded-br-2xl",
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className="hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors select-none"
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
                          tabIndex={header.column.getCanSort() ? 0 : -1}
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
                                className="text-muted-foreground"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <RiArrowDownSLine
                                className="text-muted-foreground"
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
          <TableBody className="[&_td]:bg-card ring-border rounded-lg ring-1">
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
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border group h-16 cursor-pointer border-b transition-colors last:border-b-0"
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isTopRow = rowIndex === 0;
                    const isFirstCell = cellIndex === 0;
                    const isLastCell =
                      cellIndex === row.getVisibleCells().length - 1;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "group-hover:bg-muted/10 group-hover:text-foreground max-w-xs truncate px-5 py-4 align-middle text-base transition-colors",
                          isTopRow &&
                            isFirstCell &&
                            "overflow-hidden rounded-tl-2xl",
                          isTopRow &&
                            isLastCell &&
                            "overflow-hidden rounded-tr-2xl",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-96 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Image
                      src="/AddUser.png"
                      alt="Nessun cliente trovato"
                      width={320}
                      height={320}
                      className="opacity-90"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-muted-foreground text-lg font-medium">
                        Nessun cliente trovato
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Inizia aggiungendo il tuo primo viewer.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex justify-center pt-2">
          {/* Paginazione centrata */}
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="ring-border bg-card rounded-lg border-none ring-1"
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
                  className="ring-border bg-card rounded-lg border-none ring-1"
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
  viewer,
  onStatusChange,
}: {
  data: Viewer[];
  viewer: Viewer;
  onStatusChange: () => void;
}) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetPasswordConfirmDialog, setShowResetPasswordConfirmDialog] =
    useState(false);
  const [showSendUsernameDialog, setShowSendUsernameDialog] = useState(false);
  const [deleteEmailConfirmation, setDeleteEmailConfirmation] = useState("");

  const handleDelete = () => {
    if (isUpdatePending) return;
    if (deleteEmailConfirmation !== viewer.email) {
      toast.error("L'email inserita non corrisponde all'email del cliente.");
      return;
    }

    startUpdateTransition(async () => {
      try {
        const response = await userService.deleteViewer(viewer.id);
        toast.success(response.message);
        onStatusChange();
        setShowDeleteDialog(false);
        setDeleteEmailConfirmation("");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile eliminare il cliente.",
        );
      }
    });
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setDeleteEmailConfirmation("");
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    onStatusChange();
  };

  const handleChangePassword = () => {
    setShowResetPasswordConfirmDialog(true);
  };

  const handleResetPasswordConfirm = () => {
    if (isUpdatePending) return;
    startUpdateTransition(async () => {
      try {
        const response = await userService.resetViewerPassword(
          viewer.id,
          viewer.nominativo,
        );
        toast.success(response.message);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile resettare la password.",
        );
      } finally {
        setShowResetPasswordConfirmDialog(false);
      }
    });
  };

  const handleSendUsername = () => {
    setShowSendUsernameDialog(true);
  };

  const handleCloseSendUsernameDialog = () => {
    setShowSendUsernameDialog(false);
    toast.success("Username inviato con successo.");
  };

  const handleDownloadCredentials = async () => {
    if (isUpdatePending) return;
    startUpdateTransition(async () => {
      try {
        const response = await userService.downloadViewerCredentials(
          viewer.id,
          viewer.nominativo,
        );
        toast.success(response.message);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile scaricare le credenziali.",
        );
      }
    });
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
              onClick={() => navigator.clipboard.writeText(viewer.email)}
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
              onClick={handleDownloadCredentials}
              disabled={isUpdatePending}
            >
              Scarica credenziali
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              disabled={isUpdatePending}
              className="text-destructive focus:text-destructive"
            >
              Elimina Cliente
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Eliminerà permanentemente
              il cliente <strong>{viewer.nominativo}</strong>.
              <br />
              <br />
              Per confermare, inserisci l&apos;email del cliente:{" "}
              <strong>{viewer.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label
              htmlFor="delete-email-confirmation"
              className="text-sm font-medium"
            >
              Email di conferma
            </Label>
            <Input
              id="delete-email-confirmation"
              type="email"
              value={deleteEmailConfirmation}
              onChange={(e) => setDeleteEmailConfirmation(e.target.value)}
              placeholder="Inserisci l'email del cliente"
              className="mt-2"
              disabled={isUpdatePending}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                isUpdatePending || deleteEmailConfirmation !== viewer.email
              }
              className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-white shadow-xs"
            >
              Elimina Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showResetPasswordConfirmDialog}
        onOpenChange={setShowResetPasswordConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sei sicuro di voler resettare la password?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione resetterà la password per l&apos;utente{" "}
              {viewer.nominativo}. Verrà inviata una mail con le nuove
              credenziali e un nuovo PDF verrà scaricato. Questa azione non può
              essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPasswordConfirm}
              disabled={isUpdatePending}
            >
              Resetta e Scarica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditViewerDialog
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        viewer={viewer}
        onViewerUpdate={onStatusChange}
      />

      <SendUsernameDialog
        isOpen={showSendUsernameDialog}
        onClose={handleCloseSendUsernameDialog}
        user={viewer}
        onUsernameSent={handleCloseSendUsernameDialog}
      />
    </>
  );
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    // eslint-disable-next-line
    dateRange: FilterFn<Sharer | Viewer>;
    activeStatus: FilterFn<Sharer | Viewer>;
    documentClassDateRange: FilterFn<DocumentClass>;
    documentClassSharer: FilterFn<DocumentClass>;
  }
}
