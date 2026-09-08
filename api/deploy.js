/**
 * WEBGEN — /api/deploy
 * Vercel Serverless Function
 *
 * Flow:
 *   1. Przyjmuje { slug, html, plan, email, session_id }
 *   2. Dla planów płatnych (pro/promax) weryfikuje session_id w Stripe — bez
 *      tego endpoint był otwarty: dowolny POST z plan:'promax' aktywował
 *      płatny serwis za darmo, /success/ tylko ufał obecności session_id
 *      w URL, nigdy go nie sprawdzając.
 *   3. Zapisuje HTML do Vercel Blob (storage)
 *   4. Dodaje subdomenę slug.webgen.pl do projektu przez Vercel API
 *   5. Zwraca { url, subdomain, status }
 *
 * Wymagane env vars:
 *   VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
 *   BLOB_READ_WRITE_TOKEN (Vercel Blob — dodaj w dashboard)
 *   STRIPE_SECRET_KEY (weryfikacja płatności dla planów pro/promax)
 */

const { put } = require('@vercel/blob');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Sprawdza w Stripe, że session_id to realna, opłacona sesja Checkout dla
// tego konkretnego sluga — nie tylko "jakiś" session_id wklejony w URL.
async function verifyPaidSession(sessionId, slug) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = session.status === 'complete'
    && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');
  if (!paid) throw new Error('Płatność nie została potwierdzona przez Stripe');
  if (session.metadata && session.metadata.firma_slug && session.metadata.firma_slug !== slug) {
    throw new Error('Slug nie zgadza się z opłaconą sesją');
  }
}

const VERCEL_API   = 'https://api.vercel.com';
const TOKEN        = process.env.VERCEL_TOKEN;
const PROJECT_ID   = process.env.VERCEL_PROJECT_ID;
const TEAM_ID      = process.env.VERCEL_TEAM_ID;

// ── Zapisuje HTML do Vercel Blob ─────────────────────────────────────────────
async function saveToBlob(slug, html) {
  const blob = await put(`sites/${slug}/index.html`, html, {
    access: 'public',
    contentType: 'text/html; charset=utf-8',
    addRandomSuffix: false,
  });
  return blob.url;
}

// ── Dodaje subdomenę do projektu Vercel ──────────────────────────────────────
async function addSubdomain(subdomain) {
  const res = await fetch(
    `${VERCEL_API}/v10/projects/${PROJECT_ID}/domains?teamId=${TEAM_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: subdomain }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    // Domena już istnieje — to OK, nie rzucaj błędem
    if (data?.error?.code === 'domain_already_in_use') {
      return { verified: true, existing: true };
    }
    throw new Error(data?.error?.message || `Vercel API error: ${res.status}`);
  }

  return data;
}

// ── Sprawdza status domeny ───────────────────────────────────────────────────
async function checkDomain(subdomain) {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${subdomain}?teamId=${TEAM_ID}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  return res.json();
}

// ── Handler ──────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = ['https://webgen.pl', 'https://www.webgen.pl'];

module.exports = async (req, res) => {
  const reqOrigin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[1]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, html, plan, email, session_id } = req.body;

  if (!slug || !html) {
    return res.status(400).json({ error: 'Wymagane: slug, html' });
  }

  if (plan && plan !== 'free') {
    if (!session_id) {
      return res.status(402).json({ error: 'Brak potwierdzenia płatności (session_id)' });
    }
    try {
      await verifyPaidSession(session_id, slug);
    } catch (err) {
      return res.status(402).json({ error: err.message });
    }
  }

  const subdomain = `${slug}.webgen.pl`;

  try {
    // 1. Zapisz HTML do Blob
    const blobUrl = await saveToBlob(slug, html);
    console.log(`[deploy] Blob saved: ${blobUrl}`);

    // 2. Dodaj subdomenę do projektu Vercel
    const domainResult = await addSubdomain(subdomain);
    console.log(`[deploy] Domain added: ${subdomain}`, domainResult);

    // 3. Sprawdź status
    const domainStatus = await checkDomain(subdomain);

    // Oblicz daty dla planu Start (6 miesięcy)
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setMonth(trialEnd.getMonth() + 6);
    const emailReminder = new Date(trialEnd);
    emailReminder.setMonth(emailReminder.getMonth() - 1); // miesiąc przed końcem

    return res.json({
      success: true,
      slug,
      subdomain,
      url: `https://${subdomain}`,
      blob_url: blobUrl,
      verified: domainStatus.verified ?? false,
      plan: plan || 'free',
      trial_end: trialEnd.toISOString().split('T')[0],
      email_reminder_date: emailReminder.toISOString().split('T')[0],
      note: 'Plan Start: 6 miesiecy bezplatnie. Email reminder wysylany miesiac przed wygasnieciem.',
    });

  } catch (err) {
    console.error('[deploy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
