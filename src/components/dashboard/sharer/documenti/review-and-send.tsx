"use client";

import { type MyDocumentClass, type Viewer } from "@/app/api/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, User, Users } from "lucide-react";
import { type FileWithPreview } from "./file-uploader";

interface ReviewAndSendProps {
  selectedClients: Viewer[];
  selectedDocClass: MyDocumentClass | undefined;
  files: FileWithPreview[];
  metadata: Record<string, string | number | boolean>;
}

export function ReviewAndSend({
  selectedClients,
  selectedDocClass,
  files,
  metadata,
}: ReviewAndSendProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Destinatari</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedClients.map((client) => (
              <Badge key={client.id} variant="secondary">
                <User className="mr-1 h-3 w-3" />
                {client.nominativo}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            <span>File</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-24">
            <ul className="list-inside list-disc space-y-1">
              {files.map((file) => (
                <li key={file.name} className="text-sm">
                  {file.name}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Dettagli Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Classe Documentale:</span>{" "}
              {selectedDocClass?.name}
            </p>
            <h4 className="font-semibold">Metadati:</h4>
            <div className="grid grid-cols-1 gap-2 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedDocClass?.fields
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((field) => (
                  <div key={field.id}>
                    <p className="text-sm font-semibold">{field.label}</p>
                    <p className="text-muted-foreground text-sm">
                      {String(metadata[field.name] ?? "N/A")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
