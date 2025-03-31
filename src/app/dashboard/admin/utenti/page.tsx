"use client";

import { useState } from "react";
import {
  userService,
  CreateSharerData,
  CreateViewerData,
  ChangePasswordData,
} from "@/app/services/api";
import useAuthStore from "@/app/auth/sign-in/auth";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  {
    /* creare viewer e gestione password*/
  }
  const handleCreateSharer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateSharerData = {
      username: formData.get("username") as string,
      nominativo: formData.get("nominativo") as string,
      email: formData.get("email") as string,
      codice_fiscale: (formData.get("codice_fiscale") as string) || undefined,
      partita_iva: (formData.get("partita_iva") as string) || undefined,
    };

    try {
      await userService.createSharer(data);
      setSuccess("Sharer creato con successo");
      setError(null);
    } catch (err) {
      setError("Errore durante la creazione dello sharer");
      setSuccess(null);
    }
  };

  return (
    <main className="p-4">
      <div className="flex items-center justify-between py-2 md:py-4">
        <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
          Gestione Utenti
        </h1>
      </div>

      {isAdmin() && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-medium">Crea nuovo Sharer</h2>
          <form onSubmit={handleCreateSharer} className="max-w-md space-y-4">
            <div>
              <label className="block">Username</label>
              <input
                type="text"
                name="username"
                required
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block">Nominativo</label>
              <input
                type="text"
                name="nominativo"
                required
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block">Codice Fiscale</label>
              <input
                type="text"
                name="codice_fiscale"
                className="w-full rounded border p-2"
              />
            </div>
            <div>
              <label className="block">Partita IVA</label>
              <input
                type="text"
                name="partita_iva"
                className="w-full rounded border p-2"
              />
            </div>
            <Button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              Crea Sharer
            </Button>
          </form>
        </div>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
      {success && <div className="mt-4 text-green-500">{success}</div>}
    </main>
  );
}
