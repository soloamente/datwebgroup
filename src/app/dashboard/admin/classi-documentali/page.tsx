"use client";
import DocumentClassiTable from "@/components/dashboard/tables/admin/classi-documentali";
import {
  userService,
  type DocumentClass,
  type DocumentClassField,
  type Sharer,
} from "@/app/api/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDocumentClassDialog } from "@/components/dashboard/create-document-class-dialog";

// Define interfaces for the raw API response structure
interface ApiDocumentClassField {
  id: number;
  name: string; // Corresponds to DocumentClassField.nome
  label: string; // Not directly used in current DocumentClassField, but present in API
  data_type: string; // Corresponds to DocumentClassField.tipo
  required: number; // 0 or 1, corresponds to DocumentClassField.obbligatorio (boolean)
  is_primary_key: number;
  sort_order: number;
  options?: { value: string; label: string }[] | null;
}

interface ApiDocumentClass {
  id: number;
  name: string; // Corresponds to DocumentClass.nome
  description: string; // Corresponds to DocumentClass.descrizione
  created_by: string; // Not in current DocumentClass, but present
  sharers_count: number;
  sharers: Sharer[]; // Assuming Sharer type from api.ts might be different or not directly applicable here
  fields: ApiDocumentClassField[];
  // created_at and updated_at are missing in the provided API response for the main items
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  message: string;
  data: ApiDocumentClass[];
}

export default function ClassiDocumentali() {
  const [documents, setDocuments] = useState<DocumentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // State for create dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // --- Stats calculation ---
  // Total document classes
  const totalClasses = documents.length;
  // Total fields across all classes
  const totalFields = documents.reduce(
    (acc, doc) => acc + (doc.campi?.length ?? 0),
    0,
  );
  // Recently created (this month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const recentlyCreated = documents.filter((doc) => {
    const createdDate = new Date(doc.created_at);
    return (
      createdDate.getMonth() === currentMonth &&
      createdDate.getFullYear() === currentYear
    );
  }).length;

  // --- Handlers for dialog ---
  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  const fetchDocumentClassesData = async () => {
    console.log("fetchDocumentClassesData called");
    setIsLoading(true);
    try {
      const response =
        (await userService.getDocumentClasses()) as unknown as ApiResponse;

      if (response?.data && Array.isArray(response.data)) {
        const transformedData: DocumentClass[] = response.data.map(
          (item: ApiDocumentClass): DocumentClass => ({
            id: item.id,
            nome: item.name,
            descrizione: item.description,
            campi:
              item.fields?.map(
                (field: ApiDocumentClassField): DocumentClassField => ({
                  id: field.id,
                  nome: field.name,
                  label: field.label,
                  tipo: field.data_type,
                  obbligatorio: field.required === 1,
                  is_primary_key: field.is_primary_key === 1,
                  sort_order: field.sort_order,
                  options: field.options,
                }),
              ) ?? [],
            sharers: item.sharers ?? [],
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? "",
          }),
        );
        console.log("Transformed document classes data:", transformedData);
        setDocuments(transformedData);
      } else {
        console.error(
          "Fetched data is not in the expected format or data array is missing:",
          response,
        );
        toast.error("Dati ricevuti in formato non valido.");
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch document classes:", error);
      toast.error("Impossibile caricare le classi documentali.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDocumentClassesData();
  }, []);

  const refreshData = () => {
    void fetchDocumentClassesData();
  };

  console.log(
    "Rendering ClassiDocumentali page. isLoading:",
    isLoading,
    "documents:",
    documents,
  );

  return (
    <main className="flex flex-col gap-4">
      {/* Header and actions */}
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            Classi Documentali
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestisci le classi documentali del sistema. Visualizza, modifica o
            creane di nuove.
          </p>
        </div>
        <Button
          className="bg-primary text-white"
          onClick={handleOpenCreateDialog}
        >
          <Plus size={20} />
          Crea Classe Documentale
        </Button>
      </div>
      {/* Stats grid */}
      <StatsGrid
        stats={[
          {
            title: "Totale Classi",
            value: totalClasses.toString(),
            change: { value: "", trend: "up" },
            icon: <Plus size={20} />, // Replace with a more relevant icon if desired
          },
          {
            title: "Totale Campi",
            value: totalFields.toString(),
            change: { value: "", trend: "up" },
            icon: <Plus size={20} />, // Replace with a more relevant icon if desired
          },
          {
            title: "Create questo mese",
            value: recentlyCreated.toString(),
            change: { value: "", trend: "up" },
            icon: <Plus size={20} />, // Replace with a more relevant icon if desired
          },
        ]}
      />
      {/* Table section */}
      <div className="flex flex-col gap-4">
        <DocumentClassiTable
          data={documents}
          isLoading={isLoading}
          onRefreshData={refreshData}
        />
      </div>
      {/* Create Document Class Dialog (to be implemented) */}
      <CreateDocumentClassDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onCreated={refreshData}
      />
    </main>
  );
}
