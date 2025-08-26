import { useState, useEffect } from "react";
import { userService } from "@/app/api/api";

/**
 * Custom hook to fetch and manage the sharer logo
 * @returns Object containing the logo URL, loading state, and error state
 */
export function useSharerLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLogo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = await userService.getSharerLogo();
        
        if (isMounted) {
          setLogoUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching sharer logo:", err);
          setError(err instanceof Error ? err.message : "Errore nel caricamento del logo");
          setLogoUrl(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLogo();

    return () => {
      isMounted = false;
      // Clean up the blob URL when component unmounts
      if (logoUrl) {
        void URL.revokeObjectURL(logoUrl);
      }
    };
  }, []);

  // Clean up blob URL when logoUrl changes
  useEffect(() => {
    return () => {
      if (logoUrl) {
        void URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  return {
    logoUrl,
    isLoading,
    error,
  };
}
