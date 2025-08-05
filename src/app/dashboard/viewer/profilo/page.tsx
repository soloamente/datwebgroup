"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Mail,
  User,
  Shield,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import useAuthStore from "@/app/api/auth";

interface UserStats {
  totalDocumentsViewed: number;
  totalDocumentsDownloaded: number;
  lastActivity: string;
  memberSince: string;
}

export default function ViewerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalDocumentsViewed: 15,
    totalDocumentsDownloaded: 8,
    lastActivity: "2024-01-15",
    memberSince: "2023-06-01",
  });
  const authStore = useAuthStore();

  const handleSaveProfile = () => {
    // TODO: Implement profile save
    console.log("Saving profile...");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profilo Utente</h1>
          <p className="text-muted-foreground">
            Gestisci le tue informazioni personali e preferenze
          </p>
        </div>
        <Badge variant="secondary">Viewer</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Personali</CardTitle>
              <CardDescription>Le tue informazioni di base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={authStore.user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {authStore.user?.nominativo?.charAt(0) || "V"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {authStore.user?.nominativo || "Nome Utente"}
                  </h3>
                  <p className="text-muted-foreground">
                    {authStore.user?.email || "email@example.com"}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Shield className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm">
                      Viewer
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={authStore.user?.username || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authStore.user?.email || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nominativo">Nome Completo</Label>
                  <Input
                    id="nominativo"
                    value={authStore.user?.nominativo || ""}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                  <Input
                    id="codice_fiscale"
                    value={authStore.user?.codice_fiscale || ""}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile}>Salva Modifiche</Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                </div>
              )}

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Modifica Profilo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiche Attività</CardTitle>
              <CardDescription>Le tue statistiche di utilizzo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalDocumentsViewed}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Documenti Visualizzati
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalDocumentsDownloaded}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Documenti Scaricati
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Membro dal</p>
                  <p className="text-muted-foreground text-sm">
                    {stats.memberSince}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Ruolo</p>
                  <p className="text-muted-foreground text-sm">Viewer</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground text-sm">
                    {authStore.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Ultima Attività</p>
                  <p className="text-muted-foreground text-sm">
                    {stats.lastActivity}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Azioni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Visualizza Documenti
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Documenti Scaricati
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Cambia Password
              </Button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Stato Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stato</span>
                  <Badge variant="default">Attivo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verificato</span>
                  <Badge variant="secondary">Sì</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ultimo Accesso</span>
                  <span className="text-muted-foreground text-sm">Oggi</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
