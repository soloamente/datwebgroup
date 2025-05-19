"use client";

import { useState, useEffect } from "react";
import { userService, type Sharer } from "@/app/api/api";
import SharerTable from "@/components/dashboard/tables/admin/sharer-table";
import { toast } from "sonner";

export default function SharerTableWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [sharers, setSharers] = useState<Sharer[]>([]);

  const fetchSharers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getSharers();
      setSharers(data);
    } catch (error) {
      console.error("Error fetching sharers:", error);
      toast.error("Impossibile caricare gli utenti");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSharers();
  }, []);

  const handleStatusChange = () => {
    void fetchSharers();
  };

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-medium">Lista Utenti</h2>
      <SharerTable
        data={sharers}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
