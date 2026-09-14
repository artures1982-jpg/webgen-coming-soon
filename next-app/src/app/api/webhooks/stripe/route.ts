// Webhook Stripe — jedyne miejsce, które faktycznie aktywuje płatne strony
// (Pro/Pro Max). Zastępuje złamany flow "stary /success na innej domenie czyta
// localStorage" (patrz plan docelowego flow aktywacji strony): po
// checkout.session.completed odbiera HTML zapisany tymczasowo przez
// create-checkout/route.ts (Blob, "pending/{slug}/index.html"), wdraża go tą samą
// współdzieloną logiką co plan darmowy (lib/deploy-site.ts) i zapisuje slug/URL na
// koncie Clerk klienta (unsafeMetadata) — bez tego /dashboard nie miałby skąd wziąć
// linku do strony.
//
// WYMAGA surowego body (nie req.json()) — inaczej weryfikacja podpisu Stripe zawsze
// zawiedzie. Stripe może dostarczyć to samo zdarzenie więcej niż raz (gwarancja
// "at-least-once") — performDeploy()/addSubdomain są z natury idempotentne
// (nadpisanie tym samym HTML-em nie szkodzi), więc celowo NIE ma tu dodatkowego
// mechanizmu odrzucania duplikatów.
import Stripe from "stripe";
import { head } from "@vercel/blob";
import { performDeploy, updateUserSiteMetadata } from "@/lib/deploy-site";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing");
}

async function fetchPendingHtml(slug: string): Promise<string | null> {
  try {
    const info = await head("pending/" + slug + "/index.html");
    const res = await fetch(info.url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[webhooks/stripe] Brak podpisu lub STRIPE_WEBHOOK_SECRET");
    return Response.json({ error: "Webhook nieskonfigurowany" }, { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] Nieprawidłowy podpis:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Nieprawidłowy podpis" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const slug = session.metadata?.firma_slug;
  const clerkUserId = session.metadata?.clerk_user_id;
  const plan = session.metadata?.plan;
  const contactEmail = session.metadata?.contact_email;

  // Dokupienie samego dodatku do już istniejącej strony (panel klienta) — brak
  // firma_slug/plan w metadata, nic do wdrożenia, tylko potwierdzenie płatności.
  if (!slug || !plan) {
    return Response.json({ received: true, skipped: "brak firma_slug/plan — to nie aktywacja nowej strony" });
  }

  if (!clerkUserId) {
    console.error("[webhooks/stripe] Brak clerk_user_id w metadata sesji " + session.id);
    return Response.json({ error: "Brak clerk_user_id w metadata" }, { status: 400 });
  }

  const html = await fetchPendingHtml(slug);
  if (!html) {
    console.error("[webhooks/stripe] Nie znaleziono tymczasowego HTML-a dla sluga: " + slug);
    return Response.json({ error: "Brak zapisanego HTML-a do wdrożenia" }, { status: 500 });
  }

  try {
    const result = await performDeploy(slug, html, contactEmail || undefined);
    await updateUserSiteMetadata(clerkUserId, {
      firma_slug: result.slug,
      site_url: result.url,
      site_plan: plan,
    });
    console.log("[webhooks/stripe] Strona aktywowana: " + result.url + " (user " + clerkUserId + ")");
    return Response.json({ received: true, url: result.url });
  } catch (err) {
    console.error("[webhooks/stripe] Błąd deployu:", err);
    // 500 → Stripe ponowi dostawę zdarzenia zgodnie ze swoim retry policy.
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
