import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";
import { FileIcon } from "lucide-react";

export const navigationData = {
  navGeneral: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: GridIcon,
      description: "Vai alla dashboard principale",
    },
  ],

  navAdmin: [
    {
      title: "Gestione Utenti",
      url: "/dashboard/admin/utenti",
      icon: UserIcon,
      description: "Visualizza e gestisci gli sharer",
    },
    {
      title: "Gestione Classi Documentali",
      url: "/dashboard/admin/classi-documentali",
      icon: FileIcon,
      description: "Visualizza e gestisci le classi documentali",
    },
  ],
};
