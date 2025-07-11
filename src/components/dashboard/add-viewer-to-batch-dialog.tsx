"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getAvailableViewersForBatch,
  attachViewerToBatch,
  type ViewerInfo,
} from "@/app/api/api";
import { toast } from "sonner";
import {
  RiCheckLine,
  RiLoader4Line,
  RiUserSearchLine,
  RiUserAddLine,
  RiUserSmileLine,
} from "@remixicon/react";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddViewerToBatchDialogProps {
  batchId: number;
  onViewerAdded: () => void;
  children: React.ReactNode;
}

export function AddViewerToBatchDialog({
  batchId,
  onViewerAdded,
  children,
}: AddViewerToBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [availableViewers, setAvailableViewers] = useState<ViewerInfo[]>([]);
  const [selectedViewer, setSelectedViewer] = useState<ViewerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchViewers = async () => {
        setIsLoading(true);
        try {
          const response = await getAvailableViewersForBatch(batchId);
          setAvailableViewers(response.viewers);
        } catch (error) {
          toast.error("Impossibile caricare i destinatari disponibili.");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      void fetchViewers();
    }
  }, [open, batchId]);

  const handleAttachViewer = async () => {
    if (!selectedViewer) {
      toast.warning("Seleziona un destinatario da aggiungere.");
      return;
    }
    setIsAttaching(true);
    try {
      await attachViewerToBatch(batchId, selectedViewer.id);
      toast.success(
        `Destinatario "${selectedViewer.nominativo}" aggiunto con successo.`,
      );
      onViewerAdded();
      setOpen(false);
      setSelectedViewer(null);
    } catch (error) {
      toast.error("Errore durante l'aggiunta del destinatario.");
      console.error(error);
    } finally {
      setIsAttaching(false);
    }
  };

  const selectedViewerDisplay = useMemo(() => {
    if (!selectedViewer) return "Seleziona un destinatario...";
    return `${selectedViewer.nominativo} (${selectedViewer.email})`;
  }, [selectedViewer]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Destinatario</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Seleziona un utente da associare a questo batch. Gli utenti già
            inclusi non verranno mostrati.
          </p>
        </DialogHeader>
        <div className="py-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between"
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  {selectedViewer ? (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {selectedViewer.nominativo.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <RiUserSearchLine className="text-muted-foreground h-5 w-5" />
                  )}
                  <span className="truncate">{selectedViewerDisplay}</span>
                </div>

                {isLoading ? (
                  <RiLoader4Line className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[100] w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Cerca per nome, email o CF..." />
                <CommandList
                  className="max-h-60 overflow-y-auto"
                  onWheel={(e) => {
                    e.currentTarget.scrollTop += e.deltaY;
                  }}
                >
                  {isLoading ? (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 p-4 text-sm">
                      <RiLoader4Line className="h-4 w-4 animate-spin" />
                      <span>Caricamento destinatari...</span>
                    </div>
                  ) : availableViewers.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 p-4 text-center text-sm">
                      <RiUserSmileLine className="h-8 w-8" />
                      <span>Nessun nuovo destinatario disponibile.</span>
                    </div>
                  ) : (
                    <CommandGroup>
                      {availableViewers.map((viewer) => (
                        <CommandItem
                          key={viewer.id}
                          value={`${viewer.nominativo} ${viewer.email} ${
                            viewer.codice_fiscale ?? ""
                          }`}
                          onSelect={() => {
                            setSelectedViewer(viewer);
                            setPopoverOpen(false);
                          }}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {viewer.nominativo.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="font-medium">{viewer.nominativo}</p>
                            <p className="text-muted-foreground text-sm">
                              {viewer.email}
                            </p>
                          </div>
                          <RiCheckLine
                            className={`ml-auto h-4 w-4 ${
                              selectedViewer?.id === viewer.id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annulla</Button>
          </DialogClose>
          <Button
            onClick={handleAttachViewer}
            disabled={!selectedViewer || isAttaching}
          >
            {isAttaching ? (
              <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RiUserAddLine className="mr-2 h-4 w-4" />
            )}
            Aggiungi Destinatario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
