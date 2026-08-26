#!/usr/bin/env node
// scripts/generate-studio-paznokci-pilot.js — pilot: warianty wizualne dla Studia paznokci
// (start od wariantu 1 free), trzecia branża w systemie 6 archetypów po Hydrauliku i Elektryku.
// Wynik NIE trafia do templates/manifest.json (produkcyjny, dziś pusty) — zapisywany osobno
// w templates/pilot/ + kopiowany do preview/studio-paznokci/ jako statyczne strony pod podgląd.
//
// Użycie: node scripts/generate-studio-paznokci-pilot.js
// Wymaga ANTHROPIC_API_KEY w .env — w praktyce warianty generowane ręcznie przez sesje
// Claude Code (patrz docs/produkcja-szablonow/README.md), ten skrypt to źródło promptów.

const fs = require('fs');
const path = require('path');
const { buildTemplatePrompt } = require('../lib/promptBuilder');

const ROOT = path.join(__dirname, '..');
const PILOT_DIR = path.join(ROOT, 'templates', 'pilot');
const PREVIEW_DIR = path.join(ROOT, 'preview', 'studio-paznokci');

function loadDotEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
function loadDotEnv() {
  if (process.env.ANTHROPIC_API_KEY) return;
  loadDotEnvFile(path.join(ROOT, '.env'));
  loadDotEnvFile(path.join(ROOT, '.env.local'));
}
loadDotEnv();

// Identyczne co do słowa z scripts/generate-hydraulik-pilot.js i generate-elektryk-pilot.js —
// te zasady są branżowo-niezależne, wypracowane na wcześniejszych pilotach i spisane w
// docs/produkcja-szablonow/ZASADY.md.
const CSS_VAR_REQUIREMENT = `

WYMÓG TECHNICZNY (personalizacja bez regeneracji — KRYTYCZNE):
Zdefiniuj w :root DOKŁADNIE te zmienne CSS: --accent, --accent-dark (ciemniejszy wariant do
hover/tekstu), --bg (tło strony), --surface (tło kart/sekcji), --text (główny kolor tekstu),
--muted (pomocniczy kolor tekstu), --head (font-family nagłówków), --body (font-family tekstu).
W CAŁYM pozostałym CSS używaj WYŁĄCZNIE var(--nazwa) do każdego koloru i fontu — ani jednego
literału hex ani nazwy fontu poza samą deklaracją w :root. To pozwoli później zmienić całą
kolorystykę i typografię strony przez podmianę tylko bloku :root, bez dotykania reszty kodu.
Jedyny dopuszczalny wyjątek: słowa kluczowe "white"/"black" WEWNĄTRZ color-mix() jako neutralne
punkty odniesienia (np. color-mix(in srgb, var(--text) 90%, black)) — nigdy literały hex, nawet
wewnątrz color-mix().

WYMÓG JĘZYKOWY — ODMIANA NAZWY MIASTA (KRYTYCZNE):
{{MIASTO}} to token, który przy aktywacji zostanie podstawiony nazwą DOWOLNEGO polskiego miasta
w mianowniku (Kraków, Warszawa, Łódź, Gdańsk...) — NIE zakładaj żadnej konkretnej odmiany, bo nie
da się jej automatycznie poprawnie wygenerować dla każdego miasta. Dlatego:
- NIGDY nie pisz "w {{MIASTO}}", "z {{MIASTO}}", "do {{MIASTO}}", "poza {{MIASTO}}" ani żadnej innej
  formy wymagającej odmiany nazwy własnej przez przyimek — to gramatycznie niepoprawne dla większości
  miast ("w Kraków" zamiast "w Krakowie").
- Zamiast tego używaj BEZPIECZNYCH konstrukcji, które działają dla każdej nazwy miasta w mianowniku:
  "w mieście {{MIASTO}}", "na terenie miasta {{MIASTO}}", "poza miastem {{MIASTO}}" (rzeczownik
  pospolity "miasto" się odmienia, nazwa własna zostaje w mianowniku jako dopowiedzenie — to
  poprawna polszczyzna), ALBO usuń przyimek i użyj myślnika/dwukropka: "Usługi — {{MIASTO}}",
  "Zapraszamy — {{MIASTO}}".
- Wyjątek: {{MIASTO}} użyte SAMODZIELNIE bez przyimka (np. w adresie "{{ADRES}}, {{MIASTO}}",
  w tagu lokalizacji, w tytule strony, w podpisie "Imię, {{MIASTO}}") jest zawsze bezpieczne —
  mianownik nie wymaga żadnej zmiany.

WYMÓG — MAPA DOJAZDU (KRYTYCZNE):
Sekcja kontaktowa MUSI zawierać prawdziwy, działający embed Google Maps — NIE placeholder/prostokąt
zastępczy. Użyj: <iframe src="https://www.google.com/maps?q={{ADRES}}, {{MIASTO}}&output=embed"
loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0;width:100%;height:320px">
</iframe> (ten format nie wymaga klucza API i zadziała automatycznie, gdy {{ADRES}}/{{MIASTO}}
zostaną podstawione prawdziwymi danymi przy aktywacji).

PUŁAPKA CSS — aspect-ratio na <img> z atrybutami width/height (KRYTYCZNE, znaleziony realny błąd):
Jeśli <img> ma HTML-owe atrybuty width="..." height="..." (typowe dla SEO/CLS, np. width="940"
height="650") ORAZ w CSS ustawiasz mu tylko width (albo max-width) + aspect-ratio bez jawnego
height, w niektórych przeglądarkach faktyczna wysokość elementu i tak zostaje usztywniona na
wartość z atrybutu HTML height, IGNORUJĄC aspect-ratio — przy zwężaniu szerokości na mobile obrazek
robi się drastycznie, nienaturalnie wysoki (potwierdzone w praktyce, nie teoria). Zawsze gdy łączysz
CSS width/max-width + aspect-ratio na <img> z atrybutami HTML width/height, dopisz też jawne
height:auto w tej samej regule CSS — inaczej aspect-ratio nie zadziała poprawnie na wąskich
ekranach.

PUŁAPKA — przycisk telefonu/CTA z pełnym tekstem w nav na mobile (KRYTYCZNE, znaleziony realny
błąd): Jeśli nav (sticky header) ma przycisk z pełnym tekstem (np. "Zadzwoń: {{TELEFON}}" albo
"Umów wizytę") obok hamburgera na wąskich ekranach, tekst nie mieści się w dostępnej szerokości
i się łamie — rozpycha pasek nawigacji, nachodzi na logo i ikonę menu. Na <700px świadomie
zaprojektuj kolaps tego elementu (np. skrócony tekst, sama ikona, albo schowanie do wnętrza
rozwijanego menu) — nie kopiuj mechaniki z innej branży 1:1, zaprojektuj ją dla tego layoutu.

WYMÓG TREŚCI: konkretne liczby i daty (lata na rynku, liczba klientek, procenty, punkty osi
czasu typu rok założenia) wstawiaj NORMALNIE jako gotową treść docelową — klientka nadpisze to
przy edycji strony, to nie jest placeholder do unikania. Zakazane jest wyłącznie zmyślanie
FAKTÓW O OSOBACH TRZECICH: fikcyjnych nazw firm-klientów w sekcji "zaufali nam" (użyj
generycznych etykiet kategorii) i wymyślonego imienia właścicielki (nie ma na to tokenu — tylko
{{NAZWA_STRONY}}, nazwa firmy).

ZASADA 0 — BESPOKE WYKONANIE, ZERO REUŻYCIA LAYOUTU MIĘDZY BRANŻAMI (KRYTYCZNE, patrz
docs/produkcja-szablonow/ZASADY.md sekcja 0): pliki odpowiedników tego archetypu w innych
branżach (templates/pilot/hydraulik-1-zaufany-fachowiec.html,
templates/pilot/elektryk-1-zaufany-fachowiec.html) wolno przeczytać WYŁĄCZNIE jako inspirację
ducha archetypu ("Zaufany fachowiec" = ciepły, budujący zaufanie, szeroki zakres, darmowy tier)
— NIGDY jako plik bazowy do skopiowania. Każda sekcja musi dostać inny mechanizm wizualny niż
OBA te pliki. Paleta też musi się różnić nastrojem (jasność/temperatura tła), nie tylko odcieniem
akcentu — patrz .claude/agents/designer-ux-ui.md sekcja "Baw się jasnością i tłem".`;

const SYSTEM_BASE = 'Jesteś ekspertem web designu tworzącym profesjonalne strony dla polskich firm lokalnych.\n' +
  'Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.\n' +
  'Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.';

const VARIANTS = [
  {
    id: 'studio-paznokci-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: „Zaufany fachowiec" — ciepły, osobisty, budujący zaufanie do stylistki paznokci,
z naciskiem na przejrzysty cennik i realne zdjęcia wykonanych stylizacji (portfolio). To pierwszy
wariant zupełnie nowej branży (Studio paznokci) w systemie 6 archetypów — przeczytaj ZASADĘ 0
powyżej przed kodowaniem, jest tu krytyczna, bo to pierwszy plik tej branży i nie ma jeszcze
żadnego rodzeństwa w obrębie samej branży do porównania — jedyny punkt odniesienia to
hydraulik-1/elektryk-1, od których trzeba się odróżnić.

PALETA (jako zmienne CSS): --bg ciepła kość słoniowa/ivory (NIE czysta biel jak hydraulik-1 i
elektryk-1 — np. #faf3ee), --surface głębszy blady róż/kremowy, wyraźnie ciemniejszy od --bg
(np. #f3e4de — tło wierszy cennika, kart galerii, medalionów), --accent stonowany dusty-rose/
pudrowy róż (np. #c9718c — kolor kojarzony z branżą beauty, ale stonowany, nie neonowy pink),
--accent-dark głębszy bordowo-różowy (np. #8a3f5a), --text ciepły prawie-czarny brąz, --muted
ciepły taupe-szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki elegancki serif o wysokim kontraście grubości (np.
Playfair Display — inny niż sans-serify hydraulik-1/elektryk-1, pierwszy serif w tym archetypie),
tekst czytelny, miękki, zaokrąglony sans (np. Mulish).

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tych URL-i; to NIE jest opcjonalne):
- HERO: stylistka pracująca przy dłoni klientki, kolorowe półki z lakierami w tle, ciepła
  atmosfera pracy: https://images.pexels.com/photos/15202934/pexels-photo-15202934.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- SEKCJA O NAS: kadr stanowiska pracy stylistki — pastelowe tło, roślina, przybory do paznokci
  na blacie, przytulny nastrój salonu: https://images.pexels.com/photos/7755452/pexels-photo-7755452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA/PORTFOLIO, zdjęcie 1 (stylizacja nude/minimalistyczna): https://images.pexels.com/photos/6941115/pexels-photo-6941115.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA/PORTFOLIO, zdjęcie 2 (stylizacja czerwono-biało-złota, wzór falisty): https://images.pexels.com/photos/34871595/pexels-photo-34871595.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA/PORTFOLIO, zdjęcie 3 (stylizacja brokatowa nude ze zdobieniem kwiatowym): https://images.pexels.com/photos/35491156/pexels-photo-35491156.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT — celowo inny mechanizm niż hydraulik-1 (topbar+pasek promo, hero pełnoekranowe z
overlay, siatka 3 kart usług ze zdjęciem, sekcja o nas z dwoma nachodzącymi zdjęciami+watermark,
ciemne pasmo zaufania z rating-badge+cytatami, 4 kółka ikon "dlaczego my", split kontakt,
3-kolumnowa stopka) i niż elektryk-1 (kolaż 3 zdjęć w hero, usługi jako naprzemienne rzędy,
polaroid w "o nas", jasna siatka opinii, karty z numerem i górnym paskiem, baner kontaktu, stopka
2-kolumnowa):
1. Nav: logo WYŚRODKOWANE, linki nawigacyjne rozdzielone symetrycznie po obu stronach logo
   (połowa z lewej, połowa z prawej), przycisk "Umów wizytę" w prawym rogu, numer telefonu jako
   drugorzędny link tekstowy obok. Sticky, cienki dolny border (nie pełny pasek promo nad nav
   jak w hydraulik-1, nie sam telefon-pill jak w elektryk-1). MOBILE <700px: symetryczny układ
   linków fizycznie się nie mieści — zwiń całą nawigację (linki) do hamburgera, zostaw tylko
   logo (można przesunąć z centrum na lewo) + skrócony/ikonowy przycisk "Umów wizytę" + hamburger
   w jednym rzędzie, zgodnie z PUŁAPKĄ — przycisk z pełnym tekstem w nav na mobile (patrz wyżej).
2. Hero: split 2-kolumnowy — lewo tekst (eyebrow, H1, lead, jeden CTA "Umów wizytę"), prawo
   zdjęcie hero w zaokrąglonej ramce (nie pełnoekranowe tło z overlay jak hydraulik-1, nie kolaż
   jak elektryk-1) z MAŁĄ pływającą kartą-plakietką nachodzącą na dolny-lewy róg zdjęcia:
   "📅 Najbliższy wolny termin: [tekst do uzupełnienia przez klientkę]" + mały link "Sprawdź
   dostępność".
3. Sekcja CENNIK (NOWA, nie istnieje w hydraulik-1 ani elektryk-1 — to jest kluczowy element
   budujący zaufanie w tej branży: przejrzystość cen): lista usług pogrupowana w 2 kolumny na
   desktopie, każda pozycja jako wiersz "nazwa usługi ... kropkowana linia... cena" w stylu
   eleganckiego menu (np. restauracyjnego cennika), z czasem trwania usługi jako mały tekst pod
   nazwą. Min. 6-8 pozycji (manicure klasyczny, manicure hybrydowy, przedłużanie żelem,
   pedicure klasyczny, pedicure hybrydowy, zdobienia/nail art, wymiana/uzupełnienie, zabieg
   parafinowy — dobierz sensowne ceny w PLN).
4. Sekcja GALERIA: siatka 3 zdjęć z listy powyżej (portfolio wykonanych stylizacji), każde w
   zaokrąglonym kwadracie/prostokącie z lekkim hover-zoom, krótki podpis pod każdym.
5. Sekcja O NAS: zdjęcie z listy powyżej w dużej zaokrąglonej ramce PO JEDNEJ STRONIE (nie dwa
   nachodzące zdjęcia jak hydraulik-1, nie przechylony polaroid jak elektryk-1) + tekst obok +
   3 okrągłe "medaliony" statystyk w rzędzie pod tekstem (liczba w kole + podpis pod spodem) —
   lata doświadczenia / zadowolonych klientek / wykonanych stylizacji.
6. Sekcja OPINIE: 2 duże cytaty klientek obok siebie, BEZ awatarów i BEZ gwiazdek (nie ciemne
   pasmo z rating-badge jak hydraulik-1, nie jasna siatka kart z inicjałami jak elektryk-1) —
   sam duży kursywny cytat (serif) + imię i miasto pod spodem, minimalistycznie.
7. Sekcja "Dlaczego my": pionowa lista 4 pozycji z cienkimi liniami-separatorami między nimi
   (ikona + nazwa + krótki opis w jednym wierszu), NIE siatka kart/kółek jak w obu
   poprzednikach — np. Doświadczona stylistka / Wysokiej jakości produkty / Higiena i
   sterylizacja narzędzi / Przejrzysty cennik bez niespodzianek.
8. FAQ — accordion, standardowo.
9. Kontakt: duża karta-baner "Umów wizytę" (telefon jako duży przycisk + link do rezerwacji
   online jeśli chcesz dodać, opcjonalnie) + pod spodem dane kontaktowe w poziomym pasku + mapa
   dojazdu (patrz WYMÓG — MAPA DOJAZDU powyżej). UWAGA — ŚWIADOMY WYJĄTEK: ten wariant celowo
   NIE MA formularza kontaktowego (w odróżnieniu od hydraulik-1/elektryk-1) — dla usługi
   rezerwowanej terminowo telefon/baner rezerwacji jest naturalniejszym CTA niż formularz
   "wyślij wiadomość i czekaj na odpowiedź"; nie zgłaszać braku formularza jako błędu w QA.
10. Stopka: prosta, wyśrodkowana, jedna kolumna (nie 3-kolumnowa jak hydraulik-1, nie 2-kolumnowa
    jak elektryk-1) — logo, krótki opis, linki kontaktowe w rzędzie, copyright.`
  },
];

async function callClaude(system, userPrompt) {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) throw new Error('Brak ANTHROPIC_API_KEY (ustaw w .env lub środowisku)');

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
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const rawText = await r.text();
  if (!r.ok) {
    let errMsg = rawText;
    try { errMsg = JSON.parse(rawText)?.error?.message || rawText; } catch (e) {}
    throw new Error('Claude API ' + r.status + ': ' + String(errMsg).slice(0, 300));
  }

  const data = JSON.parse(rawText);
  let html = (data.content?.[0]?.text || '').trim();
  if (html.startsWith('```html')) html = html.slice(7);
  else if (html.startsWith('```')) html = html.slice(3);
  if (html.endsWith('```')) html = html.slice(0, -3);
  html = html.trim();
  if (!html.includes('</body>')) html += '\n</body>';
  if (!html.includes('</html>')) html += '\n</html>';

  if (html.length < 500) throw new Error('Za krótka odpowiedź (' + html.length + ' znaków)');
  return html;
}

function buildStudioPaznokciTokens() {
  return {
    nazwa: '{{NAZWA_STRONY}}',
    nazwa_strony: '{{NAZWA_STRONY}}',
    slug: '{{SLUG}}',
    branza: 'Studio paznokci',
    miasto: '{{MIASTO}}',
    dzielnica: '',
    telefon: '{{TELEFON}}',
    email: '{{EMAIL}}',
    adres: '{{ADRES}}',
    godz_pon_pt: '{{GODZINY_PON_PT}}',
    godz_sob: '{{GODZINY_SOB}}',
    lata: '', realizacje: '', opis: '', nazwa_firma: '', nip: '', adres_firma: '',
    galeria: [], heroUrl: '', logo_base64: '', whatsapp: '', facebook: '', instagram: '',
    google_ocena: '', google_opinie: '', usp: [], faq: [], obszar: '', certyfikaty: '',
    platnosci: '', keywords: '', uslugi_lista: [],
  };
}

async function main() {
  fs.mkdirSync(PILOT_DIR, { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const firmaTokens = buildStudioPaznokciTokens();
  const results = [];

  console.log('Generuję warianty Studia paznokci...\n');

  for (const v of VARIANTS) {
    process.stdout.write('→ ' + v.name + ' [' + v.tier + ']... ');
    try {
      const styleConfig = {
        system: SYSTEM_BASE,
        visual: v.visual + CSS_VAR_REQUIREMENT,
      };
      const userPrompt = buildTemplatePrompt(styleConfig, firmaTokens);
      const html = await callClaude(styleConfig.system, userPrompt);

      fs.writeFileSync(path.join(PILOT_DIR, v.id + '.html'), html, 'utf8');
      fs.writeFileSync(path.join(PREVIEW_DIR, v.id + '.html'), html, 'utf8');

      results.push({ id: v.id, tier: v.tier, name: v.name, ok: true, chars: html.length });
      console.log('OK (' + html.length + ' znaków)');
    } catch (err) {
      results.push({ id: v.id, tier: v.tier, name: v.name, ok: false, error: err.message });
      console.log('BŁĄD: ' + err.message);
    }
  }

  const indexHtml = '<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta name="robots" content="noindex, nofollow">' +
    '<title>Pilot: Studio paznokci — warianty wizualne</title>' +
    '<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;line-height:1.6}' +
    'h1{font-size:24px}a.card{display:block;border:1px solid #ddd;border-radius:10px;padding:16px 20px;margin-bottom:12px;text-decoration:none;color:#111}' +
    'a.card:hover{border-color:#888}.tier{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#888}</style></head><body>' +
    '<h1>Pilot: Studio paznokci — warianty wizualne</h1>' +
    results.map(r => r.ok
      ? '<a class="card" href="/preview/studio-paznokci/' + r.id + '.html"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong></a>'
      : '<div class="card" style="border-color:#c00;color:#c00"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong> — BŁĄD: ' + r.error + '</div>'
    ).join('\n') +
    '</body></html>';

  fs.writeFileSync(path.join(PREVIEW_DIR, 'index.html'), indexHtml, 'utf8');
  console.log('\nGotowe. Podgląd: preview/studio-paznokci/index.html');
}

main().catch(err => { console.error(err); process.exit(1); });
