import { useState, useEffect } from "react";
import {
  getMyDocumentClasses,
  getSharedBatchesByDocumentClass,
  type SharedBatch,
  type ViewerInfo,
  type MyDocumentClass,
} from "@/app/api/api";

export interface RecentShare {
  batchId: number;
  documentClassId: number;
  documentClassName: string;
  title: string;
  sentAt: string;
  viewers: ViewerInfo[];
  totalFiles: number;
}

export interface RecentViewer {
  id: number;
  nominativo: string;
  email: string;
  lastSharedAt: string;
  documentClassName: string;
  totalShares: number;
  lastDocumentClassId: number;
  lastShareId: number;
}

export function useRecentShares(documentClassId: number | null = null) {
  const [recentShares, setRecentShares] = useState<RecentShare[]>([]);
  const [recentViewers, setRecentViewers] = useState<RecentViewer[]>([]);
  const [documentClasses, setDocumentClasses] = useState<MyDocumentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentClasses = async () => {
      try {
        const response = await getMyDocumentClasses();
        setDocumentClasses(response.data);
      } catch (err) {
        setError("Impossibile caricare le classi documentali.");
        console.error("Errore nel caricamento delle classi documentali:", err);
      }
    };
    void fetchDocumentClasses();
  }, []);

  useEffect(() => {
    if (documentClasses.length === 0) return;

    const fetchRecentShares = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const classesToFetch = documentClassId
          ? documentClasses.filter((dc) => dc.id === documentClassId)
          : documentClasses;

        const allShares: RecentShare[] = [];
        const viewerMap = new Map<
          number,
          {
            nominativo: string;
            email: string;
            lastSharedAt: string;
            documentClassName: string;
            totalShares: number;
            lastDocumentClassId: number;
            lastShareId: number;
          }
        >();

        for (const docClass of classesToFetch) {
          try {
            const batchesResponse = await getSharedBatchesByDocumentClass(
              docClass.id,
            );
            const batches = batchesResponse.data;

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentBatches = batches.filter(
              (batch) => new Date(batch.sent_at) >= thirtyDaysAgo,
            );

            recentBatches.forEach((batch) => {
              const totalFiles = batch.documents.reduce(
                (sum, doc) => sum + doc.files.length,
                0,
              );

              allShares.push({
                batchId: batch.id,
                documentClassId: docClass.id,
                documentClassName: docClass.name,
                title: batch.singular_name,
                sentAt: batch.sent_at,
                viewers: batch.viewers,
                totalFiles,
              });

              batch.viewers.forEach((viewer) => {
                const existing = viewerMap.get(viewer.id);
                if (
                  !existing ||
                  new Date(batch.sent_at) > new Date(existing.lastSharedAt)
                ) {
                  viewerMap.set(viewer.id, {
                    nominativo: viewer.nominativo,
                    email: viewer.email,
                    lastSharedAt: batch.sent_at,
                    documentClassName: docClass.name,
                    totalShares: (existing?.totalShares ?? 0) + 1,
                    lastDocumentClassId: docClass.id,
                    lastShareId: batch.id,
                  });
                } else if (existing) {
                  existing.totalShares += 1;
                }
              });
            });
          } catch (err) {
            console.error(
              `Errore nel caricamento dei batch per la classe ${docClass.name}:`,
              err,
            );
          }
        }

        allShares.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
        );

        const topRecentShares = allShares.slice(0, 20);

        const topRecentViewers = Array.from(viewerMap.entries())
          .map(([id, data]) => ({
            id,
            ...data,
          }))
          .sort(
            (a, b) =>
              new Date(b.lastSharedAt).getTime() -
              new Date(a.lastSharedAt).getTime(),
          )
          .slice(0, 10);

        setRecentShares(topRecentShares);
        setRecentViewers(topRecentViewers);
      } catch (err) {
        setError("Impossibile caricare i dati delle condivisioni recenti");
        console.error(
          "Errore nel caricamento delle condivisioni recenti:",
          err,
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRecentShares();
  }, [documentClassId, documentClasses]);

  return {
    recentShares,
    recentViewers,
    documentClasses,
    isLoading,
    error,
  };
}
