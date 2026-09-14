// NOWY endpoint (nie port) — zastępuje loadStripeAdminData() z admin/index.html,
// który był strukturalnie martwy: pętlował po 5 hardcoded e-mailach klientów przez
// GET /api/dashboard-data?email=X BEZ nagłówka Authorization, a ten endpoint
// (zgodnie z CLAUDE.md i lib/clerk-verify.js) ignoruje ?email= i bierze adres
// wyłącznie ze zweryfikowanej sesji Bearer — więc każde z tych 5 zapytań zawsze
// kończyło się 401 "Brak autoryzacji", nawet w dzisiejszej produkcji, nie tylko
// w porcie. Ten endpoint liczy MRR i liczbę płacących klientów wprost z listy
// wszystkich aktywnych/trialing subskrypcji Stripe (nie po pojedynczym customerze),
// więc żaden hardcoded email nie jest już potrzebny.
//
// Autoryzacja: sesja Clerk (jak reszta API) + allowlist admina po stronie SERWERA
// (ADMIN_ALLOWED_EMAILS) — bez tego dowolny zalogowany klient mógłby zobaczyć
// zbiorcze przychody całego biznesu. Bramka w AdminShell.tsx po stronie klienta
// to tylko UX, nie zabezpieczenie.
//
// "Aktywne strony" z oryginału świadomie NIE odtworzone — bez bazy danych nie ma
// żadnego sposobu policzenia darmowych (Free) klientów po stronie serwera, ich
// jedyny ślad żyje w localStorage przeglądarki każdego z osobna. Pokazywanie tu
// jakiejkolwiek liczby byłoby zgadywaniem, nie realną metryką.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { ADMIN_ALLOWED_EMAILS } from "@/lib/admin-allowlist";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

type StripePrice = { unit_amount?: number };
type StripeItem = { price?: StripePrice };
type StripeSubscription = { items?: { data: StripeItem[] } };
type StripeListResponse = { data?: StripeSubscription[] };

async function stripeGet(pathname: string): Promise<StripeListResponse> {
  const res = await fetch("https://api.stripe.com/v1" + pathname, {
    headers: {
      Authorization: "Bearer " + STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.json();
}

export async function OPTIONS(req: Request) {
  return optionsResponse(req, "GET, OPTIONS");
}

export async function GET(req: Request) {
  const headers = corsHeaders(req, "GET, OPTIONS");

  const session = await verifyRequest(req);
  if (!session || !ADMIN_ALLOWED_EMAILS.includes(session.email)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  }

  if (!STRIPE_SECRET_KEY) {
    return Response.json({ ok: true, mrr: 0, payingClients: 0, note: "no_stripe_key" }, { headers });
  }

  try {
    // limit=100 na status — wystarczające na dzisiejszą skalę biznesu; pełna
    // paginacja (starting_after) do dodania, gdy liczba subskrypcji to przerośnie.
    const [activeRes, trialingRes] = await Promise.all([
      stripeGet("/subscriptions?status=active&limit=100"),
      stripeGet("/subscriptions?status=trialing&limit=100"),
    ]);
    const subs = [...(activeRes.data || []), ...(trialingRes.data || [])];

    let mrr = 0;
    for (const sub of subs) {
      const item = sub.items?.data?.[0];
      mrr += Math.round((item?.price?.unit_amount || 0) / 100);
    }

    return Response.json({ ok: true, mrr, payingClients: subs.length }, { headers });
  } catch (err) {
    console.error("admin/stripe-summary error:", err);
    return Response.json(
      { error: "Błąd pobierania danych", details: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
