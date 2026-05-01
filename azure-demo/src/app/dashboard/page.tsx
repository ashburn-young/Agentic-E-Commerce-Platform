import type { Metadata } from "next";

import { DashboardClient } from "@/app/dashboard/dashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
