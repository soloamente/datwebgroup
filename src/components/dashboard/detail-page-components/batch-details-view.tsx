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
} from "@remixicon/react";
import { Button } from "@/components/ui/button";

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
        <div className="space-y-3">
          {batch.viewers.map((viewer: ViewerInfo) => (
            <div key={viewer.id} className="bg-muted/50 rounded-lg border p-3">
              <p className="font-medium">{viewer.nominativo}</p>
              <p className="text-muted-foreground text-sm">{viewer.email}</p>
              {viewer.codice_fiscale && (
                <p className="text-muted-foreground mt-1 text-xs">
                  CF: {viewer.codice_fiscale}
                </p>
              )}
              {viewer.partita_iva && (
                <p className="text-muted-foreground text-xs">
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
        <div className="space-y-6">
          {batch.documents.map((doc: DocumentWithMetadata) => {
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

            return (
              <div key={doc.id} className="bg-background rounded-lg border p-4">
                <h4 className="mb-3 font-semibold">Metadati Documento</h4>
                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
                  {metadataEntries.map(([key, value]) => {
                    const fieldDetails = getFieldDetails(key);
                    return (
                      <div key={key}>
                        <p className="text-muted-foreground">
                          {fieldDetails?.label ?? key}
                        </p>
                        <MetadataValue
                          value={value}
                          dataType={fieldDetails?.data_type}
                        />
                      </div>
                    );
                  })}
                </div>

                <h5 className="mb-2 text-sm font-semibold">
                  File Allegati ({doc.files.length})
                </h5>
                <div className="space-y-2">
                  {doc.files.map((file: AttachedFile) => (
                    <div
                      key={file.id}
                      className="bg-muted/50 flex items-center justify-between rounded-md p-2"
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
                      <Button variant="ghost" size="icon">
                        <RiDownload2Line size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
