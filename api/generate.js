
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

    // Generate 3 layout variants
    const variants = {
      classic: generateHTML({ ...firma, layout: 'classic' }),
      modern: generateHTML({ ...firma, layout: 'modern' }),
      elegant: generateHTML({ ...firma, layout: 'elegant' }),
    };

    return res.status(200).json({ success: true, variants, slug, mode: 'placeholder' });
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ═══════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════
function generateHTML(f) {
  const layout = f.layout || 'classic';
  const COLORS = {
    'Remonty i wykończenia': { primary: '#D97B3A', accent: '#B8621B' },
    'Hydraulika':            { primary: '#2163C8', accent: '#1A4F9E' },
    'Elektryka':             { primary: '#D4A017', accent: '#B8890F' },
    'Salon piękności':       { primary: '#E698BA', accent: '#D47FA3' },
    'Sprzątanie':            { primary: '#4AA86E', accent: '#3A8F5A' },
    'Ogrodnictwo':           { primary: '#6AB52E', accent: '#5A9E24' },
    'Malowanie':             { primary: '#E87E2D', accent: '#CC6A1F' },
    'Gastronomia':           { primary: '#C0322D', accent: '#A02824' },
  };
  const bc = COLORS[f.branza] || { primary: '#3366FF', accent: '#2952CC' };
  const lok = [f.dzielnica, f.miasto].filter(Boolean).join(', ');
  const nazwa = f.nazwa || f.branza;
  const tel = f.telefon || '+48 000 000 000';
  const email = f.email || 'kontakt@firma.pl';
  const lata = f.lata ? `${f.lata} lat doświadczenia` : '';
  const real = f.realizacje ? `${f.realizacje}+ realizacji` : '';
  const godz = f.godz_pon_pt ? `Pon-Pt: ${f.godz_pon_pt}` : '';
  const godzSob = f.godz_sob ? ` | Sob: ${f.godz_sob}` : '';
  const opis = f.opis || `Profesjonalna firma ${f.branza.toLowerCase()} na terenie ${lok}. Szybko, solidnie, z gwarancja jakosci.`;
  const rok = new Date().getFullYear();

  const socialLinks = [
    f.facebook ? `<a href="${f.facebook}" target="_blank" rel="noopener">Facebook</a>` : '',
    f.instagram ? `<a href="${f.instagram}" target="_blank" rel="noopener">Instagram</a>` : '',
    f.tiktok ? `<a href="${f.tiktok}" target="_blank" rel="noopener">TikTok</a>` : '',
  ].filter(Boolean);

  const whatsappHtml = f.whatsapp ? `<a href="https://wa.me/48${f.whatsapp}" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,.2);z-index:999">💬</a>` : '';
  const booksyHtml = f.booksy ? `<a href="${f.booksy}" target="_blank" rel="noopener" class="cta-booksy">📅 Zarezerwuj termin</a>` : '';
  const logoHtml = f.logo_base64 ? `<img src="${f.logo_base64}" alt="${nazwa} logo" style="max-height:56px;max-width:150px;border-radius:5px">` : '';

  const PLAN_LIMITS = { free: 3, managed_start: 6, managed_pro: 12, managed_premium: 12 };
  const planKey = (f.plan || 'free').toLowerCase().replace(/[^a-z_]/g, '_');
  const galeriaLimit = PLAN_LIMITS[planKey] || 3;
  const galeria = (Array.isArray(f.galeria) ? f.galeria : (f.galeriaUrls || [])).filter(Boolean).slice(0, galeriaLimit);
  const heroUrl = f.hero_base64 || f.heroUrl || '';

  const googleBadge = f.google_ocena ? `<span class="badge-google">⭐ ${f.google_ocena} ${f.google_opinie ? `(${f.google_opinie} opinii)` : ''}</span>` : '';

  const schema = JSON.stringify({
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "name": nazwa, "telephone": tel, "email": email, "description": opis,
    "address": { "@type": "PostalAddress", "addressLocality": f.miasto, "addressCountry": "PL" },
    ...(f.google_ocena ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": f.google_ocena, "reviewCount": f.google_opinie || 10 } } : {}),
    ...(f.adres ? { "streetAddress": f.adres } : {}),
  });

  const head = `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${nazwa} - ${f.branza} ${lok}</title>
<meta name="description" content="${nazwa} - profesjonalne uslugi ${f.branza.toLowerCase()} w ${lok}. Zadzwon: ${tel}.">
<script type="application/ld+json">${schema}</script>`;

  const d = { bc, lok, nazwa, tel, email, lata, real, godz, godzSob, opis, rok, socialLinks, whatsappHtml, booksyHtml, logoHtml, galeria, heroUrl, googleBadge, head, f };

  if (layout === 'modern') return layoutModern(d);
  if (layout === 'elegant') return layoutElegant(d);
  return layoutClassic(d);
}

// ═══════════════════════════════════════
//  LAYOUT 1: CLASSIC — warm, friendly
// ═══════════════════════════════════════
function layoutClassic(d) {
  const { bc, lok, nazwa, tel, email, lata, real, godz, godzSob, opis, rok, socialLinks, whatsappHtml, booksyHtml, logoHtml, galeria, heroUrl, googleBadge, head } = d;
  const galeriaHtml = galeria.length ? `<section class="sec"><h2>Nasze realizacje</h2><div class="gal">${galeria.map(s=>`<img src="${s}" alt="Realizacja ${nazwa}" loading="lazy">`).join('')}</div></section>` : '';
  return `${head}
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#FFF8F2;color:#331A00;line-height:1.65}
header{background:${bc.primary};color:#fff;padding:56px 24px;text-align:center}
header h1{font-size:clamp(28px,5vw,48px);font-weight:800;margin-bottom:6px}
header .sub{font-size:17px;opacity:.9}
.stats{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:20px 0}
.stat{background:rgba(255,255,255,.18);border-radius:8px;padding:8px 16px;font-weight:700;font-size:14px}
.badge-google{display:inline-block;background:rgba(255,255,255,.2);border-radius:8px;padding:6px 14px;margin-top:10px;font-weight:700}
.cta{display:inline-block;margin-top:18px;background:#fff;color:${bc.primary};padding:14px 32px;border-radius:10px;font-weight:800;font-size:18px;text-decoration:none}
.cta-booksy{display:inline-block;margin-top:10px;background:rgba(255,255,255,.2);color:#fff;padding:10px 24px;border-radius:8px;font-weight:700;text-decoration:none}
main{max-width:860px;margin:0 auto;padding:48px 24px}
.sec{background:#fff;border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,.05)}
.sec h2{font-size:22px;font-weight:800;color:${bc.primary};margin-bottom:14px}
.grid4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:24px}
.card{background:#fff;border-radius:12px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.05);border-left:4px solid ${bc.primary}}
.card h3{font-size:15px;font-weight:700;color:${bc.primary};margin-bottom:6px}
.card p{font-size:13px;color:#666}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px}
.contact{background:${bc.primary};color:#fff;border-radius:16px;padding:40px;text-align:center;margin-bottom:24px}
.contact h2{font-size:26px;font-weight:800;margin-bottom:14px}
.contact .big{display:block;font-size:30px;font-weight:800;color:#fff;text-decoration:none;margin-bottom:6px}
footer{background:${bc.primary};color:rgba(255,255,255,.7);padding:20px;text-align:center;font-size:12px}
footer a{color:rgba(255,255,255,.5);text-decoration:none}
@media(max-width:600px){header{padding:36px 16px}main{padding:24px 16px}.grid4{grid-template-columns:1fr}}
</style></head><body>
<header>
  ${logoHtml ? `<div style="margin-bottom:14px">${logoHtml}</div>` : ''}
  <h1>${nazwa}</h1>
  <p class="sub">${d.f.branza} · ${lok}</p>
  <div class="stats">${lata?`<div class="stat">✓ ${lata}</div>`:''}${real?`<div class="stat">✓ ${real}</div>`:''}</div>
  ${googleBadge}
  <div><a href="tel:${tel}" class="cta">📞 ${tel}</a></div>
  ${booksyHtml}
</header>
${heroUrl?`<div style="max-height:420px;overflow:hidden"><img src="${heroUrl}" alt="${nazwa}" style="width:100%;object-fit:cover;display:block"></div>`:''}
<main>
  <div class="sec"><h2>O nas</h2><p>${opis}</p></div>
  ${galeriaHtml}
  <div class="grid4">
    <div class="card"><h3>Profesjonalizm</h3><p>Kompleksowa obsluga na terenie ${lok}.</p></div>
    <div class="card"><h3>Terminowosc</h3><p>Szybka realizacja i rzetelnosc.</p></div>
    <div class="card"><h3>Doswiadczenie</h3><p>${lata||'Wieloletnie doswiadczenie'} na rynku.</p></div>
    <div class="card"><h3>Gwarancja</h3><p>Kazde zlecenie z pelnym zaangazowaniem.</p></div>
  </div>
  ${godz?`<div class="sec"><h2>Godziny otwarcia</h2><p>${godz}${godzSob}</p></div>`:''}
  <div class="contact"><h2>Zadzwon do nas</h2><a href="tel:${tel}" class="big">${tel}</a><p>${email}</p>${socialLinks.length?`<div style="margin-top:14px;display:flex;gap:12px;justify-content:center">${socialLinks.map(l=>l.replace('<a ','<a style="color:rgba(255,255,255,.8);text-decoration:none" ')).join('')}</div>`:''}</div>
</main>
<footer>&copy; ${rok} ${nazwa} · Strona: <a href="https://webgen.pl">webgen.pl</a></footer>
${whatsappHtml}</body></html>`;
}

// ═══════════════════════════════════════
//  LAYOUT 2: MODERN — dark, bold, tech
// ═══════════════════════════════════════
function layoutModern(d) {
  const { bc, lok, nazwa, tel, email, lata, real, godz, godzSob, opis, rok, socialLinks, whatsappHtml, booksyHtml, logoHtml, galeria, heroUrl, googleBadge, head } = d;
  const acc = '#00E5A0';
  const galeriaHtml = galeria.length ? `<section class="sec"><h2>Realizacje</h2><div class="gal">${galeria.map(s=>`<img src="${s}" alt="Realizacja ${nazwa}" loading="lazy">`).join('')}</div></section>` : '';
  return `${head}
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Space Grotesk',system-ui,sans-serif;background:#080A0F;color:#E8ECF4;line-height:1.65}
header{padding:60px 24px;text-align:center;position:relative;overflow:hidden;background:linear-gradient(135deg,#0A0F1A 0%,#121828 100%)}
header::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 30% 50%,${bc.primary}15 0%,transparent 50%),radial-gradient(circle at 70% 50%,${acc}10 0%,transparent 50%);pointer-events:none}
header h1{font-size:clamp(30px,5vw,52px);font-weight:700;position:relative;color:#fff}
header h1 span{color:${acc}}
header .sub{font-size:17px;color:rgba(255,255,255,.6);position:relative}
.stats{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:20px 0;position:relative}
.stat{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 16px;font-weight:600;font-size:13px;color:${acc}}
.badge-google{display:inline-block;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 14px;margin-top:8px;font-weight:600;position:relative}
.cta{display:inline-block;margin-top:18px;background:${acc};color:#080A0F;padding:14px 36px;border-radius:10px;font-weight:700;font-size:17px;text-decoration:none;position:relative}
.cta:hover{opacity:.9}
.cta-booksy{display:inline-block;margin-top:10px;background:transparent;border:1px solid ${acc};color:${acc};padding:10px 24px;border-radius:8px;font-weight:600;text-decoration:none}
main{max-width:900px;margin:0 auto;padding:48px 24px}
.sec{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:32px;margin-bottom:24px}
.sec h2{font-size:22px;font-weight:700;color:#fff;margin-bottom:14px}
.sec h2::after{content:'';display:block;width:40px;height:3px;background:${acc};border-radius:2px;margin-top:8px}
.grid4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:24px}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:22px;transition:border-color .2s}
.card:hover{border-color:${acc}40}
.card h3{font-size:15px;font-weight:700;color:${acc};margin-bottom:6px}
.card p{font-size:13px;color:rgba(255,255,255,.5)}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,.06)}
.contact{background:linear-gradient(135deg,${bc.primary}20,${acc}15);border:1px solid ${acc}30;border-radius:16px;padding:40px;text-align:center;margin-bottom:24px}
.contact h2{font-size:26px;font-weight:700;color:#fff;margin-bottom:14px}
.contact .big{display:block;font-size:28px;font-weight:700;color:${acc};text-decoration:none;margin-bottom:6px}
footer{border-top:1px solid rgba(255,255,255,.06);padding:20px;text-align:center;font-size:12px;color:rgba(255,255,255,.3)}
footer a{color:${acc};opacity:.5;text-decoration:none}
@media(max-width:600px){header{padding:36px 16px}main{padding:24px 16px}.grid4{grid-template-columns:1fr}}
</style></head><body>
<header>
  ${logoHtml ? `<div style="margin-bottom:14px;position:relative">${logoHtml}</div>` : ''}
  <h1>${nazwa.split(' ').slice(0,-1).join(' ')} <span>${nazwa.split(' ').slice(-1)}</span></h1>
  <p class="sub">${d.f.branza} · ${lok}</p>
  <div class="stats">${lata?`<div class="stat">${lata}</div>`:''}${real?`<div class="stat">${real}</div>`:''}<div class="stat">PageSpeed 90+</div></div>
  ${googleBadge}
  <div><a href="tel:${tel}" class="cta">📞 ${tel}</a></div>
  ${booksyHtml}
</header>
${heroUrl?`<div style="max-height:420px;overflow:hidden"><img src="${heroUrl}" alt="${nazwa}" style="width:100%;object-fit:cover;display:block"></div>`:''}
<main>
  <div class="sec"><h2>O firmie</h2><p>${opis}</p></div>
  ${galeriaHtml}
  <div class="grid4">
    <div class="card"><h3>// Profesjonalizm</h3><p>Kompleksowa obsluga na terenie ${lok}.</p></div>
    <div class="card"><h3>// Terminowosc</h3><p>Szybka realizacja i rzetelnosc.</p></div>
    <div class="card"><h3>// Doswiadczenie</h3><p>${lata||'Wieloletnie doswiadczenie'} na rynku.</p></div>
    <div class="card"><h3>// Gwarancja</h3><p>Kazde zlecenie z pelnym zaangazowaniem.</p></div>
  </div>
  ${godz?`<div class="sec"><h2>Godziny</h2><p>${godz}${godzSob}</p></div>`:''}
  <div class="contact"><h2>Kontakt</h2><a href="tel:${tel}" class="big">${tel}</a><p style="color:rgba(255,255,255,.5)">${email}</p>${socialLinks.length?`<div style="margin-top:14px;display:flex;gap:14px;justify-content:center">${socialLinks.map(l=>l.replace('<a ','<a style="color:'+acc+';text-decoration:none;font-size:14px" ')).join('')}</div>`:''}</div>
</main>
<footer>&copy; ${rok} ${nazwa} · <a href="https://webgen.pl">webgen.pl</a></footer>
${whatsappHtml}</body></html>`;
}

// ═══════════════════════════════════════
//  LAYOUT 3: ELEGANT — minimal, luxury
// ═══════════════════════════════════════
function layoutElegant(d) {
  const { bc, lok, nazwa, tel, email, lata, real, godz, godzSob, opis, rok, socialLinks, whatsappHtml, booksyHtml, logoHtml, galeria, heroUrl, googleBadge, head } = d;
  const gold = '#8B7355';
  const galeriaHtml = galeria.length ? `<section class="sec"><h2>Portfolio</h2><div class="gal">${galeria.map(s=>`<img src="${s}" alt="Realizacja ${nazwa}" loading="lazy">`).join('')}</div></section>` : '';
  return `${head}
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#FAFAF8;color:#2A2A2A;line-height:1.7}
h1,h2,h3{font-family:'Playfair Display',Georgia,serif}
header{padding:64px 24px;text-align:center;border-bottom:1px solid #E8E6E1}
header h1{font-size:clamp(32px,5vw,56px);font-weight:700;letter-spacing:-.02em;color:#1A1A1A;margin-bottom:4px}
header .sub{font-size:15px;color:#8B8B8B;letter-spacing:2px;text-transform:uppercase;font-weight:500;font-family:'Inter',sans-serif}
header .line{width:60px;height:2px;background:${gold};margin:20px auto}
.stats{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin:16px 0}
.stat{font-size:13px;color:${gold};font-weight:500;letter-spacing:.5px}
.stat::before{content:'— '}
.badge-google{display:inline-block;font-size:14px;color:${gold};margin-top:8px}
.cta{display:inline-block;margin-top:22px;background:${gold};color:#fff;padding:14px 40px;border-radius:0;font-weight:500;font-size:15px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;font-family:'Inter',sans-serif}
.cta:hover{background:#7A654A}
.cta-booksy{display:inline-block;margin-top:10px;border:1px solid ${gold};color:${gold};padding:10px 28px;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-family:'Inter',sans-serif}
main{max-width:800px;margin:0 auto;padding:56px 24px}
.sec{margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid #E8E6E1}
.sec:last-child{border-bottom:none}
.sec h2{font-size:28px;font-weight:600;color:#1A1A1A;margin-bottom:16px;letter-spacing:-.01em}
.sec p{font-size:16px;color:#555;max-width:640px}
.grid4{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:48px}
.card{padding:28px 0;border-top:1px solid #E8E6E1}
.card h3{font-size:18px;font-weight:600;color:#1A1A1A;margin-bottom:8px}
.card p{font-size:14px;color:#888}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.gal img{width:100%;aspect-ratio:4/3;object-fit:cover;filter:grayscale(20%);transition:filter .3s}
.gal img:hover{filter:grayscale(0%)}
.contact{text-align:center;padding:56px 24px;margin-bottom:48px}
.contact h2{font-size:32px;margin-bottom:16px}
.contact .big{display:block;font-size:28px;font-weight:700;color:${gold};text-decoration:none;margin-bottom:8px;font-family:'Playfair Display',serif}
.contact .em{color:#888;font-size:15px}
footer{border-top:1px solid #E8E6E1;padding:24px;text-align:center;font-size:11px;color:#BBB;letter-spacing:.5px}
footer a{color:#999;text-decoration:none}
@media(max-width:600px){header{padding:40px 16px}main{padding:32px 16px}.grid4{grid-template-columns:1fr}}
</style></head><body>
<header>
  ${logoHtml ? `<div style="margin-bottom:16px">${logoHtml}</div>` : ''}
  <p class="sub">${d.f.branza} · ${lok}</p>
  <h1>${nazwa}</h1>
  <div class="line"></div>
  <div class="stats">${lata?`<span class="stat">${lata}</span>`:''}${real?`<span class="stat">${real}</span>`:''}</div>
  ${googleBadge}
  <div><a href="tel:${tel}" class="cta">Zadzwon ${tel}</a></div>
  ${booksyHtml}
</header>
${heroUrl?`<div style="max-height:480px;overflow:hidden"><img src="${heroUrl}" alt="${nazwa}" style="width:100%;object-fit:cover;display:block"></div>`:''}
<main>
  <div class="sec"><h2>O nas</h2><p>${opis}</p></div>
  ${galeriaHtml}
  <div class="grid4">
    <div class="card"><h3>Profesjonalizm</h3><p>Kompleksowa obsluga na terenie ${lok}.</p></div>
    <div class="card"><h3>Terminowosc</h3><p>Szybka realizacja i rzetelnosc.</p></div>
    <div class="card"><h3>Doswiadczenie</h3><p>${lata||'Wieloletnie doswiadczenie'} na rynku.</p></div>
    <div class="card"><h3>Gwarancja</h3><p>Kazde zlecenie z pelnym zaangazowaniem.</p></div>
  </div>
  ${godz?`<div class="sec"><h2>Godziny otwarcia</h2><p>${godz}${godzSob}</p></div>`:''}
  <div class="contact"><h2>Kontakt</h2><a href="tel:${tel}" class="big">${tel}</a><p class="em">${email}</p>${socialLinks.length?`<div style="margin-top:16px;display:flex;gap:16px;justify-content:center">${socialLinks.map(l=>l.replace('<a ','<a style="color:'+gold+';text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase" ')).join('')}</div>`:''}</div>
</main>
<footer>&copy; ${rok} ${nazwa} &middot; <a href="https://webgen.pl">webgen.pl</a></footer>
${whatsappHtml}</body></html>`;
}
