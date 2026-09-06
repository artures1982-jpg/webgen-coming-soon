export function checkMapaEmbed(html, relPath) {
  const iframeRe = /<iframe[^>]*src=["']([^"']*google\.com\/maps[^"']*)["'][^>]*>/i;
  const m = iframeRe.exec(html);
  const isWariant6 = /-6-|minimalistyczny/i.test(relPath);

  if (!m) {
    return {
      id: 'mapa_embed',
      sekcja: '3',
      opis: 'Embed mapy Google (świadomy wyjątek z README.md: wariant 6 celowo nie ma mapy)',
      status: isWariant6 ? 'warn' : 'fail',
      znaleziska: isWariant6
        ? [{ info: 'brak mapy — zweryfikuj, że to faktycznie świadomy wyjątek wariantu 6' }]
        : [{ info: 'brak embedu Google Maps (<iframe src="...google.com/maps...">)' }],
      wymaga_oceny_wzrokowej: false,
    };
  }

  const src = m[1];
  const hasTokens = src.includes('{{ADRES}}') && src.includes('{{MIASTO}}');
  const isFilled = !src.includes('{{') && /q=[^&"']+/.test(src);
  const ok = hasTokens || isFilled;

  return {
    id: 'mapa_embed',
    sekcja: '3',
    opis: 'Embed mapy Google z {{ADRES}}/{{MIASTO}} (lub podstawionymi wartościami w wersji wypełnionej)',
    status: ok ? 'ok' : 'fail',
    znaleziska: ok ? [] : [{ src }],
    wymaga_oceny_wzrokowej: false,
  };
}
