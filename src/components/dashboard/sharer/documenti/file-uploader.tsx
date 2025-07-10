"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/kamui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  File as FileIcon,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export interface FileWithPreview extends File {
  preview: string;
}

interface FileUploaderProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
}

export function FileUploader({ files, setFiles }: FileUploaderProps) {
  const [fileToPreview, setFileToPreview] = useState<FileWithPreview | null>(
    null,
  );
  const [fileToRename, setFileToRename] = useState<FileWithPreview | null>(
    null,
  );
  const [newFileName, setNewFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleRenameFile = () => {
    if (!fileToRename || !newFileName.trim()) return;

    const updatedFiles = files.map((file) => {
      if (file.name === fileToRename.name) {
        const newFile = new File([file], newFileName.trim(), {
          type: file.type,
          lastModified: file.lastModified,
        });
        return Object.assign(newFile, { preview: file.preview });
      }
      return file;
    });

    setFiles(updatedFiles);
    setFileToRename(null);
    setNewFileName("");
  };

  const isPreviewable = (file: File) => {
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    return supportedTypes.includes(file.type);
  };

  return (
    <>
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            <span>File da Spedire</span>
          </CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-1 flex-col"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileInput}
          />
          <Label
            htmlFor="file-upload"
            className={cn(
              "border-border flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "bg-background hover:border-primary/50",
            )}
          >
            {files.length === 0 ? (
              <div className="p-6 text-center">
                <div
                  className={cn(
                    "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                    isDragging ? "bg-primary/20" : "bg-muted",
                  )}
                >
                  <UploadCloud
                    className={cn(
                      "h-8 w-8",
                      isDragging ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </div>
                <p className="text-foreground font-semibold">
                  Trascina i file qui o{" "}
                  <span className="text-primary">clicca per caricare</span>
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Puoi caricare più documenti contemporaneamente.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full w-full">
                <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="group border-border bg-muted relative aspect-square overflow-hidden rounded-lg border"
                    >
                      {file.type.startsWith("image/") ? (
                        <Image
                          src={file.preview}
                          alt={file.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
                          <FileIcon className="text-muted-foreground h-8 w-8" />
                          <p className="text-muted-foreground text-center text-xs break-all">
                            {file.name}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100" />
                      <div className="absolute top-1 right-1 flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-background/50 hover:bg-background h-7 w-7"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFileToRename(file);
                            setNewFileName(file.name);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Rinomina file</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          color="danger"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFile(file.name);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Rimuovi file</span>
                        </Button>
                      </div>
                      {isPreviewable(file) && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="outline"
                            className="bg-background/50 hover:bg-background"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFileToPreview(file);
                            }}
                          >
                            <Search className="mr-2 h-4 w-4" />
                            Anteprima
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Label>
        </CardContent>
      </Card>
      {/* File Preview Dialog */}
      <Dialog
        open={!!fileToPreview}
        onOpenChange={(open) => !open && setFileToPreview(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{fileToPreview?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 h-[70vh]">
            {fileToPreview?.type === "application/pdf" ? (
              <iframe
                src={fileToPreview.preview}
                className="h-full w-full"
                title="File Preview"
              />
            ) : (
              <Image
                src={fileToPreview?.preview ?? ""}
                alt={fileToPreview?.name ?? ""}
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog
        open={!!fileToRename}
        onOpenChange={(open) => !open && setFileToRename(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rinomina File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameFile()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFileToRename(null)}>
              Annulla
            </Button>
            <Button color="primary" onClick={handleRenameFile}>
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
