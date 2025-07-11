"use client";

import { useParams, useRouter } from "next/navigation";
import { BatchDetailsView } from "@/components/dashboard/detail-page-components/batch-details-view";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDynamicDate } from "@/lib/date-format";
import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiUserAddLine,
} from "@remixicon/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSharedBatchById, type DocumentClassDetails } from "@/app/api/api";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { AddViewerToBatchDialog } from "@/components/dashboard/add-viewer-to-batch-dialog";

// Custom hook for fetching batch details
function useBatchDetails(batchId: number) {
  const [data, setData] = useState<{
    batch: EnrichedDocument | null;
    documentClass: DocumentClassDetails | null;
  }>({ batch: null, documentClass: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetails = useCallback(async () => {
    if (!batchId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSharedBatchById(batchId);
      setData({
        batch: result as unknown as EnrichedDocument,
        documentClass: result.document_class,
      });
    } catch (err) {
      setError(
        "Impossibile caricare i dettagli del batch. Potrebbe non esistere o potresti non avere i permessi per visualizzarlo.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void fetchBatchDetails();
  }, [fetchBatchDetails]);

  return { ...data, isLoading, error, refetch: fetchBatchDetails };
}

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = Number(params.batchId);

  const { batch, documentClass, isLoading, error, refetch } =
    useBatchDetails(batchId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-36" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
            <div className="mt-8 space-y-8">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <RiErrorWarningLine className="text-destructive mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">Errore</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.back()}>
            <RiArrowLeftLine className="mr-2" />
            Torna indietro
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!batch || !documentClass) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <h2 className="mb-2 text-xl font-semibold">Batch non trovato</h2>
          <p className="text-muted-foreground mb-6">
            Il batch che stai cercando non è stato trovato o la sessione è
            scaduta.
          </p>
          <Button onClick={() => router.back()}>
            <RiArrowLeftLine className="mr-2" />
            Torna indietro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <RiArrowLeftLine className="mr-2" />
            Torna alla lista
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {documentClass.name}:{" "}
            <span className="text-muted-foreground">{batch.title}</span>
          </h1>
          <p className="text-muted-foreground">
            Dettagli del batch di condivisione inviato il{" "}
            {formatDynamicDate(batch.sent_at)}.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <AddViewerToBatchDialog batchId={batchId} onViewerAdded={refetch}>
            <Button className="text-white">
              <RiUserAddLine className="" />
              Aggiungi Destinatario
            </Button>
          </AddViewerToBatchDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column for details */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <BatchDetailsView batch={batch} docClassDetails={documentClass} />
            </CardContent>
          </Card>
        </div>

        {/* Right column for status and summary */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge
                  className="text-white"
                  variant={batch.status === "sent" ? "default" : "secondary"}
                >
                  {batch.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Questo batch è stato inviato e processato.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RiInformationLine className="mr-2" />
                Informazioni Riepilogative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documenti</span>
                <span>{batch.documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinatari</span>
                <span>{batch.viewers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Classe Documentale
                </span>
                <span className="text-right">{documentClass.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
