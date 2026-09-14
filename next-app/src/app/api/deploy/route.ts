// Aktywacja planu Start (darmowego) — jedyna ścieżka, która woła ten endpoint
// bezpośrednio z klienta (patrz CheckoutModal.tsx's activateFreeSite()). Płatne
// plany (Pro/Pro Max) NIE przechodzą już przez ten route — po potwierdzeniu
// płatności deploy robi webhook Stripe (api/webhooks/stripe/route.ts), który woła
// tę samą współdzieloną logikę w lib/deploy-site.ts. Trzymanie obu ścieżek w
// jednym miejscu groziłoby podwójnym deployem tej samej strony.
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { performDeploy, isSlugTaken, updateUserSiteMetadata } from "@/lib/deploy-site";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });

  const body = await req.json().catch(() => ({}));
  const { slug, html, contact_email } = body;

  if (!slug || !html) {
    return Response.json({ error: "Wymagane: slug, html" }, { status: 400, headers });
  }

  try {
    if (await isSlugTaken(slug)) {
      return Response.json(
        { error: "Ta nazwa strony jest już zajęta — zmień nazwę w kroku 2." },
        { status: 409, headers }
      );
    }

    const result = await performDeploy(slug, html, contact_email);
    await updateUserSiteMetadata(authSession.userId, {
      firma_slug: result.slug,
      site_url: result.url,
      site_plan: "free",
    });

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setMonth(trialEnd.getMonth() + 6);
    const emailReminder = new Date(trialEnd);
    emailReminder.setMonth(emailReminder.getMonth() - 1);

    return Response.json(
      {
        success: true,
        slug: result.slug,
        subdomain: result.subdomain,
        url: result.url,
        blob_url: result.blobUrl,
        verified: result.verified,
        plan: "free",
        trial_end: trialEnd.toISOString().split("T")[0],
        email_reminder_date: emailReminder.toISOString().split("T")[0],
        note: "Plan Start: 6 miesiecy bezplatnie. Email reminder wysylany miesiac przed wygasnieciem.",
      },
      { headers }
    );
  } catch (err) {
    console.error("[deploy] Error:", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers });
  }
}
