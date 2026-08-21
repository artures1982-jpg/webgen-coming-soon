// api/personalize.js — Faza 4: platna personalizacja AI na bazie wybranego szablonu.
// Node runtime (nie Edge) — dluzszy limit czasu (300s Fluid Compute vs 25s Edge Hobby),
// potrzebne bo wywolanie Claude na pelna strone potrafi trwac dlugo.
// Gating: bez aktywnego planu Pro w Stripe nie wolamy Claude (kontrola kosztow).

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO;
const STRIPE_PRICE_PRO_YEARLY = process.env.STRIPE_PRICE_PRO_YEARLY;

const fs = require('fs');
const path = require('path');
const { STYLES, buildUserPrompt } = require('../lib/promptBuilder');

async function stripeGet(pathname) {
  var res = await fetch('https://api.stripe.com/v1' + pathname, {
    headers: {
      'Authorization': 'Bearer ' + STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.json();
}

// Zwraca true jesli klient ma aktywna (lub trialing) subskrypcje Pro.
// Ograniczenie znane i celowe: bez realnych sesji/JWT w projekcie, email z requestu jest
// ufany tak samo jak w reszcie apki (np. api/dashboard-data.js) — nie probujemy tu naprawiac
// calego modelu auth, patrz CLAUDE.md "Pending: Supabase Auth".
async function checkEntitlement(email) {
  if (!STRIPE_SECRET_KEY || !email) return false;
  try {
    var customers = await stripeGet('/customers?email=' + encodeURIComponent(email) + '&limit=1');
    var customer = customers.data && customers.data[0] ? customers.data[0] : null;
    if (!customer) return false;

    var subs = await stripeGet('/subscriptions?customer=' + customer.id + '&status=active&limit=10');
    var list = subs.data || [];
    if (list.length === 0) {
      var trialing = await stripeGet('/subscriptions?customer=' + customer.id + '&status=trialing&limit=10');
      list = trialing.data || [];
    }

    for (var i = 0; i < list.length; i++) {
      var items = list[i].items && list[i].items.data || [];
      for (var j = 0; j < items.length; j++) {
        var priceId = items[j].price && items[j].price.id;
        if (priceId && (priceId === STRIPE_PRICE_PRO || priceId === STRIPE_PRICE_PRO_YEARLY)) {
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error('checkEntitlement error:', err);
    return false;
  }
}

function slugify(name) {
  return (name || 'firma')
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim().slice(0, 30) || 'firma';
}

function loadManifest() {
  var manifestPath = path.join(__dirname, '..', 'templates', 'manifest.json');
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    return [];
  }
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  var templateId = body.templateId;
  var firma = body.firma;
  var email = body.email;

  if (!templateId || !firma || !email) {
    return res.status(400).json({ error: 'Brak templateId, firma lub email' });
  }
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'Brak ANTHROPIC_API_KEY w srodowisku' });
  }

  var isPro = await checkEntitlement(email);
  if (!isPro) {
    return res.status(402).json({ error: 'Personalizacja AI wymaga aktywnego planu Pro', code: 'PRO_REQUIRED' });
  }

  var manifest = loadManifest();
  var tpl = manifest.filter(function (t) { return t.id === templateId; })[0];
  if (!tpl) {
    return res.status(404).json({ error: 'Nie znaleziono szablonu: ' + templateId });
  }

  var styleConfig = STYLES[tpl.style] || STYLES.classic;
  var userPrompt = buildUserPrompt(styleConfig, firma);

  try {
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: styleConfig.system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    var rawText = await r.text();
    if (!r.ok) {
      var errMsg = rawText;
      try { errMsg = JSON.parse(rawText).error.message; } catch (e) {}
      return res.status(500).json({ error: 'Claude API ' + r.status + ': ' + String(errMsg).slice(0, 300) });
    }

    var data = JSON.parse(rawText);
    var html = ((data.content && data.content[0] && data.content[0].text) || '').trim();
    if (html.indexOf('```html') === 0) html = html.slice(7);
    else if (html.indexOf('```') === 0) html = html.slice(3);
    if (html.slice(-3) === '```') html = html.slice(0, -3);
    html = html.trim();

    if (html.indexOf('</body>') === -1) html += '\n</body>';
    if (html.indexOf('</html>') === -1) html += '\n</html>';

    if (html.length < 500) {
      return res.status(500).json({ error: 'Claude zwrocil za krotka odpowiedz (' + html.length + ' znakow)' });
    }

    var slug = slugify(firma.nazwa_strony || firma.nazwa);

    return res.status(200).json({
      success: true,
      html: html,
      slug: slug,
      templateId: templateId,
      style: tpl.style,
      styleName: styleConfig.name,
      model: 'claude-sonnet-4-6',
      chars: html.length,
    });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
};
