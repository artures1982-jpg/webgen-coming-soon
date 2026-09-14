// Port 1:1 z api/personalize.js — mechaniczne wypełnienie wybranego szablonu + paleta,
// pod bramką isProEmail. Zero AI w runtime (patrz historia tego pliku w statycznym repo).
//
// DECYZJA ARCHITEKTONICZNA (do potwierdzenia): templates/manifest.json, templates/pilot/*.html
// i templates/palettes.json fizycznie żyją w korzeniu repo, POZA next-app/ — plan migracji
// (sekcja 2) mówi, że te pliki nie stają się komponentami React, ale nie rozstrzyga gdzie mają
// fizycznie leżeć dla Next.js. Ten port ROZWIĄZUJE to na razie przez fetch() z produkcji
// (https://webgen.pl/templates/...) zamiast czytania lokalnego fs — dokładnie to, co dziś robi
// klient w przeglądarce, tylko przeniesione na serwer. Zaleta: zero duplikacji plików, zero
// ryzyka rozjazdu dwóch kopii. Wada: ten endpoint w next-app zależy od tego, że produkcja
// (główny statyczny serwis) jest dostępna. Do zmiany na lokalny odczyt dopiero przy realnym
// cutover, gdy pliki szablonów fizycznie przeniosą się do next-app/ (albo współdzielonego
// katalogu w monorepo).
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProEmail } from "@/lib/entitlement";
import { applyPalette, fillTemplate, flattenPalettes, slugifyName } from "@/lib/template-fill";
import type { Firma, ManifestEntry, PalettesByIndustry } from "@/lib/template-fill";
import { TEMPLATES_BASE } from "@/lib/templates-base";
import { enhanceOpis } from "@/lib/enhance-opis";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  const email = authSession.email;

  const body = await req.json().catch(() => ({}));
  const templateId: string | undefined = body.templateId;
  const firma: Firma | undefined = body.firma;

  if (!templateId || !firma) {
    return Response.json({ error: "Brak templateId lub firma" }, { status: 400, headers });
  }

  const isPro = await isProEmail(email);
  if (!isPro) {
    return Response.json(
      { error: "Personalizacja AI wymaga aktywnego planu Pro", code: "PRO_REQUIRED" },
      { status: 402, headers }
    );
  }

  let manifest: ManifestEntry[] = [];
  try {
    const manifestRes = await fetch(TEMPLATES_BASE + "/templates/manifest.json");
    manifest = manifestRes.ok ? await manifestRes.json() : [];
  } catch {
    manifest = [];
  }
  const tpl = manifest.find((t) => t.id === templateId);
  if (!tpl) {
    return Response.json({ error: "Nie znaleziono szablonu: " + templateId }, { status: 404, headers });
  }

  let rawHtml: string;
  try {
    // Bez ".html" — cleanUrls (vercel.json produkcji) 308-uje .html na czysty URL;
    // ten skok przekierowania nie ma nagłówka CORS (nieistotne tu, serwer-serwer,
    // ale to samo zapytanie z klienta w useRawTemplate.ts/useGeneration.ts musi
    // trafić od razu w czysty URL, inaczej fetch() w przeglądarce dostaje "Failed
    // to fetch" mimo że cel końcowy ma poprawny Access-Control-Allow-Origin.
    const tplRes = await fetch(TEMPLATES_BASE + "/templates/pilot/" + tpl.id);
    if (!tplRes.ok) throw new Error("status " + tplRes.status);
    rawHtml = await tplRes.text();
  } catch {
    return Response.json({ error: "Nie udało się wczytać pliku szablonu" }, { status: 500, headers });
  }

  let palettesByIndustry: PalettesByIndustry = {};
  try {
    const palettesRes = await fetch(TEMPLATES_BASE + "/templates/palettes.json");
    palettesByIndustry = palettesRes.ok ? await palettesRes.json() : {};
  } catch {
    palettesByIndustry = {};
  }

  // Dociosanie opisu przez AI TU (nie tylko w kroku 2 generatora) — dla nowego
  // klienta kupującego Pro po raz pierwszy checkout jest dopiero w kroku 5, więc
  // /api/enhance-opis (wołane z kroku 2) odrzuca go 402-ką, zanim jeszcze zapłaci.
  // Ten endpoint wie już na pewno, że klient ma aktywny Pro (przeszedł isPro wyżej)
  // — więc to jedyne miejsce gwarantujące AI-opis na finalnej stronie każdemu
  // płacącemu klientowi, niezależnie czy krok 2 zdążył to zrobić wcześniej.
  const opisAI = await enhanceOpis({
    branza: firma.branza,
    miasto: firma.miasto,
    opisDraft: firma.opis,
    lata: firma.lata,
    realizacje: firma.realizacje,
    uslugiLista: firma.uslugi_lista,
  });
  const firmaZOpisem = { ...firma, opis: opisAI };

  const html = applyPalette(fillTemplate(rawHtml, firmaZOpisem), firma.paletteId, flattenPalettes(palettesByIndustry));

  return Response.json(
    {
      success: true,
      html,
      slug: slugifyName(firma.nazwa_strony || firma.nazwa),
      templateId,
      chars: html.length,
    },
    { headers }
  );
}
