// Generowanie zdjęcia hero przez AI — żywy podgląd w kroku 2, WYŁĄCZNIE Pro Max
// (nie zwykły Pro, patrz isProMaxEmail w entitlement.ts — realna różnica między
// planami, nie tylko cena). W przeciwieństwie do enhance-opis, tu NIE ma
// odpowiednika wywołania z /api/personalize — jeśli krok 2 nie zdążył wygenerować
// zdjęcia (np. klient dopiero co kupił Pro Max i checkout był w kroku 5), strona
// po prostu zostaje przy domyślnym zdjęciu stockowym szablonu; brak zdjęcia AI
// nigdy nie blokuje aktywacji.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProMaxEmail } from "@/lib/entitlement";
import { generateHeroImage } from "@/lib/generate-hero-image";

type Body = {
  branza?: string;
  miasto?: string;
  uslugiLista?: string[];
};

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });

  const isProMax = await isProMaxEmail(authSession.email);
  if (!isProMax) {
    return Response.json(
      { error: "Generowanie zdjęcia hero przez AI wymaga aktywnego planu Pro Max", code: "PROMAX_REQUIRED" },
      { status: 402, headers }
    );
  }

  const body: Body = await req.json().catch(() => ({}));
  const heroImage = await generateHeroImage(body);
  return Response.json({ heroImage }, { headers });
}
