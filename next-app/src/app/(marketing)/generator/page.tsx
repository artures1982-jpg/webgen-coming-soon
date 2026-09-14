import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GeneratorShell from "@/components/generator/GeneratorShell";

// Port 1:1 z generator/index.html, z jednym ulepszeniem architektonicznym: brak
// ?template= jest sprawdzany TU, w Server Component, przed jakimkolwiek renderem —
// zamiast w oryginalnym window.location.href wykonywanym dopiero po sparsowaniu
// całego <script> po stronie klienta. Ten sam powód co komentarz w oryginale przy
// PENDING_TEMPLATE_ID: QA znalazło bug, gdzie sprawdzanie tego ZA PÓŹNO (po
// wypełnieniu panelu-0) gubiło dane rejestracji klienta bezpowrotnie — tu ten
// scenariusz jest strukturalnie niemożliwy, bo strona nigdy się nie renderuje bez
// szablonu.
export const metadata: Metadata = {
  title: "Webgen — Stwórz swoją stronę",
  description: "Generator stron Webgen — podaj dane firmy i AI stworzy Twoją profesjonalną stronę w 3 minuty. Zoptymalizowana pod lokalne SEO.",
  alternates: { canonical: "https://www.webgen.pl/generator/" },
  openGraph: {
    type: "website",
    url: "https://www.webgen.pl/generator/",
    siteName: "Webgen",
    title: "Generator stron — Webgen | Stwórz stronę w 3 minuty",
    description: "Wypełnij formularz, AI generuje profesjonalną stronę zoptymalizowaną pod lokalne SEO. Bez wiedzy technicznej.",
    images: ["https://www.webgen.pl/og-image.png"],
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Generator stron Webgen — 3 minuty do strony firmowej",
    description: "AI generuje Twoją stronę z lokalnym SEO. Wypełnij formularz — gotowe w 3 minuty.",
  },
};

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const params = await searchParams;
  if (!params.template) redirect("/galeria/");
  return <GeneratorShell templateId={params.template} />;
}
