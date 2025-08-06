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
      return <p className="font-medium">{String(value)}</p>;
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
      <div className="bg-muted/50 flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
        <RiInbox2Line className="text-muted-foreground mb-4 h-10 w-10" />
        <h3 className="font-semibold">Nessun metadato</h3>
        <p className="text-muted-foreground text-sm">
          Non ci sono metadati per questo documento.
        </p>
      </div>
    );
  }

  return (
    <dl className="bg-muted/50 grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border p-4 sm:grid-cols-2">
      {metadataEntries.map(([key, value]) => {
        const fieldDetails = getFieldDetails(key);
        return (
          <div key={key} className="break-words">
            <dt className="text-muted-foreground text-sm font-medium">
              {fieldDetails?.label ?? key}
            </dt>
            <dd>
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
}: MetadataFormProps) => {
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null>
  >(doc.metadata as Record<string, string | number | boolean | null>);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (
    key: string,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      onUpdate();
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
      className="space-y-4"
    >
      <div className="bg-muted/50 grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border p-4 sm:grid-cols-2">
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
                      <div className="text-md flex w-fit items-center gap-2 rounded-sm px-2 py-1.5 ring-1 ring-black/10">
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
                  <SelectTrigger className="ring-1 ring-black/10">
                    <SelectValue placeholder="Seleziona..." />
                  </SelectTrigger>
                  <SelectContent className="border-0 ring-1 shadow-sm ring-black/10">
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
                  className="ring-1 ring-black/10"
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
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Annulla
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salva Modifiche
        </Button>
      </div>
    </form>
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

  const handleUpdate = () => {
    setIsEditingMetadata(false);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Metadati
          </CardTitle>
          {!isEditingMetadata && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingMetadata(true)}
            >
              <RiPencilLine className="h-4 w-4" /> Modifica Metadati
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingMetadata ? (
            <MetadataForm
              doc={doc}
              docClassDetails={docClassDetails}
              batchId={batchId}
              onUpdate={handleUpdate}
              onCancel={() => setIsEditingMetadata(false)}
            />
          ) : (
            <MetadataDisplay doc={doc} docClassDetails={docClassDetails} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip size={20} />
            File Allegati
          </CardTitle>
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => setIsAddFilesDialogOpen(true)}
          >
            <RiAddLine className="h-4 w-4" />
            Aggiungi File
          </Button>
        </CardHeader>
        <CardContent>
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

const ViewerCard = ({ viewer }: ViewerCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
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

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback
          style={{ backgroundColor: avatarColor, color: "white" }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{viewer.nominativo}</p>
        <p className="text-muted-foreground truncate text-sm">{viewer.email}</p>
        {viewer.codice_fiscale && (
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {viewer.codice_fiscale}
          </p>
        )}
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadCredentials}
                disabled={isDownloading}
                aria-label="Scarica credenziali"
              >
                {isDownloading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
                ) : (
                  <RiDownloadLine size={20} />
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
              >
                {isSendingEmail ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
                ) : (
                  <KeyRound size={20} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Recupero credenziali</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export const ViewersSection = ({ viewers }: { viewers: ViewerInfo[] }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <RiUserLine size={20} className="text-muted-foreground" />
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Destinatari</h3>
          <Badge variant="outline">{viewers.length}</Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {viewers.length > 0 ? (
        viewers.map((viewer) => <ViewerCard key={viewer.id} viewer={viewer} />)
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
        <Badge variant="outline">{batch.status}</Badge>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Classe Documentale</span>
        <span className="font-medium">{docClassDetails.name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Inviato il</span>
        <span className="font-medium">{formatDynamicDate(batch.sent_at)}</span>
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
