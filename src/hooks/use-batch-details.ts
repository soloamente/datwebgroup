"use client";

import { getSharedBatchById, type DocumentClassDetails } from "@/app/api/api";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { useCallback, useEffect, useState } from "react";

export function useBatchDetails(batchId: number | null) {
  const [data, setData] = useState<{
    batch: EnrichedDocument | null;
    documentClass: DocumentClassDetails | null;
  }>({ batch: null, documentClass: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetails = useCallback(async () => {
    if (!batchId || Number.isNaN(batchId)) {
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
    if (batchId) {
      void fetchBatchDetails();
    }
  }, [batchId, fetchBatchDetails]);

  return { ...data, isLoading, error, refetch: fetchBatchDetails };
}
