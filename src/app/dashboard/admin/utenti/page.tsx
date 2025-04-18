"use client";

import { useState } from "react";
import {
  userService,
  CreateSharerData,
  CreateViewerData,
  ChangePasswordData,
} from "@/app/api/api";
import useAuthStore from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sharer" | "viewer" | "edit">(
    "sharer",
  );
  const isAdmin = useAuthStore((state) => state.isAdmin);

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

  const handleCreateViewer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateViewerData = {
      username: formData.get("username") as string,
      nominativo: formData.get("nominativo") as string,
      email: formData.get("email") as string,
    };

    try {
      await userService.createViewer(data);
      setSuccess("Viewer creato con successo");
      setError(null);
    } catch (err) {
      setError("Errore durante la creazione del viewer");
      setSuccess(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ChangePasswordData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      password_confirmation: formData.get("password") as string,
      updated_at: new Date().toISOString(),
    };

    try {
      await userService.changePassword(data);
      setSuccess("Password modificata con successo");
      setError(null);
    } catch (err) {
      setError("Errore durante la modifica della password");
      setSuccess(null);
    }
  };

  return (
    <main>
      <div className="flex items-center justify-between py-2 md:py-4">
        <h1 className="text-2xl font-medium md:text-4xl dark:text-white">
          Gestione Utenti
        </h1>
      </div>

      {isAdmin() && (
        <>
          <div className="mb-6 flex w-full space-x-4">
            <Tabs defaultValue="sharer" className="h-full w-full">
              <TabsList className="bg-background mb-2 h-10 justify-start rounded-full p-1">
                <TabsTrigger
                  value="sharer"
                  className="dark:data-[state=active]:bg-primary rounded-full border-none p-4 hover:cursor-pointer dark:text-white"
                >
                  Crea Sharer
                </TabsTrigger>
                <TabsTrigger
                  value="viewer"
                  className="dark:data-[state=active]:bg-primary rounded-full border-none p-4 hover:cursor-pointer dark:text-white"
                >
                  Crea Viewer
                </TabsTrigger>
                <TabsTrigger
                  value="edit"
                  className="dark:data-[state=active]:bg-primary rounded-full border-none p-4 hover:cursor-pointer dark:text-white"
                >
                  Modifica Utente
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sharer">
                <div className="bg-muted/50 min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-all duration-200 md:min-h-min md:p-8 dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-medium">
                    Crea nuovo Sharer
                  </h2>
                  <form
                    onSubmit={handleCreateSharer}
                    className="max-w-md space-y-4"
                  >
                    <div>
                      <label className="block">Username</label>
                      <Input
                        type="text"
                        name="username"
                        required
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block">Nominativo</label>
                      <Input
                        type="text"
                        name="nominativo"
                        required
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block">Email</label>
                      <Input
                        type="email"
                        name="email"
                        required
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block">Codice Fiscale</label>
                      <Input
                        type="text"
                        name="codice_fiscale"
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block">Partita IVA</label>
                      <Input
                        type="text"
                        name="partita_iva"
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <Button type="submit" className="bg-primary rounded-full">
                      Crea Sharer
                    </Button>
                  </form>
                </div>
              </TabsContent>
              <TabsContent value="viewer">
                {" "}
                <div className="bg-muted/50 min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-colors duration-200 md:min-h-min md:p-8 dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-medium">
                    Crea nuovo Viewer
                  </h2>
                  <form
                    onSubmit={handleCreateViewer}
                    className="max-w-md space-y-4"
                  >
                    <div>
                      <label className="block">Username</label>
                      <Input
                        type="text"
                        name="username"
                        required
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <div>
                      <label className="block">Nominativo</label>
                      <Input
                        type="text"
                        name="nominativo"
                        required
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <div>
                      <label className="block">Email</label>
                      <Input
                        type="email"
                        name="email"
                        required
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="rounded-full bg-blue-500 px-4 py-2 text-white"
                    >
                      Crea Viewer
                    </Button>
                  </form>
                </div>
              </TabsContent>
              <TabsContent value="edit">
                <div className="bg-muted/50 min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-colors duration-200 md:min-h-min md:p-8 dark:bg-gray-800">
                  <h2 className="mb-4 text-xl font-medium">
                    Modifica Password Utente
                  </h2>
                  <form
                    onSubmit={handleChangePassword}
                    className="max-w-md space-y-4"
                  >
                    <div>
                      <label className="block">Username</label>
                      <Input
                        type="text"
                        name="username"
                        required
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <div>
                      <label className="block">Nuova Password</label>
                      <Input
                        type="password"
                        name="password"
                        required
                        className="w-full rounded-lg border p-2"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="rounded-full bg-blue-500 px-4 py-2 text-white"
                    >
                      Modifica Password
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {error && <div className="mt-4 text-red-500">{error}</div>}
      {success && <div className="mt-4 text-green-500">{success}</div>}
    </main>
  );
}
