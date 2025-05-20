import { GridIcon } from "public/pikaiconsv2.0/solid/grid";
import { UserIcon } from "public/pikaiconsv2.0/solid/user";

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
  ],
};
