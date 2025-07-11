import {
  type EnrichedDocument,
  type DocumentWithMetadata,
  type AttachedFile,
} from "@/components/dashboard/tables/sharer/shared-documents-table";
import { type ViewerInfo, type DocumentClassDetails } from "@/app/api/api";
import { Badge } from "@/components/ui/badge";
import { formatDynamicDate } from "@/lib/date-format";
import {
  RiUserLine,
  RiFileList3Line,
  RiFile2Line,
  RiDownload2Line,
  RiCheckLine,
  RiCloseLine,
  RiQuestionMark,
  RiFileTextLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BatchDetailsViewProps {
  batch: EnrichedDocument;
  docClassDetails: DocumentClassDetails;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const isURL = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

const MetadataValue = ({
  value,
  dataType,
}: {
  value: unknown;
  dataType?: string;
}) => {
  if (dataType === "boolean") {
    const truthyValues: (string | number | boolean)[] = [true, 1, "1"];
    const falsyValues: (string | number | boolean)[] = [false, 0, "0"];

    if (truthyValues.includes(value as string | number | boolean)) {
      return (
        <Badge className="flex w-fit items-center gap-1 border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700">
          <RiCheckLine size={16} />
          <span>Sì</span>
        </Badge>
      );
    }
    if (falsyValues.includes(value as string | number | boolean)) {
      return (
        <Badge variant="destructive" className="flex w-fit items-center gap-1">
          <RiCloseLine size={16} />
          <span>No</span>
        </Badge>
      );
    }
    // For null, undefined, or other non-boolean values in a boolean field
    return (
      <Badge variant="outline" className="flex w-fit items-center gap-1">
        <RiQuestionMark size={16} />
        <span>N/D</span>
      </Badge>
    );
  }

  if (value === null || value === undefined) {
    return <p className="font-medium">-</p>;
  }

  switch (typeof value) {
    case "boolean":
      // This will be caught by the dataType check above, but as a fallback:
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
    case "string":
      if (value.trim() === "") {
        return <p className="font-medium">-</p>;
      }
      if (isURL(value)) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {value}
          </a>
        );
      }
      // Very basic date check
      if (!isNaN(Date.parse(value)) && /\d{4}-\d{2}-\d{2}/.exec(value)) {
        return <p className="font-medium">{formatDynamicDate(value)}</p>;
      }
      return <p className="font-medium">{value}</p>;

    case "number":
    case "bigint":
      return <p className="font-medium">{String(value)}</p>;

    case "object": {
      const displayValue = JSON.stringify(value);
      if (displayValue === "{}" || displayValue === "[]") {
        return <p className="font-medium">-</p>;
      }
      return <p className="font-medium">{displayValue}</p>;
    }

    case "symbol":
    case "function": {
      const displayValue = String(value);
      if (displayValue.trim() === "") {
        return <p className="font-medium">-</p>;
      }
      return <p className="font-medium">{displayValue}</p>;
    }

    default:
      // Fallback for any unexpected type
      return <p className="font-medium">-</p>;
  }
};

export function BatchDetailsView({
  batch,
  docClassDetails,
}: BatchDetailsViewProps) {
  const getFieldDetails = (fieldName: string) => {
    return docClassDetails?.fields?.find((f) => f.name === fieldName);
  };

  return (
    <div className="space-y-8">
      {/* Viewers Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <RiUserLine />
          Destinatari ({batch.viewers.length})
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {batch.viewers.map((viewer: ViewerInfo) => (
            <div
              key={viewer.id}
              className="bg-background rounded-lg border p-3"
            >
              <p className="font-semibold">{viewer.nominativo}</p>
              <p className="text-muted-foreground truncate text-sm">
                {viewer.email}
              </p>
              {viewer.codice_fiscale && (
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  CF: {viewer.codice_fiscale}
                </p>
              )}
              {viewer.partita_iva && (
                <p className="text-muted-foreground font-mono text-xs">
                  P.IVA: {viewer.partita_iva}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <RiFileList3Line />
          Documenti Inclusi ({batch.documents.length})
        </h3>
        <Accordion type="multiple" className="w-full">
          {batch.documents.map((doc: DocumentWithMetadata, index: number) => {
            const metadataEntries = Object.entries(doc.metadata);
            // Optional: Sort entries based on docClassDetails.fields order
            metadataEntries.sort(([keyA], [keyB]) => {
              const fieldA = getFieldDetails(keyA);
              const fieldB = getFieldDetails(keyB);
              const indexA =
                fieldA && "sort_order" in fieldA
                  ? (fieldA.sort_order as number)
                  : Infinity;
              const indexB =
                fieldB && "sort_order" in fieldB
                  ? (fieldB.sort_order as number)
                  : Infinity;
              return indexA - indexB;
            });

            // Find a good title for the accordion trigger
            const titleField = docClassDetails.fields?.find(
              (f) => "is_title" in f && f.is_title,
            );
            const docTitle =
              titleField && doc.metadata[titleField.name]
                ? String(doc.metadata[titleField.name])
                : `Documento #${index + 1}`;

            return (
              <AccordionItem value={`doc-${doc.id}`} key={doc.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <RiFileTextLine className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{docTitle}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    <div>
                      <h4 className="mb-3 font-semibold">Metadati Documento</h4>
                      <div className="rounded-lg border">
                        <dl className="divide-border divide-y">
                          {metadataEntries.map(([key, value], idx) => {
                            const fieldDetails = getFieldDetails(key);
                            return (
                              <div
                                key={key}
                                className="grid grid-cols-3 gap-4 px-4 py-3"
                              >
                                <dt className="text-muted-foreground col-span-1">
                                  {fieldDetails?.label ?? key}
                                </dt>
                                <dd className="col-span-2">
                                  <MetadataValue
                                    value={value}
                                    dataType={fieldDetails?.data_type}
                                  />
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    </div>

                    <div>
                      <h5 className="mb-3 font-semibold">
                        File Allegati ({doc.files.length})
                      </h5>
                      <div className="space-y-2">
                        {doc.files.map((file: AttachedFile) => (
                          <div
                            key={file.id}
                            className="bg-muted/20 hover:bg-muted/50 flex items-center justify-between rounded-md border p-2 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <RiFile2Line className="text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {file.original_filename}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={`/api/files/${file.id}/download`}
                                download
                              >
                                <RiDownload2Line size={18} />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
