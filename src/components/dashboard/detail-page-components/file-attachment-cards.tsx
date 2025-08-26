"use client";

import { type AttachedFile } from "@/components/dashboard/tables/sharer/shared-documents-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { RiDownload2Line, RiDeleteBinLine } from "@remixicon/react";
import {
  BsFileEarmarkFill,
  BsFileEarmarkPdfFill,
  BsFileEarmarkWordFill,
  BsFileEarmarkExcelFill,
  BsFileEarmarkPptFill,
  BsFileEarmarkImageFill,
  BsFileEarmarkTextFill,
  BsFileEarmarkCodeFill,
  BsFileEarmarkZipFill,
  BsFileEarmarkMusicFill,
  BsFileEarmarkPlayFill,
  BsFileEarmarkSpreadsheetFill,
} from "react-icons/bs";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { downloadSharedFile, removeDocumentFromBatch } from "@/app/api/api";
import {
  formatBytes,
  getFileExtension,
  getFileNameWithoutExtension,
  getFileTypeName,
  getFileTypeIcon,
} from "@/lib/format";
import { TbSquareRoundedArrowDownFilled } from "react-icons/tb";
import { FaTrash } from "react-icons/fa6";

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
  // Function to get the appropriate icon component
  const getIconComponent = (mimeType: string) => {
    const iconName = getFileTypeIcon(mimeType);
    const iconMap: Record<string, React.ComponentType<any>> = {
      BsFileEarmarkFill,
      BsFileEarmarkPdfFill,
      BsFileEarmarkWordFill,
      BsFileEarmarkExcelFill,
      BsFileEarmarkPptFill,
      BsFileEarmarkImageFill,
      BsFileEarmarkTextFill,
      BsFileEarmarkCodeFill,
      BsFileEarmarkZipFill,
      BsFileEarmarkMusicFill,
      BsFileEarmarkPlayFill,
      BsFileEarmarkSpreadsheetFill,
    };
    return iconMap[iconName] || BsFileEarmarkFill;
  };
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => {
          const fileName = getFileNameWithoutExtension(file.original_filename);
          const fileExtension = getFileExtension(file.original_filename);

          return (
            <Card
              key={file.id}
              className="group group-hover:border-primary/20 bg-muted/20 ring-border relative flex min-h-[200px] min-w-15 flex-col gap-3 overflow-hidden border-none p-1 ring-1 transition-all duration-300 ease-in-out hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-2 pt-3 pb-0 text-sm sm:text-base">
                  {(() => {
                    const IconComponent = getIconComponent(file.mime_type);
                    return (
                      <IconComponent className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                    );
                  })()}
                  <span className="truncate text-center font-medium">
                    {fileName}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="ring-border bg-card flex flex-1 flex-col rounded-lg p-3 ring-1 sm:p-4">
                <div className="flex-grow">
                  {/* File Details */}
                  <div className="mb-3 space-y-2 sm:mb-4">
                    <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
                      <span className="text-muted-foreground">Tipo file</span>
                      <Badge
                        variant="secondary"
                        className="w-fit text-xs font-medium sm:text-sm"
                      >
                        {getFileTypeName(file.mime_type)}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
                      <span className="text-muted-foreground">
                        Dimensione file
                      </span>
                      <Badge
                        variant="secondary"
                        className="w-fit text-xs sm:text-sm"
                      >
                        {formatBytes(file.size)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() =>
                      handleDownload(file.id, file.original_filename)
                    }
                    disabled={downloadingFileId === file.id}
                  >
                    <TbSquareRoundedArrowDownFilled className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {downloadingFileId === file.id
                        ? "Scaricando..."
                        : "Scarica"}
                    </span>
                    <span className="sm:hidden">
                      {downloadingFileId === file.id ? "..." : "Scarica"}
                    </span>
                  </Button>
                  <Button
                    variant="destructive"
                    className="text-xs sm:text-sm"
                    onClick={() =>
                      setFileToRemove({
                        fileId: file.id,
                        fileName: file.original_filename,
                      })
                    }
                    disabled={isDeleting}
                  >
                    <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" /> Rimuovi
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
