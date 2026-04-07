const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  managed_start:         process.env.STRIPE_PRICE_MANAGED_START,
  managed_start_yearly:  process.env.STRIPE_PRICE_MANAGED_START_YEARLY,
  managed_pro:           process.env.STRIPE_PRICE_MANAGED_PRO,
  managed_pro_yearly:    process.env.STRIPE_PRICE_MANAGED_PRO_YEARLY,
  managed_premium:       process.env.STRIPE_PRICE_MANAGED_PREMIUM,
  managed_premium_yearly:process.env.STRIPE_PRICE_MANAGED_PREMIUM_YEARLY,
};

module.exports = async function(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const { plan, billing, firma_slug, email } = req.body;

  var planKey = plan;
  if (billing === 'year' && PRICES[plan + '_yearly']) {
    planKey = plan + '_yearly';
  }

  const priceId = PRICES[planKey];
  if (!priceId) return res.status(400).json({error: "Unknown plan: " + planKey});

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { firma_slug: firma_slug || "", billing: billing || "month" },
      success_url: "https://webgen.pl/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://webgen.pl/test/generator/",
    });
    res.json({ checkout_url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
