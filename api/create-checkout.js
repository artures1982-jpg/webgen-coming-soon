const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  managed_start:   process.env.STRIPE_PRICE_MANAGED_START,
  managed_pro:     process.env.STRIPE_PRICE_MANAGED_PRO,
  managed_premium: process.env.STRIPE_PRICE_MANAGED_PREMIUM,
  saas_starter:    process.env.STRIPE_PRICE_SAAS_STARTER,
  saas_pro:        process.env.STRIPE_PRICE_SAAS_PRO,
  saas_agency:     process.env.STRIPE_PRICE_SAAS_AGENCY,
};

module.exports = async function(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const { plan, firma_slug, email } = req.body;
  const priceId = PRICES[plan];
  if (!priceId) return res.status(400).json({error: "Unknown plan: " + plan});
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { firma_slug: firma_slug || "" },
      success_url: "https://webgen.pl/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://webgen.pl/test/generator/",
    });
    res.json({ checkout_url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
