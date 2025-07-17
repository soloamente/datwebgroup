"use client";

import { useParams, useRouter } from "next/navigation";
import {
  BatchDetailsView,
  BatchInfoCard,
  ViewersSection,
} from "@/components/dashboard/detail-page-components/batch-details-view";
import { type DocumentClassDetails } from "@/app/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDynamicDate } from "@/lib/date-format";
import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiUserAddLine,
} from "@remixicon/react";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { AddViewerToBatchDialog } from "@/components/dashboard/add-viewer-to-batch-dialog";
import BatchDetailsLoading from "./loading";
import { useBatchDetails } from "@/hooks/use-batch-details";

// ============================================================================
// Sub-components
// ============================================================================

interface BatchPageHeaderProps {
  documentClass: DocumentClassDetails;
  batch: EnrichedDocument;
  batchId: number;
  onViewerAdded: () => void;
}

function BatchPageHeader({
  documentClass,
  batch,
  batchId,
  onViewerAdded,
}: BatchPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Torna alla lista
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {documentClass.name}
        </h1>
        <p className="text-muted-foreground">
          Dettagli del batch di condivisione inviato il{" "}
          {formatDynamicDate(batch.sent_at)}.
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <AddViewerToBatchDialog batchId={batchId} onViewerAdded={onViewerAdded}>
          <Button className="transition-all duration-300">
            <RiUserAddLine className="h-4 w-4" />
            Aggiungi Destinatario
          </Button>
        </AddViewerToBatchDialog>
      </div>
    </div>
  );
}

interface BatchPageContentProps {
  batch: EnrichedDocument;
  documentClass: DocumentClassDetails;
  onUpdate: () => void;
}

function BatchPageContent({
  batch,
  documentClass,
  onUpdate,
}: BatchPageContentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BatchDetailsView
          batch={batch}
          docClassDetails={documentClass}
          onUpdate={onUpdate}
        />
      </div>
      <div className="space-y-6 lg:col-span-1">
        <BatchInfoCard batch={batch} docClassDetails={documentClass} />
        <ViewersSection viewers={batch.viewers} />
      </div>
    </div>
  );
}

function NotFound({ title, message }: { title: string; message: string }) {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={() => router.back()}>
          <RiArrowLeftLine className="mr-2" />
          Torna indietro
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function BatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const batchId = Number(params.batchId);

  const { batch, documentClass, isLoading, error, refetch } =
    useBatchDetails(batchId);

  if (isLoading) {
    return <BatchDetailsLoading />;
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
      <NotFound
        title="Batch non trovato"
        message="Il batch che stai cercando non è stato trovato o la sessione è scaduta."
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      <BatchPageHeader
        batch={batch}
        documentClass={documentClass}
        batchId={batchId}
        onViewerAdded={refetch}
      />
      <BatchPageContent
        batch={batch}
        documentClass={documentClass}
        onUpdate={refetch}
      />
    </div>
  );
}
