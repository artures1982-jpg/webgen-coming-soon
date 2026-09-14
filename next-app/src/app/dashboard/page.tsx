import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";

// Port 1:1 z dashboard/index.html. Trasa chroniona przez src/proxy.ts (isProtectedRoute
// obejmuje /dashboard(.*)) gdy CLERK_SECRET_KEY jest ustawiony; DashboardShell robi
// dodatkowo własny redirect po stronie klienta (obrona w głąb, tak jak w oryginale).
export const metadata: Metadata = {
  title: "Panel klienta — webgen.pl",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardShell />;
}
