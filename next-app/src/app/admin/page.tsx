import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

// Port CZĘŚCIOWY z admin/index.html — patrz komentarz w AdminShell.tsx. Trasa
// chroniona przez src/proxy.ts (isProtectedRoute obejmuje /admin(.*)) gdy
// CLERK_SECRET_KEY jest ustawiony; AdminShell robi dodatkowo własną bramkę
// email-allowlist po stronie klienta (obrona w głąb, jak w oryginale).
export const metadata: Metadata = {
  title: "Admin — webgen.pl",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminShell />;
}
