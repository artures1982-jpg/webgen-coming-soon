// /api/pexels.js — Pexels photo search proxy
// FIX: usunięto locale=pl-PL, zwraca oryginalna strukture src Pexels

const ALLOWED_ORIGINS = ['https://webgen.pl', 'https://www.webgen.pl'];

export default async function handler(req, res) {
  const reqOrigin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[1]);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = req.query.q || 'professional service';
  const per_page = Math.min(parseInt(req.query.per_page) || 36, 40);

  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  if (!PEXELS_KEY) {
    return res.status(500).json({ error: 'PEXELS_API_KEY not configured' });
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page}`;
    const response = await fetch(url, {
      headers: { 'Authorization': PEXELS_KEY }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Pexels ${response.status}`, details: errText });
    }

    const data = await response.json();

    // Zwroc oryginalna strukture src — frontend uzywa p.src.medium / p.src.large
    const photos = (data.photos || []).map(p => ({
      id: p.id,
      alt: p.alt || '',
      src: p.src,
      photographer: p.photographer,
    }));

    return res.status(200).json({
      total_results: data.total_results || 0,
      photos
    });

  } catch (err) {
    console.error('[pexels] Fetch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
