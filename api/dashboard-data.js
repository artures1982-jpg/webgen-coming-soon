const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Brak email' });

  if (!STRIPE_SECRET_KEY) {
    return res.status(200).json({
      ok: true,
      customer: null,
      subscription: null,
      invoices: [],
      note: 'no_stripe_key'
    });
  }

  try {
    // 1. Znajdź klienta w Stripe po emailu
    const customers = await stripeGet(`/customers?email=${encodeURIComponent(email)}&limit=1`);
    const customer = customers.data && customers.data[0] ? customers.data[0] : null;

    if (!customer) {
      return res.status(200).json({
        ok: true,
        customer: null,
        subscription: null,
        invoices: [],
        note: 'customer_not_found'
      });
    }

    // 2. Pobierz aktywną subskrypcję
    const subs = await stripeGet(`/subscriptions?customer=${customer.id}&status=active&limit=1`);
    const sub = subs.data && subs.data[0] ? subs.data[0] : null;

    // 3. Jeśli nie ma aktywnej — sprawdź wszystkie (trialing, past_due)
    let anySubscription = sub;
    if (!anySubscription) {
      const allSubs = await stripeGet(`/subscriptions?customer=${customer.id}&limit=3`);
      anySubscription = allSubs.data && allSubs.data[0] ? allSubs.data[0] : null;
    }

    // 4. Pobierz faktury
    const invoicesData = await stripeGet(`/invoices?customer=${customer.id}&limit=5`);
    const invoices = (invoicesData.data || []).map(inv => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      date: inv.created,
      pdf: inv.invoice_pdf,
      period_start: inv.period_start,
      period_end: inv.period_end,
    }));

    // 5. Przygotuj dane subskrypcji
    let subscriptionData = null;
    if (anySubscription) {
      const item = anySubscription.items && anySubscription.items.data[0];
      subscriptionData = {
        id: anySubscription.id,
        status: anySubscription.status,
        current_period_end: anySubscription.current_period_end,
        current_period_start: anySubscription.current_period_start,
        cancel_at_period_end: anySubscription.cancel_at_period_end,
        plan_name: item && item.price && item.price.nickname
          ? item.price.nickname
          : (item && item.price && item.price.product ? item.price.product : 'Plan webgen'),
        plan_amount: item && item.price ? item.price.unit_amount : 0,
        plan_currency: item && item.price ? item.price.currency : 'pln',
        plan_interval: item && item.price && item.price.recurring ? item.price.recurring.interval : 'month',
      };
    }

    return res.status(200).json({
      ok: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
      },
      subscription: subscriptionData,
      invoices,
    });

  } catch (err) {
    console.error('dashboard-data error:', err);
    return res.status(500).json({ error: 'Błąd pobierania danych', details: err.message });
  }
};
