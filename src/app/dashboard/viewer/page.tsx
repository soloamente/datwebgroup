"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  FileText,
  Users,
  Eye,
  Download,
  Share2,
  Upload,
  Folder,
  File,
  MoreVertical,
  Search,
  Grid3X3,
  Bell,
} from "lucide-react";
import useAuthStore from "@/app/api/auth";
import { useRouter } from "next/navigation";

interface DocumentCategory {
  id: string;
  name: string;
  date: string;
  count: number;
  collaborators: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  note?: string;
  isFolder?: boolean;
}

export default function ViewerDashboard() {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (authStore.user?.role !== "viewer") {
      router.push("/dashboard/admin");
      return;
    }

    void loadViewerData();
  }, [authStore, router]);

  const loadViewerData = async () => {
    try {
      setIsLoading(true);

      // Mock data for categories
      setCategories([
        {
          id: "1",
          name: "Medical",
          date: "May 12, 2021",
          count: 2,
          collaborators: [
            { id: "1", name: "JC", avatar: "/avatars/user-placeholder.png" },
            { id: "2", name: "AD", avatar: "/avatars/user-placeholder.png" },
          ],
        },
        {
          id: "2",
          name: "HR",
          date: "April 28, 2021",
          count: 1,
          collaborators: [
            { id: "3", name: "HR", avatar: "/avatars/user-placeholder.png" },
            { id: "4", name: "AD", avatar: "/avatars/user-placeholder.png" },
          ],
        },
        {
          id: "3",
          name: "Administrator",
          date: "September 24, 2021",
          count: 3,
          collaborators: [
            { id: "5", name: "AD", avatar: "/avatars/user-placeholder.png" },
          ],
        },
      ]);

      // Mock data for documents
      setDocuments([
        {
          id: "1",
          name: "Presentation",
          type: "DOC",
          size: "1.2Mb",
          date: "Mar 20, 2021 23:14",
          note: "Important...info.pdf",
        },
        {
          id: "2",
          name: "Faucibus accumsan odio",
          type: "FOLDER",
          size: "2 docs",
          date: "Dec 30, 2021 07:52",
          note: "Est sit aliqua dolor do amet sint.",
          isFolder: true,
        },
        {
          id: "3",
          name: "curae donec pharetra",
          type: "PDF",
          size: "2.7Mb",
          date: "Dec 4, 2021 21:42",
          note: "curae ... pharetra.png",
        },
        {
          id: "4",
          name: "document_1.pdf",
          type: "PDF",
          size: "0.3Mb",
          date: "Dec 7 2021 23:26",
          note: "Important info pdf",
        },
      ]);
    } catch (error) {
      console.error("Error loading viewer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with user info and notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={authStore.user?.avatar} />
            <AvatarFallback>
              {authStore.user?.nominativo?.charAt(0) ?? "V"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Documenti Viewer</h1>
            <p className="text-muted-foreground">
              Benvenuto, {authStore.user?.nominativo ?? "Viewer"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.date}</p>
              </div>
              <div className="mt-3 flex items-center space-x-1">
                {category.collaborators.slice(0, 3).map((collaborator) => (
                  <Avatar key={collaborator.id} className="h-6 w-6">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {category.collaborators.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.collaborators.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* File Upload Area */}
        <div className="lg:col-span-1">
          <Card className="h-96">
            <CardContent className="h-full p-6">
              <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400">
                <Upload className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">Drop files here</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  PDF, DOC, XLSX, image, movie, etc.
                </p>
                <p className="text-muted-foreground text-xs">
                  files with max size of 15 MB.
                </p>
                <Button className="mt-4" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documenti</CardTitle>
                  <CardDescription>I tuoi documenti e cartelle</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      placeholder="Cerca documenti..."
                      className="w-64 pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      {doc.isFolder ? (
                        <Folder className="h-8 w-8 text-blue-500" />
                      ) : (
                        <File className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="truncate font-medium">{doc.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground truncate text-sm">
                        {doc.note}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-muted-foreground text-sm">
                        {doc.size}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {doc.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
