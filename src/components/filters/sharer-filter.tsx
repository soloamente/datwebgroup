"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/animate-ui/base/checkbox";
import { RiUserLine, RiCloseLine, RiUserSearchLine } from "@remixicon/react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SharerOption {
  id: string;
  nominativo: string;
  logo_url?: string;
}

interface SharerFilterProps {
  selectedSharers: string[];
  onSelectedSharersChange: (sharers: string[]) => void;
  availableSharers: SharerOption[];
  className?: string;
}

export function SharerFilter({
  selectedSharers,
  onSelectedSharersChange,
  availableSharers,
  className,
}: SharerFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectedSharersChange([]);
  };

  // Filter sharers based on search query
  const filteredSharers = useMemo(() => {
    if (!searchQuery) return availableSharers;

    return availableSharers.filter((sharer) =>
      sharer.nominativo.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [availableSharers, searchQuery]);

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSharerToggle = (sharerId: string) => {
    const isSelected = selectedSharers.includes(sharerId);
    if (isSelected) {
      onSelectedSharersChange(selectedSharers.filter((id) => id !== sharerId));
    } else {
      onSelectedSharersChange([...selectedSharers, sharerId]);
    }
  };

  const clearAllFilters = () => {
    onSelectedSharersChange([]);
  };

  const selectedSharerNames = useMemo(() => {
    return availableSharers
      .filter((sharer) => selectedSharers.includes(sharer.id))
      .map((sharer) => sharer.nominativo);
  }, [availableSharers, selectedSharers]);

  const hasActiveFilter = selectedSharers.length > 0;

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "ring-border hover:ring-primary/40 bg-card rounded-full border-none ring-1 hover:ring-2",
              "flex items-center gap-2",
              hasActiveFilter && "ring-primary/60 bg-primary/5 ring-2",
            )}
            aria-label="Filtra per sharer"
            onClick={() => !open && setOpen(true)}
          >
            <RiUserSearchLine className="text-muted-foreground/80 size-4" />
            Utente
            {hasActiveFilter && (
              <>
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                >
                  {selectedSharers.length}
                </Badge>
                <span
                  role="button"
                  aria-label="Rimuovi filtro sharer"
                  onClick={handleClearClick}
                  className={cn(
                    "text-muted-foreground/60 hover:text-foreground hover:bg-muted -mr-1 ml-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                  )}
                >
                  <RiCloseLine size={14} />
                </span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 rounded-2xl p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Filtra per utente</h4>
                <p className="text-muted-foreground text-xs">
                  Seleziona uno o più utenti
                </p>
              </div>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-xs"
                >
                  Cancella
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Input
                id="sharer-search"
                placeholder="Cerca per nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card ring-border focus:ring-primary/40 h-9 rounded-full border-none ring-1 focus:ring-2"
              />
            </div>

            {/* Sharer List */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">
                  Utenti disponibili
                </Label>
                <Badge variant="outline" className="h-5 px-1.5 text-xs">
                  {filteredSharers.length}
                </Badge>
              </div>
              <div
                className="ring-border max-h-48 min-h-32 overflow-x-hidden overflow-y-auto rounded-lg border-none ring-1"
                style={{
                  scrollBehavior: "smooth",
                  overscrollBehavior: "contain",
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="space-y-1 p-1">
                  {filteredSharers.length === 0 ? (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      Nessuno sharer trovato
                    </div>
                  ) : (
                    filteredSharers.map((sharer) => (
                      <div
                        key={sharer.id}
                        className="hover:bg-muted/40 flex cursor-pointer items-center rounded-lg p-2 transition-colors"
                      >
                        <Checkbox
                          id={`sharer-${sharer.id}`}
                          checked={selectedSharers.includes(sharer.id)}
                          onCheckedChange={() => handleSharerToggle(sharer.id)}
                          className="ring-border size-4 cursor-pointer ring-1"
                        />
                        <Avatar className="ml-3 h-6 w-6">
                          <AvatarImage src={sharer.logo_url} />
                          <AvatarFallback
                            className="text-xs"
                            name={sharer.nominativo}
                          >
                            {sharer.nominativo.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={`sharer-${sharer.id}`}
                          className="grow cursor-pointer pl-3 text-sm font-normal"
                        >
                          {sharer.nominativo}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Selected Summary */}
            {hasActiveFilter && (
              <div className="border-muted/30 space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Selezionati</Label>
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {selectedSharers.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedSharerNames.map((name, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
