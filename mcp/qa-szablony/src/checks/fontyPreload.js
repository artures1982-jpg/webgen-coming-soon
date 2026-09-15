// Złapane realnie 2026-09-07 (Lighthouse render-blocking-insight), rozniesione mechanicznie na
// wszystkie 53 szablony 2026-09-15: <link href="...fonts.googleapis.com/css2?...family=...
// display=swap" rel="stylesheet"> blokuje renderowanie mimo display=swap (który kontroluje tylko
// zachowanie tekstu, nie blocking). Wymagany wzorzec: preload+onload + <noscript> fallback.
// Patrz ZASADY.md sekcja 4b.
export function checkFontyPreload(html) {
  // Bare <link rel="stylesheet"> na fonty jest OK w <noscript> jako fallback — problem jest
  // wyłącznie gdy DOKŁADNIE ten sam URL nie ma odpowiadającego <link rel="preload" as="style">
  // (czyli strona ładuje fonty tylko przez blokującą ścieżkę, bez preload).
  const blockingRe = /<link\s+href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"\s+rel="stylesheet">/g;
  const preloadedUrls = new Set();
  const preloadRe = /<link\s+rel="preload"\s+as="style"\s+href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/g;
  let pm;
  while ((pm = preloadRe.exec(html))) preloadedUrls.add(pm[1]);

  const findings = [];
  let m;
  while ((m = blockingRe.exec(html))) {
    if (preloadedUrls.has(m[1])) continue; // to jest <noscript> fallback, nie bug
    const lineNo = html.slice(0, m.index).split('\n').length;
    findings.push({ linia: lineNo, url: m[1] });
  }

  const hasAnyFonts = /fonts\.googleapis\.com\/css2/.test(html);

  return {
    id: 'fonty_preload',
    sekcja: '4b',
    opis: 'Google Fonts musi ładować się przez wzorzec preload+onload+noscript, nie przez zwykły <link rel="stylesheet"> (render-blocking mimo display=swap)',
    status: findings.length ? 'fail' : hasAnyFonts ? 'ok' : 'n-a',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
