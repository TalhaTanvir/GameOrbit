import type { ReactNode } from "react";

import AdminDashboardShell from "@/components/admin/AdminDashboardShell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function AdminDashboardLayout({ children }: DashboardLayoutProps) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
