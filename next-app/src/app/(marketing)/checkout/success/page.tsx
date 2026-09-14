import type { Metadata } from "next";
import CheckoutSuccess from "@/components/CheckoutSuccess";

// ?session_id= czytane server-side (ten sam wzorzec co galeria/page.tsx's ?plan=)
// zamiast useSearchParams() po stronie klienta, żeby uniknąć dodatkowej granicy
// Suspense dla wartości potrzebnej tylko raz przy starcie.
export const metadata: Metadata = {
  title: "Aktywacja strony — Webgen",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const params = await searchParams;
  return <CheckoutSuccess sessionId={params.session_id || null} />;
}
