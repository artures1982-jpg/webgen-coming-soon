import type { Metadata } from "next";
import GaleriaShell from "@/components/galeria/GaleriaShell";
import { TIER_ORDER } from "@/lib/galeria-data";

// Port 1:1 z galeria/index.html. ?plan=pro|promax|free w URL wstępnie ustawia
// filtr planu (linkowane z /cennik/) — czytane tu server-side zamiast przez
// useSearchParams() po stronie klienta, żeby uniknąć dodatkowej granicy Suspense
// dla wartości potrzebnej tylko raz przy starcie.
export const metadata: Metadata = {
  title: "Galeria szablonów — Webgen",
  description: "Galeria szablonów Webgen — przeglądaj gotowe warianty stron dla 12 branż usługowych i zobacz podgląd na żywo, zanim wybierzesz swój.",
  alternates: { canonical: "https://www.webgen.pl/galeria/" },
};

export default async function GaleriaPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const params = await searchParams;
  const plan = (params.plan || "").toLowerCase();
  const initialTier = (TIER_ORDER as readonly string[]).includes(plan) ? plan : null;
  return <GaleriaShell initialTier={initialTier} />;
}
