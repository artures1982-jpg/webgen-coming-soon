export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firma } = req.body;
    if (!firma) return res.status(400).json({ error: 'Brak danych firmy' });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'Brak ANTHROPIC_API_KEY' });

    const slug = (firma.nazwa || 'firma')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()
      .substr(0, 30) || 'firma';

    const lok    = [firma.dzielnica, firma.miasto].filter(Boolean).join(', ') || 'Polska';
    const nazwa  = firma.nazwa || firma.branza || 'Firma';
    const tel    = firma.telefon || '';
    const email  = firma.email  || '';
    const branza = firma.branza || 'usługi';

    const galeriaUrls = (Array.isArray(firma.galeria) ? firma.galeria : (firma.galeriaUrls || []))
      .filter(Boolean).slice(0, 6);
    const heroUrl  = firma.heroUrl || firma.hero_base64 || '';
    const logoHtml = firma.logo_base64
      ? `<img src="${firma.logo_base64}" alt="${nazwa}" style="max-height:52px;max-width:150px;object-fit:contain;display:block">`
      : '';

    const galeriaImgs = galeriaUrls.length
      ? galeriaUrls.map((u, i) =>
          `<img src="${u}" alt="Realizacja ${i+1} - ${nazwa}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px">`
        ).join('\n')
      : '';

    const heroImg = heroUrl
      ? `<img src="${heroUrl}" alt="${nazwa}" style="width:100%;max-height:460px;object-fit:cover;display:block">`
      : '';

    const waBtn = firma.whatsapp
      ? `<a href="https://wa.me/48${firma.whatsapp}" aria-label="WhatsApp" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.3);z-index:999">💬</a>`
      : '';

    const schema = JSON.stringify({
      "@context": "https://schema.org", "@type": "LocalBusiness",
      "name": nazwa, "telephone": tel, "email": email,
      "description": `${nazwa} - ${branza} w ${lok}`,
      "address": { "@type": "PostalAddress", "addressLocality": firma.miasto || lok, "addressCountry": "PL" },
      ...(firma.google_ocena ? {
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": firma.google_ocena, "reviewCount": firma.google_opinie || 10 }
      } : {}),
    });

    const styleHint =
      firma.layout === 'modern'  ? 'dark mode, ciemne tło #0A0F1A, akcentowy #00E5A0, font Space Grotesk' :
      firma.layout === 'elegant' ? 'minimalistyczny, białe tło, serif Playfair Display + Inter, złote akcenty #8B6914' :
                                    'klasyczny, ciepłe kolory, przyjazny, font Inter lub Source Sans Pro';

    const PROMPT = `Wygeneruj KOMPLETNĄ stronę HTML dla polskiej firmy lokalnej.

DANE:
Nazwa: ${nazwa} | Branża: ${branza} | Lokalizacja: ${lok}
Telefon: ${tel || 'brak'} | Email: ${email || 'brak'}
Opis: ${firma.opis || ''}
Lata: ${firma.lata || ''} | Realizacje: ${firma.realizacje || ''}
Godziny: ${firma.godz_pon_pt || ''} ${firma.godz_sob ? '/ sob: '+firma.godz_sob : ''}
${firma.adres ? 'Adres: '+firma.adres : ''}
${firma.google_ocena ? 'Google: '+firma.google_ocena+'/5 ('+firma.google_opinie+' opinii)' : ''}

STYL: ${styleHint}

WYMAGANIA:
- Kompletny HTML: <!DOCTYPE html> ... </html>
- Wbudowany CSS w <style>, Google Fonts, responsywny
- Schema.org: <script type="application/ld+json">${schema}</script>
- Sekcje: nav sticky, hero z CTA tel:${tel}, o-nas, uslugi (4-6 kart konkretnych dla ${branza}), ${galeriaImgs ? 'galeria,' : ''} kontakt, footer
- Żadne lorem ipsum - realne treści dla ${branza} w ${lok}
${tel ? `- Duży przycisk "Zadzwoń: ${tel}" w hero i sekcji kontakt` : ''}
${logoHtml ? `\nLOGO (wstaw w nav): ${logoHtml}` : ''}
${heroImg ? `\nHERO IMAGE (pierwsza sekcja pod nav): ${heroImg}` : ''}
${galeriaImgs ? `\nZDJĘCIA (sekcja galeria/realizacje):\n${galeriaImgs}` : ''}
${waBtn ? `\nWHATSAPP (fixed button): ${waBtn}` : ''}

ODPOWIEDZ TYLKO KODEM HTML. Pierwsza linia: <!DOCTYPE html>  Ostatnia linia: </html>`;

    // Pierwsze zapytanie do Claude
    const makeRequest = async (messages) => {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 16000,
          messages,
        }),
      });
      if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
      return r.json();
    };

    let data = await makeRequest([{ role: 'user', content: PROMPT }]);
    let html  = (data.content?.[0]?.text || '').trim();

    // Usuń markdown fences
    if (html.startsWith('```html')) html = html.slice(7);
    else if (html.startsWith('```'))  html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0, -3);
    html = html.trim();

    // Jeśli odpowiedź urwana (brak </html>) — kontynuuj
    if (!html.endsWith('</html>') && data.stop_reason === 'max_tokens') {
      console.log('Odpowiedź urwana, kontynuuję...');
      const cont = await makeRequest([
        { role: 'user', content: PROMPT },
        { role: 'assistant', content: html },
        { role: 'user', content: 'Kontynuuj dokładnie od miejsca gdzie skończyłeś. Nie powtarzaj poprzedniej treści.' },
      ]);
      const extra = (cont.content?.[0]?.text || '').trim();
      html = html + '\n' + extra;
    }

    // Jeśli nadal brak </html> — domknij
    if (!html.includes('</body>')) html += '\n</body>';
    if (!html.includes('</html>')) html += '\n</html>';

    if (html.length < 500) {
      return res.status(500).json({ error: 'Claude zwrócił za krótką odpowiedź' });
    }

    return res.status(200).json({
      success: true,
      variants: { classic: html, modern: html, elegant: html },
      slug,
      mode: 'claude-ai',
    });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
