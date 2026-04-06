// api/generate.js — Edge Runtime, Sonnet 4.6, 1 wariant per call
// Frontend wywołuje 3x równolegle z różnym style=classic/modern/elegant
export const config = { runtime: 'edge' };

const STYLES = {
  classic: {
    name: 'Klasyczny',
    system: `Jesteś ekspertem web designu tworzącym profesjonalne strony dla polskich firm lokalnych.
Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.
Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.`,
    visual: `STYL: KLASYCZNY — ciepły, lokalny, profesjonalny, godny zaufania.
PALETA: tło białe #FFFFFF lub kremowe #FDF8F0, akcent dopasowany do branży (np. niebieski dla hydrauliki, zielony dla ogrodnictwa, różowy dla beauty).
TYPOGRAFIA: nagłówki Playfair Display lub Merriweather (Google Fonts), tekst Source Sans Pro lub Open Sans.
LAYOUT: pełna szerokość, hero z gradientem i dużym CTA, sekcje naprzemiennie białe/jasnoszare.
KARTY USŁUG: border-left 4px z kolorem akcentu, lekki box-shadow, hover efekt.
GALERIA: grid 3 kolumny, border-radius 8px.
STOPKA: ciemne tło #1a1a1a, białe linki.
FEEL: "lokalny rzemieślnik z 10-letnim doświadczeniem", zaufanie, ciepło.`
  },
  modern: {
    name: 'Nowoczesny',
    system: `Jesteś ekspertem web designu tworzącym premium strony dla polskich firm lokalnych.
Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.
Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.`,
    visual: `STYL: NOWOCZESNY — dark mode, tech, premium, odważny.
PALETA: tło #0A0F1A lub #080C14, akcent neonowy #00E5A0 lub #6C63FF, tekst #F0F2F7, muted #8892AA.
TYPOGRAFIA: Space Grotesk lub Plus Jakarta Sans (Google Fonts), font-weight 700-800 na nagłówkach.
LAYOUT: asymetryczny hero z animowanym gradientem w tle (CSS animation), sticky nav z backdrop-filter blur.
KARTY USŁUG: glassmorphism — background rgba(255,255,255,0.05), border rgba(255,255,255,0.1), hover: border-color #00E5A0 + glow box-shadow.
NAGŁÓWKI: gradient text (linear-gradient + background-clip: text + -webkit-text-fill-color: transparent).
ANIMACJE CSS: @keyframes fadeInUp na sekcjach, transform: translateY na hover.
GALERIA: overlay z opacity:0→1 na hover, border-radius 12px.
STOPKA: #05080F, kolorowe linki, gradient divider.
FEEL: "startup technologiczny", innowacja, premium digital.`
  },
  elegant: {
    name: 'Elegancki',
    system: `Jesteś ekspertem web designu tworzącym luksusowe strony dla polskich firm lokalnych.
Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.
Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.`,
    visual: `STYL: ELEGANCKI — luksusowy, minimalistyczny, premium, atelier.
PALETA: tło #FFFFFF, akcenty złoto #C9A84C lub antracyt #2C2C2C, jasnoszare #F8F8F6 jako tło sekcji.
TYPOGRAFIA: nagłówki Cormorant Garamond lub Cinzel (Google Fonts), tekst Raleway lub Montserrat light/regular.
LAYOUT: centered max-width 960px, ogromne white space (padding: 100px 0), minimalistyczna nav z thin border-bottom.
DETALE: letter-spacing: 0.08-0.2em na nagłówkach, text-transform: uppercase na etykietach, thin horizontal rules (1px złota linia) między sekcjami.
KARTY USŁUG: bez border-radius (kwadratowe), cienka linia na dole nazwy usługi, hover: delikatny background #F8F8F6.
GALERIA: równe kwadraty 1:1, szary overlay z ikoną lupy.
STOPKA: minimalistyczna, centered, thin top border.
FEEL: "ekskluzywne atelier", prestiż, jakość bez kompromisów.`
  }
};

export default async function handler(req) {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { firma } = body;
    if (!firma) return new Response(JSON.stringify({ error: 'Brak danych firmy' }), { status: 400, headers: corsHeaders });

    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY w środowisku' }), { status: 500, headers: corsHeaders });

    // Walidacja stylu
    const style = ['classic','modern','elegant'].includes(firma.style) ? firma.style : 'classic';
    const styleConfig = STYLES[style];

    // Slug
    const slug = (firma.nazwa || 'firma')
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'-').trim().slice(0,30) || 'firma';

    // Dane firmy
    const lok    = [firma.dzielnica, firma.miasto].filter(Boolean).join(', ') || 'Polska';
    const nazwaStrony = firma.nazwa_strony || firma.nazwa || firma.branza || 'Firma';
    const nazwaFirma  = firma.nazwa_firma || '';
    const nip         = firma.nip || '';
    const adresFirma  = firma.adres_firma || '';
    const nazwa       = nazwaStrony;
    const tel    = firma.telefon || '';
    const email  = firma.email  || '';
    const branza = firma.branza || 'usługi';

    // Zasoby wizualne
    const galeriaUrls = (Array.isArray(firma.galeria) ? firma.galeria : (firma.galeriaUrls || [])).filter(Boolean).slice(0,6);
    const heroUrl     = firma.heroUrl || '';
    const logoHtml    = firma.logo_base64
      ? `<img src="${firma.logo_base64}" alt="Logo ${nazwa}" style="max-height:52px;max-width:160px;object-fit:contain;display:block">`
      : '';
    const heroHtml    = heroUrl
      ? `<img src="${heroUrl}" alt="${nazwa}" style="width:100%;height:460px;object-fit:cover;display:block">`
      : '';
    const galeriaHtml = galeriaUrls.map((u,i) =>
      `<img src="${u}" alt="Realizacja ${i+1}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px">`
    ).join('\n');
    const waHtml = firma.whatsapp
      ? `<a href="https://wa.me/48${firma.whatsapp}" style="position:fixed;bottom:24px;right:24px;background:#25D366;color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;text-decoration:none;box-shadow:0 4px 24px rgba(0,0,0,.35);z-index:9999" aria-label="WhatsApp">💬</a>`
      : '';

    // Stopka prawna (tylko jeśli podano dane firmowe)
    const stopkaPrawna = nazwaFirma
      ? (nazwaFirma + (nip ? ' · NIP ' + nip : '') + (adresFirma ? ' · ' + adresFirma : ''))
      : '';

    const schema = JSON.stringify({
      "@context":"https://schema.org","@type":"LocalBusiness",
      "name":nazwaStrony,"telephone":tel,"email":email,
      ...(nazwaFirma ? {"legalName": nazwaFirma} : {}),
      "description":`${nazwaStrony} — ${branza} w ${lok}`,
      "address":{"@type":"PostalAddress","addressLocality":firma.miasto||lok,"addressCountry":"PL"},
      ...(firma.google_ocena ? {"aggregateRating":{"@type":"AggregateRating","ratingValue":firma.google_ocena,"reviewCount":firma.google_opinie||10}} : {})
    });


    // ── SEO EXTRAS ──────────────────────────────────────────────────────
    const uspList    = Array.isArray(firma.usp) ? firma.usp.filter(Boolean) : [];
    const faqList    = Array.isArray(firma.faq) ? firma.faq.filter(f => f && f.q && f.a) : [];
    const obszarList = (firma.obszar || '').split(',').map(s => s.trim()).filter(Boolean);
    const faqSchema  = faqList.length ? JSON.stringify({
      "@context":"https://schema.org","@type":"FAQPage",
      "mainEntity": faqList.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
    }) : '';

    // ── PROMPT ────────────────────────────────────────────────────────────
    const userPrompt = `Stwórz kompletną, profesjonalną stronę internetową dla polskiej firmy lokalnej.

${styleConfig.visual}

═══════════════════════════════════════
DANE FIRMY (wstaw je w odpowiednie miejsca):
═══════════════════════════════════════
Nazwa firmy:        ${nazwa}
Branża:             ${branza}
Lokalizacja:        ${lok}
Telefon:            ${tel}
Email:              ${email}
${firma.opis          ? `Opis firmy:         ${firma.opis}` : ''}
${firma.lata          ? `Lat doświadczenia:  ${firma.lata}` : ''}
${firma.realizacje    ? `Liczba realizacji:  ${firma.realizacje}` : ''}
${firma.godz_pon_pt   ? `Godziny Pon-Pt:     ${firma.godz_pon_pt}` : ''}
${firma.godz_sob      ? `Godziny Sobota:     ${firma.godz_sob}` : ''}
${firma.adres         ? `Adres:              ${firma.adres}` : ''}
${firma.google_ocena  ? `Ocena Google:       ${firma.google_ocena}/5 (${firma.google_opinie} opinii)` : ''}
${firma.facebook      ? `Facebook:           ${firma.facebook}` : ''}
${firma.instagram     ? `Instagram:          ${firma.instagram}` : ''}
${nazwaFirma          ? `Pełna nazwa firmy:  ${nazwaFirma}` : ''}
${nip                 ? `NIP:                ${nip}` : ''}
${adresFirma          ? `Adres rejestrowy:   ${adresFirma}` : ''}
${uspList.length      ? `Wyróżniki USP:      ${uspList.join(' | ')}` : `Wyróżniki USP: wygeneruj 4-5 konkretnych dla branży ${branza} (np. Gwarancja, Dojazd gratis, Bezpłatna wycena, Szybka realizacja, Certyfikowany wykonawca)`}
${firma.certyfikaty   ? `Certyfikaty:        ${firma.certyfikaty}` : ''}
${firma.platnosci     ? `Metody płatności:   ${firma.platnosci}` : ''}
${firma.keywords      ? `Słowa kluczowe SEO: ${firma.keywords}` : ''}
${obszarList.length   ? `Obszary działania:  ${obszarList.join(', ')}` : `Obszary działania: głównie ${lok} i okolice — wygeneruj sekcję z opisem zasięgu`}

═══════════════════════════════════════
ZASOBY DO WSTAWIENIA:
═══════════════════════════════════════
${logoHtml    ? `LOGO (wstaw w header/nav):\n${logoHtml}` : 'LOGO: brak — użyj nazwy firmy jako tekstu'}
${heroHtml    ? `HERO IMAGE (wstaw jako tło/obraz hero section):\n${heroHtml}` : 'HERO IMAGE: brak — użyj CSS gradient lub solidny kolor akcentu'}
${galeriaHtml ? `GALERIA REALIZACJI (wstaw w sekcji galeria):\n${galeriaHtml}` : 'GALERIA: brak — możesz pominąć sekcję lub zostawić placeholder'}
${waHtml      ? `FLOATING BUTTON WHATSAPP (wstaw przed </body>):\n${waHtml}` : ''}
META TAGI SEO (wstaw w <head>):
<meta name="description" content="${nazwa} — profesjonalne usługi ${branza} w ${lok}. Zadzwoń: ${tel}">
<meta name="keywords" content="${branza} ${lok}${firma.keywords ? ', '+firma.keywords : ''}">
<link rel="canonical" href="https://${slug}.webgen.pl">
<meta property="og:type" content="website">
<meta property="og:title" content="${nazwa} — ${branza} ${lok}">
<meta property="og:description" content="${nazwa} — profesjonalne usługi ${branza} w ${lok}. ${firma.realizacje ? firma.realizacje+' realizacji. ' : ''}Zadzwoń: ${tel}">
<meta property="og:url" content="https://${slug}.webgen.pl">
${heroUrl ? `<meta property="og:image" content="${heroUrl}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow">
SCHEMA.ORG LocalBusiness (wstaw w <head>):
<script type="application/ld+json">${schema}</script>

═══════════════════════════════════════
WYMAGANIA STRUKTURY HTML:
═══════════════════════════════════════
1. NAWIGACJA sticky z logo po lewej i linkami do sekcji + przycisk CTA "Zadzwoń: ${tel}"
2. HERO — duży, pełnoekranowy, z nagłówkiem H1, podtytułem i 2 przyciskami CTA
3. O NAS — wyróżniki firmy, liczby (${firma.lata ? firma.lata+' lat,' : ''} ${firma.realizacje ? firma.realizacje+' realizacji,' : ''} zadowoleni klienci)
4. USŁUGI — 5-6 kart z ikonami emoji, tytułami H3 i opisami SPECYFICZNYMI dla branży ${branza}
${uspList.length ? `5. WYRÓŻNIKI/ZALETY — sekcja z ikonami prezentująca: ${uspList.join(' | ')}` : ''}
${obszarList.length ? `${uspList.length?'6':'5'}. OBSZAR DZIAŁANIA — sekcja z H2 "Obszar działania" i osobnym opisem dla każdej lokalizacji: ${obszarList.join(', ')} — każda z frazą kluczową "[branża] [lokalizacja]"` : ''}
${galeriaHtml ? 'GALERIA — siatka zdjęć realizacji z opisami alt' : ''}
${faqList.length ? `FAQ — sekcja z pytaniami i odpowiedziami:
${faqList.map((f,i) => `  ${i+1}. P: ${f.q}
     O: ${f.a}`).join('\n')}` : `FAQ: wygeneruj 4-5 pytań i odpowiedzi specyficznych dla ${branza} w ${lok}`}
KONTAKT — adres, telefon ${tel}, email ${email}, godziny + Google Maps iframe dla ${lok}
FOOTER — prawa autorskie, linki, ${firma.platnosci ? 'metody płatności: '+firma.platnosci+',' : ''} kontakt

ZASADY TECHNICZNE i SEO:
- Kompletny HTML: pierwsza linia <!DOCTYPE html>, ostatnia </html>
- WSZYSTKIE style w <style> w <head> — zero zewnętrznych CSS plików
- Google Fonts przez <link> w <head>
- Mobile-first, w pełni responsywny (media queries)
- Treści 100% realne, specyficzne dla ${branza} w ${lok} — ZERO lorem ipsum
- Duży, widoczny przycisk "Zadzwoń: ${tel}" z href="tel:${tel}"
- Smooth scroll między sekcjami
- H1 tylko jeden — z NAZWĄ STRONY ("${nazwaStrony}") i branżą i lokalizacją, NIE z nazwą prawną firmy
- <title> używa nazwy strony: "${nazwaStrony} — ${branza} ${lok}"
${stopkaPrawna ? `- STOPKA: wstaw dane rejestrowe: ${stopkaPrawna}` : '- STOPKA: brak danych rejestrowych — pomiń'}
- H2 dla każdej sekcji z naturalnym słowem kluczowym
- Wstaw WSZYSTKIE meta tagi z sekcji META TAGI SEO do <head>
- <title> w formacie: "${nazwa} — ${branza} ${lok} | tel. ${tel}"
- Obrazy: atrybut alt opisowy, loading="lazy" na galerii, width/height dla LCP
- aria-label na przyciskach bez tekstu
${firma.keywords ? `- Użyj naturalnie w treści słów kluczowych: ${firma.keywords}` : ''}
${firma.certyfikaty ? `- Wstaw certyfikaty w sekcji O nas: ${firma.certyfikaty}` : ''}
${faqSchema ? `- Wstaw w <head> FAQPage schema: <script type="application/ld+json">${faqSchema}</script>` : ''}

ODPOWIEDZ WYŁĄCZNIE KODEM HTML. Pierwsza linia kodu: <!DOCTYPE html>  Ostatnia linia: </html>`;

    // ── WYWOŁANIE CLAUDE SONNET 4.6 ───────────────────────────────────────
    const r = await fetch('https://api.anthropic.com/v1/messages', {
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


    const rawText = await r.text();
    if (!r.ok) {
      let errMsg = rawText;
      try { errMsg = JSON.parse(rawText)?.error?.message || rawText; } catch(e) {}
      return new Response(JSON.stringify({ error: `Claude API ${r.status}: ${errMsg.slice(0,300)}` }), { status: 500, headers: corsHeaders });
    }

    let data;
    try { data = JSON.parse(rawText); } catch(e) {
      return new Response(JSON.stringify({ error: 'Nieprawidlowa odpowiedz API: ' + rawText.slice(0,100) }), { status: 500, headers: corsHeaders });
    }

    // Wyodrebnij HTML
    let html = (data.content?.[0]?.text || '').trim();

    // Usun markdown fences jesli Claude je doda
    if (html.startsWith('```html')) html = html.slice(7);
    else if (html.startsWith('```')) html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0,-3);
    html = html.trim();

    // Domknij jesli urwane (max_tokens)
    if (!html.includes('</body>')) html += '\n</body>';
    if (!html.includes('</html>')) html += '\n</html>';

    if (html.length < 500) {
      return new Response(JSON.stringify({
        error: 'Claude zwrocil za krotka odpowiedz (' + html.length + ' znakow): ' + html.slice(0,200)
      }), { status: 500, headers: corsHeaders });
    }

    // Free overlay
    const freeOverlay = `
<div id="wg-free-overlay" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(8,10,15,.93);backdrop-filter:blur(14px);align-items:center;justify-content:center">
  <div style="background:#0E1117;border:1px solid rgba(0,229,160,.25);border-radius:20px;padding:44px 40px;max-width:460px;width:90%;text-align:center;font-family:sans-serif">
    <div style="font-size:46px;margin-bottom:14px">⏰</div>
    <h2 style="font-size:24px;font-weight:800;color:#F0F2F7;margin:0 0 10px;letter-spacing:-.02em">Twój bezpłatny okres wygasł</h2>
    <p style="font-size:14px;color:#8892AA;line-height:1.65;margin:0 0 24px">Darmowy plan trwa 3 miesiące. Wybierz plan Managed — my zajmiemy się resztą.</p>
    <a href="https://webgen.pl/test/cennik/" style="display:block;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:10px">Wybierz plan Managed →</a>
    <a href="https://webgen.pl/test/dashboard/" style="display:block;color:#8892AA;text-decoration:none;font-size:13px">Wróć do panelu</a>
  </div>
</div>
<script>
(function(){
  var k='wg_free_${slug}';
  var s=localStorage.getItem(k);
  if(!s){localStorage.setItem(k,String(Date.now()));return;}
  if((Date.now()-parseInt(s,10))/86400000>=90){
    var el=document.getElementById('wg-free-overlay');
    if(el){el.style.display='flex';document.body.style.overflow='hidden';}
  }
})();
</script>`;

    const finalHtml = html.replace('</body>', freeOverlay + '\n</body>');

    return new Response(JSON.stringify({
      success: true,
      html: finalHtml,
      style: style,
      styleName: styleConfig.name,
      slug: slug,
      model: 'claude-sonnet-4-6',
      chars: finalHtml.length,
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: corsHeaders });
  }
}
