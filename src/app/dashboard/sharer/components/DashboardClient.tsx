"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileOverlay from "./MobileOverlay";
import MobileMenuButton from "./MobileMenuButton";

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  return (
    <main className="flex min-h-screen transition-all duration-700">
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      <section
        id="content"
        className="flex w-full flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4"
      >
        {isMobile && (
          <MobileMenuButton
            isOpen={sidebarOpen}
            onToggle={handleSidebarToggle}
          />
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
