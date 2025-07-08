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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "@tanstack/react-table";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiBardLine,
  RiSearch2Line,
  RiMoreLine,
  RiCalendarLine,
  RiFileTextLine,
  RiUserLine,
  RiEyeLine,
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
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";

import {
  type DocumentClass,
  type Sharer,
  userService,
  type Viewer,
} from "@/app/api/api";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PencilEdit } from "@/components/icons/pencil-edit";
import { CopyIcon } from "@/components/icons/copy";
import { Stack } from "@/components/ui/stack";
import { CalendarDateIcon } from "@/components/icons/calendar-date";
import { FilterVertical } from "@/components/icons/filter-vertical";
import {
  type DateField,
  DateRangeFilter,
} from "@/components/filters/date-range-filter";
import {
  SharerFilter,
  type SharerOption,
} from "@/components/filters/sharer-filter";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import CloseIcon from "@/components/icons/close";
import { formatDynamicDate } from "@/lib/date-format";

// Global filter function for text search across multiple fields for DocumentClass
const globalFilterFn: FilterFn<DocumentClass> = (
  row,
  columnId,
  filterValue: string,
) => {
  const searchValue = filterValue.toLowerCase();
  if (!searchValue) return true;

  const nome = String(row.getValue("nome") ?? "").toLowerCase();
  const descrizione = String(row.getValue("descrizione") ?? "").toLowerCase();
  const sharerNominativo = String(
    row.original.sharers?.[0]?.nominativo ?? "",
  ).toLowerCase();

  return (
    nome.includes(searchValue) ||
    descrizione.includes(searchValue) ||
    sharerNominativo.includes(searchValue)
  );
};

// Add date range filter function
const documentClassDateRangeFilterFn: FilterFn<DocumentClass> = (
  row,
  columnId,
  value: [Date | undefined, Date | undefined] | undefined,
) => {
  if (!value) return true;
  if (!value[0] && !value[1]) return true;

  const [start, end] = value;
  const dateValue = row.getValue(columnId);
  if (!dateValue) return false;

  const cellDate = new Date(dateValue as string);

  if (start && end) {
    const adjustedEnd = new Date(end);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate >= start && cellDate <= adjustedEnd;
  } else if (start) {
    return cellDate >= start;
  } else if (end) {
    const adjustedEnd = new Date(end);
    adjustedEnd.setHours(23, 59, 59, 999);
    return cellDate <= adjustedEnd;
  }

  return true;
};

// Add sharer filter function
const documentClassSharerFilterFn: FilterFn<DocumentClass> = (
  row,
  columnId,
  value: string[] | undefined,
) => {
  if (!value || value.length === 0) return true;

  const sharers = row.original.sharers ?? [];
  if (sharers.length === 0) return false;

  // Check if any of the row's sharers match the selected filter sharers
  return sharers.some((sharer) => value.includes(sharer.id.toString()));
};

interface GetColumnsProps {
  data: DocumentClass[];
  onRefreshData: () => void;
}

const getColumns = ({
  data,
  onRefreshData,
}: GetColumnsProps): ColumnDef<DocumentClass>[] => [
  {
    header: "",
    accessorKey: "logo_url",
    cell: ({ row }) => {
      const logoUrl = row.original.logo_url;
      const nome = row.original.nome;
      return (
        <div className="flex items-center justify-start">
          <Avatar className="h-12 w-9 rounded-md">
            <AvatarImage
              src={logoUrl ?? undefined}
              alt={`Cover for ${nome}`}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted rounded-md text-[10px] font-semibold">
              {nome.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: () => (
      <div className="flex items-center gap-2">
        <span>Nome</span>
      </div>
    ),
    accessorKey: "nome",
    cell: ({ row }) => (
      <div className="text-foreground font-medium">{row.getValue("nome")}</div>
    ),
    size: 200,
    enableHiding: false,
  },
  {
    header: "Descrizione",
    accessorKey: "descrizione",
    cell: ({ row }) => {
      const descrizione = row.getValue("descrizione");
      return (
        <div
          className="text-muted-foreground max-w-[250px] truncate font-normal"
          title={(descrizione as string) ?? ""}
        >
          {(descrizione as string) ?? "—"}
        </div>
      );
    },
    size: 250,
  },
  {
    header: ({ column }) => {
      const isFiltered = column.getIsFiltered();
      return (
        <div className="flex items-center gap-2">
          <span>Sharer</span>
          {isFiltered && (
            <div className="flex items-center gap-1">
              <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              <span className="text-primary text-xs font-medium">Filtrato</span>
            </div>
          )}
        </div>
      );
    },
    accessorKey: "sharers",
    cell: ({ row }) => {
      const sharers = row.original.sharers ?? [];
      if (sharers.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return <SharerAvatarGroup sharers={sharers} />;
    },
    size: 180,
    filterFn: "documentClassSharer",
  },
  {
    header: "Campi",
    accessorKey: "campi",
    cell: ({ row }) => {
      const campiArray = row.original.campi;
      const campiCount = campiArray?.length ?? 0;
      return (
        <div>
          <Badge
            variant={campiCount > 0 ? "default" : "secondary"}
            className="ring-secondary h-6 w-6 rounded-full text-xs text-white ring-2"
          >
            {campiCount}
          </Badge>
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
  {
    header: ({ column }) => {
      const isFiltered = column.getIsFiltered();
      return (
        <div className="flex items-center gap-2">
          <span>Creato</span>
          {isFiltered && (
            <div className="flex items-center gap-1">
              <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              <span className="text-primary text-xs font-medium">Filtrato</span>
            </div>
          )}
        </div>
      );
    },
    accessorKey: "created_at",
    cell: ({ row }) => {
      const dateValue: unknown = row.getValue("created_at");
      if (typeof dateValue === "string" && dateValue) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground cursor-default text-sm underline decoration-dotted underline-offset-2">
                  {format(new Date(dateValue), "d MMM yyyy", { locale: it })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatDynamicDate(dateValue)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <span className="text-muted-foreground text-sm">—</span>;
    },
    size: 140,
    filterFn: "documentClassDateRange",
  },
  {
    header: ({ column }) => {
      const isFiltered = column.getIsFiltered();
      return (
        <div className="flex items-center gap-2">
          <span>Aggiornato</span>
          {isFiltered && (
            <div className="flex items-center gap-1">
              <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              <span className="text-primary text-xs font-medium">Filtrato</span>
            </div>
          )}
        </div>
      );
    },
    accessorKey: "updated_at",
    cell: ({ row }) => {
      const dateValue: unknown = row.getValue("updated_at");
      if (typeof dateValue === "string" && dateValue) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-muted-foreground cursor-default text-sm underline decoration-dotted underline-offset-2">
                  {format(new Date(dateValue), "d MMM yyyy", { locale: it })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatDynamicDate(dateValue)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <span className="text-muted-foreground text-sm">—</span>;
    },
    size: 140,
    filterFn: "documentClassDateRange",
  },
  // {
  //   id: "actions",
  //   header: () => <span className="sr-only">Azioni</span>,
  //   cell: ({ row }) => (
  //     <RowActions documentClass={row.original} onRefreshData={onRefreshData} />
  //   ),
  //   size: 60,
  //   enableHiding: false,
  // },
];

interface DocumentClassiTableProps {
  data: DocumentClass[];
  isLoading: boolean;
  onRefreshData: () => void;
}

export default function DocumentClassiTable({
  data,
  isLoading,
  onRefreshData,
}: DocumentClassiTableProps) {
  const id = useId();
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [dateField, setDateField] = useState<"created_at" | "updated_at">(
    "created_at",
  );
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>();
  const [selectedSharers, setSelectedSharers] = useState<string[]>([]);

  const [rowSelection, setRowSelection] = useState({});

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nome",
      desc: false,
    },
  ]);

  const handleDeleteRows = useCallback(() => {
    toast.info("Funzione elimina selezionati non ancora implementata.");
    onRefreshData();
    table.resetRowSelection();
  }, [onRefreshData]);

  // Extract unique sharers from all document classes for filter options
  const availableSharers = useMemo(() => {
    const allSharers = data.flatMap((doc) => doc.sharers ?? []);
    const uniqueSharers = new Map<string, SharerOption>();

    allSharers.forEach((sharer) => {
      const key = sharer.id.toString();
      if (!uniqueSharers.has(key)) {
        uniqueSharers.set(key, {
          id: key,
          nominativo: sharer.nominativo,
          logo_url: sharer.logo_url,
        });
      }
    });

    return Array.from(uniqueSharers.values()).sort((a, b) =>
      a.nominativo.localeCompare(b.nominativo),
    );
  }, [data]);

  const columns = useMemo(
    () =>
      getColumns({
        data,
        onRefreshData,
      }),
    [data, onRefreshData],
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    filterFns: {
      documentClassDateRange: documentClassDateRangeFilterFn,
      documentClassSharer: documentClassSharerFilterFn,
      dateRange: (row, id, value) => true,
      activeStatus: (row, id, value) => true,
    },
  });

  useEffect(() => {
    table.getColumn("created_at")?.setFilterValue(undefined);
    table.getColumn("updated_at")?.setFilterValue(undefined);

    if (dateRange) {
      table.getColumn(dateField)?.setFilterValue(dateRange);
    }
  }, [dateRange, dateField, table]);

  useEffect(() => {
    table
      .getColumn("sharers")
      ?.setFilterValue(
        selectedSharers.length > 0 ? selectedSharers : undefined,
      );
  }, [selectedSharers, table]);

  const availableDateFields: DateField[] = [
    { value: "created_at", label: "Data di creazione" },
    { value: "updated_at", label: "Data di aggiornamento" },
  ];

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
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "bg-background border-muted/30 focus:ring-primary/20 h-10 w-full rounded-full border pl-9 text-base shadow-sm transition-all focus:ring-2 sm:w-72",
                  Boolean(globalFilter) && "pr-9",
                )}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Cerca per nome, descrizione, sharer"
                type="text"
                aria-label="Cerca classi documentali"
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
            <SharerFilter
              selectedSharers={selectedSharers}
              onSelectedSharersChange={setSelectedSharers}
              availableSharers={availableSharers}
            />
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
                  className="border-muted/30 hover:border-primary/40 rounded-full"
                  aria-label="Mostra/nascondi colonne"
                >
                  <FilterVertical className="text-muted-foreground/80 size-4" />
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
                        Stai per eliminare {numSelected} class
                        {numSelected === 1 ? "e" : "i"} documentale
                        {numSelected === 1 ? "" : "i"}. Questa azione non può
                        essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          // Handle deletion of selected rows
                          console.log("Deleting selected rows:", selectedRows);
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
                    router.push(
                      `/dashboard/admin/classi-documentali/${row.original.id}`,
                    );
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
                        Nessuna classe documentale trovata
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

function RowActions({
  documentClass,
  onRefreshData,
}: {
  documentClass: DocumentClass;
  onRefreshData: () => void;
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
        toast.success(
          `Classe documentale "${documentClass.nome}" eliminata (simulato).`,
        );
        onRefreshData();
      } catch (error) {
        console.error("Failed to delete document class:", error);
        toast.error("Impossibile eliminare la classe documentale.");
      }
      resetDialogStates();
    });
  }, [documentClass.nome, onRefreshData, resetDialogStates]);

  const handleEdit = useCallback(() => {
    toast.info(`Modifica per "${documentClass.nome}" non ancora implementata.`);
    resetDialogStates();
  }, [documentClass.nome, resetDialogStates]);

  const handleCopyName = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(documentClass.nome);
        toast.success("Nome classe copiato!");
        resetDialogStates();
      } catch (error) {
        console.error("Failed to copy name:", error);
        toast.error("Impossibile copiare il nome");
      }
    },
    [documentClass.nome, resetDialogStates],
  );

  const handleView = useCallback(() => {
    toast.info(
      `Visualizzazione per "${documentClass.nome}" non ancora implementata.`,
    );
    resetDialogStates();
  }, [documentClass.nome, resetDialogStates]);

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
            <DropdownMenuItem onClick={handleView} disabled={isUpdatePending}>
              <RiEyeLine size={16} className="mr-2" />
              Visualizza
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} disabled={isUpdatePending}>
              <PencilEdit className="mr-2" />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopyName}
              disabled={isUpdatePending}
            >
              <CopyIcon className="mr-2" />
              Copia Nome
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
              <RiErrorWarningLine className="text-destructive size-5" />
            </div>
            <div className="space-y-2">
              <AlertDialogHeader>
                <AlertDialogTitle>Elimina classe documentale</AlertDialogTitle>
                <AlertDialogDescription>
                  Stai per eliminare la classe documentale &quot;
                  {documentClass.nome}&quot;. Questa azione non può essere
                  annullata.
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

// Declare custom filter functions for DocumentClass
declare module "@tanstack/react-table" {
  interface FilterFns {
    dateRange: FilterFn<Sharer | Viewer>;
    activeStatus: FilterFn<Sharer | Viewer>;
    documentClassDateRange: FilterFn<DocumentClass>;
    documentClassSharer: FilterFn<DocumentClass>;
  }
}

// SharerAvatarGroup: Animated, modern avatar group for sharers, matching user-presence-avatar.tsx style
function SharerAvatarGroup({ sharers }: { sharers: Sharer[] }) {
  // Show up to 3 avatars, stack them, and show a "+N" badge if more
  const maxVisible = 3;
  const visibleSharers = sharers.slice(0, maxVisible);
  const extraCount = sharers.length - maxVisible;

  // Helper to get up to 2 initials, fallback to '?'
  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) {
      // If only one part, take up to 2 letters
      return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
    }
    // If two or more parts, take the first letter of the first two parts
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const initials = (first + second).toUpperCase();
    return initials || "?";
  };

  return (
    <div className="flex items-center">
      {/* Animated avatar group container with improved contrast */}
      <div className="flex rounded-full bg-neutral-200/80 p-0.5 dark:bg-neutral-800/80">
        <AvatarGroup
          className="h-7 -space-x-2"
          tooltipProps={{ side: "top", sideOffset: 16 }}
        >
          {visibleSharers.map((sharer, idx) => (
            <Avatar
              key={sharer.nominativo + idx}
              className="size-7 border-2 border-neutral-200/80 shadow-sm dark:border-neutral-800/80"
            >
              <AvatarImage src={sharer.logo_url} alt={sharer.nominativo} />
              <AvatarFallback className="text-foreground/90 bg-neutral-100 text-[10px] font-semibold dark:bg-neutral-700">
                {getInitials(sharer.nominativo)}
              </AvatarFallback>
              <AvatarGroupTooltip>
                <span className="text-white">{sharer.nominativo}</span>
              </AvatarGroupTooltip>
            </Avatar>
          ))}
        </AvatarGroup>
        {extraCount > 0 && (
          <div
            className="text-foreground/90 ml-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-200/80 bg-neutral-100 text-[10px] font-semibold shadow-sm dark:border-neutral-800/80 dark:bg-neutral-700"
            title={`+${extraCount} altri`}
            aria-label={`+${extraCount} altri`}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
}
