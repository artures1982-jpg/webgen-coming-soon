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
  {
    id: 'studio-paznokci-2-express',
    tier: 'pro',
    name: 'Express / ostatnia chwila',
    visual: `STYL: pierwszy wariant PRO tej branży — adaptacja archetypu "Szybka interwencja 24h"
(znanego z Hydraulika/Elektryka) na branżę beauty. KRYTYCZNE: w hydraulik-2/elektryk-2 pilność
wynika z ZAGROŻENIA (awaria, porażenie prądem) — w studiu paznokci NIE MA zagrożenia, więc NIE
kopiuj tamtej ramy "ostrzeżenie/niebezpieczeństwo". Tu pilność wynika z OGRANICZONEJ DOSTĘPNOŚCI
i tempa: "masz wydarzenie dziś wieczorem i potrzebujesz paznokci NA JUŻ", "wpadka w manicure przed
ważnym spotkaniem", ekspresowe zabiegi 20-30 minut, zapisy na ostatnią chwilę. To ENERGIA i TEMPO,
nie ALARM.

To pierwszy wariant PRO w systemie po decyzji z 26.08.2026 (patrz .claude/agents/designer-ux-ui.md
sekcja "Wariant 1 spokojny, wariant 2+ może żyć") — NALEŻY użyć ruchu: poświata/glow, shimmer,
pulsowanie, poruszający się pasek. Animuj transform/opacity, nie box-shadow/width w pętli.

WYMÓG prefers-reduced-motion — KONKRETNA LISTA (nie polegaj wyłącznie na ogólnej klauzuli
powyżej, wymień to explicite w CSS): WSZYSTKIE poniższe animowane elementy muszą mieć swój
keyframe/transition wyłączony albo zredukowany do zwykłego przejścia statycznego pod
@media (prefers-reduced-motion: reduce) — (1) pulsująca plakietka "Dziś dostępne miejsca" w nav,
(2) świecąca plama w tle hero, (3) shimmer-sweep na przycisku CTA w nav, (4) shimmer-sweep na
przycisku CTA w hero, (5) marquee/przesuwanie paska "Dziś dostępne" (pod reduced-motion: pasek
statyczny, nie przesuwający się — treść wciąż czytelna, nie ukryta), (6) jednorazowy shimmer kart
zabiegów przy wjeździe w viewport, (7) fade-in+translateY sekcji USP, (8) pulsujące tło banera
w sekcji kontakt. Żadna z tych ośmiu animacji nie jest zwolniona z tego wymogu.

PALETA (jako zmienne CSS) — ciemna, świecąca, inna niż OBA punkty odniesienia (hydraulik-2:
czerwień #e0361c na BIAŁYM tle, elektryk-2: pomarańcz #ff5a1f na BIAŁYM tle — oba jasne w tle) i
inna niż studio-paznokci-1 (ciepła kość słoniowa + dusty-rose): --bg głęboki ciemny bakłażan/plum
(np. #1f1420), --surface odrobinę jaśniejszy ciemny plum (np. #2c1c2c), --accent żywy neonowy
róż/magenta (np. #ff4d8f — kolor ze zdjęcia hero, NIE czerwień/pomarańcz hazardu jak
hydraulik-2/elektryk-2), --accent-dark głębsza magenta/wiśnia (np. #c22a68), --text ciepła
biel, --muted stonowany mauve-szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki odważny, ekspresyjny display font (np. Unbounded — inny
niż Playfair Display z wariantu 1, inny niż Archivo/Barlow Condensed z hydraulik-2/elektryk-2),
tekst czytelny geometryczny sans (np. Outfit).

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tego URL-a; to NIE jest opcjonalne):
- JEDYNE zdjęcie strony, tło hero: dramatyczne zbliżenie na dłoń z manicure w neonowym
  różowo-fioletowym oświetleniu, mocno stylizowane, klimat "nocnego expressu":
  https://images.pexels.com/photos/7230841/pexels-photo-7230841.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
  UWAGA — ŚWIADOMY WYJĄTEK: reszta strony (w tym karty zabiegów w sekcji "Ekspresowe zabiegi")
  ŚWIADOMIE bez zdjęć — glow/kolor/ruch niosą estetykę zamiast fotografii (kontrast wobec
  wariantu 1, który jest bardzo fotograficzny — galeria portfolio); to odstępstwo od ogólnej
  zasady ZASADY.md "każda karta usługi dostaje własne zdjęcie", nie przeoczenie — nie zgłaszać
  w QA jako brak.

LAYOUT — inny mechanizm niż hydraulik-2/elektryk-2 (pulsujący pasek alarmowy nad nav, gigantyczny
klikalny numer telefonu w hero, siatka ikon zagrożeń, pozioma listwa bezpieczeństwa+zdjęcie,
warn-box w kontakcie) i inny niż studio-paznokci-1 (wyśrodkowany nav, split hero+karta rezerwacji,
cennik-menu, galeria, medaliony, minimalistyczne cytaty):
1. Nav: ciemna, logo PO LEWEJ (nie wyśrodkowane jak wariant 1) + linki, obok CTA mała świecąca
   plakietka pulsująca "🟢 Dziś dostępne miejsca" (animacja: delikatne pulsowanie opacity/scale
   w pętli, wyłączona pod prefers-reduced-motion) + przycisk "Zapisz się express" z efektem
   glow/shimmer na hover (przesuwający się gradient — animowany background-position).
2. Hero: zdjęcie z listy powyżej jako pełnoekranowe tło z ciemnym gradient-overlay, ZA tekstem
   animowana świecąca plama (radial-gradient w --accent, keyframe pulsujący opacity/scale w tle,
   subtelnie, wyłączona pod prefers-reduced-motion), nagłówek o ekspresowych zabiegach na już,
   duży przycisk CTA telefon z animowanym shimmer-sweep (przesuwający się jasny pasek przez
   przycisk w pętli, NIE ring-pulse jak w elektryk-2 — inny mechanizm animacji).
3. PASEK "Dziś dostępne" — poruszający się poziomo pasek (marquee: @keyframes translateX w pętli,
   pauza na hover, wyłączony/statyczny pod prefers-reduced-motion) z rotującymi dostępnymi
   godzinami na dziś (np. "14:30 wolne · 16:00 wolne · 17:45 wolne · Zadzwoń: {{TELEFON}} ·"
   powtórzone w pętli) — to dosłowne zastosowanie "poruszającego się paska" z nowych wytycznych.
4. Sekcja "Ekspresowe zabiegi": siatka 3-4 kart krótkich zabiegów (Express manicure 20 min,
   Poprawka na już 15 min, Express pedicure 25 min, Doklejenie 1-2 paznokci) z czasem+ceną,
   subtelny glow-border (box-shadow z color-mix w --accent) na hover, i JEDNORAZOWY shimmer-sweep
   odtwarzany raz gdy karta wjeżdża w viewport (IntersectionObserver + klasa .visible).
5. Sekcja "Dlaczego u nas na już": 3-4 plakietki USP (Zawsze mamy okienko na ekspresowy zabieg /
   Certyfikowane produkty / Sterylne narzędzia / Płatność online z góry) z fade-in przy scrollu
   (IntersectionObserver, opacity+translateY), NIE statyczna siatka jak w innych wariantach.
6. FAQ — accordion, ciemna stylistyka spójna z resztą wariantu.
7. Kontakt: pasmo CTA na ciemnym tle z animowanym tłem (delikatny pulsujący radial-gradient jak
   w hero, spójność), duży przycisk telefonu z shimmer, pod spodem pasek danych kontaktowych +
   mapa dojazdu (patrz WYMÓG — MAPA DOJAZDU powyżej; mapa może zostać w jasnej wersji Google Maps
   w ramce z --accent border, to nie problem estetyczny). UWAGA — ŚWIADOMY WYJĄTEK: bez formularza
   (ten sam powód co wariant 1 — telefon jest szybszy niż formularz dla usługi "na już").
8. Stopka: ciemna, wyśrodkowana, minimalna, jedna linia + copyright.`
  },
  {
    id: 'studio-paznokci-3-nowoczesny-cyfrowy',
    tier: 'pro',
    name: 'Nowoczesny cyfrowy',
    visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" — w Hydrauliku/Elektryku to formularz
wyceny/zgłoszenia zamiast telefonu jako primary CTA. Dla studia paznokci to NATURALNE 1:1 —
rezerwacja online (Booksy-style) zamiast dzwonienia jest realną, powszechną praktyką w tej
branży, nie wymaga reframingu jak archetyp 2. Duch: "umów wizytę online w 60 sekund, zobacz
dostępne terminy od razu, bez rozmowy telefonicznej".

Trzeci wariant tej branży — ZASADY.md sekcja 0 (bespoke względem hydraulik-3-nowoczesny-cyfrowy.html
i elektryk-3-nowoczesny-cyfrowy.html, przeczytaj OBA wyłącznie jako inspirację ducha, nie jako
plik bazowy) i różnicowanie względem studio-paznokci-1 (jasna kość słoniowa+dusty-rose) i
studio-paznokci-2 (ciemny plum+neonowa magenta) — ten wariant też ciemny (spójne z archetypem
"Nowoczesny cyfrowy" u obu poprzedników), ale INNY odcień ciemnego tła i INNY akcent niż wariant 2,
żeby te dwa ciemne warianty tej samej branży nie zlewały się w jeden nastrój.

To wariant PRO — może/powinien używać ruchu (patrz .claude/agents/designer-ux-ui.md sekcja
"Wariant 1 spokojny, wariant 2+ może żyć"), ale UŻYJ INNYCH technik animacji niż wariant 2 (tam:
shimmer-sweep na CTA, marquee pasek, pulsująca kropka, PULSUJĄCA POŚWIATA W TLE — hero-glow/
contact-glow z keyframe glowPulse skalujący/zmieniający opacity radial-gradientu w pętli — i
fade-in kart) — powtórz co najwyżej fade-in przy scrollu (to uniwersalna, sensowna technika),
resztę zróżnicuj: UNIKAJ ciągle pulsującej plamy w tle (to już wariant 2), zamiast tego użyj (a)
wypełniającej się linii-gradientu w krokach "Jak to działa" (jednorazowa, odtwarzana przy wejściu
w viewport, NIE pętla) i (b) statycznej/hover-only poświaty-obwódki (box-shadow z color-mix w
--accent, BEZ własnego keyframe/pętli — czysty :hover transition) na kartach-chipach zabiegów,
zamiast marquee.

WYMÓG prefers-reduced-motion — KONKRETNA LISTA dla tego wariantu (nie polegaj wyłącznie na
ogólnej klauzuli): (1) jednorazowe fade-in+translateY kart-chipów w sekcji "Zabiegi" przy wejściu
w viewport, (2) jednorazowe wypełnianie się linii-gradientu między krokami w sekcji "Jak to
działa" przy wejściu w viewport — pod reduced-motion oba muszą pojawić się od razu w stanie
docelowym (opacity:1, linia wypełniona), bez animowanego przejścia, treść nigdy nie chowana.
Zwykłe hover-transition (np. obwódka na kartach-chipach, podświetlenie "wolnych" chipów godzin w
widgecie rezerwacji) NIE wymaga wyłączania pod reduced-motion — to nie jest nietrywialna
animacja w rozumieniu tego wymogu.

PALETA (jako zmienne CSS) — inna niż OBA punkty odniesienia (hydraulik-3: cyjan #22d3ee na
prawie-czarnym granacie #0a0e17, elektryk-3: fiolet #7c5cff na ciemnym fiolecie #0d0a1a) i inna
niż studio-paznokci-2 (plum+magenta): --bg chłodny, neutralny prawie-czarny grafit (NIE fioletowy/
plum jak wariant 2 — np. #0e1116), --surface odrobinę jaśniejszy chłodny grafit (np. #171b21),
--accent świeża emerald/mięta (np. #2dd4a7 — kolor wprost ze zdjęcia hero, inna rodzina barw niż
cyjan/fiolet/magenta already used), --accent-dark głębsza zieleń morska (np. #1a9873), --text
chłodna biel, --muted stonowany chłodny szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki nowoczesny geometryczny sans (np. Plus Jakarta Sans —
inny niż Space Grotesk/Sora u poprzedników), tekst czytelny sans (np. Instrument Sans).

PRAWDZIWE ZDJĘCIA (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tych URL-i; to NIE jest opcjonalne):
- HERO (mały, częściowo zasłonięty przez widget rezerwacji — patrz LAYOUT pkt 2): eleganckie
  dłonie ze stylizacją w odcieniach turkusu/zieleni, ciemne, nastrojowe tło, pierścionek z perłą:
  https://images.pexels.com/photos/34971922/pexels-photo-34971922.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA, zdjęcie 1 (wnętrze salonu — nowoczesne, czarno-białe, eleganckie): https://images.pexels.com/photos/13068379/pexels-photo-13068379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- GALERIA, zdjęcie 2 (stylizacja czarno-brokatowa z biżuterią, eleganckie tło): https://images.pexels.com/photos/32334805/pexels-photo-32334805.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT — inny mechanizm niż hydraulik-3/elektryk-3 (nav transparent→blur-on-scroll lub stały blur,
hero z pełnym zdjęciem/gradientem+formularz-karta, stats-strip/kpi-tiles, siatka/karuzela usług,
kroki numerowane/flow, siatka/lista opinii, why-grid, kontakt split/pełna-szerokość, stopka
gradient-line/scentrowana) i inny niż studio-paznokci-1/2:
1. Nav: ciemna, sticky, blur stały (nie transition-on-scroll). CTA to pigułka z małą ikoną
   kalendarza + "Rezerwuj online" (nie "Zapisz się"/"Wyceń online" — inne słownictwo niż
   poprzednicy), telefon jako drugorzędny link ikonowy obok.
2. Hero: 2 kolumny — lewo tekst (eyebrow, H1, lead, CTA), prawo GŁÓWNY element to makieta
   "widgetu rezerwacji" (glassmorphism karta): pozioma lista dni tygodnia (Pn Wt Śr Czw Pt Sob,
   jeden podświetlony jako wybrany) + siatka 6-8 "chipów" godzin, część wyszarzona ("zajęte"),
   część podświetlona akcentem ("wolne") — wygląda jak fragment realnej appki do rezerwacji, NIE
   zdjęcie ani gradient-mesh jak u poprzedników. Zdjęcie hero z listy powyżej widoczne jako
   zaokrąglony akcent PRZY/ZA widgetem (częściowo, mniejszy kadr, nie pełnoekranowe tło) — to
   spełnia wymóg prawdziwej fotografii bez robienia z niej dominującego elementu hero.
3. Sekcja "Jak to działa": 3 kroki jako pozioma listwa POŁĄCZONYCH kółek z wypełniającą się
   linią-gradientem między nimi (progress-bar/appka style — NIE numerowane boksy jak
   hydraulik-3, NIE flow ze strzałkami jak elektryk-3, NIE pionowy kręgosłup): Wybierz zabieg →
   Wybierz termin → Potwierdź rezerwację.
4. Sekcja "Zabiegi": siatka "wybieralnych" kart-chipów (nazwa + cena + mały wizualny znacznik
   przypominający zaznaczony checkbox/radio w rogu karty, na hover podświetlenie obwódką
   --accent) — styl appki do wyboru usługi, nie zwykłe karty z briefu wariantu 1/2. Fade-in przy
   scrollu (IntersectionObserver).
5. Sekcja "Galeria": 2 zdjęcia z listy powyżej w asymetrycznym układzie (jedno duże + jedno
   mniejsze z małą "pływającą" plakietką w stylu social media, np. "📍 Zobacz więcej w naszym
   studiu") — inny mechanizm niż siatka 3 równych kwadratów z wariantu 1.
6. Sekcja zaufania: mała pozioma listwa "⭐ 4.9 z X rezerwacji online" + JEDEN krótki cytat w
   stylu dymka czatu (chat-bubble, zaokrąglony róg jak w komunikatorze) — nie 2 duże cytaty jak
   wariant 1, nie brak sekcji jak wariant 2.
7. FAQ — accordion, ciemna stylistyka.
8. Kontakt/rezerwacja: rozbudowana, szersza wersja widgetu rezerwacji z hero (dni+godziny) jako
   finalne CTA + pod spodem pasek danych kontaktowych + mapa dojazdu (patrz WYMÓG — MAPA DOJAZDU
   powyżej). UWAGA — ŚWIADOMY WYJĄTEK: bez tradycyjnego formularza kontaktowego (imię/telefon/
   wiadomość) — widget rezerwacji JEST formularzem tego wariantu, zgodnie z duchem "cyfrowy,
   samoobsługowy".
9. Stopka: ciemna, prosta, z małą plakietką "🟢 Rezerwacja online czynna 24/7" (cyfrowy akcent,
   inny pomysł niż linia-akcent wariantu 2 czy wyśrodkowana stopka wariantu 1).`
  },
  {
    id: 'studio-paznokci-4-rodzinna-firma',
    tier: 'pro',
    name: 'Rodzinna firma',
    visual: `STYL: archetyp "Rodzinna firma" — w Hydrauliku/Elektryku to jednoosobowa działalność,
którą poznajesz z imienia, nie tylko z faktury. Dla studia paznokci to NATURALNE 1:1, tak jak
u poprzedników — jednoosobowe/rodzinne studio, właścicielka znana klientkom z imienia, bez
korporacyjnego dystansu. Duch: "nie jesteś tu kolejnym numerem w kalendarzu — jestem tu ja, ta
sama osoba od pierwszej wizyty do dzisiaj". Drobna, świadoma różnica w słownictwie względem
poprzedników (którzy piszą "nie tylko z faktury") — u nas naturalniejsze dla tej branży jest
"nie tylko z Instagrama" (bo w branży beauty umawianie się przez DM na Instagramie jest bardzo
powszechną, rozpoznawalną praktyką) — użyj tego zamiennika w H1/eyebrow zamiast kopiować frazę
"z faktury" 1:1.

Czwarty wariant tej branży — ZASADY.md sekcja 0 (bespoke względem
hydraulik-4-rodzinna-firma.html i elektryk-4-rodzinna-firma.html, przeczytaj OBA wyłącznie jako
inspirację ducha, nie jako plik bazowy) i różnicowanie względem studio-paznokci-1 (jasna kość
słoniowa+dusty-rose), studio-paznokci-2 (ciemny plum+neonowa magenta) i studio-paznokci-3 (ciemny
grafit+emerald) — ten wariant wraca do jasnej, ciepłej palety jak wariant 1, ale INNY odcień i
INNA temperatura tła niż wariant 1, żeby te dwa jasne warianty tej samej branży nie zlewały się —
patrz PALETA poniżej.

To wariant PRO — może używać ruchu (patrz .claude/agents/designer-ux-ui.md sekcja "Wariant 1
spokojny, wariant 2+ może żyć"), ale ton archetypu jest ciepły/osobisty/stonowany, nie
cyfrowy/appkowy jak wariant 3 ani pilny jak wariant 2 — dlatego ogranicz się do JEDNEJ,
delikatnej, uniwersalnej techniki: jednorazowy fade-in+translateY (IntersectionObserver) na
elementach listy "Nasza historia" i wierszach cennika przy wejściu w viewport — to ta sama
uniwersalna technika co w wariancie 3 (tam użyta na kartach-chipach), dozwolona do powtórzenia
wprost z brief-u wariantu 3. NIE dodawaj shimmer/marquee/pulsującej kropki/pulsującej poświaty ani
żadnej pętlącej się animacji — to złamałoby ciepły, spokojny ton tego archetypu w każdej branży
(hydraulik-4 i elektryk-4 też są całkowicie statyczne, bez ruchu — to nie przypadek, to spójne
z duchem "rodzinna firma, bez sztuczek marketingowych").

WYMÓG prefers-reduced-motion: fade-in listy "Nasza historia" i wierszy cennika musi mieć
natychmiastowy stan końcowy (opacity:1, bez translateY) pod reduced-motion, bez animowanego
przejścia, treść nigdy nie chowana. Zwykłe hover-transition (np. na przyciskach, wierszach
cennika) nie wymaga wyłączania.

PALETA (jako zmienne CSS) — inna niż OBA punkty odniesienia (hydraulik-4: terakota #c1613a na
prawie-białej kości słoniowej #faf1e4, elektryk-4: szałwiowa zieleń #6b8f5e na prawie-białej
kremowej #faf6ec) i inna niż studio-paznokci-1 (dusty-rose #c9718c na prawie-białej #faf3ee):
--bg ciepły, WYRAŹNIE ciemniejszy/bardziej nasycony niż wszystkie trzy powyższe jasne tła —
ciepły beż-taupe, NIE prawie-biały (np. #ece1d3), --surface cieplejsza, jaśniejsza karta (np.
#f7efe3), --accent ciepły karmel/miodowy brąz-złoto (np. #b8763f — inna rodzina barw niż
róż/terakota-czerwień/zieleń already used, bliżej żółci/brązu), --accent-dark głębszy karmel
(np. #8a5527), --text ciepły ciemny brąz, --muted stonowany ciepły szaro-brąz.
TYPOGRAFIA (jako zmienne CSS): nagłówki ciepły, osobisty serif (np. Lora — inny niż Playfair
Display/Fredoka/Quicksand u poprzedników), tekst czytelny sans (np. Figtree — inny niż
Mulish/Nunito/Karla/Outfit/Instrument Sans already used). Sprawdź grep po innych plikach
templates/pilot/*.html żeby potwierdzić że ta para nie koliduje z żadną już użytą.

PRAWDZIWE ZDJĘCIE (Pexels, wyselekcjonowane ręcznie i wizualnie zweryfikowane — użyj DOKŁADNIE
tego URL-a; to NIE jest opcjonalne; użyj tego SAMEGO zdjęcia w hero i w sekcji kontakt, mniejsze,
DOKŁADNIE jak robią to hydraulik-4 i elektryk-4 — to świadomy, powtarzalny element archetypu
"poznaj osobę za firmą", nie naruszenie zasady bespoke):
- Uśmiechnięta stylistka paznokci w okularach, trzymająca frezarkę, jasne neutralne tło studyjne,
  ciepły, bezpośredni uśmiech: https://images.pexels.com/photos/18090215/pexels-photo-18090215.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT — inny mechanizm niż hydraulik-4 (owalne/blob zdjęcie + pozioma 4-punktowa oś czasu +
lista usług z kropkami + quote-band na całą szerokość), elektryk-4 (zdjęcie z dymkiem-cytatem +
2-kolumnowy grid historia/chipy + siatka usług z checkmarkami + karta kontaktowa 2-kolumnowa) —
i UWAGA, sprawdź też realny plik studio-paznokci-1-zaufany-fachowiec.html, nie tylko 2/3: jego hero
to DOKŁADNIE "proste duże zaokrąglenie (1.4rem), zdjęcie po prawej stronie obok tekstu, bez
blob/bez bąbla" (.hero-photo-wrap/.hero-photo), a jego sekcja cennika to DOKŁADNIE kropkowany
dotted-leader "bistro menu" (.cennik-row .dots{border-bottom:2px dotted...}) — czyli oba mechanizmy
poniżej, w wersji "sprawdź oba pliki referencyjne i wybierz przeciwny", kolidowałyby z najbliższym
sąsiadem tej samej branży, nie tylko z hydraulik-4/elektryk-4. Poniższe punkty 2 i 4 są już
poprawione tak, żeby tego uniknąć:
1. Nav: jasna, statyczna (bez blur/sticky-transition, prosty sticky), CTA to zwykły przycisk
   "Zadzwoń: {{TELEFON}}" (nie pigułka z ikoną kalendarza jak wariant 3, nie avail-badge jak
   wariant 2) — telefon jako GŁÓWNE CTA tego wariantu (nie rezerwacja online jak wariant 3, zgodnie
   z duchem "osobisty kontakt z właścicielką", nie appka).
2. Hero: zdjęcie w prostym dużym zaokrągleniu (np. 2rem, NIE blob-organiczny jak hydraulik-4, NIE
   1.4rem plain-rounded-rect jak studio-paznokci-1) w kwadratowym/pionowym kadrze PO LEWEJ stronie
   (studio-paznokci-1 ma zdjęcie po prawej — wybierz lewo, żeby nie powielić 1:1 jego mechanizmu;
   to też inny wybór niż hydraulik-4/elektryk-4, które akurat obie mają zdjęcie po lewej, ale ich
   kształt zdjęcia — blob / dymek-cytat — jest inny niż tu, więc sama strona nie wystarczy jako
   różnicowanie), obok tekst: eyebrow, H1 z frazą "z Instagrama" (patrz STYL powyżej), krótki
   spersonalizowany lead (1-2 zdania, NIE hero-quote w osobnym bloku jak hydraulik-4 ani
   hero-bubble jak elektryk-4 — cytat/osobisty akcent umieść WYŁĄCZNIE w sekcji kontakt, nie
   duplikuj go w hero), CTA telefon. Żeby dodatkowo odróżnić kadr od studio-paznokci-1 (który ma
   tylko cień pod zdjęciem, bez żadnej ramki), dodaj prosty, płaski blok w kolorze --surface
   przesunięty o ok. 12-16px w prawo-dół ZA zdjęciem (offset "widoczna karta w tle" — nie
   organiczny blob, nie dymek, tylko drugi prostokąt z tym samym dużym border-radius wystający
   spod zdjęcia) — to samodzielny, rozpoznawalny mechanizm ramowania zdjęcia, którego nie ma żaden
   z trzech plików referencyjnych.
3. Sekcja "Nasza historia": PIONOWA lista 3 kamieni milowych z cienką pionową linią-kręgosłupem
   po lewej i małymi kółkami-znacznikami na linii (NIE pozioma oś z 4 kropkami jak hydraulik-4,
   NIE 2-kolumnowy grid tekst+chipy jak elektryk-4, NIE medaliony z liczbami jak studio-paznokci-1)
   — fade-in przy scrollu.
4. Sekcja "Nasze usługi" / cennik: lista w stylu "rodzinny cennik", ale INNY mechanizm niż
   studio-paznokci-1 (który już używa dokładnie kropkowanego dotted-leadera w 2-kolumnowym gridzie,
   .cennik-row .dots{border-bottom:2px dotted...}) — tu zamiast tego: JEDNOKOLUMNOWA lista
   pogrupowana pod 2 krótkimi nagłówkami podkategorii (np. "Rączki" i "Stópki"), każdy wiersz usługi
   to nazwa + czas trwania po lewej i cena PO PRAWEJ w zaokrąglonej plakietce (pill) z tłem
   color-mix(in srgb, var(--accent) 14%, transparent) i tekstem var(--accent-dark) — bez kropkowanej
   linii-wypełniacza, wiersze oddzielone tylko cienką linią border-bottom w kolorze
   color-mix(in srgb, var(--text) 10%, transparent) (NIE lista z kropkami jak hydraulik-4, NIE grid
   z checkmarkami jak elektryk-4, NIE karty-chipy jak wariant 3, NIE dotted leader jak wariant 1) —
   ciepły, osobisty, "rodzinny cennik" feel. Fade-in przy scrollu.
5. FAQ — accordion, jasna stylistyka spójna z resztą wariantu.
6. Kontakt: karta z zaokrąglonym zdjęciem właścicielki (to samo zdjęcie co hero, mniejsze),
   bezpośredni numer telefonu jako duży, czytelny link, JEDEN krótki, ciepły cytat klientki POD
   zdjęciem/numerem (to jedyne miejsce w tym wariancie z cytatem klientki), pod spodem pasek
   danych kontaktowych + mapa dojazdu (patrz WYMÓG — MAPA DOJAZDU powyżej).
7. Stopka: jasna, prosta, wyśrodkowana, jedna linia + copyright (bez plakietek/badge'y — inny,
   bardziej stonowany pomysł niż stopki wariantów 2/3).`
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
