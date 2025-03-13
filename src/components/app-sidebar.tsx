"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  Home,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

export const data = {
  user: {
    name: "Alfredo",
    email: "alfredo@gmail.com",
    avatar: "/avatars/user-placeholder.png",
  },
  navMain: [
    {
      title: "Riepilogo",
      url: "#",
      icon: Home,
      isActive: true,
    },

    {
      title: "Documenti",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Gestisci",
          url: "#",
        },
        {
          title: "Richieste",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="p-0">
              <a href="#">
                <div className="justify-left relative flex aspect-square size-16 items-center">
                  <Image
                    src="/logo_positivo.png"
                    alt="DatawebGroup"
                    width={52}
                    height={52}
                    className="object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Area Notai</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <h2 className="text-primary mt-6 text-3xl font-semibold text-balance hyphens-auto">
          Benvenuto, Dott. Alfredo!
        </h2>
        <div className="text-description mb-6 text-sm">
          <p>Studio Notarile Alfredo</p>
          <p>Notaio dal 2018</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
