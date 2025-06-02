"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  userService,
  type DocumentClass,
  type DocumentClassField,
  type Sharer,
} from "@/app/api/api"; // Import necessary types
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldsSortableTable } from "@/components/dashboard/detail-page-components/fields-sortable-table"; // Import the new component
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// --- Copied type definitions from the list page for consistent transformation ---
// Define interfaces for the raw API response structure (for a list)
interface ApiDocumentClassField {
  id: number;
  name: string;
  label: string;
  data_type: string;
  required: number;
  is_primary_key: number;
  sort_order: number;
  options?: { value: string; label: string }[] | null;
}

interface ApiDocumentClass {
  id: number;
  name: string;
  description: string;
  created_by: string;
  sharers_count: number;
  sharers: Sharer[];
  fields: ApiDocumentClassField[];
  created_at?: string;
  updated_at?: string;
}

// This ApiResponse is for a list of document classes
interface ApiListResponse {
  message: string;
  data: ApiDocumentClass[];
}
// --- End of copied type definitions ---

export default function DocumentClassDetailPage() {
  const params = useParams();
  const idFromRoute = params?.id as string;

  const [documentClass, setDocumentClass] = useState<DocumentClass | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format dates in a pretty format
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Non disponibile";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString; // fallback to original string if parsing fails
    }
  };

  useEffect(() => {
    if (idFromRoute) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch the entire list of document classes
          const response =
            (await userService.getDocumentClasses()) as unknown as ApiListResponse;

          if (response?.data && Array.isArray(response.data)) {
            // Transform the entire list first
            const transformedList: DocumentClass[] = response.data.map(
              (apiDoc: ApiDocumentClass): DocumentClass => ({
                id: apiDoc.id,
                nome: apiDoc.name,
                descrizione: apiDoc.description,
                campi:
                  apiDoc.fields?.map((field) => ({
                    id: field.id,
                    nome: field.name,
                    label: field.label,
                    tipo: field.data_type,
                    obbligatorio: field.required === 1,
                    is_primary_key: field.is_primary_key === 1,
                    sort_order: field.sort_order,
                    options: field.options,
                  })) ?? [],
                // For sharer, let's attempt to use the first from the list if present,
                // otherwise null. This matches the previous single-item fetch attempt.
                sharer:
                  (apiDoc.sharers && apiDoc.sharers.length > 0
                    ? apiDoc.sharers[0]
                    : null) ?? null,
                created_at: apiDoc.created_at ?? "",
                updated_at: apiDoc.updated_at ?? "",
              }),
            );

            // Find the specific document class by ID from the transformed list
            const numericId = Number(idFromRoute);
            const foundDoc = transformedList.find(
              (doc) => doc.id === numericId,
            );

            if (foundDoc) {
              setDocumentClass(foundDoc);
              console.log("Found and set document class:", foundDoc);
            } else {
              throw new Error(
                `Document class with ID ${idFromRoute} not found in the list.`,
              );
            }
          } else {
            throw new Error(
              "Document class list data not found in API response or is malformed.",
            );
          }
        } catch (err) {
          console.error("Failed to fetch or find document class:", err);
          const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
          setError(errorMessage);
          toast.error(`Failed to load document class: ${errorMessage}`);
        } finally {
          setIsLoading(false);
        }
      };
      void fetchData();
    }
  }, [idFromRoute]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Errore: {error}</p>
      </div>
    );
  }

  if (!documentClass) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Classe documentale non trovata.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Simplified Header */}
      <div className="mb-8">
        <h1 className="text-3xl">{documentClass.nome}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {documentClass.descrizione}
        </p>
      </div>

      {/* Minimal Tabs */}
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-full">
          <TabsTrigger value="basic-info">Generale</TabsTrigger>
          <TabsTrigger value="fields">
            Campi ({documentClass.campi.length})
          </TabsTrigger>
          <TabsTrigger value="sharers">Utenti</TabsTrigger>
          <TabsTrigger value="audit">Avanzate</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="id" className="text-sm">
                  ID
                </Label>
                <Input
                  id="id"
                  type="number"
                  defaultValue={documentClass.id}
                  className="bg-muted/50"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="nome" className="text-sm">
                  Nome
                </Label>
                <Input
                  id="nome"
                  defaultValue={documentClass.nome}
                  className="bg-background"
                />
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="descrizione" className="text-sm font-medium">
                  Descrizione
                </Label>
                <Textarea
                  id="descrizione"
                  defaultValue={documentClass.descrizione}
                  className="bg-background max-w-lg resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Campi</h2>

            {/* Simplified Add Field Form */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-sm font-medium">Aggiungi Campo</h3>
              <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="new_field_label" className="text-xs">
                    Nome Etichetta
                  </Label>
                  <Input
                    type="text"
                    id="new_field_label"
                    className="h-8"
                    placeholder="Nome campo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_field_data_type" className="text-xs">
                    Tipologia
                  </Label>
                  <select
                    id="new_field_data_type"
                    className="bg-background h-8 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="string">Testo</option>
                    <option value="boolean">Binario (Si/No)</option>
                    <option value="integer">Numero Intero</option>
                    <option value="decimal">Numero Decimale</option>
                    <option value="date">Data</option>
                    <option value="datetime">Data e Ora</option>
                    <option value="enum">Lista Opzioni</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="new_field_required" />
                    <Label htmlFor="new_field_required" className="text-xs">
                      Obbligatorio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="new_field_is_primary_key" />
                    <Label
                      htmlFor="new_field_is_primary_key"
                      className="text-xs"
                    >
                      Chiave Primaria
                    </Label>
                  </div>
                </div>

                <Button type="submit" size="sm" className="h-8 self-end">
                  Aggiungi
                </Button>
              </form>
            </div>

            {documentClass.campi && documentClass.campi.length > 0 ? (
              <FieldsSortableTable initialFields={documentClass.campi} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Nessun campo definito per questa classe documentale.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sharers" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Utenti associati</h2>
            {documentClass.sharer ? (
              <div className="rounded-lg border p-4">
                <p className="text-sm">
                  <span className="font-medium">Utente assegnato:</span>{" "}
                  {documentClass.sharer.nominativo}
                </p>
                <p className="text-muted-foreground text-xs">
                  ID: {documentClass.sharer.id}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nessun utente associato a questa classe documentale.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Informazioni avanzate</h2>
            <div className="grid gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Creato il
                </p>
                <p className="text-sm">
                  {formatDate(documentClass.created_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Ultima modifica il
                </p>
                <p className="text-sm">
                  {formatDate(documentClass.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
