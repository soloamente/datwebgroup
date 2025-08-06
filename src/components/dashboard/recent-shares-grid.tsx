"use client";

import { useState } from "react";
import { useRecentShares } from "@/hooks/use-recent-shares";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Plus,
  ChevronRight,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function RecentSharesGrid() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Changed from 5 to 6 (3 columns × 2 rows)
  const { recentShares, documentClasses, isLoading, error } =
    useRecentShares(selectedClassId);

  const handleClassChange = (value: string) => {
    setSelectedClassId(value === "all" ? null : Number(value));
    setCurrentPage(1); // Reset to first page when changing filter
  };

  // Calculate pagination
  const totalPages = Math.ceil(recentShares.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentShares = recentShares.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const selectedClassName =
    documentClasses.find((dc) => dc.id === selectedClassId)?.name ??
    "Tutte le classi";

  // Generate consistent colors for document classes
  const getDocumentClassColor = (classId: number) => {
    const colors = [
      "hsl(210, 70%, 60%)", // Blue
      "hsl(150, 70%, 60%)", // Green
      "hsl(280, 70%, 60%)", // Purple
      "hsl(30, 70%, 60%)", // Orange
      "hsl(340, 70%, 60%)", // Pink
      "hsl(60, 70%, 60%)", // Yellow
      "hsl(180, 70%, 60%)", // Cyan
      "hsl(120, 70%, 60%)", // Lime
    ];
    return colors[classId % colors.length];
  };

  return (
    <Card className="h-full flex-1 bg-neutral-900/50 text-white">
      <CardHeader className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Condivisioni Recenti
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Visualizza le tue condivisioni più recenti da {selectedClassName}.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Select onValueChange={handleClassChange} defaultValue="all">
              <SelectTrigger className="w-[200px] border-neutral-700 bg-neutral-800/80 backdrop-blur-sm">
                <SelectValue placeholder="Filtra per classe" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700 bg-neutral-800">
                <SelectItem value="all">Tutte le classi</SelectItem>
                {documentClasses.map((dc) => (
                  <SelectItem key={dc.id} value={String(dc.id)}>
                    {dc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-400">
                {startIndex + 1}-{Math.min(endIndex, recentShares.length)} di{" "}
                {recentShares.length}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 disabled:opacity-50"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  aria-label="Pagina precedente"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 disabled:opacity-50"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Pagina successiva"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-blue-500"></div>
              <span>Caricamento...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
            {error}
          </div>
        )}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="wait">
              {currentShares.map((share, index) => (
                <motion.div
                  key={`${currentPage}-${share.batchId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={`/dashboard/sharer/documenti/condivisi/${share.documentClassId}/${share.batchId}`}
                    className="block"
                    aria-label={`Visualizza dettagli della condivisione ${share.documentClassName}`}
                  >
                    <Card className="group relative h-full cursor-pointer overflow-hidden rounded-xl border-neutral-800/50 bg-neutral-900/90 backdrop-blur-sm transition-all duration-200 ease-out hover:border-neutral-700/50 hover:bg-neutral-800/90 hover:shadow-xl hover:shadow-neutral-900/30">
                      {/* Status indicator */}
                      <div className="absolute top-3 right-3 z-40">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-6 w-6 cursor-pointer items-center justify-center">
                              <div
                                className="h-3 w-3 rounded-full shadow-lg"
                                style={{
                                  backgroundColor: getDocumentClassColor(
                                    share.documentClassId,
                                  ),
                                  boxShadow: `0 0 8px ${getDocumentClassColor(share.documentClassId)}40`,
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            sideOffset={0}
                            className="z-[1000]"
                          >
                            {share.documentClassName}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <CardHeader className="mb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-500" />
                            <time
                              className="text-sm text-neutral-400"
                              dateTime={share.sentAt}
                            >
                              {new Date(share.sentAt).toLocaleDateString(
                                "it-IT",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </time>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit border-neutral-700/50 bg-neutral-800/50 text-neutral-300 backdrop-blur-sm"
                        >
                          {share.documentClassName}
                        </Badge>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-4">
                        {/* Recipients count */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                            <Users className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white transition-colors group-hover:text-blue-400">
                              {share.viewers.length}
                            </div>
                            <div className="text-sm text-neutral-400">
                              Destinatari
                            </div>
                          </div>
                        </div>

                        {/* Files count */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/10">
                            <FileText className="h-4 w-4 text-green-400" />
                          </div>
                          <div className="text-sm text-green-400">
                            {share.totalFiles} Files
                          </div>
                        </div>

                        {/* Recipients avatars */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AvatarGroup
                              className="h-8 -space-x-2"
                              tooltipProps={{ side: "top", sideOffset: 8 }}
                            >
                              {share.viewers.slice(0, 3).map((viewer) => (
                                <Avatar
                                  key={viewer.id}
                                  className="h-8 w-8 border-2 border-neutral-800 ring-1 ring-neutral-700/50"
                                >
                                  <AvatarImage
                                    src={`https://ui-avatars.com/api/?name=${viewer.nominativo.replace(/ /g, "+")}&background=random&color=fff&size=32`}
                                    alt={viewer.nominativo}
                                  />
                                  <AvatarFallback
                                    name={viewer.nominativo}
                                    size={32}
                                    className="bg-neutral-700 text-xs font-medium text-white"
                                  >
                                    {viewer.nominativo
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                  <AvatarGroupTooltip>
                                    <span className="text-white">
                                      {viewer.nominativo}
                                    </span>
                                  </AvatarGroupTooltip>
                                </Avatar>
                              ))}
                            </AvatarGroup>
                            {share.viewers.length > 3 && (
                              <Avatar className="ml-1 h-8 w-8 border-2 border-neutral-800 bg-neutral-700">
                                <AvatarFallback className="text-xs font-medium text-white">
                                  +{share.viewers.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          {/* Arrow indicator */}
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/50 text-neutral-400 transition-all duration-200 group-hover:bg-blue-500/20 group-hover:text-blue-400">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
