"use client";

import { type AttachedFile } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { RiDownload2Line, RiDeleteBinLine } from "@remixicon/react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { downloadSharedFile, removeDocumentFromBatch } from "@/app/api/api";
import {
  formatBytes,
  getFileExtension,
  getFileNameWithoutExtension,
} from "@/lib/format";

interface FileAttachmentCardsProps {
  files: AttachedFile[];
  batchId: number;
  onUpdate: () => void;
}

export function FileAttachmentCards({
  files,
  batchId,
  onUpdate,
}: FileAttachmentCardsProps) {
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(
    null,
  );
  const [fileToRemove, setFileToRemove] = useState<{
    fileId: number;
    fileName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async (fileId: number, filename: string) => {
    setDownloadingFileId(fileId);
    try {
      const result = await downloadSharedFile(fileId, filename);
      if (result.success) {
        toast.success(result.message || "Download avviato con successo.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Errore sconosciuto.";
      toast.error(`Download fallito: ${errorMessage}`);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!fileToRemove) return;
    setIsDeleting(true);
    try {
      await removeDocumentFromBatch(batchId, fileToRemove.fileId);
      toast.success(`File "${fileToRemove.fileName}" rimosso con successo.`);
      onUpdate();
    } catch (error) {
      toast.error(
        `Errore durante la rimozione del file: ${
          error instanceof Error ? error.message : "Dettagli non disponibili"
        }`,
      );
      console.error(error);
    } finally {
      setIsDeleting(false);
      setFileToRemove(null);
    }
  };

  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {files.map((file) => {
          const fileName = getFileNameWithoutExtension(file.original_filename);
          const fileExtension = getFileExtension(file.original_filename);

          return (
            <Card
              key={file.id}
              className="group hover:border-primary/20 relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md"
            >
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex-grow">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold break-words">
                        {fileName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {fileName}
                        {fileExtension}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {formatBytes(file.size)}
                    </Badge>
                  </div>

                  {/* File Details */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium break-words">
                        {file.mime_type}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{file.id}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      handleDownload(file.id, file.original_filename)
                    }
                    disabled={downloadingFileId === file.id}
                  >
                    <RiDownload2Line className="mr-2 h-4 w-4" />
                    {downloadingFileId === file.id
                      ? "Scaricando..."
                      : "Scarica"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setFileToRemove({
                        fileId: file.id,
                        fileName: file.original_filename,
                      })
                    }
                    disabled={isDeleting}
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmationDialog
        isOpen={!!fileToRemove}
        onClose={() => setFileToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Conferma Rimozione"
        description={`Sei sicuro di voler rimuovere il file "${fileToRemove?.fileName}"? Questa azione è permanente.`}
        confirmText={isDeleting ? "Rimuovendo..." : "Rimuovi"}
        isLoading={isDeleting}
      />
    </Fragment>
  );
}
