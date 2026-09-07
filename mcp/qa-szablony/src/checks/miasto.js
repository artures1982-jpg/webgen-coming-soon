// Sekcja 2 ZASADY.md: standardowy grep '(w|z|do|poza) {{MIASTO}}' łapie tylko przyimek
// TUŻ przed tokenem. Przepuszcza błąd, gdy między przyimkiem a tokenem stoi odmieniany
// rzeczownik "miasto" w złym przypadku ("poza miasto {{MIASTO}}", "do miasto {{MIASTO}}") —
// realnie znalezione w fotograf-slubny-1 (03.09.2026).
//
// Dwie iteracje tej reguły dały fałszywe alarmy na realnych plikach podczas testów 2026-09-04:
//  1) Skan całego okna wstecz łapał NIEZWIĄZANY przyimek gdzieś w zdaniu (np. "sprowadzanie
//     aut z USA {{MIASTO}}" — "z" rządzi "USA", nie tokenem). Naprawione: patrzymy tylko na
//     słowo bezpośrednio przed tokenem.
//  2) Samo słowo "miasto" bezpośrednio przed tokenem, bez wymogu poprzedzającego przyimka,
//     fałszywie łapało (a) etykiety/tagi typu "🧭 Miasto {{MIASTO}} + okolice" (elektryk-3 —
//     to nie zdanie z przyimkiem, tylko etykieta, jak "Miasto: Kraków") oraz (b) sąsiedztwo
//     przez granicę bloku HTML, np. "<h3>Mieszkanie, Stare Miasto</h3><p>{{MIASTO}}</p>"
//     (nieruchomosci-1) — "Miasto" z zupełnie innego elementu, bez związku gramatycznego.
//     Naprawione: (a) "miasto" liczy się jako błąd wyłącznie gdy w oknie do 3 słów wstecz
//     stoi też przyimek rządzący, (b) granica tagu blokowego (nie-inline) zeruje okno.
const RISKY_PREPS = new Set([
  'w', 'z', 'do', 'poza', 'spoza', 'pod', 'nad', 'przy', 'kolo', 'okolicy', 'pobliżu', 'poblizu',
]);
const SAFE_FORMS = new Set(['miescie', 'miasta', 'miastem']);
const INLINE_TAGS = new Set(['span', 'strong', 'em', 'b', 'i', 'br', 'a', 'small', 'sup', 'sub', 'mark', 'wbr']);

function stripDiacritics(s) {
  return s
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
    .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
}

function contextWords(html, idx, maxWords) {
  const raw = html.slice(Math.max(0, idx - 200), idx);
  // Granica tagu BLOKOWEGO (nie inline typu <span>/<strong>) zeruje okno — słowo z innego
  // elementu HTML nie jest gramatycznie powiązane z tokenem, nawet jeśli tekstowo sąsiaduje
  // po usunięciu tagów.
  const tagRe = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let lastBoundary = -1;
  let tm;
  while ((tm = tagRe.exec(raw))) {
    if (!INLINE_TAGS.has(tm[1].toLowerCase())) lastBoundary = tm.index + tm[0].length;
  }
  const segment = lastBoundary >= 0 ? raw.slice(lastBoundary) : raw;
  const withoutInline = segment.replace(/<[^>]+>/g, ' ');
  return withoutInline
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => stripDiacritics(w.toLowerCase()).replace(/^[^a-z]+|[^a-z]+$/g, ''))
    .filter(Boolean)
    .slice(-maxWords);
}

export function checkGramatykaMiasto(html) {
  const findings = [];
  const re = /\{\{MIASTO\}\}/g;
  let m;
  while ((m = re.exec(html))) {
    const idx = m.index;
    const words = contextWords(html, idx, 3);
    if (!words.length) continue;
    const last = words[words.length - 1];
    if (SAFE_FORMS.has(last)) continue;

    let bad = false;
    let powod = '';
    if (RISKY_PREPS.has(last)) {
      bad = true;
      powod = 'przyimek "' + last + '" bezpośrednio przed {{MIASTO}}, bez odmienionego rzeczownika "miasto"';
    } else if (last === 'miasto' && words.slice(0, -1).some((w) => RISKY_PREPS.has(w))) {
      bad = true;
      powod =
        '"miasto" w mianowniku po przyimku, bezpośrednio przed {{MIASTO}} — wymagana forma ' +
        'mieście/miasta/miastem (bare "miasto" bez poprzedzającego przyimka, np. etykieta/tag, jest OK)';
    }

    if (bad) {
      const lineNo = html.slice(0, idx).split('\n').length;
      findings.push({ linia: lineNo, kontekst: words.join(' ') + ' {{MIASTO}}', powod });
    }
  }

  return {
    id: 'gramatyka_miasto',
    sekcja: '2',
    opis:
      'Gramatyka wokół {{MIASTO}} — patrzy na słowo(-a) bezpośrednio przed tokenem w tym samym elemencie HTML ' +
      '(granica tagu blokowego zeruje okno): fail gdy ostatnie słowo to ryzykowny przyimek ' +
      '(w/z/do/poza/spoza/pod/nad/przy/koło/okolicy/pobliżu) LUB "miasto" w błędnym mianowniku poprzedzone ' +
      'takim przyimkiem w oknie do 3 słów; ok dla bezpiecznej formy (mieście/miasta/miastem), samodzielnej ' +
      'etykiety ("Miasto {{MIASTO}}" bez przyimka) i niezwiązanych rzeczowników ("aut z USA {{MIASTO}}")',
    status: findings.length ? 'fail' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
