// src/lib/entitlement.ts — port 1:1 z lib/entitlement.js (Faza 2 migracji).
// Wspólny check planu Pro przez Stripe. Bez realnych sesji serwerowych w tym
// projekcie (patrz CLAUDE.md), email jest ufany tak samo jak w reszcie apki.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO;
const STRIPE_PRICE_PRO_YEARLY = process.env.STRIPE_PRICE_PRO_YEARLY;

type StripePrice = { id: string };
type StripeItem = { price?: StripePrice };
type StripeSubscription = { items?: { data: StripeItem[] } };
type StripeListResponse<T> = { data?: T[] };
type StripeCustomer = { id: string };

async function stripeGet<T>(pathname: string): Promise<T> {
  const res = await fetch("https://api.stripe.com/v1" + pathname, {
    headers: {
      Authorization: "Bearer " + STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.json();
}

export async function isProEmail(email: string): Promise<boolean> {
  if (!STRIPE_SECRET_KEY || !email) return false;
  try {
    const customers = await stripeGet<StripeListResponse<StripeCustomer>>(
      "/customers?email=" + encodeURIComponent(email) + "&limit=1"
    );
    const customer = customers.data && customers.data[0] ? customers.data[0] : null;
    if (!customer) return false;

    const subs = await stripeGet<StripeListResponse<StripeSubscription>>(
      "/subscriptions?customer=" + customer.id + "&status=active&limit=10"
    );
    let list = subs.data || [];
    if (list.length === 0) {
      const trialing = await stripeGet<StripeListResponse<StripeSubscription>>(
        "/subscriptions?customer=" + customer.id + "&status=trialing&limit=10"
      );
      list = trialing.data || [];
    }

    for (const sub of list) {
      const items = (sub.items && sub.items.data) || [];
      for (const item of items) {
        const priceId = item.price && item.price.id;
        if (priceId && (priceId === STRIPE_PRICE_PRO || priceId === STRIPE_PRICE_PRO_YEARLY)) {
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error("isProEmail error:", err);
    return false;
  }
}
