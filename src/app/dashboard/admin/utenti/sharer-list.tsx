import { useState, useEffect } from "react";
import { userService } from "@/app/api/api";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserTables } from "@/components/user-tables";

interface Sharer {
  id: number;
  username: string;
  nominativo: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function SharerList() {
  const [sharers, setSharers] = useState<Sharer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof userService.getSharers === "function") {
        const data = await userService.getSharers();
        setSharers(data);
      } else {
        throw new Error("userService.getSharers is not implemented yet.");
      }
    } catch (err) {
      console.error("Failed to fetch sharers:", err);
      setError("Errore durante il recupero degli sharer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharers();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-muted/50 min-h-[calc(100vh-6rem)] flex-1 rounded-xl p-3 transition-all duration-500 md:min-h-min md:p-8">
      <UserTables
        sharers={sharers}
        isLoading={loading}
        onStatusChange={fetchSharers}
      />
    </div>
  );
}
