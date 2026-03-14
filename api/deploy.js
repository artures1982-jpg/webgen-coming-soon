/**
 * WEBGEN — /api/deploy
 * Vercel Serverless Function
 *
 * Flow:
 *   1. Przyjmuje { slug, html, plan, email }
 *   2. Zapisuje HTML do Vercel Blob (storage)
 *   3. Dodaje subdomenę slug.webgen.pl do projektu przez Vercel API
 *   4. Zwraca { url, subdomain, status }
 *
 * Wymagane env vars:
 *   VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
 *   BLOB_READ_WRITE_TOKEN (Vercel Blob — dodaj w dashboard)
 */

const { put } = require('@vercel/blob');

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
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, html, plan, email } = req.body;

  if (!slug || !html) {
    return res.status(400).json({ error: 'Wymagane: slug, html' });
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

    return res.json({
      success: true,
      slug,
      subdomain,
      url: `https://${subdomain}`,
      blob_url: blobUrl,
      verified: domainStatus.verified ?? false,
      plan: plan || 'free',
    });

  } catch (err) {
    console.error('[deploy] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
