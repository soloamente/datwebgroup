"use client";

import {
  RiCheckLine,
  RiCloseLine,
  RiFileList3Line,
  RiInformationLine,
  RiQuestionMark,
  RiUserLine,
  RiInbox2Line,
} from "@remixicon/react";

import { type DocumentClassDetails, type ViewerInfo } from "@/app/api/api";
import type {
  DocumentWithMetadata,
  EnrichedDocument,
} from "@/components/dashboard/tables/sharer/shared-documents-table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDynamicDate } from "@/lib/date-format";
import { generateAvatarColor, isDateString, isURL } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-zinc-50/50 p-8 text-center dark:bg-zinc-900/50">
        <RiInbox2Line className="text-muted-foreground mb-4 h-10 w-10" />
        <h3 className="font-semibold">Nessun metadato</h3>
        <p className="text-muted-foreground text-sm">
          Non ci sono metadati per questo documento.
        </p>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border bg-zinc-50/50 p-4 sm:grid-cols-2 dark:bg-zinc-900/50">
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

const DocumentContentView = ({
  doc,
  docClassDetails,
  batchId,
  onUpdate,
}: DocumentContentViewProps) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Metadati</CardTitle>
      </CardHeader>
      <CardContent>
        <MetadataDisplay doc={doc} docClassDetails={docClassDetails} />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>File Allegati</CardTitle>
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
  </div>
);

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
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50/50 p-8 dark:bg-gray-900/50">
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
  const avatarColor = generateAvatarColor(viewer.email);
  const initials = viewer.nominativo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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
    </div>
  );
};

export const ViewersSection = ({ viewers }: { viewers: ViewerInfo[] }) => (
  <Card>
    <CardHeader>
      <SectionHeader
        icon={RiUserLine}
        title={`Destinatari (${viewers.length})`}
      />
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
