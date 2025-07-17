"use client";

import {
  type MyDocumentClass,
  type MyDocumentClassField,
  type Viewer,
  docClassService,
  userService,
} from "@/app/api/api";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/animate-ui/base/checkbox";
import { CreateViewerDialog } from "@/components/create-viewer-dialog";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleDatePicker } from "@/components/ui/single-date-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  File as FileIcon,
  FileText,
  FileUp,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Send,
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

const steps = [
  { id: 1, name: "File", description: "Carica i documenti", icon: FileUp },
  {
    id: 2,
    name: "Dettagli",
    description: "Compila i metadati",
    icon: FileText,
  },
  {
    id: 3,
    name: "Destinatari",
    description: "Seleziona i clienti",
    icon: Users,
  },
  { id: 4, name: "Riepilogo", description: "Controlla e invia", icon: Check },
];

export default function DocumentiPage() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fetchViewers = useCallback(async () => {
    try {
      const viewersData = await userService.getViewers();
      if (Array.isArray(viewersData)) {
        setViewers(viewersData);
      }
    } catch (error) {
      console.error("Failed to fetch viewers:", error);
      toast.error("Impossibile caricare i destinatari.");
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
        toast.error("Impossibile caricare le classi documentali.");
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
            required={!!field.required}
          />
        );
      case "integer":
      case "decimal": {
        const numericValue =
          typeof value === "boolean" || value === 0 ? "" : value;
        return (
          <Input
            id={field.name}
            type="number"
            placeholder={`Inserisci ${field.label.toLowerCase()}`}
            value={numericValue ?? ""}
            onChange={(e) => handleMetadataChange(field.name, e.target.value)}
            required={!!field.required}
          />
        );
      }
      case "date":
        return (
          <SingleDatePicker
            value={value ? new Date(value as string) : undefined}
            onChange={(date) =>
              handleMetadataChange(
                field.name,
                date ? format(date, "yyyy-MM-dd") : "",
              )
            }
          />
        );
      case "datetime":
        return (
          <DateTimePicker
            value={value ? new Date(value as string) : undefined}
            onChange={(date) =>
              handleMetadataChange(
                field.name,
                date ? format(date, "yyyy-MM-dd HH:mm:ss") : "",
              )
            }
          />
        );
      case "boolean":
        return (
          <div className="border-input flex h-10 items-center space-x-2 rounded-md border px-3">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleMetadataChange(field.name, !!checked)
              }
            />
            <label
              htmlFor={field.name}
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
              {field.required ? (
                <span className="text-destructive"> *</span>
              ) : (
                ""
              )}
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
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        {selectedDocClass.fields
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((field) => (
            <div key={field.id} className="grid gap-2">
              {field.data_type === "boolean" ? (
                <div />
              ) : (
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required ? (
                    <span className="text-destructive"> *</span>
                  ) : (
                    ""
                  )}
                </Label>
              )}
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

  const renderStepContent = () => {
    const animationProps = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
      transition: { duration: 0.3 },
    };

    switch (currentStep) {
      case 1: // File Upload
        return (
          <motion.div {...animationProps}>
            <Card className="flex flex-1 flex-col">
              <CardHeader>
                <CardTitle>Caricamento File</CardTitle>
                <CardDescription>
                  Carica i documenti che vuoi inviare. Puoi trascinarli o
                  selezionarli dal tuo computer.
                </CardDescription>
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
                    "min-h-[200px]",
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
                            isDragging
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <p className="text-foreground font-semibold">
                        Trascina i file qui o{" "}
                        <span className="text-primary">
                          clicca per caricare
                        </span>
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Puoi caricare più documenti contemporaneamente.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-full w-full">
                      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                            <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7"
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
                        <Label
                          htmlFor="file-upload"
                          className="group border-border bg-muted/50 hover:border-primary/50 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                        >
                          <div className="text-center">
                            <PlusCircle className="text-muted-foreground group-hover:text-primary mx-auto h-8 w-8 transition-colors" />
                            <p className="text-muted-foreground group-hover:text-primary mt-2 text-sm font-semibold transition-colors">
                              Aggiungi altri file
                            </p>
                          </div>
                        </Label>
                      </div>
                    </ScrollArea>
                  )}
                </Label>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 2: // Document Details
        return (
          <motion.div {...animationProps}>
            <Card>
              <CardHeader>
                <CardTitle>Dettagli Documento</CardTitle>
                <CardDescription>
                  Seleziona una classe e compila i metadati richiesti.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-6">
                <div className="grid w-full gap-2">
                  <Label htmlFor="doc-class">Classe Documentale</Label>
                  <Select
                    onValueChange={handleDocClassChange}
                    value={selectedDocClassId}
                  >
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
                  <div className="bg-card space-y-4 rounded-lg border p-6 shadow-sm">
                    <h3 className="text-foreground text-lg font-medium">
                      Metadati per {selectedDocClass.name}
                    </h3>
                    <div className="border-border border-t pt-6">
                      {renderMetadataFields()}
                    </div>
                  </div>
                ) : (
                  <div className="border-border bg-muted/50 text-muted-foreground flex h-full min-h-[150px] flex-1 items-center justify-center rounded-lg border-2 border-dashed text-center text-sm">
                    Seleziona una classe documentale
                    <br />
                    per compilare i metadati.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      case 3: // Client Selection
        return (
          <motion.div {...animationProps}>
            <Card>
              <CardHeader>
                <CardTitle>Selezione Destinatari</CardTitle>
                <CardDescription>
                  Seleziona i clienti a cui inviare i documenti. Puoi cercarli o
                  crearne di nuovi.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Cerca cliente..."
                    className="rounded-full"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    startContent={<Search className="h-4 w-4" />}
                    wrapperClassName="flex-grow"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateViewerDialogOpen(true)}
                    className="h-10 rounded-full"
                  >
                    <UserPlus className="h-4 w-4" />
                    Nuovo cliente
                  </Button>
                </div>
                {selectedClients.length > 0 && (
                  <ScrollArea className="h-auto max-h-40">
                    <div className="flex flex-wrap gap-2 rounded-lg bg-stone-100 p-2 dark:bg-stone-900">
                      {selectedClients.map((client) => (
                        <Badge
                          key={client.id}
                          variant="secondary"
                          className="flex items-center gap-1.5 py-1 pr-1 pl-2"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span className="text-sm font-normal">
                            {client.nominativo}
                          </span>
                          <button
                            type="button"
                            aria-label={`Rimuovi ${client.nominativo}`}
                            onClick={() => removeClient(client.id)}
                            className="text-muted-foreground hover:bg-muted-foreground/20 flex-shrink-0 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                <ScrollArea className="h-96 min-h-0 shrink">
                  <div className="space-y-1 p-1">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-full border border-transparent p-2 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                              <User className="text-muted-foreground h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {client.nominativo}
                            </span>
                          </div>
                          <PlusCircle className="text-muted-foreground h-5 w-5" />
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground p-4 text-center text-sm">
                        {clientSearch
                          ? "Nessun risultato."
                          : "Inizia a cercare un cliente."}
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 4: // Summary and Send
        return (
          <motion.div {...animationProps}>
            <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
              <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <Check className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">Tutto pronto!</h2>
              <p className="text-muted-foreground mt-2">
                Ricontrolla il riepilogo sulla destra.
                <br />
                Se è tutto corretto, puoi procedere con l&apos;invio.
              </p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid h-full flex-1 grid-cols-1 lg:grid-cols-[1fr_400px]">
      <main className="flex h-full flex-col">
        <header className="flex-shrink-0 border-b p-4 lg:px-8 lg:py-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Nuova Spedizione
          </h1>
          <p className="text-muted-foreground">
            Componi e invia i documenti ai tuoi clienti in un unico posto.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold transition-colors",
                        currentStep > step.id
                          ? "bg-primary text-primary-foreground"
                          : currentStep === step.id
                            ? "border-primary bg-primary/10 text-primary border-2"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-2 w-20 truncate text-sm",
                        currentStep >= step.id
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-1 flex-1 transition-colors",
                        currentStep > index + 1 ? "bg-primary" : "bg-muted",
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Indietro
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && files.length === 0) ||
                  (currentStep === 2 && !isMetadataValid) ||
                  (currentStep === 3 && selectedClients.length === 0)
                }
              >
                Avanti
              </Button>
            ) : null}
          </div>
        </div>
      </main>
      {/* Right Column: Summary Sidebar */}
      <aside className="bg-sidebar-background flex flex-col p-4">
        <div className="bg-card sticky top-6 flex h-full flex-col gap-6 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Riepilogo Spedizione</h2>
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <FileUp className="h-4 w-4" />
                <span>File</span>
                <Badge variant="secondary">{files.length}</Badge>
              </h3>
              {files.length > 0 ? (
                <ScrollArea className="h-auto max-h-48">
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="bg-muted/50 flex items-center gap-2 rounded-md p-2"
                      >
                        <FileIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-center text-sm">
                    Nessun file.
                  </p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>Classe Documentale</span>
              </h3>
              {selectedDocClass ? (
                <p className="text-sm font-medium">{selectedDocClass.name}</p>
              ) : (
                <p className="text-muted-foreground py-2 text-center text-sm">
                  Non selezionata.
                </p>
              )}
            </div>
            <div>
              <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Destinatari</span>
                <Badge variant="secondary">{selectedClients.length}</Badge>
              </h3>
              <div className="space-y-2">
                {selectedClients.length > 0 ? (
                  <ScrollArea className="h-auto max-h-32">
                    <div className="space-y-2 pr-2">
                      {selectedClients.map((client) => (
                        <div
                          key={client.id}
                          className="bg-muted/50 flex items-center justify-between rounded-md p-2"
                        >
                          <span className="text-sm">{client.nominativo}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeClient(client.id)}
                            aria-label={`Rimuovi ${client.nominativo}`}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground text-center text-sm">
                      Nessun cliente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Button
              size="lg"
              className="w-full"
              disabled={!isFormValid || isSubmitting}
              onClick={handleSendDocuments}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Invio in corso...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Invia a {selectedClients.length} Cliente
                  {selectedClients.length !== 1 && "i"}
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
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
              fileToPreview?.preview && (
                <Image
                  src={fileToPreview.preview}
                  alt={fileToPreview.name}
                  fill
                  className="object-contain"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog
        open={!!fileToRename}
        onOpenChange={(open) => !open && setFileToRename(null)}
      >
        <DialogContent className="sm:max-w-md">
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
            <Button onClick={handleRenameFile}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
