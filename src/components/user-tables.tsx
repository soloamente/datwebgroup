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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Sharer } from "@/app/api/api";
import { userService } from "@/app/api/api";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EditUserDialog } from "./edit-user-dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SendUsernameDialog } from "./send-username-dialog";

interface UserTablesProps {
  sharers: Sharer[];
  isLoading: boolean;
  onStatusChange: () => void;
}

export const columns = (
  onStatusToggle: (id: number, currentStatus: boolean) => void,
  onEditUser: (user: Sharer) => void,
  onChangePassword: (user: Sharer) => void,
  onSendUsername: (user: Sharer) => void,
): ColumnDef<Sharer>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
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
  {
    accessorKey: "role",
    header: "Ruolo",
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "active",
    header: "Stato",
    cell: ({ row }) => (
      <Badge variant={row.getValue("active") ? "default" : "destructive"}>
        {row.getValue("active") ? "Attivo" : "Inattivo"}
      </Badge>
    ),
  },
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
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const sharer = row.original;

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
              onClick={() => navigator.clipboard.writeText(sharer.email)}
            >
              Copia Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditUser(sharer)}>
              Modifica Utente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangePassword(sharer)}>
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendUsername(sharer)}>
              Invia Username
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusToggle(sharer.id, sharer.active)}
              className={cn(sharer.active && "text-red-600")}
            >
              {sharer.active ? "Disattiva Utente" : "Attiva Utente"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserTables({
  sharers,
  isLoading,
  onStatusChange,
}: UserTablesProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Sharer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [changingPasswordUser, setChangingPasswordUser] =
    useState<Sharer | null>(null);
  const [isSendUsernameDialogOpen, setIsSendUsernameDialogOpen] =
    useState(false);
  const [sendingUsernameUser, setSendingUsernameUser] = useState<Sharer | null>(
    null,
  );

  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const data = React.useMemo(
    () => (isLoading ? [] : sharers),
    [isLoading, sharers],
  );

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await userService.toggleSharerStatus(id);
      toast.success(response.message);
      onStatusChange();
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Failed to toggle sharer status:", error);
      toast.error(
        // eslint-disable-next-line
        error.response?.data?.error ??
          "Impossibile cambiare lo stato dello sharer.",
      );
    }
  };

  const handleEditUser = (user: Sharer) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const handleOpenChangePasswordDialog = (user: Sharer) => {
    setChangingPasswordUser(user);
    setIsChangePasswordDialogOpen(true);
  };

  const handleCloseChangePasswordDialog = () => {
    setIsChangePasswordDialogOpen(false);
    setChangingPasswordUser(null);
  };

  const handleOpenSendUsernameDialog = (user: Sharer) => {
    setSendingUsernameUser(user);
    setIsSendUsernameDialogOpen(true);
  };

  const handleCloseSendUsernameDialog = () => {
    setIsSendUsernameDialogOpen(false);
    setSendingUsernameUser(null);
  };

  const tableColumns = React.useMemo(
    () =>
      columns(
        // eslint-disable-next-line
        handleToggleStatus,
        handleEditUser,
        handleOpenChangePasswordDialog,
        handleOpenSendUsernameDialog,
      ),
    [handleToggleStatus],
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
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
                "peer min-w-80 pl-9",
                Boolean(table.getState().globalFilter) && "pr-9",
              )}
              // eslint-disable-next-line
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder="Cerca per username, nominativo o email..."
              type="text"
              aria-label="Cerca utenti"
            />
            {Boolean(table.getState().globalFilter) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-r-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Pulisci filtro"
                onClick={() => {
                  table.setGlobalFilter("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={handleOpenCreateDialog}>
          <Plus /> Crea Utente
        </Button>
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
                      className={cn(isUsernameHeader && "px-0")}
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
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} di{" "}
          {table.getFilteredRowModel().rows.length} righe selezionate.
        </div>
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
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        user={editingUser}
        onUserUpdate={() => {
          handleCloseEditDialog();
          onStatusChange();
        }}
      />
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onUserCreated={() => {
          handleCloseCreateDialog();
          onStatusChange();
        }}
      />
      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onClose={handleCloseChangePasswordDialog}
        user={changingPasswordUser}
      />
      <SendUsernameDialog
        isOpen={isSendUsernameDialogOpen}
        onClose={handleCloseSendUsernameDialog}
        user={sendingUsernameUser}
        onUsernameSent={() => {
          handleCloseSendUsernameDialog();
          toast.success("Username inviato con successo.");
        }}
      />
    </div>
  );
}
