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
import { RiUserLine, RiCloseLine } from "@remixicon/react";
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
              "border-muted/30 hover:border-primary/40 rounded-full pr-2 pl-3",
              "flex items-center gap-1.5",
              hasActiveFilter && "border-primary/60 bg-primary/5",
            )}
            aria-label="Filtra per sharer"
            onClick={() => !open && setOpen(true)}
          >
            <RiUserLine className="text-muted-foreground/80 size-4" />
            Sharer
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
                <h4 className="text-sm font-semibold">Filtra per Sharer</h4>
                <p className="text-muted-foreground text-xs">
                  Seleziona uno o più sharer
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
              <Label htmlFor="sharer-search" className="text-xs font-medium">
                Cerca sharer
              </Label>
              <Input
                id="sharer-search"
                placeholder="Cerca per nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-full"
              />
            </div>

            {/* Sharer List */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">
                  Sharers disponibili
                </Label>
                <Badge variant="outline" className="h-5 px-1.5 text-xs">
                  {filteredSharers.length}
                </Badge>
              </div>
              <div
                className="border-muted/20 max-h-48 min-h-32 overflow-x-hidden overflow-y-auto rounded-lg border"
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
                        className="hover:bg-muted/40 flex items-center gap-3 rounded-lg p-2 transition-colors"
                      >
                        <Checkbox
                          id={`sharer-${sharer.id}`}
                          checked={selectedSharers.includes(sharer.id)}
                          onCheckedChange={() => handleSharerToggle(sharer.id)}
                          className="size-4"
                        />
                        <Avatar className="h-6 w-6">
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
                          className="grow cursor-pointer text-sm font-normal"
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
