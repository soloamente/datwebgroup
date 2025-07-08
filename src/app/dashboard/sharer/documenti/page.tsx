"use client";

import {
  type GetMyDocumentClassesResponse,
  type MyDocumentClass,
  type MyDocumentClassField,
  type Viewer,
  docClassService,
  userService,
} from "@/app/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { CreateViewerDialog } from "@/components/create-viewer-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/kamui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  File as FileIcon,
  FileUp,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  UploadCloud,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface FileWithPreview extends File {
  preview: string;
}

export default function DocumentiPage() {
  const [selectedClients, setSelectedClients] = useState<Viewer[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  const [documentClasses, setDocumentClasses] = useState<MyDocumentClass[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateViewerDialogOpen, setIsCreateViewerDialogOpen] =
    useState(false);

  const [selectedDocClassId, setSelectedDocClassId] = useState("");
  const [metadata, setMetadata] = useState<
    Record<string, string | number | boolean>
  >({});
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  // File management state
  const [fileToPreview, setFileToPreview] = useState<FileWithPreview | null>(
    null,
  );
  const [fileToRename, setFileToRename] = useState<FileWithPreview | null>(
    null,
  );
  const [newFileName, setNewFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchViewers = useCallback(async () => {
    try {
      const viewersData = await userService.getViewers();
      if (Array.isArray(viewersData)) {
        setViewers(viewersData);
      }
    } catch (error) {
      console.error("Failed to fetch viewers:", error);
      // TODO: show toast notification on error
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [docClassesResponse] = await Promise.all([
          docClassService.getMyDocumentClasses(),
          fetchViewers(),
        ]);

        if (docClassesResponse?.data) {
          setDocumentClasses(docClassesResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch document classes:", error);
        // TODO: show toast notification on error
      } finally {
        setIsLoading(false);
      }
    };
    void fetchInitialData();
  }, [fetchViewers]);

  const handleViewerCreated = () => {
    setIsCreateViewerDialogOpen(false);
    void fetchViewers();
  };

  const handleClientSelect = (client: Viewer) => {
    if (!selectedClients.some((c) => c.id === client.id)) {
      setSelectedClients([...selectedClients, client]);
    }
    setClientSearch("");
  };

  const removeClient = (clientId: number) => {
    setSelectedClients(selectedClients.filter((c) => c.id !== clientId));
  };

  const handleDocClassChange = (classId: string) => {
    setSelectedDocClassId(classId);
    setMetadata({}); // Reset metadata when class changes
  };

  const handleMetadataChange = (
    fieldName: string,
    value: string | number | boolean,
  ) => {
    setMetadata((prev) => ({ ...prev, [fieldName]: value }));
  };

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
        // Create a new File object with the new name
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

  const selectedDocClass = useMemo(
    () => documentClasses.find((c) => c.id.toString() === selectedDocClassId),
    [selectedDocClassId, documentClasses],
  );

  const isMetadataValid = useMemo(() => {
    if (!selectedDocClass) return false;
    return selectedDocClass.fields.every((field) => {
      if (!field.required) return true;
      const value = metadata[field.name];
      return value !== undefined && value !== "" && value !== null;
    });
  }, [selectedDocClass, metadata]);

  const filteredClients = useMemo(
    () =>
      viewers.filter(
        (client) =>
          client.nominativo
            .toLowerCase()
            .includes(clientSearch.toLowerCase()) &&
          !selectedClients.some((sc) => sc.id === client.id),
      ),
    [clientSearch, selectedClients, viewers],
  );

  const renderField = (field: MyDocumentClassField) => {
    const value = metadata[field.name];

    switch (field.data_type) {
      case "string":
        return (
          <Input
            id={field.name}
            type="text"
            placeholder={`Inserisci ${field.label.toLowerCase()}`}
            value={(value as string) ?? ""}
            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "integer":
      case "decimal":
        return (
          <Input
            id={field.name}
            type="number"
            placeholder={`Inserisci ${field.label.toLowerCase()}`}
            value={(value as number) ?? ""}
            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "date":
        return (
          <Input
            id={field.name}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "datetime":
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={(value as string) ?? ""}
            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
            className="bg-background"
            required={!!field.required}
          />
        );
      case "boolean":
        return (
          <div className="border-input bg-background flex h-10 items-center space-x-2 rounded-md border px-3">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleMetadataChange(field.name, checked)
              }
            />
            <label
              htmlFor={field.name}
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );
      case "enum":
        return (
          <Select
            onValueChange={(selectValue) =>
              handleMetadataChange(field.name, selectValue)
            }
            value={(value as string) ?? ""}
            required={!!field.required}
          >
            <SelectTrigger id={field.name}>
              <SelectValue
                placeholder={`Seleziona ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        const _exhaustiveCheck: never = field.data_type;
        return <p>Unsupported field type: {field.data_type}</p>;
    }
  };

  const renderMetadataFields = () => {
    if (!selectedDocClass) return null;

    return (
      <div className="grid grid-cols-1 gap-4">
        {selectedDocClass.fields
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((field) => (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? (
                  <span className="text-destructive">*</span>
                ) : (
                  ""
                )}
              </Label>
              {renderField(field)}
            </div>
          ))}
      </div>
    );
  };

  const isFormValid =
    selectedClients.length > 0 &&
    selectedDocClassId &&
    files.length > 0 &&
    isMetadataValid;

  const isPreviewable = (file: File) => {
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    return supportedTypes.includes(file.type);
  };

  const handleSendDocuments = async () => {
    if (!isFormValid) {
      toast.error("Per favore, compila tutti i campi obbligatori.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Invio in corso...");

    try {
      const response = await userService.shareDocuments({
        document_class_id: parseInt(selectedDocClassId, 10),
        viewer_ids: selectedClients.map((c) => c.id),
        metadata,
        files,
      });

      if (response.batch_id) {
        toast.success(response.message, { id: toastId });
        // Reset form state
        setSelectedClients([]);
        setSelectedDocClassId("");
        setMetadata({});
        setFiles([]);
      } else {
        let errorMessage = response.message;
        if (response.errors) {
          errorMessage = Object.values(response.errors).flat().join("\n");
        }
        toast.error(errorMessage, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to send documents:", error);
      toast.error("Si è verificato un errore durante l'invio.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center justify-between border-b p-4 lg:px-6 lg:py-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Nuova Spedizione
          </h1>
          <p className="text-muted-foreground">
            Componi e invia i documenti ai tuoi clienti in un unico posto.
          </p>
        </div>
        <Button
          size="lg"
          disabled={!isFormValid || isSubmitting}
          color="primary"
          onClick={handleSendDocuments}
        >
          {isSubmitting ? (
            "Invio in corso..."
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Invia a {selectedClients.length} Cliente(i)
            </>
          )}
        </Button>
      </header>

      <main className="grid flex-1 gap-6 overflow-y-auto p-4 lg:grid-cols-12 lg:p-6">
        {/* Left Column: Client Selection */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Destinatari</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <Input
                placeholder="Cerca cliente..."
                className="rounded-full"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
                endContent={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setIsCreateViewerDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 rounded-full" />
                  </Button>
                }
                wrapperClassName="w-full"
              />
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-full border border-transparent p-2 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {client.nominativo}
                      </span>
                      <PlusCircle className="text-muted-foreground h-4 w-4" />
                    </div>
                  ))}
                  {filteredClients.length === 0 && clientSearch && (
                    <p className="text-muted-foreground p-2 text-center text-sm">
                      Nessun risultato.
                    </p>
                  )}
                </div>
              </ScrollArea>
              <div className="mt-auto space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">
                  Clienti Selezionati ({selectedClients.length})
                </h3>
                <div className="border-border flex min-h-[96px] flex-wrap content-start gap-2 rounded-lg border-2 border-dashed p-2">
                  {selectedClients.length > 0 ? (
                    selectedClients.map((client) => (
                      <Badge
                        key={client.id}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 pr-1 pl-2"
                      >
                        <span className="text-sm">{client.nominativo}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClient(client.id)}
                          aria-label={`Rimuovi ${client.nominativo}`}
                          className="h-5 w-5"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <div className="flex w-full items-center justify-center py-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Nessun cliente selezionato.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: File Upload */}
        <div className="flex flex-col gap-6 lg:col-span-5">
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
                              onClick={() => {
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
                              onClick={() => {
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
                                onClick={() => {
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
        </div>

        {/* Right Column: Document Details */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <CardTitle>Dettagli Documento</CardTitle>
              <CardDescription>
                Seleziona una classe e compila i metadati richiesti.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-6">
              <div className="grid w-full gap-2">
                <Label htmlFor="doc-class">Classe Documentale</Label>
                <Select onValueChange={handleDocClassChange}>
                  <SelectTrigger id="doc-class">
                    <SelectValue placeholder="Seleziona una classe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Caricamento...
                      </SelectItem>
                    ) : (
                      documentClasses.map((dc) => (
                        <SelectItem key={dc.id} value={dc.id.toString()}>
                          {dc.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedDocClass ? (
                <ScrollArea className="flex-1">
                  <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
                    <h4 className="text-foreground font-semibold">
                      Metadati per {selectedDocClass.name}
                    </h4>
                    {renderMetadataFields()}
                  </div>
                </ScrollArea>
              ) : (
                <div className="border-border bg-muted/50 text-muted-foreground flex h-full flex-1 items-center justify-center rounded-lg border-2 border-dashed text-center text-sm">
                  Seleziona una classe documentale
                  <br />
                  per compilare i metadati.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <CreateViewerDialog
        isOpen={isCreateViewerDialogOpen}
        onClose={() => setIsCreateViewerDialogOpen(false)}
        onViewerCreated={handleViewerCreated}
      />

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
    </div>
  );
}
