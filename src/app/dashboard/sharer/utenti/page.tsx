"use client";

import { useState, useEffect } from "react";
import ViewerTable from "@/components/dashboard/tables/sharer/viewer-table";
import { userService, type Viewer } from "@/app/api/api";
import { toast } from "sonner";
import { StatsGrid } from "@/components/admin/stats-grid";
import { Users, UserCheck, UserX, UserPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "@/components/create-user-dialog";

export default function ListaViewerPage() {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchViewers = async () => {
    setLoading(true);
    try {
      const fetchedViewers = await userService.getViewers();
      setViewers(fetchedViewers);
    } catch (err) {
      console.error("Failed to fetch viewers:", err);
      toast.error("Impossibile caricare i dati dei viewer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchViewers();
  }, []);

  const handleStatusChange = () => {
    void fetchViewers();
  };

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex w-full items-center justify-between py-2 md:py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
            Lista Viewer
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestisci i viewer registrati. Visualizza, modifica, attiva/disattiva
            o creane di nuovi.
          </p>
        </div>
        <Button
          className="bg-primary text-white"
          onClick={handleOpenCreateDialog}
        >
          <Plus size={20} />
          Crea Viewer
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <StatsGrid
          stats={[
            {
              title: "Totale Viewer",
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
        <ViewerTable
          data={viewers}
          isLoading={loading}
          onStatusChange={handleStatusChange}
        />
      </div>
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onUserCreated={() => {
          handleCloseCreateDialog();
          void fetchViewers();
        }}
      />
    </main>
  );
}
