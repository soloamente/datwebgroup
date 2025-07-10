"use client";

import { type Viewer } from "@/app/api/api";
import { CreateViewerDialog } from "@/components/create-viewer-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/kamui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Search, UserPlus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

interface ClientSelectorProps {
  viewers: Viewer[];
  selectedClients: Viewer[];
  onClientSelect: (client: Viewer) => void;
  onRemoveClient: (clientId: number) => void;
  onViewerCreated: () => void;
}

export function ClientSelector({
  viewers,
  selectedClients,
  onClientSelect,
  onRemoveClient,
  onViewerCreated,
}: ClientSelectorProps) {
  const [clientSearch, setClientSearch] = useState("");
  const [isCreateViewerDialogOpen, setIsCreateViewerDialogOpen] =
    useState(false);

  const filteredClients = useMemo(
    () =>
      viewers.filter(
        (client) =>
          client.nominativo
            .toLowerCase()
            .includes(clientSearch.toLowerCase()) &&
          !selectedClients.some((sc) => sc.id === client.id),
      ),
    [clientSearch, selectedClients, viewers],
  );

  const handleViewerCreated = () => {
    setIsCreateViewerDialogOpen(false);
    onViewerCreated();
  };

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Destinatari</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex-shrink-0">
            <Input
              placeholder="Cerca cliente..."
              className="rounded-full"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              startContent={<Search className="h-4 w-4" />}
              endContent={
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setIsCreateViewerDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 rounded-full" />
                </Button>
              }
              wrapperClassName="w-full"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onClientSelect(client)}
                  className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {client.nominativo}
                  </span>
                  <PlusCircle className="text-muted-foreground h-4 w-4" />
                </div>
              ))}
              {filteredClients.length === 0 && clientSearch && (
                <p className="text-muted-foreground p-2 text-center text-sm">
                  Nessun risultato.
                </p>
              )}
              {filteredClients.length === 0 && !clientSearch && (
                <p className="text-muted-foreground p-2 text-center text-sm">
                  Tutti i clienti sono stati selezionati o non ci sono clienti.
                </p>
              )}
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 space-y-2">
            <h3 className="text-muted-foreground text-sm font-medium">
              Clienti Selezionati ({selectedClients.length})
            </h3>
            <ScrollArea className="h-32">
              <div className="border-border flex min-h-[96px] flex-wrap content-start gap-2 rounded-lg border-2 border-dashed p-2">
                {selectedClients.length > 0 ? (
                  selectedClients.map((client) => (
                    <Badge
                      key={client.id}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 pr-1 pl-2"
                    >
                      <span className="text-sm">{client.nominativo}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveClient(client.id)}
                        aria-label={`Rimuovi ${client.nominativo}`}
                        className="h-5 w-5"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <div className="flex w-full items-center justify-center text-center">
                    <p className="text-muted-foreground text-sm">
                      Nessun cliente selezionato.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      <CreateViewerDialog
        isOpen={isCreateViewerDialogOpen}
        onClose={() => setIsCreateViewerDialogOpen(false)}
        onViewerCreated={handleViewerCreated}
      />
    </>
  );
}
