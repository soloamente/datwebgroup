"use client";
import DocumentClassiTable from "@/components/dashboard/tables/admin/classi-documentali";
import {
  getDocumentClasses,
  type DocumentClass,
  type DocumentClassField,
  type Sharer,
} from "@/app/api/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import { FileStack, ListChecks, CalendarPlus, FilePlus } from "lucide-react";
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
  logo_url?: string; // Add logo_url to API response type
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

  // Calculate previous month and year
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  // Count document classes created in the previous month
  const prevMonthCreated = documents.filter((doc) => {
    const createdDate = new Date(doc.created_at);
    return (
      createdDate.getMonth() === prevMonth &&
      createdDate.getFullYear() === prevMonthYear
    );
  }).length;

  // Calculate the ratio of this month to last month as a percentage for Totale Classi
  let percentOfLastMonth = 0;
  if (prevMonthCreated === 0 && recentlyCreated > 0) {
    percentOfLastMonth = 100;
  } else if (prevMonthCreated === 0 && recentlyCreated === 0) {
    percentOfLastMonth = 0;
  } else {
    percentOfLastMonth = (recentlyCreated / prevMonthCreated) * 100;
  }
  const formattedChange = `${percentOfLastMonth.toFixed(0)}%`;
  const trend = "up";

  // Calculate the percentage change for 'Create questo mese' (without increase/decrease labels)
  let monthChange = 0;
  let monthTrend: "up" | "down" = "up";
  if (prevMonthCreated === 0 && recentlyCreated > 0) {
    monthChange = 100;
    monthTrend = "up";
  } else if (prevMonthCreated === 0 && recentlyCreated === 0) {
    monthChange = 0;
    monthTrend = "up";
  } else {
    monthChange =
      ((recentlyCreated - prevMonthCreated) / prevMonthCreated) * 100;
    if (monthChange > 0) {
      monthTrend = "up";
    } else if (monthChange < 0) {
      monthTrend = "down";
    } else {
      monthTrend = "up";
    }
  }
  const formattedMonthChange =
    monthChange === 0 ? "0%" : `${Math.abs(monthChange).toFixed(0)}%`;

  // Calculate the percentage change for 'Totale Campi' (without increase/decrease labels)
  let fieldsChange = 0;
  let fieldsTrend: "up" | "down" = "up";
  // Calculate total fields for previous month
  const prevMonthFields = documents
    .filter((doc) => {
      const createdDate = new Date(doc.created_at);
      return (
        createdDate.getMonth() === prevMonth &&
        createdDate.getFullYear() === prevMonthYear
      );
    })
    .reduce((acc, doc) => acc + (doc.campi?.length ?? 0), 0);
  if (prevMonthFields === 0 && totalFields > 0) {
    fieldsChange = 100;
    fieldsTrend = "up";
  } else if (prevMonthFields === 0 && totalFields === 0) {
    fieldsChange = 0;
    fieldsTrend = "up";
  } else {
    fieldsChange = ((totalFields - prevMonthFields) / prevMonthFields) * 100;
    if (fieldsChange > 0) {
      fieldsTrend = "up";
    } else if (fieldsChange < 0) {
      fieldsTrend = "down";
    } else {
      fieldsTrend = "up";
    }
  }
  const formattedFieldsChange =
    fieldsChange === 0 ? "0%" : `${Math.abs(fieldsChange).toFixed(0)}%`;

  // --- Handlers for dialog ---
  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  // Type guard function to check if response is valid ApiResponse
  const isValidApiResponse = (data: unknown): data is ApiResponse => {
    return (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      Array.isArray((data as ApiResponse).data)
    );
  };

  const fetchDocumentClassesData = async () => {
    console.log("fetchDocumentClassesData called");
    setIsLoading(true);
    try {
      // The API actually returns a response object with message and data properties
      let apiResponse: unknown;

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        apiResponse = await getDocumentClasses();
      } catch (apiError) {
        console.error("API call failed:", apiError);
        toast.error("Impossibile caricare le classi documentali.");
        setDocuments([]);
        return;
      }

      // Check if the result is a valid ApiResponse
      if (!isValidApiResponse(apiResponse)) {
        console.error("Invalid response from getDocumentClasses:", apiResponse);
        toast.error("Risposta non valida dal server.");
        setDocuments([]);
        return;
      }

      // Now we can safely use apiResponse as ApiResponse and transform the data
      const transformedData: DocumentClass[] = apiResponse.data.map(
        (item: ApiDocumentClass): DocumentClass => ({
          id: item.id,
          nome: item.name,
          descrizione: item.description,
          logo_url: item.logo_url ?? null,
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
          className="bg-primary rounded-full text-white"
          onClick={handleOpenCreateDialog}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Crea Classe Documentale
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        {/* Stats grid */}
        <StatsGrid
          stats={[
            {
              title: "Totale Classi",
              value: totalClasses.toString(),
              change: { value: formattedChange, trend },
              icon: <FileStack size={20} />, // Replace with a more relevant icon if desired
            },
            {
              title: "Totale Campi",
              value: totalFields.toString(),
              change: { value: formattedFieldsChange, trend: fieldsTrend },
              icon: <ListChecks size={20} />, // Replace with a more relevant icon if desired
            },
            {
              title: "Create questo mese",
              value: recentlyCreated.toString(),
              change: { value: formattedMonthChange, trend: monthTrend },
              icon: <CalendarPlus size={20} />, // Replace with a more relevant icon if desired
            },
          ]}
        />
        {/* Table section */}

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
