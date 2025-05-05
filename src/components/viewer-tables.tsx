"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  CircleXIcon,
  ListFilterIcon,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge"; // Removed as 'active' status is not in Viewer
import { Skeleton } from "@/components/ui/skeleton";
import { type Viewer, userService } from "@/app/api/api"; // Changed from Sharer, added userService back
// import { userService } from "@/app/services/api"; // Removed as no user service actions are needed yet
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Added back
import { EditViewerDialog } from "./edit-viewer-dialog"; // Added back
import { CreateViewerDialog } from "./create-viewer-dialog"; // Add import for CreateViewerDialog

interface ViewerTablesProps {
  // Renamed from UserTablesProps
  viewers: Viewer[]; // Changed from Sharer
  isLoading: boolean;
  onViewerUpdate: () => void; // Added prop to refresh data
}

export const columns = (
  // onStatusToggle: (id: number, currentStatus: boolean) => void, // Removed
  onEditViewer: (viewer: Viewer) => void, // Added back for edit
): ColumnDef<Viewer>[] => [
  // Changed from Sharer
  // Removed select column for now, can be added back if needed
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="flex justify-center">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex justify-center">
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     </div>
  //   ),
  //   enableSorting: true,
  //   enableHiding: true,
  // },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="m-0 h-full justify-start p-0"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // eslint-disable-next-line
    cell: ({ row }) => row.getValue("username"),
  },
  {
    accessorKey: "nominativo",
    header: "Nominativo",
    cell: ({ row }) => <div>{row.getValue("nominativo")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="lowercase">{row.getValue("email")}</span>
    ),
  },
  // Role might be constant ("viewer"), skipping for now
  // {
  //   accessorKey: "role",
  //   header: "Ruolo",
  //   cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  // },
  // Viewer doesn't have 'active' status in the provided API response
  // {
  //   accessorKey: "active",
  //   header: "Stato",
  //   cell: ({ row }) => (
  //     <Badge variant={row.getValue("active") ? "default" : "destructive"}>
  //       {row.getValue("active") ? "Attivo" : "Inattivo"}
  //     </Badge>
  //   ),
  // },
  {
    accessorKey: "created_at",
    header: "Creato il",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: "Aggiornato il",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      const formattedDate = date.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return <div>{formattedDate}</div>;
    },
  },
  // Added actions column back
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const viewer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(viewer.email)}
            >
              Copia Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditViewer(viewer)}>
              Modifica Viewer
            </DropdownMenuItem>
            {/* Add other viewer-specific actions here if needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ViewerTables({
  // Renamed from UserTables
  viewers, // Changed from sharers
  isLoading,
  // onStatusChange, // Removed
  onViewerUpdate, // Added
}: ViewerTablesProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  // Removed row selection state as select column is removed
  // const [rowSelection, setRowSelection] = React.useState({});
  // Added editing state back
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingViewer, setEditingViewer] = useState<Viewer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // Add state for create dialog

  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const data = React.useMemo(
    () => (isLoading ? [] : viewers), // Changed from sharers
    [isLoading, viewers], // Changed from sharers
  );

  // Removed handler functions for status toggle and editing
  // const handleToggleStatus = async (id: number, currentStatus: boolean) => { ... };
  // const handleEditUser = (user: Viewer) => { ... };
  // const handleCloseEditDialog = () => { ... };

  // Added handlers for editing
  const handleEditViewer = (viewer: Viewer) => {
    setEditingViewer(viewer);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingViewer(null);
  };

  // Add handlers for creating
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const tableColumns = React.useMemo(
    () => columns(handleEditViewer), // Pass handler
    [], // Dependencies might need updating if handlers change based on external state
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    // onRowSelectionChange: setRowSelection, // Removed
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      // rowSelection, // Removed
    },
    // Disable row selection
    enableRowSelection: false,
  });

  const skeletonRows = Array(5)
    .fill(0)
    .map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {tableColumns.map((column) => (
          <TableCell key={column.id ?? `skeleton-cell-${i}-${Math.random()}`}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col flex-wrap items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <ListFilterIcon
                size={16}
                aria-hidden="true"
                className="text-muted-foreground"
              />
            </div>
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 pl-9",
                Boolean(table.getColumn("username")?.getFilterValue()) &&
                  "pr-9",
              )}
              value={
                (table.getColumn("username")?.getFilterValue() ?? "") as string
              }
              onChange={(e) =>
                table.getColumn("username")?.setFilterValue(e.target.value)
              }
              placeholder="Filtra per username..." // Kept placeholder
              type="text"
              aria-label="Filtra per username"
            />
            {Boolean(table.getColumn("username")?.getFilterValue()) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-r-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("username")?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenCreateDialog} // Update onClick to open create dialog
          >
            <Plus />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto flex items-center">
              Colonne <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isUsernameHeader = header.id === "username";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(isUsernameHeader && "px-0")} // Kept username padding adjustment
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRows
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  // data-state={row.getIsSelected() && "selected"} // Removed selection state
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
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  Nessun risultato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* Removed selected row count */}
        {/* <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} di{" "}
          {table.getFilteredRowModel().rows.length} righe selezionate.
        </div> */}
        <div className="flex-1"></div> {/* Added spacer */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Precedente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Successivo
          </Button>
        </div>
      </div>
      {/* Removed EditUserDialog */}
      {/* <EditUserDialog ... /> */}
      {/* Added EditViewerDialog */}
      <EditViewerDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        viewer={editingViewer}
        onViewerUpdate={() => {
          handleCloseEditDialog();
          onViewerUpdate(); // Call the prop to refresh data
        }}
      />
      {/* Add CreateViewerDialog */}
      <CreateViewerDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onViewerCreated={() => {
          handleCloseCreateDialog();
          onViewerUpdate(); // Refresh data after creation
        }}
      />
    </div>
  );
}
