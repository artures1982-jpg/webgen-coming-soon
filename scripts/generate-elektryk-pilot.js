#!/usr/bin/env node
// scripts/generate-elektryk-pilot.js — pilot: 6 bespoke wariantów wizualnych dla Elektryka
// (1 free + 5 pro), druga branża po Hydrauliku w tym samym systemie 6 archetypów.
// Wynik NIE trafia do templates/manifest.json (produkcyjny, dziś pusty) — zapisywany osobno
// w templates/pilot/ + kopiowany do preview/elektryk/ jako statyczne strony pod podgląd.
//
// Użycie: node scripts/generate-elektryk-pilot.js
// Wymaga ANTHROPIC_API_KEY w .env — w praktyce warianty generowane ręcznie przez równoległe
// sesje Claude Code (patrz docs/produkcja-szablonow/README.md), ten skrypt to źródło promptów.

const fs = require('fs');
const path = require('path');
const { buildTemplatePrompt } = require('../lib/promptBuilder');

const ROOT = path.join(__dirname, '..');
const PILOT_DIR = path.join(ROOT, 'templates', 'pilot');
const PREVIEW_DIR = path.join(ROOT, 'preview', 'elektryk');

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

// Identyczne co do słowa z scripts/generate-hydraulik-pilot.js — te zasady są branżowo-
// niezależne, wypracowane na 6 wariantach Hydraulika i spisane w docs/produkcja-szablonow/ZASADY.md.
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
  "Dojazd gratis — {{MIASTO}}".
- Wyjątek: {{MIASTO}} użyte SAMODZIELNIE bez przyimka (np. w adresie "{{ADRES}}, {{MIASTO}}",
  w tagu lokalizacji, w tytule strony, w podpisie "Imię, {{MIASTO}}") jest zawsze bezpieczne —
  mianownik nie wymaga żadnej zmiany.

WYMÓG — MAPA DOJAZDU (KRYTYCZNE):
Sekcja kontaktowa MUSI zawierać prawdziwy, działający embed Google Maps — NIE placeholder/prostokąt
zastępczy. Użyj: <iframe src="https://www.google.com/maps?q={{ADRES}}, {{MIASTO}}&output=embed"
loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0;width:100%;height:320px">
</iframe> (ten format nie wymaga klucza API i zadziała automatycznie, gdy {{ADRES}}/{{MIASTO}}
zostaną podstawione prawdziwymi danymi przy aktywacji). Wyjątek: wariant 6 (minimalistyczny)
celowo nie ma mapy — patrz jego brief.

PUŁAPKA CSS — aspect-ratio na <img> z atrybutami width/height (KRYTYCZNE, znaleziony realny błąd):
Jeśli <img> ma HTML-owe atrybuty width="..." height="..." (typowe dla SEO/CLS, np. width="940"
height="650") ORAZ w CSS ustawiasz mu tylko width (albo max-width) + aspect-ratio bez jawnego
height, w niektórych przeglądarkach faktyczna wysokość elementu i tak zostaje usztywniona na
wartość z atrybutu HTML height, IGNORUJĄC aspect-ratio — przy zwężaniu szerokości na mobile obrazek
robi się drastycznie, nienaturalnie wysoki (potwierdzone w praktyce, nie teoria). Zawsze gdy łączysz
CSS width/max-width + aspect-ratio na <img> z atrybutami HTML width/height, dopisz też jawne
height:auto w tej samej regule CSS — inaczej aspect-ratio nie zadziała poprawnie na wąskich
ekranach.

PUŁAPKA — przycisk telefonu z pełnym numerem w nav na mobile (KRYTYCZNE, znaleziony realny błąd):
Jeśli nav (sticky header) ma przycisk z pełnym tekstem "Zadzwoń: {{TELEFON}}" obok hamburgera na
wąskich ekranach, tekst z numerem telefonu nie mieści się w dostępnej szerokości i się łamie —
rozpycha pigułkę/pasek nawigacji, nachodzi na logo i ikonę menu. Na <700px zwiń ten przycisk do
samej ikony (np. okrągły przycisk ~44x44px z emoji 📞, bez tekstu) — pełny tekst "Zadzwoń: {{TELEFON}}"
zostaw tylko w dedykowanych, szerszych miejscach (hero, sekcja kontakt), nie w ciasnym pasku nav.

WYMÓG TREŚCI: konkretne liczby i daty (lata na rynku, liczba klientów, procenty, punkty osi
czasu typu rok założenia) wstawiaj NORMALNIE jako gotową treść docelową — klient nadpisze to
przy edycji strony, to nie jest placeholder do unikania. Zakazane jest wyłącznie zmyślanie
FAKTÓW O OSOBACH TRZECICH: fikcyjnych nazw firm-klientów w sekcji "zaufali nam" (użyj
generycznych etykiet kategorii, np. "Deweloperzy mieszkaniowi") i wymyślonego imienia
właściciela (nie ma na to tokenu — tylko {{NAZWA_STRONY}}, nazwa firmy).`;

const SYSTEM_BASE = 'Jesteś ekspertem web designu tworzącym profesjonalne strony dla polskich firm lokalnych.\n' +
  'Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.\n' +
  'Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.';

const VARIANTS = [
  {
    id: 'elektryk-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: „Zaufany fachowiec" — ciepły, lokalny, sprawdzona struktura budująca zaufanie do rzemieślnika.
PALETA (jako zmienne CSS): --bg biały, --accent bursztynowo-żółty lub elektryczny bursztyn (kolor kojarzony z elektryką/prądem — np. #E8A317 lub podobny ciepły amber, NIE neonowy żółty), --text ciemny grafit.
TYPOGRAFIA (jako zmienne CSS): nagłówki mocny, pewny sans-serif (np. Bricolage Grotesque/Sora), tekst czytelny sans (np. Inter/Source Sans Pro).

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tych URL-i, jako <img src="..."> z sensownym object-fit:cover; NIE wymyślaj innych zdjęć ani nie
zostawiaj tam pustych placeholderów):
- HERO (tło pełnoekranowe, z ciemnym gradient-overlay dla czytelności tekstu): https://images.pexels.com/photos/20500461/pexels-photo-20500461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Awarie i naprawy elektryczne": https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Instalacje elektryczne": https://images.pexels.com/photos/32497160/pexels-photo-32497160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Przeglądy i pomiary instalacji": https://images.pexels.com/photos/14319099/pexels-photo-14319099.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Montaż gniazdek, włączników i oświetlenia": https://images.pexels.com/photos/4981794/pexels-photo-4981794.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Instalacje fotowoltaiczne": https://images.pexels.com/photos/33379361/pexels-photo-33379361.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Rozdzielnice i zabezpieczenia": BRAK dobrego zdjęcia — zostaw tę jedną kartę z samą dużą ikoną/emoji zamiast zdjęcia, tak jak resztę struktury karty (nie łam layoutu, po prostu bez obrazka u góry tej jednej karty).
- Sekcja O NAS, zdjęcie realizacji 1 (z dwóch nachodzących na siebie): https://images.pexels.com/photos/27928762/pexels-photo-27928762.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Sekcja O NAS, zdjęcie realizacji 2 (z dwóch nachodzących na siebie): https://images.pexels.com/photos/7641361/pexels-photo-7641361.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT:
1. Pasek nad nawigacją, tło var(--accent), tekst ciemny (dla kontrastu na żółto-bursztynowym): "Pracujemy 24/7" po lewej, "ZADZWOŃ: {{TELEFON}}" po prawej.
2. Sticky nav biała: logo/nazwa + linki + przycisk telefonu.
3. Hero pełnoekranowy: zdjęcie z listy powyżej jako tło z ciemnym gradient-overlay, pinezka lokalizacji nad nagłówkiem, duży pogrubiony nagłówek H1, jeden wyraźny przycisk CTA "Zadzwoń: {{TELEFON}}".
4. Sekcja USŁUGI: 3 kolumny (2 rzędy po 3), każda ze zdjęciem z listy powyżej u góry (poza kartą "Rozdzielnice i zabezpieczenia" — patrz wyżej) + kategoria + lista 3 punktów pod spodem.
5. Sekcja O NAS: tekst po lewej (lata doświadczenia, liczby), po prawej dwa nachodzące na siebie zdjęcia z listy powyżej + duża wyblakła ikona błyskawicy/gniazdka w tle jako watermark.
6. Pasmo zaufania na ciemnym tle (var(--text) lub pochodna): duży badge oceny z gwiazdkami po lewej, 2 krótkie cytaty klientów z inicjałem w kółku po prawej.
7. Sekcja "Dlaczego my" — 4 punkty z ikonami w rzędzie (Uprawnienia SEP / Szybki dojazd / Gwarancja na usługę / Uczciwa wycena).
8. Kontakt: duży numer telefonu, dane kontaktowe + formularz (imię, telefon, wiadomość) obok siebie, mapa dojazdu pod spodem (patrz WYMÓG — MAPA DOJAZDU powyżej).
9. Pasmo CTA tuż przed stopką: "Awaria elektryczna? Jesteśmy pod telefonem" + przycisk.
10. Stopka ciemna, dane kontaktowe + linki.`
  },
  {
    id: 'elektryk-2-szybka-interwencja',
    tier: 'pro',
    name: 'Szybka interwencja 24h',
    visual: `STYL: „Szybka interwencja 24h" — pilny, wysoki kontrast, budowany wokół natychmiastowego telefonu. Odróżnij się od wariantu 1 (bez fotograficznego hero, bez siatki kart usług ze zdjęciami) i od odpowiednika w branży Hydraulik (inna paleta, inna typografia, siatka zagrożeń jako DUŻE IKONY, nie zdjęcia w tle, sekcja zaufania jako pozioma listwa certyfikacji zamiast splitu tekst+zdjęcie).
PALETA (jako zmienne CSS): --bg biały dla sekcji treściowych ale --text bardzo ciemny prawie czarny grafit używany jako tło hero/paska alarmowego, --accent pomarańcz bezpieczeństwa/hi-vis (np. #ff5a1f — NIE bursztynowy żółty wariantu 1, NIE czerwień), --accent-dark spalona rdzawa pomarańcz (np. #b8390a).
TYPOGRAFIA (jako zmienne CSS): nagłówki wąski, techniczny, „alarmowy" font (np. Barlow Condensed/Oswald, wersaliki), tekst czytelny sans inny niż w wariancie 1 (np. Work Sans zamiast Inter).

PRAWDZIWE ZDJĘCIA — TODO (dobrane, zweryfikowane wizualnie):
- Sekcja BEZPIECZEŃSTWO/ZAUFANIE, jedyne zdjęcie na stronie: elektryk mierzący napięcie multimetrem przy otwartej rozdzielnicy, ostre skupienie, ręce z sondami pomiarowymi — https://images.pexels.com/photos/34054464/pexels-photo-34054464.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Reszta strony (hero, siatka zagrożeń) świadomie BEZ zdjęć — duże emoji/ikony zamiast fotografii, żeby różnić się strukturalnie od wariantu 1 i szybko skanować się wzrokiem w sytuacji awaryjnej.

LAYOUT:
1. Pulsujący pasek alarmowy nad nawigacją, tło var(--accent): "⚡ Porażenie prądem, iskrzenie, pożar instalacji? Dzwoń natychmiast: {{TELEFON}}".
2. Sticky nav CIEMNA (var(--text) jako tło, nie biała jak wariant 1): logo + skrócone linki (Zagrożenia / Bezpieczeństwo / FAQ / Kontakt) + przycisk telefonu zwinięty do samej ikony poniżej 700px.
3. Hero BEZ zdjęcia w tle: ciemne tło (var(--text)) + subtelny radial-gradient akcentu jak elektryczna poświata, tag lokalizacji nad ogromnym klikalnym numerem telefonu (duża czcionka jak w hero-phone), pod numerem jednozdaniowy nagłówek pilności, jeden przycisk CTA "Zadzwoń teraz".
4. Pasek 3 liczbowych odznak pod hero (jasne tło): średni czas dojazdu / dostępność 24/7/365 / bezpłatna wycena telefoniczna.
5. Sekcja ZAGROŻENIA: siatka 6 kafli z DUŻĄ IKONĄ/EMOJI (nie zdjęciem) + krótką etykietą: Porażenie prądem, Pożar instalacji / zwarcie, Iskrzenie gniazdka, Brak prądu w całym domu, Uszkodzony licznik/rozdzielnica, Zapach spalenizny z instalacji. Kafle na ciemnym tle z akcentowym obramowaniem, hover unoszący.
6. Sekcja BEZPIECZEŃSTWO: pozioma listwa 4 odznak (nie split 2-kolumnowy jak w wariancie 1) — Uprawnienia SEP / Ubezpieczenie OC / Zgodność z normami PPOŻ / Ekipa w gotowości 24/7 — każda duża ikona + krótki opis; obok/pod listwą jedyne zdjęcie strony (patrz PRAWDZIWE ZDJĘCIA).
7. Sekcja FAQ — accordion, jak w pozostałych wariantach.
8. Kontakt: pasek ostrzegawczy na górze sekcji ("Nie dotykaj uszkodzonej instalacji — zadzwoń, nie naprawiaj samodzielnie"), formularz (telefon + krótki opis zagrożenia) obok danych kontaktowych, mapa dojazdu pod spodem (patrz WYMÓG — MAPA DOJAZDU).
9. Pasmo CTA przed stopką z akcentowym tłem, powtórzone wezwanie do dzwonienia.
10. Stopka ciemna, prosta: telefon + adres + 2 linki (krótsza niż w wariancie 1, jak w archetypie „szybka interwencja").`
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

function buildElektrykTokens() {
  return {
    nazwa: '{{NAZWA_STRONY}}',
    nazwa_strony: '{{NAZWA_STRONY}}',
    slug: '{{SLUG}}',
    branza: 'Elektryk',
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

  const firmaTokens = buildElektrykTokens();
  const results = [];

  console.log('Generuję warianty Elektryka (1 free + 5 pro)...\n');

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
    '<title>Pilot: Elektryk — warianty wizualne</title>' +
    '<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;line-height:1.6}' +
    'h1{font-size:24px}a.card{display:block;border:1px solid #ddd;border-radius:10px;padding:16px 20px;margin-bottom:12px;text-decoration:none;color:#111}' +
    'a.card:hover{border-color:#888}.tier{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#888}</style></head><body>' +
    '<h1>Pilot: Elektryk — warianty wizualne</h1>' +
    results.map(r => r.ok
      ? '<a class="card" href="/preview/elektryk/' + r.id + '.html"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong></a>'
      : '<div class="card" style="border-color:#c00;color:#c00"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong> — BŁĄD: ' + r.error + '</div>'
    ).join('\n') +
    '</body></html>';

  fs.writeFileSync(path.join(PREVIEW_DIR, 'index.html'), indexHtml, 'utf8');
  console.log('\nGotowe. Podgląd: preview/elektryk/index.html');
}

main().catch(err => { console.error(err); process.exit(1); });
