import { useState, useEffect } from "react";
import useAuthStore from "@/app/api/auth";
import { getMyDocumentClasses, type MyDocumentClass } from "@/app/api/api";

export function useDocumentClasses() {
  const [documentClasses, setDocumentClasses] = useState<MyDocumentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const authStore = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchDocumentClasses = async () => {
      if (authStore.user?.role !== "sharer") {
        setDocumentClasses([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getMyDocumentClasses();
        setDocumentClasses(response.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
        console.error("Errore nel recupero delle classi documentali:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      void fetchDocumentClasses();
    }
  }, [authStore.user?.role, isMounted]);

  return { documentClasses, isLoading, error };
}
