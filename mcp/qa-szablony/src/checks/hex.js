export function checkHexPozaRoot(html) {
  const rootMatch = /:root\s*\{/i.exec(html);
  let rootStart = -1;
  let rootEnd = -1;
  if (rootMatch) {
    rootStart = rootMatch.index;
    let d = 1;
    let k = rootMatch.index + rootMatch[0].length;
    while (k < html.length && d > 0) {
      if (html[k] === '{') d++;
      else if (html[k] === '}') d--;
      k++;
    }
    rootEnd = k;
  }

  const findings = [];
  const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
  let m;
  while ((m = hexRe.exec(html))) {
    const idx = m.index;
    if (rootStart !== -1 && idx >= rootStart && idx < rootEnd) continue;
    const lineNo = html.slice(0, idx).split('\n').length;
    const ctxStart = Math.max(0, idx - 30);
    const ctxEnd = Math.min(html.length, idx + 20);
    findings.push({
      linia: lineNo,
      fragment: m[0],
      kontekst: html.slice(ctxStart, ctxEnd).replace(/\s+/g, ' ').trim(),
    });
  }

  return {
    id: 'hex_poza_root',
    sekcja: '1',
    opis: 'Literały hex poza blokiem :root (white/black wewnątrz color-mix() to słowa kluczowe, nie hexy — nie są tu liczone)',
    status: findings.length ? 'fail' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
