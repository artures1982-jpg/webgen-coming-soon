const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { verifyRequest } = require("../lib/clerk-verify");

// Model Free/Pro (Faza 5 przebudowy cennika) — jeden płatny plan zamiast START/PRO/PREMIUM.
const PRICES = {
  pro:                        process.env.STRIPE_PRICE_PRO,
  pro_yearly:                 process.env.STRIPE_PRICE_PRO_YEARLY,
};

// 7 dodatków à la carte nad planem Pro. SEO i formularz/rezerwacje są teraz wbudowane w Pro,
// więc seo_dzielnice/seo_miasto/wersja_jezykowa zniknęły stąd (patrz plan Fazy 5).
const ADDON_PRICES = {
  wlasna_domena:              process.env.STRIPE_PRICE_ADDON_DOMENA,
  social_media:               process.env.STRIPE_PRICE_ADDON_SOCIAL_MEDIA,
  statystyki:                 process.env.STRIPE_PRICE_ADDON_STATYSTYKI,
  dodatkowe_podstrony:        process.env.STRIPE_PRICE_ADDON_PODSTRONY,
  sesja_ai:                   process.env.STRIPE_PRICE_ADDON_SESJA_AI,
  google_business:            process.env.STRIPE_PRICE_ADDON_GBP,
  priorytetowe_wsparcie:      process.env.STRIPE_PRICE_ADDON_PRIORYTETOWE,
};

// Dodatki jednorazowe (Stripe Checkout mode:'payment') vs cykliczne (mode:'subscription').
// wlasna_domena i dodatkowe_podstrony i sesja_ai to setup jednorazowy; reszta miesięczna.
const ONE_TIME_ADDONS = { wlasna_domena: true, dodatkowe_podstrony: true, sesja_ai: true };

module.exports = async function(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  const session = await verifyRequest(req);
  if (!session) return res.status(401).json({error: "Brak autoryzacji"});
  const email = session.email;
  const { plan, billing, addons, firma_slug } = req.body;

  var lineItems = [];
  var hasRecurring = false;

  // plan jest opcjonalny — pusty gdy klient z panelu klienta dokupuje sam dodatek
  // do już aktywnego planu Pro (patrz test/dashboard/index.html addonRow()).
  if (plan) {
    var planKey = plan;
    if (billing === 'year' && PRICES[plan + '_yearly']) {
      planKey = plan + '_yearly';
    }
    const planPriceId = PRICES[planKey];
    if (!planPriceId) return res.status(400).json({error: "Unknown plan: " + planKey});
    lineItems.push({ price: planPriceId, quantity: 1 });
    hasRecurring = true;
  }

  if (Array.isArray(addons)) {
    for (var i = 0; i < addons.length; i++) {
      var addonId = addons[i];
      var addonPriceId = ADDON_PRICES[addonId];
      if (addonPriceId) {
        lineItems.push({ price: addonPriceId, quantity: 1 });
        if (!ONE_TIME_ADDONS[addonId]) hasRecurring = true;
      }
    }
  }

  if (lineItems.length === 0) return res.status(400).json({error: "Brak pozycji do zakupu"});

  try {
    // Stripe wymaga mode:'subscription' tylko gdy jest co najmniej 1 cena cykliczna;
    // sam zakup jednorazowego dodatku (bez planu) idzie przez mode:'payment'.
    var mode = hasRecurring ? 'subscription' : 'payment';
    var checkoutSession = await stripe.checkout.sessions.create({
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
    res.json({ checkout_url: checkoutSession.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
