// Dociosanie przez AI pola "Krótki opis działalności" z formularza generatora, do
// żywego podglądu w kroku 2 — działa tylko dla klientów z JUŻ aktywnym Pro/Pro Max
// (patrz entitlement.ts). Dla nowego klienta kupującego Pro po raz pierwszy ta
// bramka odrzuci wywołanie 402-ką (checkout jest dopiero w kroku 5) — w takim
// wypadku AI-opis i tak trafi na finalną stronę przez enhanceOpis() wołane z
// /api/personalize/route.ts. Logika promptu współdzielona w lib/enhance-opis.ts.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProEmail } from "@/lib/entitlement";
import { enhanceOpis } from "@/lib/enhance-opis";

type Body = {
  branza?: string;
  miasto?: string;
  opisDraft?: string;
  lata?: string;
  realizacje?: string;
  uslugiLista?: string[];
};

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });

  const isPro = await isProEmail(authSession.email);
  if (!isPro) {
    return Response.json(
      { error: "Dociosanie opisu przez AI wymaga aktywnego planu Pro", code: "PRO_REQUIRED" },
      { status: 402, headers }
    );
  }

  const body: Body = await req.json().catch(() => ({}));
  const opis = await enhanceOpis(body);
  return Response.json({ opis }, { headers });
}
