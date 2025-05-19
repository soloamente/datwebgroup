"use client";

import { useState, useEffect } from "react";
import SharerTable from "@/components/dashboard/tables/admin/sharer-table";
import { userService, type Sharer } from "@/app/api/api";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import {
  Users,
  UserCheck,
  UserX,
  FileSpreadsheet,
  UserPlus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/components/create-user-dialog";

export default function ListaSharerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sharers, setSharers] = useState<Sharer[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchSharers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getSharers();
      setSharers(data);
    } catch (error) {
      console.error("Failed to fetch sharers:", error);
      toast.error("Impossibile caricare i dati degli sharer");
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

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            Lista Sharer
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestisci gli sharer registrati. Visualizza, modifica,
            attiva/disattiva o creane di nuovi.
          </p>
        </div>
        <Button
          className="bg-primary text-white"
          onClick={handleOpenCreateDialog}
        >
          <Plus size={20} />
          Crea Sharer
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <StatsGrid
          stats={[
            {
              title: "Totale Sharers",
              value: "13",
              change: {
                value: "+13%",
                trend: "up",
              },
              icon: <Users size={20} />,
            },
            {
              title: "Attivi",
              value: "12",
              change: {
                value: "+12%",
                trend: "up",
              },
              icon: <UserCheck size={20} />,
            },
            {
              title: "Disattivati",
              value: "1",
              change: {
                value: "+100%",
                trend: "up",
              },
              icon: <UserX size={20} />,
            },
            {
              title: "Creati",
              value: "1",
              change: {
                value: "+100%",
                trend: "up",
              },
              icon: <UserPlus size={20} />,
            },
          ]}
        />
        <SharerTable
          data={sharers}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
        />
      </div>
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onUserCreated={() => {
          handleCloseCreateDialog();
          void fetchSharers();
        }}
      />
    </main>
  );
}
