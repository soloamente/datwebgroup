"use client";

import { useParams, useRouter } from "next/navigation";
import { useBatchStore } from "@/store/batch-store";
import { BatchDetailsView } from "@/components/dashboard/detail-page-components/batch-details-view";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDynamicDate } from "@/lib/date-format";
import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiUserAddLine,
} from "@remixicon/react";
import { Card, CardContent } from "@/components/ui/card";
import { Stack } from "@/components/ui/stack";
import { getSharedBatchById, type DocumentClassDetails } from "@/app/api/api";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { AddViewerToBatchDialog } from "@/components/dashboard/add-viewer-to-batch-dialog";

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = Number(params.batchId);
  const slug = params.slug as string;

  // Attempt to get data from the store first
  const storeBatch =
    useBatchStore((state) => state.getBatchById(batchId)) ?? null;
  const storeDocumentClass = useBatchStore((state) => state.documentClass);

  const [batch, setBatch] = useState<EnrichedDocument | null>(storeBatch);
  const [documentClass, setDocumentClass] =
    useState<DocumentClassDetails | null>(storeDocumentClass);
  const [isLoading, setIsLoading] = useState(!storeBatch);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetails = useCallback(async () => {
    if (!batchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSharedBatchById(batchId);
      setBatch(data as unknown as EnrichedDocument);
      setDocumentClass(data.document_class);
    } catch (err) {
      setError(
        "Impossibile caricare i dettagli del batch. Potrebbe non esistere o potresti non avere i permessi per visualizzarlo.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  // Handle cases where the store might not be hydrated or on page refresh
  useEffect(() => {
    if (storeBatch && storeDocumentClass) {
      setBatch(storeBatch);
      setDocumentClass(storeDocumentClass);
      setIsLoading(false);
      return;
    }
    void fetchBatchDetails();
  }, [batchId, storeBatch, storeDocumentClass, fetchBatchDetails]);

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
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <RiArrowLeftLine className="mr-2" />
          Torna alla lista
        </Button>
        <AddViewerToBatchDialog
          batchId={batchId}
          onViewerAdded={fetchBatchDetails}
        >
          <Button variant="default">
            <RiUserAddLine className="mr-2" />
            Aggiungi Destinatario
          </Button>
        </AddViewerToBatchDialog>
      </div>
      <div className="bg-card text-card-foreground rounded-lg border p-6">
        <div className="mb-6">
          <Stack direction="row" gap={2} align="center" justify="start">
            <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
              {documentClass.name} -
            </h1>

            <h2 className="text-3xl font-bold tracking-tight">{batch.title}</h2>
          </Stack>
          <p className="text-muted-foreground flex items-center gap-2">
            Dettagli del batch di condivisione inviato il{" "}
            {formatDynamicDate(batch.sent_at)}.
            <Badge variant={batch.status === "sent" ? "default" : "secondary"}>
              {batch.status}
            </Badge>
          </p>
        </div>
        <BatchDetailsView batch={batch} docClassDetails={documentClass} />
      </div>
    </div>
  );
}
