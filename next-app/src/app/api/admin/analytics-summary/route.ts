// Odczyt ruchu webgen.pl z Google Analytics (GA4) dla panelu admina — patrz
// lib/google-analytics.ts. Ta sama bramka co stripe-summary: Clerk + allowlist
// admina PO STRONIE SERWERA, bramka kliencka w AdminShell.tsx to tylko UX.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { ADMIN_ALLOWED_EMAILS } from "@/lib/admin-allowlist";
import { fetchAnalyticsSummary } from "@/lib/google-analytics";

export async function OPTIONS(req: Request) {
  return optionsResponse(req, "GET, OPTIONS");
}

export async function GET(req: Request) {
  const headers = corsHeaders(req, "GET, OPTIONS");

  const session = await verifyRequest(req);
  if (!session || !ADMIN_ALLOWED_EMAILS.includes(session.email)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  }

  try {
    const summary = await fetchAnalyticsSummary(7);
    return Response.json({ ok: true, ...summary }, { headers });
  } catch (err) {
    console.error("admin/analytics-summary error:", err);
    return Response.json(
      { error: "Błąd pobierania danych z Google Analytics", details: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
