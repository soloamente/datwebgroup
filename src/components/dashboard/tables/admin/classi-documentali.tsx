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
  RiMoreLine,
  RiCalendarLine,
  RiFileTextLine,
  RiUserLine,
  RiEyeLine,
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
    row.original.sharer?.nominativo ?? "",
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

interface GetColumnsProps {
  data: DocumentClass[];
  onRefreshData: () => void;
}

const getColumns = ({
  data,
  onRefreshData,
}: GetColumnsProps): ColumnDef<DocumentClass>[] => [
  {
    header: () => (
      <div className="flex items-center gap-2">
        <RiFileTextLine size={16} className="text-muted-foreground" />
        <span>Nome Classe</span>
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
    header: () => (
      <div className="flex items-center gap-2">
        <RiUserLine size={16} className="text-muted-foreground" />
        <span>Sharer</span>
      </div>
    ),
    accessorKey: "sharer.nominativo",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.sharer?.nominativo ?? "—"}
      </div>
    ),
    size: 180,
  },
  {
    header: "Campi",
    accessorKey: "campi",
    cell: ({ row }) => {
      const campiArray = row.original.campi;
      const campiCount = campiArray?.length ?? 0;
      return (
        <div className="text-center">
          <Badge
            variant={campiCount > 0 ? "default" : "secondary"}
            className="text-xs"
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
    header: "Creato",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at");
      if (typeof dateValue !== "string")
        return <span className="text-muted-foreground">—</span>;
      const date = new Date(dateValue);
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span className="text-muted-foreground text-sm">{formattedDate}</span>
      );
    },
    size: 140,
    filterFn: "documentClassDateRange",
  },
  {
    header: "Aggiornato",
    accessorKey: "updated_at",
    cell: ({ row }) => {
      const dateValue = row.getValue("updated_at");
      if (typeof dateValue !== "string")
        return <span className="text-muted-foreground">—</span>;
      const date = new Date(dateValue);
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span className="text-muted-foreground text-sm">{formattedDate}</span>
      );
    },
    size: 140,
    filterFn: "documentClassDateRange",
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Azioni</span>,
    cell: ({ row }) => (
      <RowActions documentClass={row.original} onRefreshData={onRefreshData} />
    ),
    size: 60,
    enableHiding: false,
  },
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
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

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
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    filterFns: {
      documentClassDateRange: documentClassDateRangeFilterFn,
      dateRange: (row, id, value) => true,
      activeStatus: (row, id, value) => true,
    },
  });

  useEffect(() => {
    if (dateRange[0] ?? dateRange[1]) {
      table.getColumn(dateField)?.setFilterValue(dateRange);
    } else {
      table.getColumn(dateField)?.setFilterValue(undefined);
    }
  }, [dateRange, dateField, table]);

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

  const resetFilters = useCallback(() => {
    setGlobalFilter("");
    setDateRange([undefined, undefined]);
    table.resetColumnFilters();
    table.resetGlobalFilter();
  }, [table]);

  const hasActiveFilters = globalFilter ?? dateRange[0] ?? dateRange[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Classi Documentali
          </h2>
          <p className="text-muted-foreground text-sm">
            Gestisci le classi documentali del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left side - Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "bg-background w-80 pl-9",
                  Boolean(globalFilter) && "pr-9",
                )}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Cerca per nome, descrizione o sharer..."
                type="text"
                aria-label="Cerca classi documentali"
              />
              <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
                <RiSearch2Line size={16} aria-hidden="true" />
              </div>
              {Boolean(globalFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 px-3 py-0 hover:bg-transparent"
                  onClick={() => {
                    setGlobalFilter("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Cancella ricerca"
                >
                  <RiCloseCircleLine size={14} />
                </Button>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground"
              >
                Reimposta filtri
              </Button>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Date filter */}
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <RiCalendarLine size={16} className="mr-2" />
                  {getDateFilterDisplay()}
                  {(dateRange[0] ?? dateRange[1]) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 px-1 text-xs"
                    >
                      {dateRange[0] && dateRange[1] ? "2" : "1"}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase">
                      Campo Data
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          dateField === "created_at" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDateField("created_at")}
                        className="text-xs"
                      >
                        Creazione
                      </Button>
                      <Button
                        variant={
                          dateField === "updated_at" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDateField("updated_at")}
                        className="text-xs"
                      >
                        Aggiornamento
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase">
                      Periodo
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground mb-1 text-xs">
                          Da
                        </Label>
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
                        <Label className="text-muted-foreground mb-1 text-xs">
                          A
                        </Label>
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
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between border-t pt-2">
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
                    <Button size="sm" onClick={() => setDateFilterOpen(false)}>
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
          <div className="flex items-center gap-3">
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
                <div className="flex items-start gap-4">
                  <div className="border-destructive/20 bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full border">
                    <RiErrorWarningLine className="text-destructive size-5" />
                  </div>
                  <div className="space-y-2">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                      <AlertDialogDescription>
                        Stai per eliminare{" "}
                        {table.getSelectedRowModel().rows.length}{" "}
                        {table.getSelectedRowModel().rows.length === 1
                          ? "classe documentale"
                          : "classi documentali"}
                        . Questa azione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRows}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="text-muted-foreground h-12 px-4 text-left align-middle font-medium"
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
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-muted-foreground">
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
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push(
                      `/dashboard/admin/classi-documentali/${row.original.id}`,
                    );
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
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
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <RiFileTextLine
                      size={32}
                      className="text-muted-foreground/50"
                    />
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        Nessuna classe documentale trovata
                      </p>
                      {hasActiveFilters && (
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

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              Mostra{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              -{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              di {table.getFilteredRowModel().rows.length} risultati
            </span>
          </div>
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Precedente
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
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
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
  }
}
