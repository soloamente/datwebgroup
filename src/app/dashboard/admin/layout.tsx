import { AdminDashboardClient } from "@/components/sidebar/AdminSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardClient>{children}</AdminDashboardClient>;
}
