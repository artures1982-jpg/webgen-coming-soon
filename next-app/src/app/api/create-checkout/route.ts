// Port 1:1 z api/create-checkout.js — tworzy sesję Stripe Checkout dla planu i/lub
// dodatków à la carte. WYSOKIE RYZYKO: prawdziwe pieniądze — nie testować bez
// świadomej decyzji o kluczach Stripe (test mode) w tym projekcie.
import Stripe from "stripe";
import { verifyRequest } from "@/lib/clerk-verify";

// Leniwa inicjalizacja — Stripe SDK rzuca błąd już przy konstrukcji bez klucza, co
// wywalało `next build` (zbieranie metadanych route'a importuje moduł bez uruchamiania
// requestu). W oryginalnym api/*.js to nie był problem, bo Vercel nigdy nie "buduje"
// zwykłych plików Node w ten sposób.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing");
}

const PRICES: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  promax: process.env.STRIPE_PRICE_PROMAX,
  promax_yearly: process.env.STRIPE_PRICE_PROMAX_YEARLY,
};

// wlasna_domena/dodatkowe_podstrony/sesja_ai to setup jednorazowy; reszta miesięczna.
const ADDON_PRICES: Record<string, string | undefined> = {
  wlasna_domena: process.env.STRIPE_PRICE_ADDON_DOMENA,
  social_media: process.env.STRIPE_PRICE_ADDON_SOCIAL_MEDIA,
  statystyki: process.env.STRIPE_PRICE_ADDON_STATYSTYKI,
  dodatkowe_podstrony: process.env.STRIPE_PRICE_ADDON_PODSTRONY,
  sesja_ai: process.env.STRIPE_PRICE_ADDON_SESJA_AI,
  google_business: process.env.STRIPE_PRICE_ADDON_GBP,
  priorytetowe_wsparcie: process.env.STRIPE_PRICE_ADDON_PRIORYTETOWE,
};

const ONE_TIME_ADDONS: Record<string, boolean> = {
  wlasna_domena: true,
  dodatkowe_podstrony: true,
  sesja_ai: true,
};

export async function POST(req: Request) {
  const session = await verifyRequest(req);
  if (!session) return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  const email = session.email;

  const body = await req.json().catch(() => ({}));
  const { plan, billing, addons, firma_slug } = body;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let hasRecurring = false;

  // plan jest opcjonalny — pusty gdy klient z panelu dokupuje sam dodatek do
  // już aktywnego planu Pro.
  if (plan) {
    let planKey = plan;
    if (billing === "year" && PRICES[plan + "_yearly"]) {
      planKey = plan + "_yearly";
    }
    const planPriceId = PRICES[planKey];
    if (!planPriceId) return Response.json({ error: "Unknown plan: " + planKey }, { status: 400 });
    lineItems.push({ price: planPriceId, quantity: 1 });
    hasRecurring = true;
  }

  if (Array.isArray(addons)) {
    for (const addonId of addons) {
      const addonPriceId = ADDON_PRICES[addonId];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        if (!ONE_TIME_ADDONS[addonId]) hasRecurring = true;
      }
    }
  }

  if (lineItems.length === 0) {
    return Response.json({ error: "Brak pozycji do zakupu" }, { status: 400 });
  }

  try {
    const mode: Stripe.Checkout.SessionCreateParams.Mode = hasRecurring ? "subscription" : "payment";
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      metadata: {
        firma_slug: firma_slug || "",
        billing: billing || "month",
        addons: Array.isArray(addons) ? addons.join(",") : "",
      },
      success_url: "https://webgen.pl/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://webgen.pl/generator/",
    });
    return Response.json({ checkout_url: checkoutSession.url });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
