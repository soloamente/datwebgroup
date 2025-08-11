"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2Icon } from "lucide-react";
import type { Sharer } from "@/app/api/api";

interface AssociatedSharersTableProps {
  sharers: Sharer[];
  isLoading?: boolean;
  onRemove: (sharerId: number) => void;
}

export function AssociatedSharersTable({
  sharers,
  isLoading = false,
  onRemove,
}: AssociatedSharersTableProps) {
  const columns = useMemo<ColumnDef<Sharer>[]>(() => {
    return [
      {
        header: "Nome",
        accessorKey: "nominativo",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center gap-2 font-medium">
              <Avatar className="h-8 w-8">
                <AvatarImage src={s.logo_url} alt={s.nominativo} />
                <AvatarFallback className="text-sm">
                  {s.nominativo
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>{s.nominativo}</span>
            </div>
          );
        },
        size: 240,
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (
          <span className="text-muted-foreground block truncate lowercase">
            {row.original.email}
          </span>
        ),
        size: 240,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Azioni</div>,
        cell: ({ row }) => (
          <div className="flex w-full items-center justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(row.original.id);
              }}
              aria-label={`Rimuovi ${row.original.nominativo}`}
              title={`Rimuovi ${row.original.nominativo} dalla classe documentale`}
            >
              Elimina
            </Button>
          </div>
        ),
        size: 100,
        enableHiding: false,
      },
    ];
  }, [onRemove]);

  const table = useReactTable({
    data: sharers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSortingRemoval: false,
  });

  return (
    <div className="ring-border isolate overflow-hidden rounded-2xl ring-1">
      <Table className="bg-muted/30 min-w-full border-separate border-spacing-0">
        <TableHeader className="sticky top-0 z-10 text-sm [&_tr]:border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header, idx) => (
                <TableHead
                  key={header.id}
                  style={{ width: `${header.getSize()}px` }}
                  className={cn(
                    "text-muted-foreground overflow-hidden px-5 text-left align-middle",
                    idx === 0 && "rounded-tl-2xl rounded-bl-2xl",
                    idx === headerGroup.headers.length - 1 &&
                      "rounded-tr-2xl rounded-br-2xl",
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              )),
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:bg-card ring-border rounded-lg ring-1">
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-40 rounded-lg text-center align-middle"
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
                className="border-border group h-16 border-b transition-colors last:border-b-0"
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "group-hover:bg-muted/10 group-hover:text-foreground max-w-xs truncate px-5 py-4 align-middle text-base transition-colors",
                      rowIndex === 0 &&
                        cellIndex === 0 &&
                        "overflow-hidden rounded-tl-2xl",
                      rowIndex === 0 &&
                        cellIndex === row.getVisibleCells().length - 1 &&
                        "overflow-hidden rounded-tr-2xl",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  <svg
                    width="40"
                    height="40"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="text-muted-foreground/40"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 15c.667-1 2-3 4-3s3.333 2 4 3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="9" cy="10" r="1" fill="currentColor" />
                    <circle cx="15" cy="10" r="1" fill="currentColor" />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-base">
                      Nessun utente associato
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* No pagination for associated sharers */}
    </div>
  );
}
