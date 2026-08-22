// lib/entitlement.js — wspolny check planu Pro przez Stripe, reuzywany przez
// api/personalize.js i api/update-request.js. Bez realnych sesji w projekcie (patrz
// CLAUDE.md "Pending: Supabase Auth"), email z requestu jest ufany tak samo jak w
// reszcie apki (dashboard-data.js robi to samo) — nie probujemy tu naprawiac calego
// modelu auth, tylko unikamy duplikowania tej samej logiki w dwoch plikach.

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO;
const STRIPE_PRICE_PRO_YEARLY = process.env.STRIPE_PRICE_PRO_YEARLY;

async function stripeGet(pathname) {
  const res = await fetch('https://api.stripe.com/v1' + pathname, {
    headers: {
      'Authorization': 'Bearer ' + STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.json();
}

async function isProEmail(email) {
  if (!STRIPE_SECRET_KEY || !email) return false;
  try {
    const customers = await stripeGet('/customers?email=' + encodeURIComponent(email) + '&limit=1');
    const customer = customers.data && customers.data[0] ? customers.data[0] : null;
    if (!customer) return false;

    let subs = await stripeGet('/subscriptions?customer=' + customer.id + '&status=active&limit=10');
    let list = subs.data || [];
    if (list.length === 0) {
      const trialing = await stripeGet('/subscriptions?customer=' + customer.id + '&status=trialing&limit=10');
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
    console.error('isProEmail error:', err);
    return false;
  }
}

module.exports = { isProEmail };
