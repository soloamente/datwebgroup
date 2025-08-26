"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import useAuthStore from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, FileText } from "lucide-react";
import { IoExitOutline } from "react-icons/io5";
import { BoringAvatarFallback } from "@/components/ui/boring-avatar";
import { motion } from "motion/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ViewerLayoutProps {
  children: React.ReactNode;
}

export default function ViewerLayout({ children }: ViewerLayoutProps) {
  const authStore = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication
    if (!authStore.isAuthenticated()) {
      void router.push("/login");
      return;
    }

    // Check if user is a viewer
    if (authStore.user?.role !== "viewer") {
      void router.push("/dashboard/admin");
      return;
    }
  }, [authStore, router]);

  const handleLogout = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    authStore.logout();
    void router.push("/login");
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Always start with home
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard/viewer",
      isCurrent: segments.length <= 2,
    });

    // Add dynamic segments
    if (segments.includes("batch")) {
      breadcrumbs.push({
        label: "Dettagli Condivisione",
        href: pathname,
        isCurrent: true,
      });
    } else if (segments.includes("scaricati")) {
      breadcrumbs.push({
        label: "Documenti Scaricati",
        href: pathname,
        isCurrent: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="bg-background min-h-screen">
      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm backdrop-blur sm:gap-x-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-1 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-x-3"
            >
              <Image
                src="/logo_positivo.png"
                alt="DatawebGroup Logo"
                width={160}
                height={50}
                className="h-12 w-auto"
                priority
              />
              <div className="hidden sm:block">
                <div className="bg-border h-6 w-px" />
              </div>
              <div className="hidden sm:block">
                <span className="text-muted-foreground text-sm font-medium">
                  Viewer Portal
                </span>
              </div>
            </motion.div>
          </div>

          {/* Center Section - Breadcrumbs */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    <BreadcrumbItem>
                      {crumb.isCurrent ? (
                        <BreadcrumbPage className="text-sm font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="mx-2" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="rounded-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    type="button"
                    className="hover:ring-primary/20 relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-transparent ring-2 ring-transparent transition-all duration-200"
                  >
                    <Avatar className="h-full w-full rounded-full">
                      <AvatarImage src={authStore.user?.avatar} />
                      <BoringAvatarFallback
                        name={authStore.user?.nominativo ?? "User"}
                        size={40}
                        variant="beam"
                      />
                    </Avatar>
                  </button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={authStore.user?.avatar} />
                        <BoringAvatarFallback
                          name={authStore.user?.nominativo ?? "User"}
                          size={32}
                          variant="beam"
                        />
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <p className="text-sm leading-none font-medium">
                            {authStore.user?.nominativo}
                          </p>
                          <Badge variant="secondary" className="w-fit text-xs">
                            Viewer
                          </Badge>
                        </div>
                        <p className="text-muted-foreground/40 text-xs leading-none">
                          {authStore.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>I miei documenti</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <IoExitOutline className="mr-2 h-4 w-4" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
