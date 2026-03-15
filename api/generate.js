import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firma } = req.body;
    if (!firma) return res.status(400).json({ error: 'Brak danych firmy' });

    const slug = (firma.nazwa || 'firma')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
      .substr(0, 30) || 'firma';

    const html = generateHTML(firma);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await put(`sites/${slug}/index.html`, html, {
          access: 'private',
          contentType: 'text/html; charset=utf-8',
        });
      } catch (blobErr) {
        console.warn('Blob save skipped:', blobErr.message);
      }
    }

    return res.status(200).json({ success: true, html, slug, mode: 'placeholder' });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function generateHTML(f) {
  const COLORS = {
    'Remonty i wykończenia': { primary: '#D97B3A', bg: '#FFF8F2', text: '#331A00' },
    'Hydraulika':            { primary: '#2163C8', bg: '#F0F6FF', text: '#0A1E36' },
    'Elektryka':             { primary: '#E6B82E', bg: '#0E0E0E', text: '#FFFFFF' },
    'Salon piękności':       { primary: '#E698BA', bg: '#FFF5F8', text: '#4A1A30' },
    'Sprzątanie':            { primary: '#4AA86E', bg: '#F0FFF5', text: '#0A2D1A' },
    'Ogrodnictwo':           { primary: '#6AB52E', bg: '#F5FFEC', text: '#1A2C04' },
    'Malowanie':             { primary: '#E87E2D', bg: '#FFF8F2', text: '#331500' },
    'Gastronomia':           { primary: '#C0322D', bg: '#FFF0F0', text: '#330505' },
  };

  const c = COLORS[f.branza] || { primary: '#3366FF', bg: '#F5F5FF', text: '#111144' };
  const lok = [f.dzielnica, f.miasto].filter(Boolean).join(', ');
  const nazwa = f.nazwa || f.branza;
  const tel = f.telefon || '+48 000 000 000';
  const email = f.email || 'kontakt@firma.pl';
  const lata = f.lata ? `${f.lata} lat doświadczenia` : '';
  const real = f.realizacje ? `${f.realizacje}+ realizacji` : '';
  const godz = f.godz_pon_pt ? `Pon–Pt: ${f.godz_pon_pt}` : '';
  const godzSob = f.godz_sob ? ` | Sob: ${f.godz_sob}` : '';
  const opis = f.opis || `Profesjonalna firma ${f.branza.toLowerCase()} działająca na terenie ${lok}. Szybko, solidnie, z gwarancją jakości.`;

  const socialLinks = [
    f.facebook ? `<a href="${f.facebook}" style="color:#fff;margin:0 8px">Facebook</a>` : '',
    f.instagram ? `<a href="${f.instagram}" style="color:#fff;margin:0 8px">Instagram</a>` : '',
    f.tiktok ? `<a href="${f.tiktok}" style="color:#fff;margin:0 8px">TikTok</a>` : '',
  ].filter(Boolean).join('');

  const whatsapp = f.whatsapp ? `
    <a href="https://wa.me/48${f.whatsapp}" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:999">💬</a>` : '';

  const booksy = f.booksy ? `<a href="${f.booksy}" style="display:inline-block;margin-top:12px;background:#fff;color:${c.primary};padding:10px 24px;border-radius:8px;font-weight:700;text-decoration:none">📅 Zarezerwuj termin</a>` : '';

  const googleBadge = f.google_ocena ? `
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);border-radius:8px;padding:8px 16px;margin-top:12px">
      <span style="font-size:20px">⭐</span>
      <span style="font-weight:800;font-size:18px">${f.google_ocena}</span>
      <span style="opacity:.8">${f.google_opinie ? `(${f.google_opinie} opinii)` : 'w Google'}</span>
    </div>` : '';

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": nazwa,
    "telephone": tel,
    "email": email,
    "description": opis,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": f.miasto,
      "addressCountry": "PL"
    },
    ...(f.google_ocena ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": f.google_ocena, "reviewCount": f.google_opinie || 10 } } : {}),
    ...(f.adres ? { "streetAddress": f.adres } : {}),
  });

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nazwa} - ${f.branza} ${lok}</title>
  <meta name="description" content="${nazwa} - profesjonalne usługi ${f.branza.toLowerCase()} w ${lok}. Zadzwoń: ${tel}.">
  <script type="application/ld+json">${schema}</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:${c.bg};color:${c.text};line-height:1.6}
    header{background:${c.primary};color:#fff;padding:48px 24px;text-align:center}
    header h1{font-size:clamp(28px,5vw,52px);font-weight:800;margin-bottom:8px}
    header p{font-size:18px;opacity:.9;margin-bottom:4px}
    .stats{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin:20px 0}
    .stat{background:rgba(255,255,255,.15);border-radius:8px;padding:8px 16px;font-weight:700}
    .cta-tel{display:inline-block;margin-top:20px;background:#fff;color:${c.primary};padding:14px 32px;border-radius:10px;font-weight:800;font-size:18px;text-decoration:none}
    main{max-width:860px;margin:0 auto;padding:48px 24px}
    .about{background:#fff;border-radius:16px;padding:32px;margin-bottom:32px;box-shadow:0 2px 12px rgba(0,0,0,.06)}
    .about h2{font-size:24px;font-weight:800;color:${c.primary};margin-bottom:12px}
    .services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:32px}
    .service{background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .service h3{font-size:16px;font-weight:700;color:${c.primary};margin-bottom:8px}
    .service p{font-size:14px;color:#666}
    .hours{background:#fff;border-radius:12px;padding:24px;margin-bottom:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .hours h2{font-size:20px;font-weight:700;color:${c.primary};margin-bottom:12px}
    .contact-box{background:${c.primary};color:#fff;border-radius:16px;padding:40px;text-align:center;margin-bottom:32px}
    .contact-box h2{font-size:28px;font-weight:800;margin-bottom:16px}
    .contact-box a.big-tel{display:block;font-size:32px;font-weight:800;color:#fff;text-decoration:none;margin-bottom:8px}
    .contact-box .email{opacity:.85;font-size:16px}
    footer{background:${c.primary};color:rgba(255,255,255,.7);padding:24px;text-align:center;font-size:13px}
  </style>
</head>
<body>
  <header>
    <h1>${nazwa}</h1>
    <p>${f.branza} · ${lok}</p>
    <div class="stats">
      ${lata ? `<div class="stat">✓ ${lata}</div>` : ''}
      ${real ? `<div class="stat">✓ ${real}</div>` : ''}
      <div class="stat">✓ PageSpeed 90+</div>
    </div>
    ${googleBadge}
    <a href="tel:${tel}" class="cta-tel">📞 Zadzwoń: ${tel}</a>
    ${booksy}
  </header>
  <main>
    <div class="about">
      <h2>O nas</h2>
      <p>${opis}</p>
    </div>
    <div class="services-grid">
      <div class="service"><h3>Profesjonalna obsługa</h3><p>Wykonujemy kompleksowo na terenie ${lok}.</p></div>
      <div class="service"><h3>Szybka realizacja</h3><p>Terminowość i rzetelność to nasza wizytówka.</p></div>
      <div class="service"><h3>Doświadczenie</h3><p>${lata || 'Wieloletnie doświadczenie'} na lokalnym rynku.</p></div>
      <div class="service"><h3>Gwarancja jakości</h3><p>Każde zlecenie realizujemy z pełnym zaangażowaniem.</p></div>
    </div>
    ${godz ? `<div class="hours"><h2>Godziny otwarcia</h2><p>${godz}${godzSob}</p></div>` : ''}
    <div class="contact-box">
      <h2>Skontaktuj się z nami</h2>
      <a href="tel:${tel}" class="big-tel">${tel}</a>
      <div class="email">${email}</div>
      ${f.adres ? `<div style="margin-top:8px;opacity:.8">📍 ${f.adres}</div>` : ''}
      ${socialLinks ? `<div style="margin-top:16px">${socialLinks}</div>` : ''}
    </div>
  </main>
  <footer>© ${new Date().getFullYear()} ${nazwa} · ${lok} · Strona stworzona przez <a href="https://webgen.pl" style="color:inherit">webgen.pl</a></footer>
  ${whatsapp}
</body>
</html>`;
}
