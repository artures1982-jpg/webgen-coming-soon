// Złapane realnie 2026-09-07 (Lighthouse lcp-discovery-insight), rozniesione mechanicznie na
// 38/53 szablonów 2026-09-15 (te z <img> w hero — 15 z hero jako CSS background-image
// świadomie pominięte, tam LCP jest tekstem, nie obrazkiem, zweryfikowane realnym Lighthouse
// na produkcji). Hero <img> potrzebuje <link rel="preload" as="image" fetchpriority="high">
// w <head> z DOKŁADNIE tym samym URL-em, inaczej przeglądarka odkrywa LCP-obrazek dopiero gdy
// parser dotrze do <body>. Patrz ZASADY.md sekcja 4c.
//
// Ograniczenie tego checku (świadome, nie próbuj tego "naprawić" bez realnego audytu jak ten
// z 2026-09-15): wykrywa hero tylko po klasie zawierającej "hero" na <img> z src Pexels — nazwy
// klas hero są niespójne między szablonami (hero-img/hero-photo/hero-banner/big/tl-photo), więc
// pliki z inną nazwą klasy albo z hero jako CSS background wychodzą "n-a", nie "fail" — lepiej
// nic nie stwierdzić niż zgadywać.
export function checkLcpPreload(html) {
  const heroImgRe = /<img\b[^>]*class="[^"]*\bhero[^"]*"[^>]*\bsrc="(https:\/\/images\.pexels\.com\/[^"]+)"[^>]*>/i;
  const altOrderRe = /<img\b[^>]*\bsrc="(https:\/\/images\.pexels\.com\/[^"]+)"[^>]*\bclass="[^"]*\bhero[^"]*"[^>]*>/i;
  const match = html.match(heroImgRe) || html.match(altOrderRe);

  if (!match) {
    return {
      id: 'lcp_preload',
      sekcja: '4c',
      opis: 'Zdjęcie hero (LCP-element) musi mieć <link rel="preload" as="image" fetchpriority="high"> w <head> z tym samym URL-em',
      status: 'n-a',
      znaleziska: { uwaga: 'brak <img> z klasą zawierającą "hero" i src Pexels — hero to CSS background-image (LCP jest tekstem, nie zdjęciem) albo nietypowa nazwa klasy' },
      wymaga_oceny_wzrokowej: false,
    };
  }

  const heroUrl = match[1];
  const preloadRe = new RegExp('<link\\s+rel="preload"\\s+as="image"[^>]*href="' + heroUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"');
  const hasPreload = preloadRe.test(html);

  return {
    id: 'lcp_preload',
    sekcja: '4c',
    opis: 'Zdjęcie hero (LCP-element) musi mieć <link rel="preload" as="image" fetchpriority="high"> w <head> z tym samym URL-em',
    status: hasPreload ? 'ok' : 'fail',
    znaleziska: hasPreload ? {} : { hero_url: heroUrl },
    wymaga_oceny_wzrokowej: false,
  };
}
