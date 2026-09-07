#!/usr/bin/env node
// scripts/generate-fryzjer-barber-pilot.js — pilot: warianty wizualne dla Fryzjer / Barber
// (start od wariantu 1 free), czwarta branża w systemie 5 archetypów po Hydrauliku, Elektryku
// i Studiu paznokci.
// Wynik NIE trafia do templates/manifest.json (produkcyjny, dziś pusty) — zapisywany osobno
// w templates/pilot/ + kopiowany do preview/fryzjer-barber/ jako statyczne strony pod podgląd.
//
// Użycie: node scripts/generate-fryzjer-barber-pilot.js
// Wymaga ANTHROPIC_API_KEY w .env — w praktyce warianty generowane ręcznie przez sesje
// Claude Code (patrz docs/produkcja-szablonow/README.md), ten skrypt to źródło promptów.

const fs = require('fs');
const path = require('path');
const { buildTemplatePrompt } = require('../lib/promptBuilder');

const ROOT = path.join(__dirname, '..');
const PILOT_DIR = path.join(ROOT, 'templates', 'pilot');
const PREVIEW_DIR = path.join(ROOT, 'preview', 'fryzjer-barber');

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

// Identyczne co do słowa z generate-hydraulik-pilot.js / generate-elektryk-pilot.js /
// generate-studio-paznokci-pilot.js — te zasady są branżowo-niezależne, spisane w
// docs/produkcja-szablonow/ZASADY.md.
const CSS_VAR_REQUIREMENT = `

WYMÓG TECHNICZNY (personalizacja bez regeneracji — KRYTYCZNE):
Zdefiniuj w :root DOKŁADNIE te zmienne CSS: --accent, --accent-dark (ciemniejszy wariant do
hover/tekstu), --bg (tło strony), --surface (tło kart/sekcji), --text (główny kolor tekstu),
--muted (pomocniczy kolor tekstu), --head (font-family nagłówków), --body (font-family tekstu).
W CAŁYM pozostałym CSS używaj WYŁĄCZNIE var(--nazwa) do każdego koloru i fontu — ani jednego
literału hex ani nazwy fontu poza samą deklaracją w :root. Jedyny dopuszczalny wyjątek: słowa
kluczowe "white"/"black" WEWNĄTRZ color-mix() jako neutralne punkty odniesienia — nigdy literały
hex, nawet wewnątrz color-mix().

WYMÓG JĘZYKOWY — ODMIANA NAZWY MIASTA (KRYTYCZNE):
{{MIASTO}} to token podstawiany DOWOLNYM polskim miastem w mianowniku. NIGDY "w {{MIASTO}}",
"z {{MIASTO}}", "do {{MIASTO}}", "poza {{MIASTO}}" — zamiast tego "w mieście {{MIASTO}}",
"na terenie miasta {{MIASTO}}", "poza miastem {{MIASTO}}", albo myślnik/dwukropek: "Usługi —
{{MIASTO}}". {{MIASTO}} samodzielnie (adres, tytuł, podpis) jest zawsze bezpieczne.

WYMÓG — MAPA DOJAZDU (KRYTYCZNE):
<iframe src="https://www.google.com/maps?q={{ADRES}}, {{MIASTO}}&output=embed" loading="lazy"
referrerpolicy="no-referrer-when-downgrade" style="border:0;width:100%;height:320px"></iframe>

PUŁAPKA CSS — aspect-ratio na <img> z atrybutami width/height (KRYTYCZNE): jeśli <img> ma HTML
width/height ORAZ CSS width+aspect-ratio bez jawnego height, część przeglądarek usztywnia
wysokość na atrybut HTML i ignoruje aspect-ratio — zawsze dopisz height:auto w tej samej regule.

PUŁAPKA — przycisk telefonu/CTA z pełnym tekstem w nav na mobile (KRYTYCZNE): na <700px
zaprojektuj świadomy kolaps (skrócony tekst / sama ikona / schowanie do menu) — nie kopiuj
mechaniki 1:1 z innej branży.

PUŁAPKA — overflow-x:auto na .nav .wrap PRZYCINA rozwijane menu mobilne (KRYTYCZNE, patrz
ZASADY.md sekcja 6.4): jeśli wariant ma hamburger + mobilny dropdown zagnieżdżony wewnątrz
elementu z overflow-x:auto, dropdown zostanie przycięty do zera wysokości (overflow-x auto
wymusza overflow-y auto). Rozdziel linki na .nav-links-desktop (w .wrap) i .nav-links-mobile
(rodzeństwo .wrap, POZA nim), JS celuje po ID nie po klasie. Zawsze faktycznie KLIKNIJ hamburger
na wąskim viewporcie przy odbiorze, nie tylko czytaj CSS.

WYMÓG TREŚCI: konkretne liczby i daty (lata na rynku, liczba klientów, procenty, rok założenia)
wstawiaj NORMALNIE jako gotową treść docelową. Zakazane wyłącznie: fikcyjne nazwy firm-klientów
w "zaufali nam" (użyj generycznych etykiet kategorii) i wymyślone imię właściciela — nie ma na
to tokenu, tylko {{NAZWA_STRONY}}.

ZASADA 0 — BESPOKE WYKONANIE, ZERO REUŻYCIA LAYOUTU MIĘDZY BRANŻAMI (KRYTYCZNE, patrz
docs/produkcja-szablonow/ZASADY.md sekcja 0): pliki odpowiedników tego archetypu w innych
branżach wolno przeczytać WYŁĄCZNIE jako inspirację ducha — NIGDY jako plik bazowy do
skopiowania. Każda sekcja musi dostać inny mechanizm wizualny. Paleta też musi się różnić
nastrojem (jasność/temperatura tła), nie tylko odcieniem akcentu — patrz
.claude/agents/designer-ux-ui.md sekcja "Baw się jasnością i tłem". Sprawdź grepem po
templates/pilot/*.html że wybrany hex/font faktycznie nie koliduje z żadnym już istniejącym
wariantem w CAŁYM systemie (nie tylko tej branży).

ZDJĘCIA — ZASADY.md sekcja 4: URL-e muszą być prawdziwe, wizualnie zweryfikowane zdjęcia
Pexels (krótkie 1-2 słowne zapytania, obejrzyj miniaturkę przed użyciem, żadne zdjęcie nie może
się powtórzyć między wariantami TEJ branży ani kolidować z ID już użytymi w
templates/pilot/*.html), każda karta usługi dostaje własne zdjęcie, overlay 50-80% krycia.`;

const SYSTEM_BASE = 'Jesteś ekspertem web designu tworzącym profesjonalne strony dla polskich firm lokalnych.\n' +
  'Tworzysz WYŁĄCZNIE kompletny, gotowy do użycia kod HTML z wbudowanym CSS.\n' +
  'Nie dodajesz żadnych komentarzy, wyjaśnień ani markdown — tylko czysty HTML.';

// Dane przykładowe (wersja "wypełniony") — ten sam zestaw co w pozostałych branżach, żeby dało
// się porównywać style 1:1 (patrz README.md).
const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'SharpCut',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@sharpcut.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'sharpcut-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 20:00',
  '{{GODZINY_SOB}}': '9:00 – 15:00',
};

const VARIANTS = [
  {
    id: 'fryzjer-barber-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: "Zaufany fachowiec" — ciepły, męski, budujący zaufanie do barbera/fryzjera,
z naciskiem na przejrzysty cennik usług i realne zdjęcia wykonanych strzyżeń/brody (portfolio).
To pierwszy wariant zupełnie nowej branży (Fryzjer / Barber) w systemie 5 archetypów po
Hydrauliku, Elektryku i Studiu paznokci — przeczytaj ZASADĘ 0 powyżej przed kodowaniem. Punkty
odniesienia do odróżnienia: hydraulik-1, elektryk-1, studio-paznokci-1-zaufany-fachowiec.html
(przeczytaj wszystkie trzy WYŁĄCZNIE jako inspirację ducha archetypu, nigdy jako bazę).

PALETA (jako zmienne CSS, zablokowane wartości — sprawdzone grepem, że nie kolidują z żadnym
istniejącym wariantem w templates/pilot/*.html): --bg ciepły, stonowany szaro-beżowy "kamienny"
odcień, WYRAŹNIE mniej różowy/pomarańczowy niż wszystkie dotychczasowe jasne tła (np. #f1ede5 —
bliżej neutralnej szarości niż ivory/ecru użyte gdzie indziej), --surface odrobinę ciemniejszy
ciepły szaro-beż, wyraźnie różny od --bg (np. #e6e0d4), --accent głęboka bordowo-winna czerwień,
klimat skórzanego fotela barberskiego (np. #7a2430 — inna rodzina niż jaskrawa czerwień-pomarańcz
hydraulik-2/elektryk-2, inna niż dusty-rose studio-paznokci-1), --accent-dark jeszcze głębszy,
prawie czarny bordowy (np. #4a161e), --text ciepły prawie-czarny brąz, --muted stonowany
szaro-brąz.
TYPOGRAFIA (jako zmienne CSS): nagłówki mocny, klasyczny slab-serif z vintage-barbershop
charakterem (np. Bitter lub Roboto Slab), tekst czytelny grotesk (np. Karla). Zweryfikuj grepem
po templates/pilot/*.html że ta para nie koliduje z już użytymi.

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie 1-2 słowne zapytania: "barber",
"barbershop", "haircut man", "beard trim") — HERO (barber strzygący klienta w klasycznym wnętrzu
barbershopu, ciepłe światło), sekcja O NAS (wnętrze zakładu / stanowisko pracy), min. 3 zdjęcia
do galerii/portfolio (różne style strzyżenia/brody — fade, klasyczny undercut, golenie brzytwą).
Zero powtórzeń między wariantami tej branży.

LAYOUT — celowo inny mechanizm niż hydraulik-1, elektryk-1 i studio-paznokci-1 (patrz te pliki
dla przypomnienia ich konkretnych mechanizmów nav/hero/cennik/opinie/stopka — NIE powielaj
żadnego z nich):
1. Nav: sticky, logo po lewej jako prosty tekstowy monogram w plakietce (np. kwadrat z
   inicjałem), linki wyśrodkowane, CTA "Umów wizytę" jako przycisk z ostrą (nie zaokrągloną)
   krawędzią po prawej, telefon jako drugorzędny link tekstowy. Mobile <700px: kolaps do
   hamburgera zgodnie z PUŁAPKĄ overflow-x powyżej.
2. Hero: pełnoekranowe zdjęcie jako tło z ciemnym gradient-overlay (50-80% krycia), tekst
   wyśrodkowany w dolnej jednej trzeciej (nie górna połowa jak inne warianty), jeden wyraźny CTA
   + drugorzędny link "Zobacz cennik".
3. Sekcja CENNIK: tabela usług w 2 kolumnach (Strzyżenie, Broda, Golenie brzytwą, Strzyżenie +
   broda, Strzyżenie dziecięce, Modelowanie brody, Regulacja konturu, Pakiet VIP), każda pozycja
   jako wiersz z nazwą, czasem trwania i ceną PLN po prawej w prostym, "szyldowym" stylu
   (grubsza linia-separator, nie kropkowany dotted-leader jak studio-paznokci-1 — inny mechanizm).
4. Sekcja GALERIA/PORTFOLIO: siatka min. 3 zdjęć wykonanych stylizacji, prostokątne kadry z
   ostrymi rogami (nie zaokrąglone jak inne branże), krótki podpis pod każdym.
5. Sekcja O NAS: zdjęcie wnętrza/pracy w prostym kadrze PO JEDNEJ STRONIE + tekst obok +
   pozioma lista 3 statystyk (lata doświadczenia / liczba klientów / liczba zabiegów) jako
   proste liczby z podpisem, bez kółek-medalionów (inny mechanizm niż studio-paznokci-1).
6. Sekcja OPINIE: siatka 3 kart z krótkim cytatem + imieniem + miastem, prosta ramka, bez
   awatarów i gwiazdek jako osobnego elementu graficznego (mała plakietka "5.0" tekstowo).
7. Sekcja "Dlaczego my": 4 karty w rzędzie z ikoną + nazwą + krótkim opisem (np. Doświadczeni
   barberzy / Wysokiej jakości kosmetyki / Umów się online lub telefonicznie / Bez ukrytych
   kosztów).
8. FAQ — accordion, standardowo.
9. Kontakt: split 2-kolumnowy — formularz kontaktowy PO LEWEJ, dane kontaktowe + mapa dojazdu
   PO PRAWEJ (patrz WYMÓG — MAPA DOJAZDU powyżej).
10. Stopka: 3-kolumnowa (logo+opis / linki / godziny otwarcia), copyright na dole.`,
  },
  {
    id: 'fryzjer-barber-2-bez-kolejki',
    tier: 'pro',
    name: 'Bez kolejki / Walk-in',
    visual: `STYL: pierwszy wariant PRO tej branży — adaptacja archetypu "Szybka interwencja 24h"
(znanego z Hydraulika/Elektryka/Studia paznokci) na barbershop. W hydraulik-2/elektryk-2 pilność
wynika z ZAGROŻENIA — u nas, jak w studio-paznokci-2, nie ma zagrożenia. Tu pilność wynika z
TEMPA i DOSTĘPNOŚCI: "wpadnij bez zapisu, zero kolejki, szybkie strzyżenie w 20 minut przed
ważnym spotkaniem, wolne miejsca DZIŚ widoczne na żywo". To ENERGIA i TEMPO miejskiego
barbershopu z walk-inami, nie ALARM.

To wariant PRO — NALEŻY użyć ruchu (patrz .claude/agents/designer-ux-ui.md sekcja "Wariant 1
spokojny, wariant 2+ może żyć"): poświata/glow, shimmer, pulsowanie, poruszający się pasek.
Animuj transform/opacity, nie box-shadow/width w pętli.

WYMÓG prefers-reduced-motion — KONKRETNA LISTA (wymień explicite w CSS, nie polegaj wyłącznie
na ogólnej klauzuli): każdy animowany element musi mieć swój keyframe/transition wyłączony albo
zredukowany do statycznego stanu końcowego pod @media (prefers-reduced-motion: reduce) — m.in.
pulsująca plakietka dostępności w nav, świecąca plama w tle hero, shimmer-sweep na CTA,
marquee/przesuwający się pasek "wolne dziś" (statyczny, treść czytelna, nie ukryta pod
reduced-motion), jednorazowy shimmer/fade-in kart przy wjeździe w viewport. Wymień każdy element
z osobna w CSS, nie jedną ogólną regułą.

PALETA (jako zmienne CSS) — ciemna, świecąca, inna niż WSZYSTKIE dotychczasowe ciemne warianty
w systemie (hydraulik-2/elektryk-2 są jasne na białym tle, więc porównaj głównie ze
studio-paznokci-2 plum/magenta #1f1420/#ff4d8f, studio-paznokci-3 grafit/emerald #0e1116/#2dd4a7,
elektryk-3 fiolet #0d0a1a/#7c5cff, hydraulik-3 granat/cyjan #0a0e17/#22d3ee): --bg ciepły,
prawie-czarny brąz-węgiel drzewny (np. #1a1512 — cieplejszy niż wszystkie powyższe chłodne
czernie), --surface odrobinę jaśniejszy ciepły węgiel (np. #251e19), --accent nasycony
bursztynowo-złoty amber (np. #e0a527 — inna rodzina niż magenta/emerald/fiolet/cyjan already
used), --accent-dark głębszy bursztyn/miód (np. #a97615), --text ciepła biel, --muted stonowany
ciepły beż-szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki odważny, kanciasty display/condensed font (np. Oswald —
inny niż Unbounded/Space Grotesk/Sora/Fraunces already used), tekst czytelny sans (np. Work Sans).
Zweryfikuj grepem po templates/pilot/*.html.

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie zapytania: "barbershop interior",
"fade haircut", "barber tools") — jedno mocne, dynamiczne zdjęcie jako tło hero (klimat
"miejskiego barbershopu, ruch, energia") — pasuje do ducha "bez zdjęć w kartach, glow/kolor/ruch
niosą estetykę" jak studio-paznokci-2 (świadomy wyjątek od ogólnej zasady kart ze zdjęciami —
uzasadnij tak samo, nie zgłaszać w QA jako brak). Zero powtórzeń z innymi wariantami tej branży.

LAYOUT — inny mechanizm niż hydraulik-2/elektryk-2 (pulsujący pasek alarmowy nad nav, gigantyczny
klikalny telefon, siatka ikon zagrożeń) i inny niż studio-paznokci-2 (świecąca plama w hero,
marquee pasek godzin, karty zabiegów z jednorazowym shimmer):
1. Nav: ciemna, logo po lewej + linki, mała pulsująca plakietka "🟢 X wolnych miejsc dziś" obok
   CTA "Wpadnij bez zapisu" z animowanym obramowaniem (border-gradient animowany
   background-position, nie shimmer-sweep na tle przycisku jak studio-paznokci-2 — inny
   mechanizm animacji CTA).
2. Hero: zdjęcie jako pełnoekranowe tło z overlay, ZA tekstem animowana pozioma "smuga światła"
   przesuwająca się raz na kilka sekund (linear-gradient pasek animowany translateX, nie radial
   pulsująca plama jak studio-paznokci-2 — inny mechanizm), duży telefon-CTA ze statycznym
   glow-border (box-shadow color-mix, bez pętli) zamiast shimmer-sweep.
3. PASEK "Wolne dziś": poziomy marquee z rotującymi wolnymi godzinami, pauza na hover, statyczny
   pod reduced-motion.
4. Sekcja "Ekspresowe usługi": siatka 3-4 kart (Fade w 20 min, Podcinka na już, Golenie
   ekspresowe, Strzyżenie + broda combo) z czasem+ceną, jednorazowy fade-in przy scrollu
   (IntersectionObserver), subtelny glow-border na hover.
5. Sekcja "Dlaczego bez zapisu": 3-4 plakietki USP z fade-in przy scrollu.
6. FAQ — accordion, ciemna stylistyka.
7. Kontakt: pasmo CTA na ciemnym tle, duży przycisk telefonu, pod spodem pasek danych + mapa
   dojazdu. Świadomy wyjątek: bez formularza (telefon/wpadnięcie są szybsze niż formularz dla
   usługi "na już") — nie zgłaszać w QA jako brak.
8. Stopka: ciemna, minimalna, jedna linia + copyright.`,
  },
  {
    id: 'fryzjer-barber-3-nowoczesny-cyfrowy',
    tier: 'pro',
    name: 'Nowoczesny cyfrowy',
    visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" — rezerwacja online (Booksy-style)
zamiast dzwonienia jako primary CTA. Naturalne 1:1 dla tej branży, tak jak u
studio-paznokci-3 — barbershopy powszechnie korzystają z rezerwacji online. Duch: "umów wizytę
online w 60 sekund, zobacz dostępne terminy od razu".

Trzeci wariant tej branży — ZASADY.md sekcja 0 (bespoke względem hydraulik-3, elektryk-3,
studio-paznokci-3-nowoczesny-cyfrowy.html — przeczytaj WSZYSTKIE trzy wyłącznie jako inspirację
ducha) i różnicowanie względem fryzjer-barber-1 (kamienny beż + bordo) i fryzjer-barber-2
(ciepły węgiel + amber) — ten wariant też ciemny (spójne z archetypem "Nowoczesny cyfrowy" u
poprzedników), ale INNY odcień ciemnego tła i INNY akcent niż wariant 2, żeby te dwa ciemne
warianty tej samej branży nie zlewały się.

Wariant PRO — może/powinien używać ruchu, ale UŻYJ INNYCH technik niż wariant 2 (tam:
border-gradient CTA, przesuwająca się smuga światła w hero, marquee pasek). Tu: jednorazowy
fade-in przy scrollu (uniwersalna technika, dozwolona do powtórzenia) + wypełniająca się
linia-gradient w krokach "Jak to działa" (jednorazowa, nie pętla) + statyczna hover-only
poświata-obwódka na kartach usług (bez keyframe/pętli).

WYMÓG prefers-reduced-motion — KONKRETNA LISTA: (1) fade-in+translateY kart usług przy wejściu w
viewport, (2) wypełnianie się linii-gradientu między krokami "Jak to działa" przy wejściu w
viewport — oba muszą mieć natychmiastowy stan końcowy pod reduced-motion, treść nigdy nie
chowana. Zwykłe hover-transition nie wymaga wyłączania.

PALETA (jako zmienne CSS) — inna niż WSZYSTKIE dotychczasowe ciemne warianty w systemie
(hydraulik-3 cyjan/granat, elektryk-3 fiolet, studio-paznokci-3 emerald/grafit) i inna niż
fryzjer-barber-2 (ciepły węgiel #1a1512 + amber #e0a527): --bg chłodny, neutralny grafitowo-
-niebieski, WYRAŹNIE chłodniejszy niż wariant 2 (np. #0f1418 — chłodny slate, nie ciepły brąz),
--surface odrobinę jaśniejszy chłodny slate (np. #182027), --accent nasycony elektryczny
błękit-cyan-blue (np. #3d8ef0 — wyraźnie różny od cyjanu hydraulik-3 #22d3ee: bardziej
niebieski niż turkusowy, sprawdź grepem że to faktycznie inny odcień, nie kosmetyczna zmiana o
kilka stopni), --accent-dark głębszy kobaltowy błękit (np. #245ba8), --text chłodna biel,
--muted stonowany chłodny szary-niebieski.
TYPOGRAFIA (jako zmienne CSS): nagłówki nowoczesny geometryczny sans (np. Manrope — inny niż
Plus Jakarta Sans/Space Grotesk/Sora/Unbounded already used), tekst czytelny sans (np. Inter).
Zweryfikuj grepem po templates/pilot/*.html.

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie zapytania: "barber shop modern",
"men haircut", "barber tools") — jedno mniejsze zdjęcie hero (częściowo za widgetem rezerwacji,
patrz LAYOUT pkt 2), 2 zdjęcia do galerii. Zero powtórzeń z innymi wariantami tej branży ani
kolizji ID z resztą systemu.

LAYOUT — inny mechanizm niż hydraulik-3/elektryk-3/studio-paznokci-3 i inny niż
fryzjer-barber-1/2:
1. Nav: ciemna, sticky, blur stały. CTA to pigułka z ikoną kalendarza + "Rezerwuj online",
   telefon jako drugorzędny link ikonowy.
2. Hero: 2 kolumny — lewo tekst, prawo GŁÓWNY element to makieta "widgetu rezerwacji"
   (glassmorphism karta): pozioma lista dni tygodnia + siatka chipów godzin (część zajęta,
   część wolna podświetlona akcentem). Zdjęcie hero widoczne jako mniejszy zaokrąglony akcent
   przy/za widgetem, nie dominujące tło.
3. Sekcja "Jak to działa": 3 kroki jako pozioma listwa połączonych kółek z wypełniającą się
   linią-gradientem (Wybierz usługę → Wybierz termin → Potwierdź rezerwację).
4. Sekcja "Usługi": siatka wybieralnych kart-chipów (nazwa + cena + znacznik wyboru w rogu),
   statyczna hover-only poświata-obwódka.
5. Sekcja "Galeria": 2 zdjęcia w asymetrycznym układzie.
6. Sekcja zaufania: poziома listwa "⭐ 4.9 z X rezerwacji online" + jeden krótki cytat w stylu
   dymka czatu.
7. FAQ — accordion, ciemna stylistyka.
8. Kontakt/rezerwacja: rozbudowana wersja widgetu z hero jako finalne CTA + pasek danych + mapa
   dojazdu. Świadomy wyjątek: bez tradycyjnego formularza — widget rezerwacji JEST formularzem.
9. Stopka: ciemna, prosta, z małą plakietką "🟢 Rezerwacja online czynna 24/7".`,
  },
  {
    id: 'fryzjer-barber-4-rodzinna-firma',
    tier: 'pro',
    name: 'Rodzinna firma',
    visual: `STYL: archetyp "Rodzinna firma" — jednoosobowy/rodzinny zakład fryzjerski, barber
znany klientom z imienia, bez korporacyjnego dystansu. Duch: "nie jesteś tu kolejnym numerem w
kalendarzu — jestem tu ja, ten sam barber od pierwszej wizyty do dzisiaj, może nawet strzygłem
już Twojego ojca". Rodzinny zakład fryzjerski przekazywany z pokolenia na pokolenie to bardzo
naturalny, rozpoznawalny motyw tej branży (silniejszy nawet niż w hydrauliku/elektryku) — możesz
oprzeć narrację na motywie "od dziadka do wnuka" / "trzecie pokolenie w zawodzie", jeśli to
wzmacnia autentyczność.

Czwarty wariant tej branży — ZASADY.md sekcja 0 (bespoke względem hydraulik-4, elektryk-4,
studio-paznokci-4-rodzinna-firma.html — przeczytaj WSZYSTKIE trzy wyłącznie jako inspirację
ducha) i różnicowanie względem fryzjer-barber-1 (kamienny beż + bordo), fryzjer-barber-2 (ciepły
węgiel + amber), fryzjer-barber-3 (chłodny slate + niebieski) — ten wariant wraca do jasnej,
ciepłej palety jak wariant 1, ale INNY odcień i INNA temperatura tła niż wariant 1.

Wariant PRO — ogranicz się do JEDNEJ, delikatnej, uniwersalnej techniki: jednorazowy
fade-in+translateY na elementach osi/listy "Nasza historia" i wierszach cennika przy wejściu w
viewport. NIE dodawaj shimmer/marquee/pulsowania/pętlącej się animacji — spójne z ciepłym,
spokojnym tonem archetypu w każdej branży (hydraulik-4, elektryk-4, studio-paznokci-4 są
całkowicie statyczne, to nie przypadek).

WYMÓG prefers-reduced-motion: fade-in "Nasza historia" i wierszy cennika musi mieć natychmiastowy
stan końcowy pod reduced-motion, bez animowanego przejścia. Zwykłe hover-transition nie wymaga
wyłączania.

PALETA (jako zmienne CSS) — inna niż WSZYSTKIE jasne warianty już istniejące w systemie
(hydraulik-4 terakota/ivory #c1613a/#faf1e4, elektryk-4 szałwia/kremowy #6b8f5e/#faf6ec,
studio-paznokci-1 dusty-rose/ivory #c9718c/#faf3ee, studio-paznokci-4 karmel/beż-taupe
#b8763f/#ece1d3, studio-paznokci-5 achromat/écru #2a2622/#f1eee6) i inna niż fryzjer-barber-1
(kamienny beż #f1ede5 + bordo #7a2430): --bg ciepły, jasny, WYRAŹNIE zielonkawo-szary (nie beż
ani różowy jak wszystkie powyższe — np. #eef0e8, subtelny szałwiowo-szary odcień, ale znacznie
jaśniejszy i bardziej wyszarzony niż elektryk-4's nasycona szałwia, więc nie koliduje), --surface
odrobinę cieplejsza/jaśniejsza karta (np. #f6f6f0), --accent głęboka leśna zieleń, inna gałąź
zieleni niż szałwia elektryk-4 i emerald studio-paznokci-3 (np. #3f6b4a — ciemniejsza, bardziej
"leśna/mchowa" niż jasna szałwiowa #6b8f5e i mniej neonowa niż emerald #2dd4a7), --accent-dark
głębsza butelkowa zieleń (np. #274a32), --text ciepły ciemny brąz-zielonkawy, --muted stonowany
szaro-zielony.
TYPOGRAFIA (jako zmienne CSS): nagłówki ciepły, osobisty serif (np. Domine — inny niż Playfair
Display/Lora/Fraunces/Bodoni Moda/Cormorant Garamond already used), tekst czytelny sans (np.
Mulish — sprawdź grepem po templates/pilot/*.html, bo Mulish mógł już być użyty w
studio-paznokci-1; jeśli tak, wybierz np. Nunito Sans zamiast).

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie zapytania: "barber portrait",
"old barbershop", "father son haircut") — jedno zdjęcie właściciela/barbera (ciepły,
bezpośredni uśmiech, jasne tło) użyte w hero i w sekcji kontakt (mniejsze) — to świadomy,
powtarzalny element archetypu "poznaj osobę za firmą" (jak hydraulik-4/elektryk-4/
studio-paznokci-4), nie naruszenie zasady bespoke. Zero kolizji ID z resztą systemu.

LAYOUT — inny mechanizm niż hydraulik-4, elektryk-4, studio-paznokci-4 (sprawdź WSZYSTKIE trzy
konkretne mechanizmy hero-photo/oś czasu/cennik przed projektowaniem, żeby nie powielić żadnego)
i inny niż fryzjer-barber-1 (już ma prostokątne kadry z ostrymi rogami i szyldowy cennik z
grubą linią-separatorem):
1. Nav: jasna, statyczna prosty sticky, CTA "Zadzwoń: {{TELEFON}}" jako główne CTA (osobisty
   kontakt z barberem, nie rezerwacja online jak wariant 3).
2. Hero: zdjęcie w owalnym/eliptycznym kadrze (inny kształt niż prostokąt-ostre-rogi wariantu 1,
   inny niż blob/dymek/plain-rounded z innych branż) PO PRAWEJ stronie, obok tekst z frazą
   nawiązującą do pokoleń/tradycji w H1 lub eyebrow, krótki osobisty lead, CTA telefon.
3. Sekcja "Nasza historia": pozioma oś czasu z 3-4 punktami jako proste karty-etykiety
   połączone cienką linią u DOŁU (nie u góry, nie pionowa linia z boku jak inne branże),
   fade-in przy scrollu.
4. Sekcja "Nasze usługi"/cennik: dwukolumnowa siatka kart usług (nie lista wierszy jak wariant
   1, nie dotted-leader) — każda karta: nazwa + krótki opis + cena jako duża liczba w rogu.
   Fade-in przy scrollu.
5. FAQ — accordion, jasna stylistyka.
6. Kontakt: karta z owalnym zdjęciem właściciela (to samo zdjęcie co hero, mniejsze),
   bezpośredni telefon jako duży link, jeden krótki ciepły cytat klienta pod zdjęciem, pasek
   danych + mapa dojazdu.
7. Stopka: jasna, prosta, wyśrodkowana, jedna linia + copyright.`,
  },
  {
    id: 'fryzjer-barber-5-premium',
    tier: 'pro',
    name: 'Premium',
    visual: `STYL: adaptacja archetypu "Premium/korporacyjny" — w Hydrauliku/Elektryku to
dosłownie B2B. Dla fryzjera/barbera tego nie da się zrobić dosłownie, ale w ODRÓŻNIENIU od studia
paznokci (gdzie trzeba było przenieść ducha na eventy/marki) — barbershop MA naturalny,
realistyczny odpowiednik korporacyjny: usługi B2B dla firm i hoteli — barber "in-house" na
eventy firmowe, umowy z hotelami/apartamentami na usługi dla gości, pakiety grooming dla zespołów
przed ważnymi wydarzeniami (targi, sesje zdjęciowe, śluby — drużyna pana młodego), karty
podarunkowe firmowe. To bliżej dosłownego archetypu niż studio-paznokci-5, ale nadal NIE kopiuj
słownictwa "deweloperzy/inwestorzy przemysłowi" z hydraulika/elektryka — dobierz realistyczne
kategorie klientów tej branży. Duch: "poziom obsługi, który zauważą hotelowi concierge i dział
HR organizujący event firmowy".

Piąty i OSTATNI wariant tej branży (system 5 archetypów) — ZASADY.md sekcja 0 (bespoke względem
hydraulik-5, elektryk-5, studio-paznokci-5-premium.html — przeczytaj WSZYSTKIE trzy wyłącznie
jako inspirację ducha i mechaniki strukturalnej: stats-strip, "Jak pracujemy" jako oś procesu,
portfolio realizacji, rejestr zaufania, PEŁNY formularz zapytania zamiast telefonu jako primary
CTA — te mechanizmy architektoniczne wolno przenieść, ale KAŻDY mechanizm wizualny sekcji musi
dostać inny wygląd niż WSZYSTKIE trzy te pliki) i różnicowanie względem fryzjer-barber-1
(kamienny beż + bordo), fryzjer-barber-2 (ciepły węgiel + amber), fryzjer-barber-3 (chłodny
slate + niebieski), fryzjer-barber-4 (jasny zielonkawo-szary + leśna zieleń).

Wariant PRO (najwyższy tier) — duch "premium/edytorialny" w punktach odniesienia jest wyciszony,
precyzyjny, bez zabawek marketingowych. Zachowaj tę konwencję: WYŁĄCZNIE jednorazowy
fade-in+translateY na kartach portfolio i wierszach rejestru zaufania, zero pętli/keyframes.

WYMÓG prefers-reduced-motion: fade-in kart portfolio i wierszy rejestru zaufania musi mieć
natychmiastowy stan końcowy pod reduced-motion. Zwykłe hover-transition nie wymaga wyłączania.

PALETA (jako zmienne CSS) — inna niż WSZYSTKIE dotychczasowe warianty w systemie, w tym
studio-paznokci-5's achromatyczny czarno-atramentowy akcent na écru (#2a2622/#f1eee6 — NIE
powielaj tego samego "monochromatyczny na écru" pomysłu, wybierz inny mechanizm premium) i
różne od WSZYSTKICH czterech poprzednich wariantów tej branży: --bg chłodny, rafinowany
kamienny szary (nie écru/beż jak reszta systemu — np. #e9e7e2, wyraźnie chłodniejszy i bardziej
szary niż fryzjer-barber-1's #f1ede5 i fryzjer-barber-4's #eef0e8), --surface odrobinę ciemniejszy
chłodny kamień (np. #dcdad3), --accent i --accent-dark: głęboki, matowy grafitowo-czarny jako
BAZA (np. --accent:#22201d) z BRĄZOWO-ZŁOTYM (mosiądz/brąz, nie żółte złoto) jako WTÓRNYM akcentem
osiąganym przez color-mix w gradientach/obwódkach (np.
color-mix(in srgb, #22201d 70%, #a8813a 30%) na obwódkach kart premium, sam mosiądz #a8813a użyty
oszczędnie na cenach/plakietkach) — to daje "gentleman's club" bez powtarzania achromatycznego
pomysłu studio-5 1:1 (tam BRAK jakiegokolwiek koloru; tu jest brąz-mosiądz jako świadomy drugi
wymiar, sprawdź grepem że ta konkretna kombinacja czarno-mosiężna nie występuje jeszcze nigdzie
w templates/pilot/*.html), --text prawie czarny chłodny, --muted stonowany chłodny szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki elegancki, wąski, edytorialny serif (np. Libre Caslon
Text — inny niż Playfair Display/Fraunces/Bodoni Moda/Cormorant Garamond/Domine already used),
tekst czytelny geometryczny sans (np. Sora — sprawdź grepem, bo Sora mógł już być użyty; jeśli
tak, użyj Public Sans). Zweryfikuj OBOWIĄZKOWO grepem po templates/pilot/*.html przed
finalizacją.

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie zapytania: "luxury barbershop",
"gentleman grooming", "barber suit") — HERO PHOTO jako duże zdjęcie WEWNĄTRZ 2-kolumnowego gridu
hero obok tekstu (nie pełnoszerokościowy baner nad sekcją), 2 zdjęcia do portfolio realizacji
(np. przygotowanie drużyny pana młodego, event firmowy/grooming w hotelu). Zero kolizji ID z
resztą systemu, zero powtórzeń w tej branży.

LAYOUT — inny mechanizm niż hydraulik-5, elektryk-5, studio-paznokci-5 (sprawdź WSZYSTKIE trzy
konkretne mechanizmy nav/hero/stats/process/cases/trust/kontakt przed projektowaniem) i inny niż
fryzjer-barber-1/2/3/4:
1. Nav: jasna, statyczna, wąski tracking liter na linkach (edytorialny detal), CTA "Umów
   konsultację" jako obrysowany (outline, nie wypełniony) przycisk.
2. Hero: 2 kolumny — lewo tekst (eyebrow, H1, lead, CTA formularz-link), prawo duże zdjęcie w
   ostro przyciętym prostokącie z cienką mosiężną ramką (1-2px border w --accent).
3. Sekcja stats-strip: 3 liczby w rzędzie z cienkimi pionowymi separatorami (nie karty, nie
   kółka).
4. Sekcja "Jak pracujemy": 3-4 kroki procesu jako pozioma lista z numerami rzymskimi (I, II,
   III) zamiast cyfr arabskich lub ikon — edytorialny detal odróżniający od poprzedników.
5. Sekcja "Realizacje": 2 duże karty portfolio (event firmowy, drużyna pana młodego) w układzie
   naprzemiennym (zdjęcie-tekst / tekst-zdjęcie), fade-in przy scrollu.
6. Sekcja "Zaufali nam": rejestr zaufania jako pozioma lista kategorii klientów (Hotele i
   apartamenty / Agencje eventowe / Firmy przed sesją wizerunkową / Organizatorzy ślubów) w
   prostych plakietkach z cienką obwódką, fade-in przy scrollu.
7. FAQ — accordion, jasna stylistyka.
8. Kontakt: PEŁNY formularz zapytania (nazwa firmy/wydarzenia, liczba osób, termin, wiadomość)
   jako primary CTA zamiast telefonu, pod spodem pasek danych + mapa dojazdu.
9. Stopka: jasna, minimalna, wąski tracking, jedna linia + copyright.`,
  },
];

// Placeholdery poniżej odzwierciedlają pipeline z pozostałych branż — w praktyce warianty
// powstają autorsko przez sesje Claude Code (patrz docs/produkcja-szablonow/README.md), ten
// skrypt jest kanonicznym źródłem briefów, nie musi zostać faktycznie uruchomiony.
module.exports = { VARIANTS, CSS_VAR_REQUIREMENT, SYSTEM_BASE, SAMPLE_TOKENS, PILOT_DIR, PREVIEW_DIR, buildTemplatePrompt };

if (require.main === module) {
  console.log('Fryzjer / Barber pilot — ' + VARIANTS.length + ' warianty zdefiniowane.');
  console.log('Ten skrypt jest źródłem briefów; generacja odbywa się autorsko (patrz README.md).');
}
