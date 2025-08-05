"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Download,
  Calendar,
  FileText,
  Trash2,
  FolderOpen,
} from "lucide-react";

interface DownloadedDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  downloadedDate: string;
  originalSharedBy: string;
  localPath: string;
}

export default function DownloadedDocuments() {
  const [documents, setDocuments] = useState<DownloadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockDocuments: DownloadedDocument[] = [
      {
        id: "1",
        name: "Report_2024.pdf",
        type: "PDF",
        size: "2.5 MB",
        downloadedDate: "2024-01-15",
        originalSharedBy: "Mario Rossi",
        localPath: "/downloads/Report_2024.pdf",
      },
      {
        id: "2",
        name: "Presentazione.pptx",
        type: "PPTX",
        size: "5.1 MB",
        downloadedDate: "2024-01-14",
        originalSharedBy: "Giulia Bianchi",
        localPath: "/downloads/Presentazione.pptx",
      },
      {
        id: "3",
        name: "Contratto.pdf",
        type: "PDF",
        size: "1.8 MB",
        downloadedDate: "2024-01-13",
        originalSharedBy: "Admin",
        localPath: "/downloads/Contratto.pdf",
      },
    ];

    setDocuments(mockDocuments);
    setIsLoading(false);
  }, []);

  const handleOpen = (document: DownloadedDocument) => {
    console.log("Opening document:", document.localPath);
    // TODO: Implement document opening
  };

  const handleDelete = (documentId: string) => {
    console.log("Deleting document:", documentId);
    // TODO: Implement document deletion
    setDocuments((docs) => docs.filter((doc) => doc.id !== documentId));
  };

  const handleOpenFolder = () => {
    console.log("Opening downloads folder");
    // TODO: Implement folder opening
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">
            Caricamento documenti scaricati...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti Scaricati</h1>
          <p className="text-muted-foreground">
            Gestisci i documenti scaricati localmente
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleOpenFolder}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Apri Cartella
          </Button>
          <Badge variant="secondary">{documents.length} documenti</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale Scaricati
            </CardTitle>
            <Download className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-muted-foreground text-xs">Documenti scaricati</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Spazio Occupato
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents
                .reduce((acc, doc) => {
                  const sizeStr = doc.size?.split(" ")[0];
                  const size = sizeStr ? parseFloat(sizeStr) : 0;
                  return acc + size;
                }, 0)
                .toFixed(1)}{" "}
              MB
            </div>
            <p className="text-muted-foreground text-xs">Spazio totale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ultimo Download
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.length > 0 && documents[0]
                ? documents[0].downloadedDate
                : "N/A"}
            </div>
            <p className="text-muted-foreground text-xs">
              Data ultimo download
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documenti Scaricati</CardTitle>
          <CardDescription>
            I documenti che hai scaricato e salvato localmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                      <span>{doc.type}</span>
                      <span>{doc.size}</span>
                      <span>Condiviso da: {doc.originalSharedBy}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Scaricato: {doc.downloadedDate}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Percorso: {doc.localPath}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpen(doc)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Apri
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Elimina
                  </Button>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="py-8 text-center">
                <Download className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">
                  Nessun documento scaricato
                </h3>
                <p className="text-muted-foreground">
                  I documenti che scarichi appariranno qui per una gestione
                  locale.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
