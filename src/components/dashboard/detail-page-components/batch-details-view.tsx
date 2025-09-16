"use client";

import { useState } from "react";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiDownloadLine,
  RiInbox2Line,
  RiInformationLine,
  RiPencilLine,
  RiQuestionMark,
  RiSaveLine,
  RiUserLine,
} from "@remixicon/react";
import { Database, KeyRound, Paperclip, Save, X } from "lucide-react";
import { toast } from "sonner";

import {
  batchService,
  type DocumentClassDetails,
  type ViewerInfo,
  userService,
} from "@/app/api/api";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation";
import type {
  DocumentWithMetadata,
  EnrichedDocument,
} from "@/components/dashboard/tables/sharer/shared-documents-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDynamicDate, toInputDateString } from "@/lib/date-format";
import { generateAvatarColor, isDateString, isURL } from "@/lib/utils";

import { AddFilesToDocumentDialog } from "./add-files-to-document-dialog";
import { FileAttachmentCards } from "./file-attachment-cards";
import { MdPersonRemove } from "react-icons/md";
import {
  FaFileArrowUp,
  FaFolderPlus,
  FaPencil,
  FaPlus,
  FaUserMinus,
} from "react-icons/fa6";
import { FaFileUpload, FaPencilAlt } from "react-icons/fa";

// ============================================================================
// PROPS
// ============================================================================

interface BatchDetailsViewProps {
  batch: EnrichedDocument;
  docClassDetails: DocumentClassDetails;
  onUpdate: () => void;
}

interface ViewerCardProps {
  viewer: ViewerInfo;
  batchId: number;
  onUpdate: () => void;
}

interface MetadataValueProps {
  value: unknown;
  dataType?: string;
}

interface MetadataDisplayProps {
  doc: DocumentWithMetadata;
  docClassDetails: DocumentClassDetails;
}

interface MetadataFormProps {
  doc: DocumentWithMetadata;
  docClassDetails: DocumentClassDetails;
  batchId: number;
  onUpdate: () => void;
  onCancel: () => void;
  formData: Record<string, string | number | boolean | null>;
  setFormData: (data: Record<string, string | number | boolean | null>) => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
}

interface DocumentContentViewProps {
  doc: DocumentWithMetadata;
  docClassDetails: DocumentClassDetails;
  batchId: number;
  onUpdate: () => void;
}

// ============================================================================
// UTILITY & HELPER COMPONENTS
// ============================================================================
const BooleanBadge = ({ value }: { value: boolean | null }) => {
  if (value === null) {
    return (
      <Badge variant="outline" className="flex w-fit items-center gap-1">
        <RiQuestionMark size={16} />
        <span>N/D</span>
      </Badge>
    );
  }

  return value ? (
    <Badge className="flex w-fit items-center gap-1 border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700">
      <RiCheckLine size={16} />
      <span>Sì</span>
    </Badge>
  ) : (
    <Badge variant="destructive" className="flex w-fit items-center gap-1">
      <RiCloseLine size={16} />
      <span>No</span>
    </Badge>
  );
};

const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return null;

  if (typeof value === "string" || typeof value === "number") {
    const stringValue = String(value).toLowerCase().trim();
    const truthyValues = ["true", "1", "yes", "sì"];
    const falsyValues = ["false", "0", "no"];

    if (truthyValues.includes(stringValue)) return true;
    if (falsyValues.includes(stringValue)) return false;
  }

  return null;
};

const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "In attesa",
    sent: "Inviato",
    delivered: "Consegnato",
    read: "Letto",
    expired: "Scaduto",
    cancelled: "Annullato",
    failed: "Fallito",
    processing: "In elaborazione",
    completed: "Completato",
    active: "Attivo",
    inactive: "Inattivo",
    draft: "Bozza",
    published: "Pubblicato",
    archived: "Archiviato",
  };

  return statusMap[status.toLowerCase()] ?? status;
};

const MetadataValue = ({ value, dataType }: MetadataValueProps) => {
  if (value === null || value === undefined) {
    return <p className="font-medium">-</p>;
  }

  if (dataType === "boolean") {
    return <BooleanBadge value={parseBoolean(value)} />;
  }

  switch (typeof value) {
    case "boolean":
      return <BooleanBadge value={value} />;
    case "string": {
      const trimmed = value.trim();
      if (trimmed === "") return <p className="font-medium">-</p>;
      if (isURL(trimmed)) {
        return (
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary break-all hover:underline"
          >
            {trimmed}
          </a>
        );
      }
      return (
        <p className="font-medium break-words">
          {isDateString(trimmed) ? formatDynamicDate(trimmed) : trimmed}
        </p>
      );
    }
    case "number":
    case "bigint":
      return <p className="">{String(value)}</p>;
    case "object": {
      const displayValue = JSON.stringify(value);
      return (
        <p className="font-medium break-all">
          {displayValue === "{}" || displayValue === "[]" ? "-" : displayValue}
        </p>
      );
    }
    default:
      return <p className="font-medium">-</p>;
  }
};

// ============================================================================
// MAIN CONTENT AREA COMPONENTS (LEFT COLUMN)
// ============================================================================

const MetadataDisplay = ({ doc, docClassDetails }: MetadataDisplayProps) => {
  const getFieldDetails = (fieldName: string) =>
    docClassDetails?.fields?.find((f) => f.name === fieldName);

  const metadataEntries = Object.entries(doc.metadata).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB),
  );

  if (metadataEntries.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-dashed p-8 text-center">
        <RiInbox2Line className="text-muted-foreground mb-4 h-10 w-10" />
        <h3 className="font-semibold">Nessun metadato</h3>
        <p className="text-muted-foreground text-sm">
          Non ci sono metadati per questo documento.
        </p>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg p-4 sm:grid-cols-2">
      {metadataEntries.map(([key, value]) => {
        const fieldDetails = getFieldDetails(key);
        return (
          <div key={key} className="flex flex-col gap-2 break-words">
            <dt className="text-muted-foreground text-sm font-medium">
              {fieldDetails?.label ?? key}
            </dt>
            <dd className="ring-border bg-muted/10 rounded-md border-none p-2 text-sm ring-1">
              <MetadataValue value={value} dataType={fieldDetails?.data_type} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
};

const MetadataForm = ({
  doc,
  docClassDetails,
  batchId,
  onUpdate,
  onCancel,
  formData,
  setFormData,
  handleSave,
  isSaving,
}: MetadataFormProps) => {
  const handleFieldChange = (
    key: string,
    value: string | number | boolean | null,
  ) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg p-4 sm:grid-cols-2">
        {docClassDetails.fields.map((field) => {
          const value = formData[field.name];
          const isPrimaryKey = field.is_primary_key;

          if (isPrimaryKey) {
            return (
              <div key={field.name} className="space-y-2">
                <Label>{field.label ?? field.name}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ring-border bg-muted/10 flex items-center gap-2 rounded-sm border-none px-2 py-1.5 font-medium ring-1">
                        <KeyRound size={16} className="text-amber-500" />
                        <MetadataValue
                          value={value}
                          dataType={field.data_type}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Questo campo è una chiave primaria e non può essere
                        modificato.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label ?? field.name}
                {field.required ? (
                  <span className="text-destructive text-md font-bold"> *</span>
                ) : (
                  ""
                )}
              </Label>
              {field.data_type === "boolean" ? (
                <div className="flex items-center pt-2">
                  <Switch
                    id={field.name}
                    className="ring-1 ring-black/10"
                    checked={!!value}
                    onCheckedChange={(checked) =>
                      handleFieldChange(field.name, checked)
                    }
                  />
                  <span className="ml-3 text-sm font-medium">
                    {value ? "Sì" : "No"}
                  </span>
                </div>
              ) : field.data_type === "enum" ? (
                <Select
                  value={String(value ?? "")}
                  onValueChange={(newValue) =>
                    handleFieldChange(field.name, newValue)
                  }
                >
                  <SelectTrigger className="ring-border bg-muted/10 border-none ring-1">
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent className="ring-border border-0 ring-1 shadow-sm">
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  className="ring-border bg-muted/10 border-none ring-1"
                  type={
                    field.data_type === "date"
                      ? "date"
                      : field.data_type === "datetime"
                        ? "datetime-local"
                        : ["integer", "decimal"].includes(field.data_type)
                          ? "number"
                          : "text"
                  }
                  value={
                    field.data_type.includes("date")
                      ? toInputDateString(
                          value as string,
                          field.data_type === "datetime",
                        )
                      : String(value ?? "")
                  }
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  required={!!field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DocumentContentView = ({
  doc,
  docClassDetails,
  batchId,
  onUpdate,
}: DocumentContentViewProps) => {
  const [isAddFilesDialogOpen, setIsAddFilesDialogOpen] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null>
  >(doc.metadata as Record<string, string | number | boolean | null>);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = () => {
    setIsEditingMetadata(false);
    onUpdate();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await batchService.updateDocumentMetadata(
        batchId,
        doc.id,
        formData,
      );
      toast.success(response.message || "Metadati aggiornati con successo.");
      handleUpdate();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Errore durante l'aggiornamento dei metadati.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(
      doc.metadata as Record<string, string | number | boolean | null>,
    );
    setIsEditingMetadata(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/20 ring-border gap-2 border-none p-1 ring-1">
        <CardHeader className="flex flex-row items-center justify-between pt-3 pr-2 pb-2 pl-4">
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Metadati
          </CardTitle>
          {!isEditingMetadata ? (
            <Button
              variant="outline"
              onClick={() => setIsEditingMetadata(true)}
              className="ring-border max-w-fit flex-1 border-none text-xs ring-1 sm:text-sm"
            >
              <FaPencilAlt className="h-4 w-4" /> Modifica Metadati
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="ring-border border-none text-xs ring-1 sm:text-sm"
              >
                <X className="h-4 w-4" />
                Annulla
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="ring-border border-none text-xs ring-1 sm:text-sm"
              >
                {isSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salva
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="bg-card ring-border rounded-lg px-2 pt-4 pb-2 ring-1">
          {isEditingMetadata ? (
            <MetadataForm
              doc={doc}
              docClassDetails={docClassDetails}
              batchId={batchId}
              onUpdate={handleUpdate}
              onCancel={handleCancel}
              formData={formData}
              setFormData={setFormData}
              handleSave={handleSave}
              isSaving={isSaving}
            />
          ) : (
            <MetadataDisplay doc={doc} docClassDetails={docClassDetails} />
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/20 ring-border gap-2 border-none p-1 ring-1">
        <CardHeader className="flex flex-row items-center justify-between p-0 pt-3 pr-2 pb-2 pl-4">
          <CardTitle className="flex items-center gap-2">
            <Paperclip size={20} />
            File Allegati
          </CardTitle>
          <Button
            variant={"outline"}
            onClick={() => setIsAddFilesDialogOpen(true)}
            className="ring-border max-w-fit flex-1 border-none text-xs ring-1 sm:text-sm"
          >
            <FaFileArrowUp className="h-4 w-4" />
            Aggiungi File
          </Button>
        </CardHeader>
        <CardContent className="bg-card ring-border rounded-lg px-2 pt-4 pb-2 ring-1">
          {doc.files && doc.files.length > 0 ? (
            <FileAttachmentCards
              files={doc.files}
              batchId={batchId}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-zinc-50/50 text-center dark:bg-zinc-900/50">
              <RiInbox2Line className="text-muted-foreground mb-4 h-10 w-10" />
              <h3 className="font-semibold">Nessun file allegato</h3>
              <p className="text-muted-foreground text-sm">
                Non ci sono file allegati a questo documento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <AddFilesToDocumentDialog
        batchId={batchId}
        documentId={doc.id}
        open={isAddFilesDialogOpen}
        onOpenChange={setIsAddFilesDialogOpen}
        onSuccess={onUpdate}
      />
    </div>
  );
};

const DocumentsSection = ({
  batch,
  docClassDetails,
  onUpdate,
}: BatchDetailsViewProps) => {
  const { documents, id: batchId } = batch;

  const firstDocument = documents?.[0];
  const hasMultipleDocuments = documents.length > 1;

  if (!firstDocument) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-muted/50 flex min-h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
            <RiInbox2Line className="text-muted-foreground mb-4 h-10 w-10" />
            <h3 className="font-semibold">Nessun Documento</h3>
            <p className="text-muted-foreground text-sm">
              Non ci sono documenti in questo batch.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasMultipleDocuments) {
    return (
      <DocumentContentView
        doc={firstDocument}
        docClassDetails={docClassDetails}
        batchId={batchId}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <Tabs defaultValue={`doc-${firstDocument.id}`} className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {documents.map((doc, index) => (
          <TabsTrigger key={doc.id} value={`doc-${doc.id}`}>
            {`${docClassDetails.name} ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {documents.map((doc) => (
        <TabsContent key={doc.id} value={`doc-${doc.id}`} className="mt-6">
          <DocumentContentView
            doc={doc}
            docClassDetails={docClassDetails}
            batchId={batchId}
            onUpdate={onUpdate}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

// ============================================================================
// SIDEBAR COMPONENTS (RIGHT COLUMN)
// ============================================================================

const ViewerCard = ({ viewer, batchId, onUpdate }: ViewerCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const avatarColor = generateAvatarColor(viewer.email);
  const initials = viewer.nominativo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleDownloadCredentials = async () => {
    setIsDownloading(true);
    try {
      const result = await userService.downloadViewerCredentials(
        viewer.id,
        viewer.nominativo,
      );
      toast.success(result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore imprevisto.";
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendCredentialsEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await userService.sendViewerCredentialsByEmail(viewer.id);
      toast.success(result.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore imprevisto durante l'invio della mail.";
      toast.error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleRemoveViewer = async (): Promise<boolean> => {
    try {
      const result = await batchService.removeViewerFromBatch(
        batchId,
        viewer.id,
      );
      toast.success(result.message);
      onUpdate();
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Si è verificato un errore imprevisto durante la rimozione del destinatario.";
      toast.error(errorMessage);
      return false;
    }
  };

  return (
    <div className="flex flex-col justify-between gap-3 truncate p-3 sm:flex-row sm:items-center sm:p-0 md:gap-4 lg:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
          <AvatarFallback
            style={{ backgroundColor: avatarColor, color: "white" }}
            className="text-sm sm:text-base"
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">
            {viewer.nominativo}
          </p>
          <p className="text-muted-foreground truncate text-xs sm:text-sm">
            {viewer.email}
          </p>
          {viewer.codice_fiscale && (
            <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
              {viewer.codice_fiscale}
            </p>
          )}
        </div>
      </div>
      <TooltipProvider>
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2 md:gap-2 lg:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadCredentials}
                disabled={isDownloading}
                aria-label="Scarica credenziali"
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              >
                {isDownloading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current sm:h-5 sm:w-5 md:h-6 md:w-6" />
                ) : (
                  <RiDownloadLine
                    size={16}
                    className="sm:h-5 sm:w-5 md:h-6 md:w-6"
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scarica credenziali</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSendCredentialsEmail}
                disabled={isSendingEmail}
                aria-label="Recupero credenziali"
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              >
                {isSendingEmail ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current sm:h-5 sm:w-5 md:h-6 md:w-6" />
                ) : (
                  <KeyRound size={16} className="sm:h-5 sm:w-5 md:h-6 md:w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recupero credenziali</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRemoveDialogOpen(true)}
                aria-label="Rimuovi destinatario"
                className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
              >
                <FaUserMinus
                  size={16}
                  className="sm:h-5 sm:w-5 md:h-6 md:w-6"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rimuovi destinatario</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <DeleteConfirmationDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        onSuccess={() => setIsRemoveDialogOpen(false)}
        fieldId={0}
        optionId={0}
        onConfirm={handleRemoveViewer}
        customMessage={`Sei sicuro di voler rimuovere ${viewer.nominativo} da questo condivisione? Questa azione non può essere annullata.`}
      />
    </div>
  );
};

export const ViewersSection = ({
  viewers,
  batchId,
  onUpdate,
}: {
  viewers: ViewerInfo[];
  batchId: number;
  onUpdate: () => void;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <RiUserLine size={18} className="text-muted-foreground sm:h-5 sm:w-5" />
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold sm:text-lg">Destinatari</h3>
          <Badge variant="outline" className="text-xs sm:text-sm">
            {viewers.length}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3 sm:space-y-4">
      {viewers.length > 0 ? (
        viewers.map((viewer) => (
          <ViewerCard
            key={viewer.id}
            viewer={viewer}
            batchId={batchId}
            onUpdate={onUpdate}
          />
        ))
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          Nessun destinatario aggiunto.
        </p>
      )}
    </CardContent>
  </Card>
);

export const BatchInfoCard = ({
  batch,
  docClassDetails,
}: {
  batch: EnrichedDocument;
  docClassDetails: DocumentClassDetails;
}) => (
  <Card>
    <CardHeader>
      <SectionHeader icon={RiInformationLine} title="Riepilogo" />
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Stato</span>
        <Badge
          variant="outline"
          className="bg-muted/20 ring-border border-none px-2 py-1 ring-1"
        >
          {translateStatus(batch.status)}
        </Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Classe Documentale</span>
        <Badge
          variant="outline"
          className="bg-muted/20 ring-border border-none px-2 py-1 ring-1"
        >
          {docClassDetails.name}
        </Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Inviato il</span>
        <Badge
          variant="outline"
          className="bg-muted/20 ring-border border-none px-2 py-1 ring-1"
        >
          {new Date(batch.sent_at).toLocaleDateString("it-IT", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN EXPORTED COMPONENT
// ============================================================================

export function BatchDetailsView({
  batch,
  docClassDetails,
  onUpdate,
}: BatchDetailsViewProps) {
  return (
    <DocumentsSection
      batch={batch}
      docClassDetails={docClassDetails}
      onUpdate={onUpdate}
    />
  );
}
