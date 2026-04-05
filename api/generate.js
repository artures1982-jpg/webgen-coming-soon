// api/generate.js — Edge Runtime (25s limit na Hobby) + Haiku (szybki)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { firma } = body;
    if (!firma) return new Response(JSON.stringify({ error: 'Brak danych firmy' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });

    const slug = (firma.nazwa || 'firma')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-').trim().substr(0, 30) || 'firma';

    const lok    = [firma.dzielnica, firma.miasto].filter(Boolean).join(', ') || 'Polska';
    const nazwa  = firma.nazwa || firma.branza || 'Firma';
    const tel    = firma.telefon || '';
    const email  = firma.email  || '';
    const branza = firma.branza || 'uslugi';

    const galeriaUrls = (Array.isArray(firma.galeria) ? firma.galeria : (firma.galeriaUrls || []))
      .filter(Boolean).slice(0, 6);
    const heroUrl = firma.heroUrl || '';

    const galeriaImgs = galeriaUrls.length
      ? galeriaUrls.map((u, i) => `<img src="${u}" alt="Realizacja ${i+1}" loading="lazy" style="width:100%;height:200px;object-fit:cover;border-radius:8px">`).join('\n')
      : '';
    const heroImg = heroUrl
      ? `<img src="${heroUrl}" alt="${nazwa}" style="width:100%;height:400px;object-fit:cover">`
      : '';
    const logoHtml = firma.logo_base64
      ? `<img src="${firma.logo_base64}" alt="${nazwa}" style="max-height:48px;max-width:140px;object-fit:contain">`
      : '';

    const schema = JSON.stringify({
      "@context": "https://schema.org", "@type": "LocalBusiness",
      "name": nazwa, "telephone": tel, "email": email,
      "description": `${nazwa} - ${branza} w ${lok}`,
      "address": { "@type": "PostalAddress", "addressLocality": firma.miasto || lok, "addressCountry": "PL" }
    });

    const style = ['classic','modern','elegant'].includes(firma.style) ? firma.style : 'classic';

    const styleMap = {
      classic:  'KLASYCZNY: biale/kremowe tlo, ciepłe kolory (czerwien/pomarancz), font Playfair Display (naglowki) + Lato (tekst), border-left na kartach uslug',
      modern:   'NOWOCZESNY: ciemne tlo #0A0F1A, akcent neonowy #00E5A0, font Space Grotesk, glassmorphism karty, gradient tekst na naglowkach',
      elegant:  'ELEGANCKI: biale tlo #FFFFFF, zlote akcenty #C9A84C, font Cormorant Garamond (naglowki) + Montserrat (tekst), duzo bialej przestrzeni, letter-spacing'
    };


    const prompt = `Stwórz kompletną stronę internetową dla lokalnej firmy. Styl: ${styleMap[style]}.

DANE:
Firma: ${nazwa} | Branża: ${branza} | Lokalizacja: ${lok}
Tel: ${tel} | Email: ${email}
${firma.opis ? 'Opis: '+firma.opis : ''}
${firma.lata ? 'Lat doswiadczenia: '+firma.lata : ''}
${firma.realizacje ? 'Realizacji: '+firma.realizacje : ''}
${firma.godz_pon_pt ? 'Godz Pon-Pt: '+firma.godz_pon_pt : ''}
${firma.adres ? 'Adres: '+firma.adres : ''}
${firma.google_ocena ? 'Ocena Google: '+firma.google_ocena+'/5 ('+firma.google_opinie+' opinii)' : ''}
${logoHtml ? 'LOGO HTML: '+logoHtml : ''}
${heroImg ? 'HERO IMG HTML: '+heroImg : ''}
${galeriaImgs ? 'GALERIA HTML:\n'+galeriaImgs : ''}
SCHEMA: <script type="application/ld+json">${schema}</script>

WYMAGANIA:
- Kompletny HTML <!DOCTYPE html> do </html> z wbudowanym CSS w <style>
- Sekcje: nav sticky, hero z duzym CTA "Zadzwon: ${tel}", o-nas, uslugi (5 kart), ${galeriaImgs?'galeria,':''} kontakt, footer
- Responsywny mobile-first, Google Fonts przez <link>
- Realne tresci dla ${branza} w ${lok}, zero lorem ipsum
ODPOWIEDZ WYLACZNIE KODEM HTML. Pierwsza linia <!DOCTYPE html>, ostatnia </html>.`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const responseText = await r.text();
    if (!r.ok) {
      let errMsg = responseText;
      try { errMsg = JSON.parse(responseText)?.error?.message || responseText; } catch(e) {}
      return new Response(JSON.stringify({ error: `Claude API ${r.status}: ${errMsg.slice(0,200)}` }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    let data;
    try { data = JSON.parse(responseText); } catch(e) {
      return new Response(JSON.stringify({ error: 'Nieprawidlowa odpowiedz API' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    let html = (data.content?.[0]?.text || '').trim();
    if (html.startsWith('```html')) html = html.slice(7);
    else if (html.startsWith('```')) html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0, -3);
    html = html.trim();

    if (!html.includes('</body>')) html += '\n</body>';
    if (!html.includes('</html>')) html += '\n</html>';

    if (html.length < 200) {
      return new Response(JSON.stringify({ error: 'Claude zwrocil zbyt krotka odpowiedz: ' + html.slice(0,100) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }


    // Free overlay
    const overlay = `<div id="wg-free-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(8,10,15,.92);backdrop-filter:blur(12px);align-items:center;justify-content:center"><div style="background:#0E1117;border:1px solid rgba(0,229,160,.2);border-radius:20px;padding:40px;max-width:460px;width:90%;text-align:center"><div style="font-size:44px;margin-bottom:14px">⏰</div><h2 style="font-size:24px;font-weight:800;color:#F0F2F7;margin-bottom:10px">Twój bezpłatny okres wygasł</h2><p style="font-size:14px;color:#8892AA;line-height:1.65;margin-bottom:24px">Darmowy plan trwa 3 miesiące. Wybierz plan Managed i my zajmiemy się resztą.</p><a href="https://webgen.pl/test/cennik/" style="display:block;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:10px">Wybierz plan Managed →</a><a href="https://webgen.pl/test/dashboard/" style="display:block;color:#8892AA;text-decoration:none;font-size:13px">Wróć do panelu</a></div></div><script>(function(){var k='wg_free_${slug}';var s=localStorage.getItem(k);if(!s){localStorage.setItem(k,Date.now());return;}if((Date.now()-parseInt(s))/86400000>=90){var el=document.getElementById('wg-free-overlay');if(el){el.style.display='flex';document.body.style.overflow='hidden';}}})();</script>`;

    const finalHtml = html.replace('</body>', overlay + '\n</body>');

    return new Response(JSON.stringify({
      success: true,
      html: finalHtml,
      style: style,
      slug: slug,
      mode: 'claude-haiku',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Generate error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
