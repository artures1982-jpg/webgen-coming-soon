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
    const branza = firma.branza || 'uslugi';

    const galeriaUrls = (Array.isArray(firma.galeria) ? firma.galeria : (firma.galeriaUrls || []))
      .filter(Boolean).slice(0, 6);
    const heroUrl  = firma.heroUrl || firma.hero_base64 || '';
    const logoHtml = firma.logo_base64
      ? `<img src="${firma.logo_base64}" alt="${nazwa}" style="max-height:52px;max-width:150px;object-fit:contain;display:block">`
      : '';

    const galeriaImgs = galeriaUrls.length
      ? galeriaUrls.map((u, i) =>
          `<img src="${u}" alt="Realizacja ${i+1}" loading="lazy">`
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

    const commonData = `
DANE FIRMY:
Nazwa: ${nazwa} | Branża: ${branza} | Lokalizacja: ${lok}
Telefon: ${tel || 'brak'} | Email: ${email || 'brak'}
Opis: ${firma.opis || ''}
Lata doświadczenia: ${firma.lata || ''} | Realizacje: ${firma.realizacje || ''}
Godziny: ${firma.godz_pon_pt || ''} ${firma.godz_sob ? '/ sob: '+firma.godz_sob : ''}
${firma.adres ? 'Adres: '+firma.adres : ''}
${firma.google_ocena ? 'Ocena Google: '+firma.google_ocena+'/5 ('+firma.google_opinie+' opinii)' : ''}
${firma.facebook ? 'Facebook: '+firma.facebook : ''}
${firma.instagram ? 'Instagram: '+firma.instagram : ''}

WSTAW W ODPOWIEDNIE MIEJSCA:
${logoHtml ? 'LOGO: '+logoHtml : ''}
${heroImg ? 'HERO IMAGE: '+heroImg : ''}
${galeriaImgs ? 'ZDJECIA GALERII:\n'+galeriaImgs : ''}
${waBtn ? 'WHATSAPP BUTTON: '+waBtn : ''}

SCHEMA.ORG: <script type="application/ld+json">${schema}</script>

WYMAGANIA TECHNICZNE:
- Kompletny HTML od <!DOCTYPE html> do </html>
- Wbudowany CSS w <style>, responsywny mobile-first
- Google Fonts wczytane przez link
- Sekcje: nawigacja sticky, hero z CTA tel:${tel}, o-nas, uslugi (5-6 kart specyficznych dla ${branza}), ${galeriaImgs ? 'galeria realizacji,' : ''} kontakt z mapą/adresem, footer
- Treści realne dla ${branza} w ${lok} - zero lorem ipsum
- Przycisk CTA "Zadzwoń: ${tel}" duży i widoczny
ODPOWIEDZ TYLKO KODEM HTML. Pierwsza linia: <!DOCTYPE html> Ostatnia: </html>`;

    // Trzy różne prompty — zupełnie inne palety kolorów, fonty, układy
    const prompts = {
      classic: `Stwórz stronę w stylu KLASYCZNYM - ciepłym, lokalnym, godnym zaufania.
WYMAGANE cechy wizualne:
- Tło białe #FFFFFF lub kremowe #FDF8F2
- Kolory: ciepła czerwień/pomarańcz/brąz jako akcent (dopasuj do branży ${branza})
- Font nagłówków: Playfair Display lub Merriweather (serif, tradycyjny)
- Font tekstu: Source Sans Pro lub Lato
- Layout: szeroki header z dużym hero, sekcje na pełną szerokość z naprzemiennym tłem
- Karty usług z lewą kolorową obwódką (border-left)
- Galeria w siatce 3 kolumny
- Stopka z ciemnym tłem
- Styl "rzemieślniczy", przyjazny, lokalny${commonData}`,

      modern: `Stwórz stronę w stylu NOWOCZESNYM - tech, odważnym, dark mode.
WYMAGANE cechy wizualne:
- Tło ciemne: #0A0F1A lub #080C14
- Kolor akcentowy: #00E5A0 (neonowa zieleń) lub #6C63FF (elektryczny fiolet)
- Font: Space Grotesk lub Plus Jakarta Sans (nowoczesny, geometryczny)
- Layout: asymetryczny hero z gradient mesh w tle, sekcje z glassmorphism kartami
- Karty usług: ciemne tło rgba(255,255,255,0.05), border rgba(255,255,255,0.08), hover z glow
- Gradient na nagłówkach (linear-gradient tekst z background-clip)
- Animacje CSS: fadeIn, slideUp na sekcjach
- Galeria z overlay hover
- Stopka ultraciemna z kolorowymi linkami
- Styl "startup", premium, zaawansowany technologicznie${commonData}`,

      elegant: `Stwórz stronę w stylu ELEGANCKIM - luksusowym, minimalistycznym, premium.
WYMAGANE cechy wizualne:
- Tło: czysta biel #FFFFFF z akcentami jasnoszarymi #F8F8F6
- Kolory: złoto #C9A84C lub antracyt #2C2C2C jako akcent
- Font nagłówków: Cormorant Garamond lub Cinzel (luksusowy serif)
- Font tekstu: Raleway lub Montserrat (clean sans-serif)
- Layout: duże białe przestrzenie (padding 80-120px), centered content max 900px
- Karty usług: minimalistyczne, bez border-radius, cienka linia pod nagłówkiem
- Separator: cienka złota linia (2px) między sekcjami
- Galeria: masonry lub równe kwadraty z szarym overlay
- Typography: letter-spacing 0.05-0.15em na nagłówkach, text-transform uppercase dla etykiet
- Styl "atelier", premium, luksusowy${commonData}`,
    };

    const makeRequest = async (prompt) => {
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
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
      return r.json();
    };

    const cleanHTML = async (prompt, label) => {
      const data = await makeRequest(prompt);
      let html = (data.content?.[0]?.text || '').trim();

      // Usuń markdown fences
      if (html.startsWith('```html')) html = html.slice(7);
      else if (html.startsWith('```'))  html = html.slice(3);
      if (html.endsWith('```')) html = html.slice(0, -3);
      html = html.trim();

      // Kontynuacja gdy urwane
      if (!html.endsWith('</html>') && data.stop_reason === 'max_tokens') {
        console.log(`[${label}] Urwane, kontynuuję...`);
        const cont = await makeRequest(
          `Kontynuuj dokładnie od miejsca gdzie skończyłeś ten HTML (nie powtarzaj treści):\n\n${html.slice(-500)}`
        );
        let extra = (cont.content?.[0]?.text || '').trim();
        if (extra.startsWith('```')) extra = extra.slice(extra.indexOf('\n')+1);
        if (extra.endsWith('```')) extra = extra.slice(0, -3);
        html = html + '\n' + extra.trim();
      }

      // Domknij jeśli nadal brak
      if (!html.includes('</body>')) html += '\n</body>';
      if (!html.includes('</html>')) html += '\n</html>';

      return html;
    };

    // Generuj 3 warianty równolegle
    const [classic, modern, elegant] = await Promise.all([
      cleanHTML(prompts.classic, 'classic'),
      cleanHTML(prompts.modern,  'modern'),
      cleanHTML(prompts.elegant, 'elegant'),
    ]);

    if (classic.length < 500) {
      return res.status(500).json({ error: 'Claude zwrócił za krótką odpowiedź' });
    }


  // Wstrzyknij blokadę Free do wygenerowanego HTML
  const injectFreeOverlay = (html, slug) => {
    const overlay = `
<!-- webgen FREE plan overlay -->
<div id="wg-free-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(8,10,15,.92);backdrop-filter:blur(12px);align-items:center;justify-content:center">
  <div style="background:#0E1117;border:1px solid rgba(0,229,160,.2);border-radius:20px;padding:48px 40px;max-width:480px;width:90%;text-align:center">
    <div style="font-size:48px;margin-bottom:16px">⏰</div>
    <h2 style="font-size:26px;font-weight:800;color:#F0F2F7;margin-bottom:10px;letter-spacing:-.02em">Twój bezpłatny okres wygasł</h2>
    <p style="font-size:15px;color:#8892AA;line-height:1.65;margin-bottom:28px">Darmowy plan trwa 3 miesiące. Aby Twoja strona działała dalej — wybierz plan Managed i my zajmiemy się wszystkim.</p>
    <div style="background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.18);border-radius:12px;padding:20px;margin-bottom:24px;text-align:left">
      <div style="font-size:13px;color:#00E5A0;font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.1em;font-family:monospace">Managed START — 249 zł/mies.</div>
      <div style="font-size:13px;color:#8892AA;line-height:1.8">✓ Hosting + SSL bez limitu czasu<br>✓ Aktualizacje przez email<br>✓ Lokalne SEO + Google Business<br>✓ PageSpeed 90+ gwarantowany</div>
    </div>
    <a href="https://webgen.pl/test/cennik/" style="display:block;background:#00E5A0;color:#080A0F;text-decoration:none;padding:15px;border-radius:10px;font-size:16px;font-weight:700;margin-bottom:12px">Wybierz plan Managed →</a>
    <a href="https://webgen.pl/test/dashboard/" style="display:block;color:#8892AA;text-decoration:none;font-size:13px">Wróć do panelu klienta</a>
  </div>
</div>
<script>
(function wgFreeCheck() {
  var KEY = 'wg_free_start_${slug}';
  var start = localStorage.getItem(KEY);
  if (!start) { localStorage.setItem(KEY, Date.now().toString()); return; }
  var days = (Date.now() - parseInt(start)) / 86400000;
  if (days >= 90) {
    var el = document.getElementById('wg-free-overlay');
    if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  }
})();
</script>`;
    // Wstaw przed </body>
    return html.replace('</body>', overlay + '\n</body>');
  };

    return res.status(200).json({
      success: true,
      variants: { classic: injectFreeOverlay(classic, slug), modern: injectFreeOverlay(modern, slug), elegant: injectFreeOverlay(elegant, slug) },
      slug,
      mode: 'claude-ai',
    });

  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message });
  }
}
