const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  managed_start:              process.env.STRIPE_PRICE_MANAGED_START,
  managed_start_yearly:       process.env.STRIPE_PRICE_MANAGED_START_YEARLY,
  managed_pro:                process.env.STRIPE_PRICE_MANAGED_PRO,
  managed_pro_yearly:         process.env.STRIPE_PRICE_MANAGED_PRO_YEARLY,
  managed_premium:            process.env.STRIPE_PRICE_MANAGED_PREMIUM,
};

const ADDON_PRICES = {
  seo_dzielnice:              process.env.STRIPE_PRICE_ADDON_SEO_DZIELNICE,
  seo_miasto:                 process.env.STRIPE_PRICE_ADDON_SEO_MIASTO,
  wersja_jezykowa:            process.env.STRIPE_PRICE_ADDON_WERSJA_JEZYKOWA,
  priorytetowe_wsparcie:      process.env.STRIPE_PRICE_ADDON_PRIORYTETOWE,
  wlasna_domena:              process.env.STRIPE_PRICE_ADDON_DOMENA,
  dodatkowe_podstrony:        process.env.STRIPE_PRICE_ADDON_PODSTRONY,
  sesja_ai:                   process.env.STRIPE_PRICE_ADDON_SESJA_AI,
};

module.exports = async function(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const { plan, billing, addons, firma_slug, email } = req.body;

  var planKey = plan;
  if (billing === 'year' && PRICES[plan + '_yearly']) {
    planKey = plan + '_yearly';
  }

  const planPriceId = PRICES[planKey];
  if (!planPriceId) return res.status(400).json({error: "Unknown plan: " + planKey});

  var lineItems = [{ price: planPriceId, quantity: 1 }];

  if (Array.isArray(addons)) {
    for (var i = 0; i < addons.length; i++) {
      var addonId = addons[i];
      var addonPriceId = ADDON_PRICES[addonId];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
      }
    }
  }

  try {
    var mode = 'subscription';
    var session = await stripe.checkout.sessions.create({
      mode: mode,
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      metadata: {
        firma_slug: firma_slug || "",
        billing: billing || "month",
        addons: Array.isArray(addons) ? addons.join(',') : ""
      },
      success_url: "https://webgen.pl/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://webgen.pl/test/generator/",
    });
    res.json({ checkout_url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
