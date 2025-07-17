"use client";

import { useCallback, useState, type DragEvent } from "react";
import {
  RiCloseLine,
  RiFileUploadLine,
  RiLoader4Line,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { toast } from "sonner";

import { batchService } from "@/app/api/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/utils";

interface AddFilesToDocumentDialogProps {
  batchId: number;
  documentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddFilesToDocumentDialog({
  batchId,
  documentId,
  open,
  onOpenChange,
  onSuccess,
}: AddFilesToDocumentDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(newFiles)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, []);

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.warning("Nessun file selezionato per il caricamento.");
      return;
    }
    setIsUploading(true);
    try {
      const response = await batchService.addFilesToDocument(
        batchId,
        documentId,
        files,
      );
      toast.success(response.message);
      setFiles([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore imprevisto durante il caricamento.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Aggiungi File al Documento</DialogTitle>
          <DialogDescription>
            Trascina i file nell&apos;area sottostante o clicca per
            selezionarli.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
          >
            <RiUploadCloud2Line className="text-muted-foreground mb-2 h-10 w-10" />
            <p className="text-muted-foreground text-sm">Trascina i file qui</p>
            <p className="text-muted-foreground text-xs">o</p>
            <Button variant="link" asChild className="text-sm">
              <label htmlFor="file-upload">
                seleziona dal dispositivo
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">File selezionati:</h4>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2 text-sm">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded-md p-2 text-sm"
                  >
                    <div className="truncate">
                      <p className="truncate font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      <RiCloseLine size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
          >
            {isUploading ? (
              <>
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <RiFileUploadLine className="mr-2 h-4 w-4" />
                Carica {files.length} {files.length === 1 ? "file" : "files"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
