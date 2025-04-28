"use client";

import { useState, useEffect } from "react";
import { ViewerTables } from "@/components/viewer-tables"; // Adjust the import path
import { userService, type Viewer } from "@/app/api/api"; // Import userService and Viewer type

export default function ListaViewerPage() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViewers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedViewers = await userService.getViewers();
      setViewers(fetchedViewers);
    } catch (err) {
      setError("Errore nel caricamento dei viewer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchViewers();
  }, []);

  // TODO: Add error handling UI

  return (
    <main>
      <div className="flex items-center justify-between py-2 md:py-4">
        <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
          Lista Viewer
        </h1>
      </div>
      <ViewerTables
        viewers={viewers}
        isLoading={loading}
        onViewerUpdate={fetchViewers}
      />
    </main>
  );
}
