const TAGS = ['section', 'div', 'header', 'footer', 'nav', 'form'];

export function checkBalansTagow(html) {
  // Usuń <script>...</script> i komentarze — CLAUDE.md ostrzega, że </body> (i podobne)
  // potrafią żyć wewnątrz JS-owych stringów (np. iframe.srcdoc); to samo dotyczy tych tagów.
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const findings = [];
  for (const tag of TAGS) {
    const openRe = new RegExp('<' + tag + '(\\s[^>]*)?>', 'gi');
    const closeRe = new RegExp('</' + tag + '\\s*>', 'gi');
    const opens = (cleaned.match(openRe) || []).length;
    const closes = (cleaned.match(closeRe) || []).length;
    if (opens !== closes) {
      findings.push({ tag, otwarte: opens, zamkniete: closes });
    }
  }

  return {
    id: 'balans_tagow',
    sekcja: 'Checklista weryfikacji (integralność HTML)',
    opis: 'Balans znaczników section/div/header/footer/nav/form (poza <script> i komentarzami)',
    status: findings.length ? 'fail' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
