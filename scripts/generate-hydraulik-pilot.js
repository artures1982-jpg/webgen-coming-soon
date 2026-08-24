#!/usr/bin/env node
// scripts/generate-hydraulik-pilot.js — pilot: 6 bespoke wariantów wizualnych dla Hydraulika
// (1 free + 5 pro), zamiast dawnego trio classic/modern/elegant. Wynik NIE trafia do
// templates/manifest.json (produkcyjny, dziś pusty) — zapisywany osobno w templates/pilot/
// + kopiowany do preview/hydraulik/ jako statyczne strony pod podgląd na Vercelu.
//
// Użycie: node scripts/generate-hydraulik-pilot.js
// Wymaga ANTHROPIC_API_KEY w .env.

const fs = require('fs');
const path = require('path');
const { buildTemplatePrompt } = require('../lib/promptBuilder');

const ROOT = path.join(__dirname, '..');
const PILOT_DIR = path.join(ROOT, 'templates', 'pilot');
const PREVIEW_DIR = path.join(ROOT, 'preview', 'hydraulik');

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

const CSS_VAR_REQUIREMENT = `

WYMÓG TECHNICZNY (personalizacja bez regeneracji — KRYTYCZNE):
Zdefiniuj w :root DOKŁADNIE te zmienne CSS: --accent, --accent-dark (ciemniejszy wariant do
hover/tekstu), --bg (tło strony), --surface (tło kart/sekcji), --text (główny kolor tekstu),
--muted (pomocniczy kolor tekstu), --head (font-family nagłówków), --body (font-family tekstu).
W CAŁYM pozostałym CSS używaj WYŁĄCZNIE var(--nazwa) do każdego koloru i fontu — ani jednego
literału hex ani nazwy fontu poza samą deklaracją w :root. To pozwoli później zmienić całą
kolorystykę i typografię strony przez podmianę tylko bloku :root, bez dotykania reszty kodu.

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
zostaną podstawione prawdziwymi danymi przy aktywacji).`;

const SYSTEM_BASE = 'Jesteś ekspertem web designu tworzącym profesjonalne strony dla polskich firm lokalnych.\n' +
  'Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.\n' +
  'Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.';

const VARIANTS = [
  {
    id: 'hydraulik-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: „Zaufany fachowiec" — ciepły, lokalny, sprawdzona struktura budująca zaufanie do rzemieślnika.
PALETA (jako zmienne CSS): --bg biały, --accent niebiesko-turkusowy (kolor kojarzony z hydrauliką/wodą), --text ciemny grafit.
TYPOGRAFIA (jako zmienne CSS): nagłówki mocny, pewny sans-serif (np. Bricolage Grotesque/Sora), tekst czytelny sans (np. Inter/Source Sans Pro).

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie pod tę branżę — użyj DOKŁADNIE tych URL-i,
jako <img src="..."> lub background-image, z sensownym object-fit:cover; NIE wymyślaj innych
zdjęć ani nie zostawiaj tam pustych placeholderów):
- HERO (tło pełnoekranowe, z ciemnym gradient-overlay dla czytelności tekstu): https://images.pexels.com/photos/29226620/pexels-photo-29226620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Awarie i naprawy": https://images.pexels.com/photos/15206136/pexels-photo-15206136.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Instalacje wod-kan": https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Przeglądy i konserwacja": https://images.pexels.com/photos/32497162/pexels-photo-32497162.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Montaż armatury i urządzeń": https://images.pexels.com/photos/30560253/pexels-photo-30560253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Instalacje grzewcze i c.w.u.": https://images.pexels.com/photos/12644994/pexels-photo-12644994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karta usługi "Udrażnianie kanalizacji": BRAK dobrego zdjęcia — zostaw tę jedną kartę z samą dużą ikoną/emoji zamiast zdjęcia, tak jak resztę struktury karty (nie łam layoutu, po prostu bez obrazka u góry tej jednej karty).
- Sekcja O NAS, zdjęcie realizacji 1 (z dwóch nachodzących na siebie): https://images.pexels.com/photos/16509869/pexels-photo-16509869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Sekcja O NAS, zdjęcie realizacji 2 (z dwóch nachodzących na siebie): https://images.pexels.com/photos/13726337/pexels-photo-13726337.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT:
1. Pasek nad nawigacją, tło var(--accent), tekst biały: "Pracujemy 24/7" po lewej, "ZADZWOŃ: {{TELEFON}}" po prawej.
2. Sticky nav biała: logo/nazwa + linki + przycisk telefonu.
3. Hero pełnoekranowy: zdjęcie z listy powyżej jako tło z ciemnym gradient-overlay, pinezka lokalizacji nad nagłówkiem, duży pogrubiony nagłówek H1, jeden wyraźny przycisk CTA "Zadzwoń: {{TELEFON}}".
4. Sekcja USŁUGI: 3 kolumny, każda ze zdjęciem z listy powyżej u góry (poza kartą "Udrażnianie kanalizacji" — patrz wyżej) + kategoria + lista 3 punktów pod spodem.
5. Sekcja O NAS: tekst po lewej (lata doświadczenia, liczby), po prawej dwa nachodzące na siebie zdjęcia z listy powyżej + duża wyblakła ikona klucza/rury w tle jako watermark.
6. Pasmo zaufania na ciemnym tle (var(--text) lub pochodna): duży badge oceny z gwiazdkami po lewej, 2 krótkie cytaty klientów z inicjałem w kółku po prawej.
7. Sekcja "Dlaczego my" — 4 punkty z ikonami w rzędzie (Licencjonowani i ubezpieczeni / Szybki dojazd / Gwarancja na usługę / Uczciwa wycena).
8. Kontakt: duży numer telefonu, dane kontaktowe + formularz (imię, telefon, wiadomość) obok siebie, mapa dojazdu pod spodem (patrz WYMÓG — MAPA DOJAZDU poniżej).
9. Pasmo CTA tuż przed stopką: "Awaria hydrauliczna? Jesteśmy pod telefonem" + przycisk.
10. Stopka ciemna, dane kontaktowe + linki.`
  },
  {
    id: 'hydraulik-2-szybka-interwencja',
    tier: 'pro',
    name: 'Szybka interwencja 24h',
    visual: `STYL: „Alarm 24/7" — maksymalna pilność, natychmiastowa reakcja na awarię, konwersja nade wszystko.
PALETA (jako zmienne CSS): --bg biały/bardzo jasny szary, --accent czerwono-pomarańczowy (kolor alarmu).
TYPOGRAFIA (jako zmienne CSS): nagłówki bardzo grube, kapitaliki, mocny kontrast; tekst prosty sans.

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tych URL-i jako <img src="..."> lub background-image z object-fit:cover; to NIE jest opcjonalne —
strona MUSI zawierać prawdziwe zdjęcia, nie tylko emoji/ikony i płaskie tło koloru akcentu):
- HERO (tło pełnoekranowe, ciemny technik/awaria w akcji — dłonie w rękawicach przy instalacji
  grzewczej): https://images.pexels.com/photos/7859953/pexels-photo-7859953.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
  — na tym zdjęciu zastosuj CIEMNY gradient-overlay (np. linear-gradient z var(--text) + odrobiną
  var(--accent)) na tyle mocny, żeby biały tekst i telefon OGROMNĄ czcionką były w pełni czytelne.
- Sekcja zaufania/kontakt, zdjęcie ekipy w akcji (technik z kluczem w kasku i kamizelce, gotowy do
  wyjazdu): https://images.pexels.com/photos/8486928/pexels-photo-8486928.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Sekcja "Rodzaje awarii" — Artur był jednoznaczny: chodzi o ZDJĘCIA W KAFELKACH, nie ikony/emoji i
  nie jedno wspólne zdjęcie w tle sekcji (obie te wersje były już odrzucone). KAŻDA z 6 kart dostaje
  WŁASNE zdjęcie jako tło karty (background-image, cover), z ciemnym gradientem u dołu (linear-gradient
  180deg, przezroczysty do ok. 35% → color-mix(in srgb, var(--text) 90%, black) na dole) i podpisem
  w bieli na tym gradiencie. Dla dosłownych scenariuszy ("zalanie", "brak wody", "zapchana kanalizacja",
  "instalacja gazowa") Pexels NIE MA trafionych zdjęć (sprawdzone wielokrotnie, różne zapytania) — użyj
  DOKŁADNIE tych 6 zweryfikowanych, tematycznie pasujących zdjęć hydraulika/instalacji (nie muszą być
  dosłowną ilustracją każdej awarii, mają być prawdziwą fotografią branżową, nie ikoną):
  1. Pęknięta rura: https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  2. Zalanie: https://images.pexels.com/photos/13312223/pexels-photo-13312223.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  3. Brak wody: https://images.pexels.com/photos/12271457/pexels-photo-12271457.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  4. Awaria pieca/bojlera: https://images.pexels.com/photos/29226620/pexels-photo-29226620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  5. Zapchana kanalizacja: https://images.pexels.com/photos/38028968/pexels-photo-38028968.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  6. Instalacja gazowa: https://images.pexels.com/photos/38028966/pexels-photo-38028966.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
LAYOUT:
1. Pulsujący pasek na całą szerokość pod nagłówkiem (CSS @keyframes na tle var(--accent)): "AWARIA? DZWOŃ TERAZ: {{TELEFON}}".
2. Hero pełnoekranowy: zdjęcie HERO z listy powyżej jako tło z ciemnym gradient-overlay, numer telefonu OGROMNĄ czcionką na środku (nie z boku), pod nim jedno zdanie nagłówka, przycisk CTA.
3. Zaraz pod hero: 3 badge w rzędzie — "Śr. czas dojazdu 30 min" / "Dostępni 24/7/365" / "Bezpłatna wycena telefoniczna".
4. Sekcja "Rodzaje awarii które usuwamy": siatka 6 kart, KAŻDA z własnym zdjęciem tła z listy powyżej
   (nie emoji/ikony, nie jedno wspólne tło sekcji — to dwie już odrzucone wersje) + podpis w bieli na
   ciemnym gradiencie u dołu karty — pęknięta rura, zalanie, brak wody, piec/bojler, kanalizacja,
   instalacja gazowa.
5. Sekcja zaufania: 2 kolumny — lewo 3 liczby w rzędzie (lat na rynku / awarii usuniętych / ocena Google) + USP, prawo zdjęcie ekipy z listy powyżej (duże, zaokrąglone rogi, cień) — to zdjęcie jest wymagane, nie pomijaj go.
6. Kontakt: przycisk "ZADZWOŃ TERAZ" powtórzony jeszcze raz jako duży, samodzielny pasek nad formularzem, krótki formularz (telefon + 1 zdanie opisu awarii).
7. Stopka minimalna: telefon, adres, linki prawne.`
  },
  {
    id: 'hydraulik-3-nowoczesny-cyfrowy',
    tier: 'pro',
    name: 'Nowoczesny cyfrowy',
    visual: `STYL: ciemny motyw, cyfrowy, "startup lokalny" — formularz wyceny online jako główne CTA zamiast telefonu.
PALETA (jako zmienne CSS): --bg ciemny grafitowo-niebieski, --surface odrobinę jaśniejszy od --bg, --accent nasycony niebieski/turkusowy neon, --text jasny.
TYPOGRAFIA (jako zmienne CSS): nagłówki geometryczny sans o dużej wadze (np. Space Grotesk/Sora), tekst neutralny sans.

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tych URL-i jako background-image/<img> z object-fit:cover; to NIE jest opcjonalne — ciemny/neonowy
styl nie zwalnia z wymogu prawdziwej fotografii, strona NIE MOŻE opierać się wyłącznie na
gradientach/glassmorphism bez żadnego zdjęcia, to dokładnie błąd zgłoszony wcześniej przy innym
wariancie tego pilota):
- HERO: zdjęcie w tle CAŁEJ sekcji hero (nie tylko jednej kolumny), z ciemnym gradient-overlay
  (var(--bg) + odrobiną var(--accent) jako kolorowa poświata) na tyle mocnym, by tekst i szklana
  karta formularza były w pełni czytelne — overlay musi być na tyle JASNY, żeby zdjęcie było
  faktycznie widoczne pod spodem, nie renderowało się jak jednolita czerń (sprawdź to wizualnie
  przed oddaniem pliku, nie tylko w kodzie):
  https://images.pexels.com/photos/16509869/pexels-photo-16509869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Karty USŁUGI (glassmorphism) — każda karta dostaje WŁASNE zdjęcie jako górna część karty (nie
  samą ikonę), pod zdjęciem szklany panel z nazwą usługi:
  1. "Awarie i naprawy": https://images.pexels.com/photos/15206136/pexels-photo-15206136.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  2. "Instalacje wod-kan": https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  3. "Przeglądy i diagnostyka": https://images.pexels.com/photos/32497162/pexels-photo-32497162.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  4. "Montaż armatury": https://images.pexels.com/photos/30560253/pexels-photo-30560253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
  5. "Instalacje grzewcze": https://images.pexels.com/photos/12644994/pexels-photo-12644994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=500&w=650
LAYOUT:
1. Sticky nav z przezroczystym tłem + blur po przescrollowaniu.
2. Hero: zdjęcie tła z listy powyżej na całej sekcji (patrz PRAWDZIWE ZDJĘCIA), na nim 2 kolumny —
   lewo nagłówek z fragmentem tekstu jako gradient (background-clip:text, gradient z var(--accent))
   + krótki opis, prawo kompaktowy formularz "Wyślij zapytanie o wycenę" (imię, telefon, typ usterki,
   przycisk) w karcie glassmorphism (border subtelny, tło rgba niskiej opacity, backdrop-filter:blur).
3. Sekcja USŁUGI jako karty glassmorphism ze zdjęciem z listy powyżej u góry każdej karty (nie sama
   ikona), border subtelny, hover: border-color var(--accent) + glow.
4. Sekcja "Jak to działa": 3 kroki numerowane poziomo (Zgłoś się online → Wycena w 15 minut → Fachowiec u Ciebie tego samego dnia).
5. Sekcja opinii jako statyczna siatka 3 kart (nie karuzela), każda z avatarem-inicjałem.
6. Pasmo CTA: duży nagłówek + przycisk "Wyceń online" prowadzący do formularza.
7. Stopka ciemna z linkami social i gradientowym separatorem.`
  },
  {
    id: 'hydraulik-4-rodzinna-firma',
    tier: 'pro',
    name: 'Rodzinna firma',
    visual: `STYL: osobisty, ciepły, "poznaj mnie" — jednoosobowa/rodzinna działalność, mniej korporacyjnie.
PALETA (jako zmienne CSS): --bg ciepły kremowy (nie czysta biel), --accent stonowany, ciepły odcień (np. terakota lub ciepły niebieski), --text ciemny brąz-grafit.
TYPOGRAFIA (jako zmienne CSS): nagłówki z charakterem, lekko zaokrąglone kształty liter (np. Poppins/Fredoka), tekst przyjazny sans.

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tego URL-a; to NIE jest opcjonalne, ten wariant bardziej niż inne opiera się na prawdziwej
fotografii, bo cały koncept to "poznaj właściciela"):
- Jedno zdjęcie, użyte DWUKROTNIE w dwóch różnych kadrach (ta sama osoba w obu miejscach buduje
  spójność marki — to zamierzone, nie oszczędność): ciepły, uśmiechnięty portret w warsztacie,
  naturalne światło: https://images.pexels.com/photos/8113545/pexels-photo-8113545.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
  1. HERO: pełne zdjęcie jako duży wizerunek (np. połowa szerokości hero, zaokrąglony róg/kształt
     organiczny, NIE prostokąt na całą szerokość jak w innych wariantach — to ma wyglądać osobiście,
     nie korporacyjnie), obok tekst + cytat właściciela + CTA.
  2. SEKCJA KONTAKT: ten sam plik, ale węższy kadr przez object-position (zbliżenie na twarz,
     mały okrągły portret ~64-80px obok numeru telefonu).
LAYOUT:
1. Nav prosta, bez pełnej szerokości, z lekkim marginesem.
2. Hero: zdjęcie właściciela z listy powyżej (nie samego produktu/narzędzi), krótkie osobiste motto pod nagłówkiem (np. cytat właściciela), jeden ciepły CTA.
3. Sekcja "Nasza historia": pozioma oś czasu (rok założenia → dziś, 3-4 punkty) z krótkimi opisami.
4. Sekcja USŁUGI jako prostsza lista (nie karty ze zdjęciami) — nazwa usługi + jedno zdanie opisu, mniej "sprzedażowo" niż w innych wariantach.
5. Sekcja z jednym dużym cytatem klienta na całą szerokość (duży cudzysłów dekoracyjny, cytat wyśrodkowany).
6. Sekcja kontakt osobisty: "Zadzwoń bezpośrednio do mnie — {{NAZWA_STRONY}}" (UWAGA: nie ma tokenu na
   imię właściciela, tylko {{NAZWA_STRONY}} — nie wymyślaj fikcyjnego imienia w wersji z tokenami)
   z małym okrągłym zdjęciem portretowym (z listy powyżej) obok numeru telefonu.
7. Stopka jasna, ciepła, prosta.`
  },
  {
    id: 'hydraulik-5-premium-korporacyjny',
    tier: 'pro',
    name: 'Premium / korporacyjny',
    visual: `STYL: dla firmy pozycjonującej się wyżej cenowo — klienci B2B, deweloperzy, większe realizacje.
PALETA (jako zmienne CSS): --bg biały, --accent stonowany antracyt lub głęboki granat, dużo jasnoszarego (--surface) jako tło sekcji.
TYPOGRAFIA (jako zmienne CSS): nagłówki eleganckie, wysoki kontrast grubości, spory letter-spacing na etykietach; tekst neutralny.
LAYOUT:
1. Nav minimalistyczna, cienka linia pod spodem, dużo białej przestrzeni wokół logo.
2. Hero: jedno duże, wysokiej jakości zdjęcie realizacji (nie portretowe), nagłówek z naciskiem na skalę/doświadczenie firmy, przycisk "Zapytaj o wycenę projektu".
3. Sekcja "Nasz proces": 4 kroki w rzędzie z numeracją (Konsultacja → Wycena → Realizacja → Odbiór i gwarancja), cienkie linie łączące kroki.
4. Sekcja "Realizacje" jako case studies: 2-3 duże karty (zdjęcie + krótki opis zakresu prac + metryka, np. "120 punktów instalacji"), NIE prosta galeria miniatur.
5. Sekcja zaufania: logo/nazwy klientów lub certyfikatów w rzędzie zamiast gwiazdek/cytatów.
6. Kontakt formalny: formularz "Zapytanie o wycenę projektu" z polami (firma, zakres prac, budżet orientacyjny) + dane kontaktowe obok.
7. Stopka biała/jasnoszara, elegancka, minimalna.`
  },
  {
    id: 'hydraulik-6-minimalistyczny',
    tier: 'pro',
    name: 'Minimalistyczny one-pager',
    visual: `STYL: wszystko na jednej stronie, kotwice do sekcji, maksymalna prostota i szybkość.
PALETA (jako zmienne CSS): bardzo ograniczona — tylko --bg biały i --accent jeden kolor, --text niemal czarny.
TYPOGRAFIA (jako zmienne CSS): jedna para fontów, prosty neutralny sans na całość.
LAYOUT:
1. Nav = wyłącznie kotwice do sekcji (Usługi / O nas / Kontakt) + numer telefonu, bez rozbudowanego menu.
2. Hero krótki: nagłówek + jedno zdanie opisu + jeden CTA, BEZ dużego zdjęcia tła (lekka, szybka strona) — co najwyżej mała ilustracja/ikona.
3. Sekcja USŁUGI: prosta lista ikon w jednym rzędzie (nie karty, nie zdjęcia) z krótką etykietą pod każdą.
4. Jedna połączona sekcja "O nas + opinie": krótki akapit o firmie + 1-2 krótkie zdania opinii klientów pod spodem, bez rozbudowanej oprawy graficznej.
5. Kontakt na końcu: telefon, prosty formularz (imię, telefon, wiadomość), adres tekstem (bez mapy).
6. Stopka jednolinijkowa: prawa autorskie + telefon.`
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

function buildHydraulikTokens() {
  return {
    nazwa: '{{NAZWA_STRONY}}',
    nazwa_strony: '{{NAZWA_STRONY}}',
    slug: '{{SLUG}}',
    branza: 'Hydraulik',
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

  const firmaTokens = buildHydraulikTokens();
  const results = [];

  console.log('Generuję 6 wariantów Hydraulika (1 free + 5 pro)...\n');

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

  // Prosty gallery index do podglądu wszystkich 6 na jednej stronie.
  const indexHtml = '<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<meta name="robots" content="noindex, nofollow">' +
    '<title>Pilot: Hydraulik — 6 wariantów</title>' +
    '<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:60px auto;padding:0 24px;line-height:1.6}' +
    'h1{font-size:24px}a.card{display:block;border:1px solid #ddd;border-radius:10px;padding:16px 20px;margin-bottom:12px;text-decoration:none;color:#111}' +
    'a.card:hover{border-color:#888}.tier{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#888}</style></head><body>' +
    '<h1>Pilot: Hydraulik — 6 wariantów wizualnych</h1>' +
    results.map(r => r.ok
      ? '<a class="card" href="' + r.id + '.html"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong></a>'
      : '<div class="card" style="border-color:#c00;color:#c00"><div class="tier">' + r.tier + '</div><strong>' + r.name + '</strong> — BŁĄD: ' + r.error + '</div>'
    ).join('\n') +
    '</body></html>';
  fs.writeFileSync(path.join(PREVIEW_DIR, 'index.html'), indexHtml, 'utf8');

  console.log('\nGotowe. Pliki: ' + PILOT_DIR + ' oraz ' + PREVIEW_DIR);
  const ok = results.filter(r => r.ok).length;
  console.log(ok + '/' + VARIANTS.length + ' wygenerowanych poprawnie.');
}

main();
