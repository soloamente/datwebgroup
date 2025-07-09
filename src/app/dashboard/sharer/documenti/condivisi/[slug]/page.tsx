"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { type DateRange as DayPickerDateRange } from "react-day-picker";
import {
  getSharedBatchesByDocumentClass,
  type GetSharedBatchesResponse,
  type SharedBatch,
  type SharedDocument,
  type DocumentClassDetails,
  type ViewerInfo,
  getMyDocumentClasses,
  type GetMyDocumentClassesResponse,
  type MyDocumentClass,
} from "@/app/api/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SharedDocumentsTable,
  type EnrichedDocument,
} from "@/components/dashboard/tables/sharer/shared-documents-table";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Button } from "@/components/ui/button";
import { FileText, Package, Users, Paperclip, Plus } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBatchStore } from "@/store/batch-store";
import Link from "next/link";

// Helper type for documents enriched with batch data - REMOVED, NOW IMPORTED

const unslugify = (slug: string) => {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const slugify = (text: string) => {
  if (!text) return "";
  return text.toLowerCase().replace(/\s+/g, "-");
};

export default function DocumentClassPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [docClassName, setDocClassName] = useState("");
  const [allDocuments, setAllDocuments] = useState<EnrichedDocument[]>([]);
  const [docClassDetails, setDocClassDetails] =
    useState<DocumentClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>(
    undefined,
  );
  const [dateField, setDateField] = useState<string>("sent_at");
  const [selectedViewers, setSelectedViewers] = useState<string[]>([]);
  const [dynamicColumnFilters, setDynamicColumnFilters] = useState<
    Record<string, string | string[] | undefined>
  >({});

  const setBatches = useBatchStore((state) => state.setBatches);

  useEffect(() => {
    if (slug) {
      const unslugifiedName = unslugify(slug);
      setDocClassName(unslugifiedName);

      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const myDocClassesResponse: GetMyDocumentClassesResponse =
            await getMyDocumentClasses();
          const myDocClasses: MyDocumentClass[] = myDocClassesResponse.data;

          const targetDocClass = myDocClasses.find(
            (docClass) => slugify(docClass.name) === slug,
          );

          if (targetDocClass) {
            const documentClassId = targetDocClass.id;
            const response: GetSharedBatchesResponse =
              await getSharedBatchesByDocumentClass(documentClassId);

            const enrichedData: EnrichedDocument[] = response.data.map(
              (batch: SharedBatch) => ({
                id: batch.id,
                batchId: batch.id,
                title: batch.title,
                status: batch.status,
                sent_at: batch.sent_at,
                viewers: batch.viewers,
                documents: batch.documents,
                // Add dummy properties to satisfy SharedDocument type
                metadata: {},
                files: [],
              }),
            );

            setAllDocuments(enrichedData);
            setDocClassDetails(response.document_class);
            setBatches(enrichedData, response.document_class);
            setDocClassName(response.document_class.name);
          } else {
            setError(`Classe documentale "${unslugifiedName}" non trovata.`);
          }
        } catch (err) {
          setError("Impossibile caricare i dati dei documenti.");
          if (err instanceof Error) {
            console.error(`Error fetching document data: ${err.message}`);
          } else {
            console.error("An unknown error occurred:", err);
          }
        } finally {
          setIsLoading(false);
        }
      };
      void fetchData();
    } else {
      setIsLoading(false);
      setError("Impossibile determinare la classe documentale dall'URL.");
    }
  }, [slug, setBatches]);

  const pageTitle = useMemo(
    () => (docClassName ? docClassName : "Caricamento..."),
    [docClassName],
  );

  const pageDescription = useMemo(
    () =>
      docClassDetails
        ? `Visualizza i documenti condivisi per la classe "${docClassDetails.name}".`
        : "Recupero dei dettagli della classe documentale.",
    [docClassDetails],
  );

  const canRenderTable = !isLoading && docClassDetails;

  const stats = useMemo(() => {
    if (isLoading || error || !allDocuments || allDocuments.length === 0) {
      return {
        totalDocs: 0,
        totalBatches: 0,
        totalViewers: 0,
        totalFiles: 0,
      };
    }
    const uniqueViewers = new Set(
      // eslint-disable-next-line
      allDocuments.flatMap((doc) => doc.viewers.map((v: ViewerInfo) => v.id)),
    );
    // eslint-disable-next-line
    const totalFiles = allDocuments.reduce(
      // eslint-disable-next-line
      (acc, doc) => acc + doc.files.length,
      0,
    );
    return {
      totalDocs: allDocuments.length,
      // eslint-disable-next-line
      totalBatches: new Set(allDocuments.map((d) => d.batchId)).size,
      totalViewers: uniqueViewers.size,
      // eslint-disable-next-line
      totalFiles,
    };
  }, [allDocuments, isLoading, error]);

  const handleCreateNew = () => {
    toast.info("Funzionalità per creare una nuova condivisione in arrivo!");
  };

  const filters = useMemo(
    () => ({
      globalFilter,
      dateRange,
      dateField,
      selectedViewers,
      dynamicColumnFilters,
    }),
    [globalFilter, dateRange, dateField, selectedViewers, dynamicColumnFilters],
  );

  const setFilters = useMemo(
    () => ({
      setGlobalFilter,
      setDateRange,
      setDateField,
      setSelectedViewers,
      setDynamicColumnFilters,
    }),
    [
      setGlobalFilter,
      setDateRange,
      setDateField,
      setSelectedViewers,
      setDynamicColumnFilters,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex w-full items-center justify-between py-2 md:py-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            {pageTitle}
            {}
          </h1>
          <p className="text-muted-foreground text-sm">{pageDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary rounded-full text-white">
            <Plus size={20} />
            <Link href="/dashboard/sharer/documenti">Nuova Condivisione</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <StatsGrid
          stats={[
            {
              title: "Totale Documenti",
              value: stats.totalDocs.toString(),
              change: { value: "", trend: "up" },
              icon: <FileText size={20} />,
            },
            {
              title: "Batch di Invio",
              value: stats.totalBatches.toString(),
              change: { value: "", trend: "up" },
              icon: <Package size={20} />,
            },
            {
              title: "Destinatari Unici",
              value: stats.totalViewers.toString(),
              change: { value: "", trend: "up" },
              icon: <Users size={20} />,
            },
            {
              title: "Totale Allegati",
              // eslint-disable-next-line
              value: stats.totalFiles.toString(),
              change: { value: "", trend: "up" },
              icon: <Paperclip size={20} />,
            },
          ]}
        />
        <TooltipProvider>
          {canRenderTable ? (
            <SharedDocumentsTable
              data={allDocuments}
              docClassDetails={docClassDetails}
              filters={filters}
              setFilters={setFilters}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-24 rounded-lg" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          )}
        </TooltipProvider>
      </div>
    </main>
  );
}
