"use client";

import {
  type MyDocumentClass,
  type Viewer,
  docClassService,
  userService,
} from "@/app/api/api";
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/dashboard/sharer/documenti/client-selector";
import { DocumentMetadata } from "@/components/dashboard/sharer/documenti/document-metadata";
import {
  FileUploader,
  type FileWithPreview,
} from "@/components/dashboard/sharer/documenti/file-uploader";
import { ReviewAndSend } from "@/components/dashboard/sharer/documenti/review-and-send";
import { Stepper } from "@/components/dashboard/sharer/documenti/stepper";
import { ArrowLeft, FileUp, Send } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const steps = [
  "Destinatari",
  "File da Spedire",
  "Dettagli Documento",
  "Riepilogo e Invio",
];

export default function DocumentiPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedClients, setSelectedClients] = useState<Viewer[]>([]);
  const [documentClasses, setDocumentClasses] = useState<MyDocumentClass[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocClassId, setSelectedDocClassId] = useState("");
  const [metadata, setMetadata] = useState<
    Record<string, string | number | boolean>
  >({});
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchViewers = useCallback(async () => {
    try {
      const viewersData = await userService.getViewers();
      if (Array.isArray(viewersData)) {
        setViewers(viewersData);
      }
    } catch (error) {
      console.error("Failed to fetch viewers:", error);
      toast.error("Impossibile caricare i client.");
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [docClassesResponse] = await Promise.all([
          docClassService.getMyDocumentClasses(),
          fetchViewers(),
        ]);

        if (docClassesResponse?.data) {
          setDocumentClasses(docClassesResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch document classes:", error);
        toast.error("Impossibile caricare le classi documentali.");
      } finally {
        setIsLoading(false);
      }
    };
    void fetchInitialData();
  }, [fetchViewers]);

  const handleViewerCreated = () => {
    void fetchViewers();
  };

  const handleClientSelect = (client: Viewer) => {
    if (!selectedClients.some((c) => c.id === client.id)) {
      setSelectedClients([...selectedClients, client]);
    }
  };

  const removeClient = (clientId: number) => {
    setSelectedClients(selectedClients.filter((c) => c.id !== clientId));
  };

  const handleDocClassChange = (classId: string) => {
    setSelectedDocClassId(classId);
    setMetadata({}); // Reset metadata when class changes
  };

  const handleMetadataChange = (
    fieldName: string,
    value: string | number | boolean,
  ) => {
    setMetadata((prev) => ({ ...prev, [fieldName]: value }));
  };

  const selectedDocClass = useMemo(
    () => documentClasses.find((c) => c.id.toString() === selectedDocClassId),
    [selectedDocClassId, documentClasses],
  );

  const isMetadataValid = useMemo(() => {
    if (!selectedDocClass) return false;
    return selectedDocClass.fields.every((field) => {
      if (!field.required) return true;
      const value = metadata[field.name];
      return value !== undefined && value !== "" && value !== null;
    });
  }, [selectedDocClass, metadata]);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return selectedClients.length > 0;
      case 1:
        return files.length > 0;
      case 2:
        return selectedDocClassId !== "" && isMetadataValid;
      case 3:
        return true;
      default:
        return false;
    }
  }, [
    currentStep,
    selectedClients,
    files,
    selectedDocClassId,
    isMetadataValid,
  ]);

  const handleNext = () => {
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSendDocuments = async () => {
    if (
      !isStepValid ||
      !(
        selectedClients.length > 0 &&
        selectedDocClassId &&
        files.length > 0 &&
        isMetadataValid
      )
    ) {
      toast.error("Per favore, compila tutti i campi obbligatori.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Invio in corso...");

    try {
      const response = await userService.shareDocuments({
        document_class_id: parseInt(selectedDocClassId, 10),
        viewer_ids: selectedClients.map((c) => c.id),
        metadata,
        files,
      });

      if (response.batch_id) {
        toast.success(response.message, { id: toastId });
        // Reset form state to start over
        setCurrentStep(0);
        setSelectedClients([]);
        setSelectedDocClassId("");
        setMetadata({});
        setFiles([]);
      } else {
        let errorMessage = response.message;
        if (response.errors) {
          errorMessage = Object.values(response.errors).flat().join("\n");
        }
        toast.error(errorMessage, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to send documents:", error);
      toast.error("Si è verificato un errore durante l'invio.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ClientSelector
            viewers={viewers}
            selectedClients={selectedClients}
            onClientSelect={handleClientSelect}
            onRemoveClient={removeClient}
            onViewerCreated={handleViewerCreated}
          />
        );
      case 1:
        return <FileUploader files={files} setFiles={setFiles} />;
      case 2:
        return (
          <DocumentMetadata
            documentClasses={documentClasses}
            selectedDocClassId={selectedDocClassId}
            onDocClassChange={handleDocClassChange}
            metadata={metadata}
            onMetadataChange={handleMetadataChange}
            isLoading={isLoading}
            selectedDocClass={selectedDocClass}
          />
        );
      case 3:
        return (
          <ReviewAndSend
            selectedClients={selectedClients}
            selectedDocClass={selectedDocClass}
            files={files}
            metadata={metadata}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background flex h-full flex-col p-4 lg:p-6">
      <header className="flex-shrink-0">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Nuova Spedizione
        </h1>
        <p className="text-muted-foreground">
          Componi e invia i documenti ai tuoi clienti in un unico posto.
        </p>
      </header>

      <div className="mt-6 flex-shrink-0">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden py-6">
        {renderCurrentStep()}
      </main>

      <footer className="mt-auto flex flex-shrink-0 justify-between border-t pt-4">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          )}
        </div>
        <div>
          {currentStep < steps.length - 1 ? (
            <Button
              color="primary"
              onClick={handleNext}
              disabled={!isStepValid}
            >
              Avanti
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={handleSendDocuments}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Invio in corso..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Invia Documenti
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
