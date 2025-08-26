"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BatchDetailsView,
  BatchInfoCard,
  ViewersSection,
} from "@/components/dashboard/detail-page-components/batch-details-view";
import { type DocumentClassDetails, batchService } from "@/app/api/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDynamicDate } from "@/lib/date-format";
import {
  RiArrowLeftLine,
  RiErrorWarningLine,
  RiUserAddLine,
} from "@remixicon/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { type EnrichedDocument } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { AddViewerToBatchDialog } from "@/components/dashboard/add-viewer-to-batch-dialog";
import { BatchDeleteConfirmationDialog } from "@/components/batch-delete-confirmation";
import BatchDetailsLoading from "./loading";
import { useBatchDetails } from "@/hooks/use-batch-details";
import { FaTrash, FaUserPlus } from "react-icons/fa6";

// ============================================================================
// Sub-components
// ============================================================================

interface BatchPageHeaderProps {
  documentClass: DocumentClassDetails;
  batch: EnrichedDocument;
  batchId: number;
  onViewerAdded: () => void;
  onDelete: () => void;
}

function BatchPageHeader({
  documentClass,
  batch,
  batchId,
  onViewerAdded,
  onDelete,
}: BatchPageHeaderProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteBatch = async (): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const result = await batchService.deleteBatch(batch.id);
      toast.success(result.message);
      onDelete();
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore imprevisto durante l'eliminazione del batch.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-3 sm:mb-4"
          >
            <RiArrowLeftLine className="h-4 w-4" />
            <span className="">Torna indietro</span>
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {documentClass.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Dettagli del batch di condivisione inviato il{" "}
            {formatDynamicDate(batch.sent_at)}.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <AddViewerToBatchDialog
            batchId={batchId}
            onViewerAdded={onViewerAdded}
          >
            <Button className="text-sm transition-all duration-300 sm:text-base">
              <FaUserPlus className="h-4 w-4" />
              Aggiungi destinatario
            </Button>
          </AddViewerToBatchDialog>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
            className="!bg-red-500/20 text-red-400 transition-all duration-300 sm:text-base"
          >
            {isDeleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            ) : (
              <FaTrash className="h-4 w-4" />
            )}
            <span className="">Elimina condivisione</span>
          </Button>
        </div>
      </div>

      <BatchDeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteBatch}
        documentClassName={documentClass.name}
        customMessage={`Sei sicuro di voler eliminare questa condivisione? Questa azione eliminerà definitivamente tutti i documenti e file associati e non può essere annullata.`}
      />
    </>
  );
}

interface BatchPageContentProps {
  batch: EnrichedDocument;
  documentClass: DocumentClassDetails;
  onUpdate: () => void;
  onDelete: () => void;
}

function BatchPageContent({
  batch,
  documentClass,
  onUpdate,
  onDelete,
}: BatchPageContentProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BatchDetailsView
          batch={batch}
          docClassDetails={documentClass}
          onUpdate={onUpdate}
        />
      </div>
      <div className="space-y-4 sm:space-y-6 lg:col-span-1">
        <BatchInfoCard batch={batch} docClassDetails={documentClass} />
        <ViewersSection
          viewers={batch.viewers}
          batchId={batch.id}
          onUpdate={onUpdate}
        />
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
          <RiArrowLeftLine className="h-4 w-4" />
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

  const handleDelete = () => {
    // Navigate back to the shared documents list after successful deletion
    router.push(`/dashboard/sharer/documenti/condivisi/${String(params.slug)}`);
  };

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
          <Button onClick={() => router.back()} className="text-sm">
            <RiArrowLeftLine className="h-4 w-4" />
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
        onDelete={handleDelete}
      />
      <BatchPageContent
        batch={batch}
        documentClass={documentClass}
        onUpdate={refetch}
        onDelete={handleDelete}
      />
    </div>
  );
}
