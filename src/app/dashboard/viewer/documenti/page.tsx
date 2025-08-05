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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Calendar, FileText, Search } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  sharedBy: string;
  sharedDate: string;
  status: "available" | "downloaded" | "viewed";
}

export default function ViewerDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Report_2024.pdf",
        type: "PDF",
        size: "2.5 MB",
        sharedBy: "Mario Rossi",
        sharedDate: "2024-01-15",
        status: "available",
      },
      {
        id: "2",
        name: "Presentazione.pptx",
        type: "PPTX",
        size: "5.1 MB",
        sharedBy: "Giulia Bianchi",
        sharedDate: "2024-01-14",
        status: "downloaded",
      },
      {
        id: "3",
        name: "Contratto.pdf",
        type: "PDF",
        size: "1.8 MB",
        sharedBy: "Admin",
        sharedDate: "2024-01-13",
        status: "viewed",
      },
    ];

    setDocuments(mockDocuments);
    setIsLoading(false);
  }, []);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.sharedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleView = (documentId: string) => {
    console.log("Viewing document:", documentId);
    // TODO: Implement document viewing
  };

  const handleDownload = (documentId: string) => {
    console.log("Downloading document:", documentId);
    // TODO: Implement document download
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Caricamento documenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti Condivisi</h1>
          <p className="text-muted-foreground">
            Visualizza e scarica i documenti condivisi con te
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{documents.length} documenti</Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Ricerca Documenti</CardTitle>
          <CardDescription>
            Cerca per nome documento o nome del condivisore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Cerca documenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documenti Disponibili</CardTitle>
          <CardDescription>
            {filteredDocuments.length} di {documents.length} documenti trovati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                      <span>{doc.type}</span>
                      <span>{doc.size}</span>
                      <span>Condiviso da: {doc.sharedBy}</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{doc.sharedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      doc.status === "downloaded"
                        ? "default"
                        : doc.status === "viewed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {doc.status === "downloaded"
                      ? "Scaricato"
                      : doc.status === "viewed"
                        ? "Visualizzato"
                        : "Disponibile"}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(doc.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Visualizza
                  </Button>

                  <Button size="sm" onClick={() => handleDownload(doc.id)}>
                    <Download className="mr-1 h-4 w-4" />
                    Scarica
                  </Button>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="py-8 text-center">
                <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">
                  Nessun documento trovato
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Prova a modificare i termini di ricerca."
                    : "Non ci sono documenti condivisi con te."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
