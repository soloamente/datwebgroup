"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileOverlay from "./MobileOverlay";
import MobileMenuButton from "./MobileMenuButton";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setIsTransitioning(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsTransitioning(false), 200);
  };

  const handleCompactToggle = () => {
    setIsCompact(!isCompact);
  };

  const handleExpandFromCompact = () => {
    if (isCompact) {
      setIsCompact(false);
    }
  };

  return (
    <main className="flex min-h-screen transition-all duration-700">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        isCompact={isCompact}
        onExpandFromCompact={handleExpandFromCompact}
      />

      {/* Compact Toggle Button - Fixed between sidebar and content */}
      {!isMobile && sidebarOpen && (
        <div
          className={`pointer-events-none fixed top-1/2 z-20 -translate-y-1/2 transition-all duration-300 ${
            isCompact ? "left-[calc(80px+1rem)]" : "left-[calc(300px+1rem)]"
          }`}
        >
          <div className="pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCompactToggle}
                    aria-label={
                      isCompact ? "Espandi sidebar" : "Comprimi sidebar"
                    }
                    className="!hover:bg-transparent !focus:bg-transparent !active:bg-transparent h-8 w-8 rounded-full hover:!bg-transparent focus:!bg-transparent active:!bg-transparent"
                  >
                    <div className="bg-secondary h-24 w-1.5 rounded-lg" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isCompact ? "Espandi sidebar" : "Comprimi sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      <section
        id="content"
        className="flex w-full min-w-0 flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4"
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="mb-4 flex items-center gap-3 md:hidden">
            <MobileMenuButton
              isOpen={sidebarOpen}
              onToggle={handleSidebarToggle}
            />
          </div>
        )}

        <div
          className={`flex flex-grow flex-col transition-opacity duration-200 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
        >
          {children}
        </div>
      </section>

      {isMobile && (
        <MobileOverlay
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
