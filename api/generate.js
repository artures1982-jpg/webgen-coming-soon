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

    // Dane firmy do promptu
    const lok = [firma.dzielnica, firma.miasto].filter(Boolean).join(', ');
    const nazwa = firma.nazwa || firma.branza;
    const galeriaUrls = (Array.isArray(firma.galeria) ? firma.galeria : (firma.galeriaUrls || [])).filter(Boolean).slice(0, 6);
    const heroUrl = firma.heroUrl || firma.hero_base64 || '';
    const logoHtml = firma.logo_base64 ? `<img src="${firma.logo_base64}" alt="${nazwa} logo" style="max-height:56px;max-width:160px;object-fit:contain">` : '';

    const galeriaHtmlSnippet = galeriaUrls.length
      ? galeriaUrls.map(url => `<img src="${url}" alt="Realizacja ${nazwa}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px">`).join('\n')
      : '';

    const heroSnippet = heroUrl
      ? `<img src="${heroUrl}" alt="${nazwa}" style="width:100%;max-height:480px;object-fit:cover;display:block">`
      : '';

    const schema = JSON.stringify({
      "@context": "https://schema.org", "@type": "LocalBusiness",
      "name": nazwa, "telephone": firma.telefon, "email": firma.email,
      "description": firma.opis || `Profesjonalna firma ${firma.branza} w ${lok}`,
      "address": { "@type": "PostalAddress", "addressLocality": firma.miasto, "addressCountry": "PL" },
    });

    const PROMPT = `Jesteś ekspertem od tworzenia stron WWW dla polskich firm lokalnych. Wygeneruj KOMPLETNY kod HTML strony firmowej.

DANE FIRMY:
- Nazwa: ${nazwa}
- Branża: ${firma.branza}
- Lokalizacja: ${lok}
- Telefon: ${firma.telefon || 'brak'}
- Email: ${firma.email || 'brak'}
- Opis: ${firma.opis || 'Profesjonalna firma usługowa'}
- Lata doświadczenia: ${firma.lata || 'brak'}
- Liczba realizacji: ${firma.realizacje || 'brak'}
- Godziny pon-pt: ${firma.godz_pon_pt || 'brak'}
- Godziny sobota: ${firma.godz_sob || 'brak'}
- Adres: ${firma.adres || 'brak'}
- Facebook: ${firma.facebook || 'brak'}
- Instagram: ${firma.instagram || 'brak'}
- WhatsApp: ${firma.whatsapp || 'brak'}
- Ocena Google: ${firma.google_ocena || 'brak'}
- Liczba opinii: ${firma.google_opinie || 'brak'}

STYL: ${firma.layout === 'modern' ? 'Nowoczesny, ciemny (dark mode), tech, zielone akcenty #00E5A0' : firma.layout === 'elegant' ? 'Elegancki, minimalistyczny, serif, złote akcenty, luksusowy' : 'Klasyczny, ciepły, przyjazny, profesjonalny'}

WYGENERUJ stronę HTML która:
1. Jest KOMPLETNA - od <!DOCTYPE html> do </html>
2. Ma WBUDOWANY CSS (w <style> tag) - nowoczesny, piękny design
3. Jest RESPONSYWNA (mobile-first)
4. Ma Schema.org LocalBusiness JSON-LD: ${schema}
5. Zawiera sekcje: Hero/nagłówek, O firmie, Usługi (min. 4 karty), ${galeriaHtmlSnippet ? 'Galeria realizacji,' : ''} Kontakt, Stopka
6. Ma PRAWDZIWE, UNIKALNY treść dla tej konkretnej firmy (${firma.branza} w ${lok})
7. Usługi powinny być konkretne dla branży ${firma.branza}
8. CTA: przycisk dzwoń tel: ${firma.telefon || 'brak'}
9. Fonty z Google Fonts - dobierz odpowiednie do stylu

WSTAW W ODPOWIEDNIE MIEJSCA:
${logoHtml ? `LOGO: ${logoHtml}` : ''}
${heroSnippet ? `HERO IMAGE (wstaw jako pierwsza sekcja po headerze): ${heroSnippet}` : ''}
${galeriaHtmlSnippet ? `ZDJĘCIA GALERII (wstaw w sekcji realizacji): 
${galeriaHtmlSnippet}` : ''}
${firma.whatsapp ? `WHATSAPP BUTTON (fixed bottom-right): <a href="https://wa.me/48${firma.whatsapp}" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.25);z-index:999">💬</a>` : ''}

WAŻNE:
- Nie używaj zewnętrznych bibliotek JS
- Nie używaj placeholder text (lorem ipsum) - tylko realne treści dla ${firma.branza}
- Design ma być PROFESJONALNY i wyglądać jak strona za 2000 zł
- Odpowiedz TYLKO kodem HTML - bez żadnych komentarzy przed/po kodzie
- Zacznij od <!DOCTYPE html>`;

    // Wywołaj Claude API
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 8000,
        messages: [{ role: 'user', content: PROMPT }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error('Claude API error:', err);
      return res.status(500).json({ error: 'Claude API error', details: err });
    }

    const claudeData = await claudeRes.json();
    const generatedHTML = claudeData.content?.[0]?.text || '';

    if (!generatedHTML || generatedHTML.length < 500) {
      return res.status(500).json({ error: 'Claude zwrócił pustą odpowiedź' });
    }

    // Zwróć jako 3 warianty (Claude generuje jeden, reszta jako fallback)
    return res.status(200).json({
      success: true,
      variants: {
        classic: generatedHTML,
        modern: generatedHTML,
        elegant: generatedHTML,
      },
      slug,
      mode: 'claude-ai',
    });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
