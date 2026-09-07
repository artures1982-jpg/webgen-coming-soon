#!/usr/bin/env node
// scripts/generate-fizjoterapia-pilot.js — pilot: warianty wizualne dla Fizjoterapia / Rehabilitacja
// (start od wariantu 1 free), piąta branża w systemie 5 archetypów po Hydrauliku, Elektryku,
// Studiu paznokci i Fryzjer/Barber.
//
// UWAGA: w odróżnieniu od poprzednich branż, ten plik jest budowany PRZYROSTOWO — warianty
// dopisywane pojedynczo, jeden na raz (decyzja 2026-09-01, po tym jak równoległe odpalenie 5
// agentów na raz wyczerpało wspólny limit sesji konta). Na razie zdefiniowany tylko VARIANTS[0].
//
// Wynik NIE trafia do templates/manifest.json (produkcyjny, dziś pusty) — zapisywany osobno
// w templates/pilot/ + kopiowany do preview/fizjoterapia/ jako statyczne strony pod podgląd.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'RehaFit',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@rehafit.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'rehafit-krakow',
  '{{GODZINY_PON_PT}}': '8:00 – 20:00',
  '{{GODZINY_SOB}}': '9:00 – 14:00',
};

const CSS_VAR_REQUIREMENT = `

WYMÓG TECHNICZNY (personalizacja bez regeneracji — KRYTYCZNE):
Zdefiniuj w :root DOKŁADNIE te zmienne CSS: --accent, --accent-dark, --bg, --surface, --text,
--muted, --head, --body. W CAŁYM pozostałym CSS używaj WYŁĄCZNIE var(--nazwa) do każdego koloru
i fontu — ani jednego literału hex ani nazwy fontu poza samą deklaracją w :root. Jedyny
dopuszczalny wyjątek: słowa kluczowe "white"/"black" WEWNĄTRZ color-mix() jako neutralne punkty
odniesienia.

WYMÓG JĘZYKOWY — ODMIANA NAZWY MIASTA (KRYTYCZNE): {{MIASTO}} podstawiane DOWOLNYM polskim
miastem w mianowniku. NIGDY "w {{MIASTO}}"/"z {{MIASTO}}"/"do {{MIASTO}}"/"poza {{MIASTO}}" —
zamiast tego "w mieście {{MIASTO}}", "na terenie miasta {{MIASTO}}", "poza miastem {{MIASTO}}",
albo myślnik/dwukropek: "Usługi — {{MIASTO}}". {{MIASTO}} samodzielnie jest zawsze bezpieczne.

WYMÓG — MAPA DOJAZDU (KRYTYCZNE):
<iframe src="https://www.google.com/maps?q={{ADRES}}, {{MIASTO}}&output=embed" loading="lazy"
referrerpolicy="no-referrer-when-downgrade" style="border:0;width:100%;height:320px"></iframe>

PUŁAPKA CSS — aspect-ratio na <img> z atrybutami width/height (KRYTYCZNE): dopisz zawsze
height:auto w tej samej regule obok width+aspect-ratio.

PUŁAPKA — przycisk telefonu/CTA z pełnym tekstem w nav na mobile: na <700px świadomy kolaps
(skrócony tekst / sama ikona / schowanie do menu).

PUŁAPKA — overflow-x:auto na .nav .wrap PRZYCINA rozwijane menu mobilne (KRYTYCZNE, ZASADY.md
6.4): rozdziel .nav-links-desktop (w .wrap) i .nav-links-mobile (rodzeństwo .wrap, POZA nim),
JS po ID nie po klasie. Zawsze faktycznie KLIKNIJ hamburger na wąskim viewporcie przy odbiorze.

WYMÓG TREŚCI: konkretne liczby i daty (lata na rynku, liczba pacjentów, rok założenia)
wstawiaj normalnie jako gotową treść. Zakazane wyłącznie: fikcyjne nazwy firm/klinik-partnerów
w "zaufali nam" (generyczne etykiety kategorii) i wymyślone imię terapeuty — nie ma na to tokenu.

ZASADA 0 — BESPOKE WYKONANIE, ZERO REUŻYCIA LAYOUTU MIĘDZY BRANŻAMI (KRYTYCZNE, ZASADY.md sekcja
0): pliki odpowiedników tego archetypu w innych branżach wolno czytać WYŁĄCZNIE jako inspirację
ducha — NIGDY jako bazę do skopiowania. Paleta różni się nastrojem (jasność/temperatura tła), nie
tylko odcieniem akcentu. Sprawdź grepem po templates/pilot/*.html że wybrany hex/font nie
koliduje z żadnym już istniejącym wariantem w CAŁYM systemie.

ZDJĘCIA — ZASADY.md sekcja 4: prawdziwe, wizualnie zweryfikowane zdjęcia Pexels, krótkie 1-2
słowne zapytania, zero powtórzeń między wariantami TEJ branży, zero kolizji ID z resztą systemu
(sprawdź: grep -oE 'photos/[0-9]+/pexels-photo' templates/pilot/*.html), overlay 50-80% krycia,
każda karta usługi własne zdjęcie.`;

const VARIANTS = [
  {
    id: 'fizjoterapia-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: "Zaufany fachowiec" — ciepły, profesjonalny, budujący zaufanie do fizjoterapeuty,
z naciskiem na przejrzysty cennik zabiegów i jasny opis metod terapii. To piąta branża w systemie
5 archetypów po Hydrauliku, Elektryku, Studiu paznokci i Fryzjer/Barber — przeczytaj ZASADĘ 0
powyżej przed kodowaniem. Punkty odniesienia do odróżnienia: templates/pilot/hydraulik-1-zaufany-fachowiec.html,
templates/pilot/elektryk-1-zaufany-fachowiec.html, templates/pilot/studio-paznokci-1-zaufany-fachowiec.html,
templates/pilot/fryzjer-barber-1-zaufany-fachowiec.html (przeczytaj WSZYSTKIE CZTERY wyłącznie
jako inspirację ducha archetypu, nigdy jako bazę do kopiowania — sprawdź konkretnie ich mechanizmy
nav/hero/cennik/portfolio-lub-odpowiednik/o nas/opinie/kontakt/stopka, żeby żaden się nie powtórzył).

WAŻNA RÓŻNICA WOBEC POPRZEDNIKÓW: fizjoterapia to branża MEDYCZNA/paramedyczna, nie rzemieślnicza
ani beauty — ton musi być spokojny, kompetentny, uspokajający (pacjent często przychodzi z bólem
lub po kontuzji), NIE sprzedażowy/entuzjastyczny jak inne branże. Unikaj typowych fraz
marketingowych ("najlepszy w mieście!") na rzecz konkretu klinicznego (metody, kwalifikacje,
podejście do pacjenta). Brak "portfolio" w sensie wizualnym (jak w innych branżach) — zamiast
tego sekcja "Obszary terapii"/"Czym się zajmujemy" jako główny odpowiednik.

PALETA (jako zmienne CSS, zablokowane wartości — sprawdzone grepem, że nie kolidują z żadnym
istniejącym wariantem w templates/pilot/*.html): --bg chłodny, czysty, "kliniczny" jasny
błękitno-szary (nie ciepły beż/ivory jak większość poprzedników — np. #eef2f3, sygnalizuje
higienę i spokój, nie rzemiosło), --surface czysta biel lub prawie-biel wyraźnie jaśniejsza od
--bg (np. #ffffff — dopuszczalne, bo to jedyny wariant w systemie z tak "klinicznym" kontrastem
bg/surface), --accent stonowany, ufny morski turkus-teal (np. #1f7a6c — inna rodzina niż cyjan
hydraulik-3/elektryk-3, inna niż emerald studio-paznokci-3, inna niż niebieski
fryzjer-barber-3 — ten jest wyraźnie ciemniejszy/bardziej "medyczny", nie neonowy), --accent-dark
głębsza butelkowa zieleń-teal (np. #144f46), --text chłodny, ciemny, prawie czarny
niebiesko-szary, --muted stonowany chłodny szary.
TYPOGRAFIA (jako zmienne CSS): nagłówki czysty, kompetentny geometryczny sans o średniej wadze
(np. Source Sans 3 lub Public Sans — sprawdź grepem kolizję, jeśli Public Sans już zajęty przez
inną branżę wybierz IBM Plex Sans), tekst czytelny sans (np. Karla — sprawdź kolizję, jeśli
zajęty przez fryzjer-barber-1 wybierz Rubik). Zweryfikuj OBOWIĄZKOWO grepem po
templates/pilot/*.html przed finalizacją — ta branża celowo NIE używa serifów (żaden z
poprzedników beauty/trade nie miał czysto klinicznego sans-only zestawu, to nowy rejestr).

ZDJĘCIA: znajdź i zweryfikuj wizualnie na Pexels (krótkie 1-2 słowne zapytania: "physiotherapy",
"physical therapy", "rehabilitation exercise") — HERO (terapeuta pracujący z pacjentem, np.
terapia manualna barku lub kolana, jasne czyste wnętrze gabinetu), sekcja O NAS (wnętrze
gabinetu/sprzęt rehabilitacyjny), min. 3 zdjęcia do sekcji "Obszary terapii" jeśli chcesz je tam
wykorzystać (kręgosłup/staw/sport) — ale ta sekcja może też być czysto ikonowa (patrz LAYOUT pkt
4), zdjęcia nie są obowiązkowe wszędzie, decyzja należy do wykonawcy. Zero powtórzeń w tej
branży, zero kolizji ID z resztą systemu.

LAYOUT — celowo inny mechanizm niż WSZYSTKIE CZTERY poprzedniki archetypu 1 (sprawdź je
faktycznie przed projektowaniem):
1. Nav: sticky, jasna, logo po lewej jako prosty tekstowy logotyp z małym krzyżykiem/plusem
   medycznym jako akcent graficzny (nie monogram-plakietka jak fryzjer-barber-1, nie wyśrodkowane
   jak studio-paznokci-1), linki po prawej, CTA "Umów wizytę" jako pigułka WYPEŁNIONA kolorem
   --accent z małą ikoną kalendarza. Mobile <700px: kolaps zgodnie z PUŁAPKĄ overflow-x powyżej.
2. Hero: 2 kolumny — lewo tekst (eyebrow typu "Fizjoterapia i rehabilitacja", H1 spokojny i
   konkretny, lead 1-2 zdania, CTA "Umów wizytę" + drugorzędny link "Zobacz cennik"), prawo
   zdjęcie w prostym, dużym prostokącie z JEDNĄ zaokrągloną krawędzią (np. tylko górny-lewy róg
   mocno zaokrąglony, reszta ostra — asymetryczny detal, inny niż pełny blob/owal/prostokąt
   symetryczny u poprzedników). Pod hero, WĄSKI pasek zaufania na całą szerokość (nie osobna
   sekcja, tuż pod hero): 3 krótkie staty w rzędzie z cienkimi separatorami pionowymi (np. "12 lat
   doświadczenia · 2400+ pacjentów · Umowa z NFZ" lub podobne, dobierz sensownie) — ten
   "trust-strip" natychmiast pod hero to mechanizm, którego żaden z 4 poprzedników wariantu 1 nie
   ma (mieli go dopiero w wariancie 5).
3. Sekcja "Obszary terapii": siatka 6 kart-ikon (Kręgosłup i odcinek lędźwiowy / Staw kolanowy i
   biodrowy / Bark i kończyna górna / Rehabilitacja pooperacyjna / Rehabilitacja sportowa /
   Terapia dziecięca) — prosta karta: duża ikona + nazwa + jedno zdanie opisu, BEZ zdjęć (czysto
   ikonowy mechanizm — inny niż fotograficzne portfolio/galerie wszystkich poprzedników, bo w tej
   branży zdjęcia "efektu" nie mają sensu jak w beauty/hair).
4. Sekcja CENNIK: lista zabiegów w 2 kolumnach jako karty (nie wiersze-tabela jak fryzjer-barber-1,
   nie dotted-leader jak studio-paznokci-1) — każda karta: nazwa zabiegu (np. Terapia manualna,
   Masaż leczniczy, Kinesiotaping, USG rehabilitacyjne, Trening indywidualny, Konsultacja
   pierwszorazowa) + czas trwania + cena PLN jako duża liczba, delikatna ramka --surface z cieniem.
5. Sekcja O NAS: zdjęcie gabinetu/terapeuty w prostym kadrze PO LEWEJ + tekst obok z konkretnymi
   kwalifikacjami (wykształcenie, specjalizacje, podejście do pacjenta) — bez "medalionów"
   liczbowych (już użyte w studio-paznokci-1) i bez poziomej listy statystyk (już użyte w
   fryzjer-barber-1, poza tym staty są już w trust-strip pod hero tego wariantu).
6. Sekcja OPINIE: 2 duże cytaty pacjentów obok siebie w cudzysłowie, z imieniem i typem terapii
   pod spodem (np. "Anna K., rehabilitacja po kontuzji kolana") zamiast miasta — inny detal niż
   poprzednicy, bez awatarów/gwiazdek.
7. Sekcja "Jak przebiega pierwsza wizyta": 3 kroki jako pozioma lista z numerami (Wywiad i
   badanie → Plan terapii → Pierwszy zabieg) — buduje zaufanie/redukuje niepewność pacjenta,
   naturalny element tej branży, którego żaden poprzednik nie potrzebował.
8. FAQ — accordion, standardowo (pytania o NFZ/prywatnie, skierowanie, czas trwania terapii).
9. Kontakt: split 2-kolumnowy — formularz kontaktowy PO LEWEJ, dane kontaktowe + mapa dojazdu PO
   PRAWEJ.
10. Stopka: prosta, 2-kolumnowa (logo+opis+godziny / linki), copyright na dole.`,
  },
];

module.exports = { VARIANTS, CSS_VAR_REQUIREMENT, SAMPLE_TOKENS };

if (require.main === module) {
  console.log('Fizjoterapia pilot — ' + VARIANTS.length + ' wariant(y) zdefiniowane (przyrostowo, jeden na raz).');
}
