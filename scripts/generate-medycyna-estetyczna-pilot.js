#!/usr/bin/env node
// scripts/generate-medycyna-estetyczna-pilot.js — pilot: warianty wizualne dla branży
// Medycyna estetyczna (gabinet lekarski: botoks, wypełniacze, mezoterapia, laseroterapia,
// zabiegi na twarz i ciało). Ósma branża w systemie 5 archetypów.
//
// WAŻNE — Artur wprost (2026-09-02): "Nie trzymaj się sztywno ram typu szybka pomoc 24,
// bardziej celujemy w premium" — cała branża ma skłaniać się ku premium/upscale, NIE tylko
// wariant 5. Wariant 2 (zwykle "Szybka interwencja 24h") NIE MOŻE być urgency/pogotowie —
// zamiast tego adaptuj archetyp na coś w rodzaju "dogodny termin, bez wielotygodniowego
// oczekiwania", stonowanie, bez syren/alarmizmu, dalej elegancko.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'GlowMed',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@glowmed.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'glowmed-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 19:00',
  '{{GODZINY_SOB}}': '9:00 – 14:00',
};

const VARIANTS = [
  {
    id: 'medycyna-estetyczna-1-zaufany-lekarz',
    tier: 'free',
    name: 'Zaufany lekarz',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla medycyny estetycznej — tu zaufanie
nie buduje się rzemiosłem, tylko kwalifikacjami medycznymi. Duch: "to lekarz medycyny, nie
kosmetolog z kursu weekendowego" — dyplom, specjalizacja, bezpieczeństwo, realne (nie
przesadzone) efekty. Klientela dorosła, damska i męska, ale przeważnie kobiety 30-55 lat.

CAŁA BRANŻA CELUJE W PREMIUM (instrukcja Artura, 2026-09-02) — nawet ten wariant free-tier ma
wyglądać elegancko, klinicznie-czysto, nie "tanio i szybko". Zero różowego cukierkowego spa-kitchu,
zero agresywnego marketingu "efekty od razu, bez bólu, promocja -50%". Ton: rzeczowy, spokojny,
medyczny, ale ciepły — nie zimny/korporacyjny jak szpital.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania): templates/pilot/
studio-paznokci-1-zaufany-fachowiec.html (branża najbliższa tematycznie, ale medycyna estetyczna
MUSI wyglądać poważniej/klinicznie, nie jak manicure) — Twoja wersja musi mieć inny mechanizm
wizualny każdej sekcji.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie: unikaj już zajętych
rodzin barw (teal #147d72, emerald #2dd4a7/#0b5c3f, sage #6b8f5e, coral #ff7a5c, dusty-blue
#5b7c99, champagne #f6ecd8, róż #c9718c/#ff4d8f). Zaproponuj chłodną, kliniczną, ale elegancką
kombinację — np. stonowany szałwiowo-miętowy chłód LUB głęboki, matowy burgund/wino na
kremowej bieli LUB ciepły dusty-rose (inny odcień niż już użyte różowe) na czystej bieli
medycznej. Typografia: elegancki, czytelny serif nagłówkowy (zweryfikuj grepem że nieużyty w
systemie) + czysty, medyczny sans (też zweryfikowany).

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie zgaduj innych):
- Wnętrze gabinetu (nowoczesny, elegancki treatment room z aparaturą, marmurowy blat, bez ludzi):
  https://images.pexels.com/photos/11024139/pexels-photo-11024139.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Portret lekarki w białym kitlu, pewna siebie, profesjonalna:
  https://images.pexels.com/photos/38618416/pexels-photo-38618416.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej zdjęć — NIE zgaduj ID (nie masz przeglądarki, a ID strony Pexels
czasem nie pokrywa się z ID CDN, co już raz spowodowało 404 w tym projekcie). Zostaw czytelny
placeholder w kodzie: <!-- PHOTO NEEDED: krótki opis --> i wypisz w raporcie, uzupełnię i
zweryfikuję curl-em.

TREŚĆ — zakaz przesady: żadnych medycznych obietnic wyniku ("całkowicie usuniesz zmarszczki",
"efekt lepszy niż chirurgia"), żadnych fałszywych opinii pacjentek z nazwiskiem. Zabiegi opisuj
rzeczowo (nazwa zabiegu, na co pomaga, ile trwa, cena orientacyjna) — nie "magicznie odmłodnisz
się o 10 lat". To realna branża regulowana, przesadzone obietnice są też prawnie ryzykowne dla
klienta końcowego (właściciela gabinetu), nie tylko kwestia stylu.

LAYOUT — zaproponuj bespoke mechanizm każdej sekcji (nav, hero, usługi/cennik, o lekarce/gabinecie,
"dlaczego my", opinie, FAQ, kontakt z mapą) — different from studio-paznokci-1 i od ducha
"rzemieślniczego" pozostałych branż w systemie. To gabinet medyczny, nie warsztat.`,
  },
];

VARIANTS.push({
  id: 'medycyna-estetyczna-2-elastyczne-terminy',
  tier: 'pro',
  name: 'Elastyczne terminy',
  visual: `STYL: adaptacja archetypu "Szybka interwencja 24h" dla medycyny estetycznej — Artur
wprost zabronił ram pogotowia/urgency/syren dla tej branży (2026-09-02: "Nie trzymaj się sztywno
ram typu szybka pomoc 24, bardziej celujemy w premium"). NIE "dziś wolny termin, dzwoń teraz",
NIE marquee z alarmowym kolorem, NIE język zagrożenia. Zamiast tego: pilność zastąpiona
WYGODĄ — problem realnych klientów tej branży to nie "coś się zepsuło", tylko "gabinety mają
tygodnie oczekiwania, a ja mogę tylko wieczorem/w weekend". Duch: "konsultacja i zabieg wtedy,
kiedy Ty masz na to czas — nie kiedy akurat jest wolne miejsce za 3 tygodnie".

Drugi wariant tej branży — różnicowanie względem medycyna-estetyczna-1 (jasna kość słoniowa +
plum, statyczny, medyczno-rzeczowy). Ten wariant może być nieco ciemniejszy/bardziej
atmosferyczny (wieczorny klimat — spa, nie gabinet zabiegowy w świetle dnia), ale nadal
elegancki, nigdy krzykliwy.

WYMAGANY RUCH (obowiązkowy próg dla wariantu 2+, patrz .claude/agents/designer-ux-ui.md sekcja
"Nie czekaj aż użytkownik poprosi o więcej ruchu"): ambientowa poświata w tle hero (subtelna,
premium — nie neonowy pulse), delikatny shimmer na primary CTA, wizualna reakcja na interakcję
(jeśli dodajesz cokolwiek klikalnego — np. przełącznik dni tygodnia), stopniowany fade-in kart.
WYMÓG prefers-reduced-motion: wymień explicite każdą nietrywialną animację. Ruch ma być WYCISZONY
i elegancki, zgodny z premium tonem — nie ten sam "highlighter/karteczka post-it" wzorzec co
salon-fryzjerski-2 czy remonty-2.

PALETA (zablokowana, sprawdzona grepem że nie koliduje z żadnym wariantem w systemie) — inna niż
medycyna-estetyczna-1 (plum #6b3457 na kości słoniowej #faf7f4): zaproponuj ciemniejszy,
atmosferyczny wariant — np. głęboki, przydymiony róż-mauve na prawie czarnym tle (wieczorny spa
klimat), lub ciemny szałwiowo-zielony na węglowym tle. Sprawdź grepem że dokładna kombinacja nie
powtarza żadnego istniejącego wariantu (uwaga: wiele ciemnych wariantów "2" w systemie już
istnieje — hydraulik-2, elektryk-2, fryzjer-barber-2, remonty-2, salon-fryzjerski-2 — sprawdź ich
dokładne hexy i unikaj tej samej "rodziny nastroju", nie tylko dokładnego hexu).
TYPOGRAFIA: zweryfikuj grepem że fonty nieużyte nigdzie w systemie (włącznie z Piazzolla/Wix
Madefor Text z wariantu 1 tej branży — inny wariant, inny font).

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie zgaduj innych):
- Kameralny, minimalistyczny treatment room w ciepłym, wieczornym świetle (różowawe tony):
  https://images.pexels.com/photos/34220297/pexels-photo-34220297.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Zbliżenie na dłonie w rękawiczkach przygotowujące zabieg (profesjonalne, nie odrażające):
  https://images.pexels.com/photos/34220542/pexels-photo-34220542.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w
raporcie.

LAYOUT — inny mechanizm niż medycyna-estetyczna-1: zaproponuj np. sekcję pokazującą realne pasmo
godzin dostępnych wieczorami/w weekendy (np. lista dni tygodnia z zaznaczonymi wieczornymi
slotami — statyczny UI, nie musi być funkcjonalnym kalendarzem, to nie wariant "cyfrowy"), inny
układ hero, inny mechanizm cennika/usług niż karty-kategorie z wariantu 1.`,
});

VARIANTS.push({
  id: 'medycyna-estetyczna-3-dobierz-zabieg',
  tier: 'plus',
  name: 'Dobierz zabieg',
  visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" dla medycyny estetycznej — w innych
branżach to zwykle widget rezerwacji (wybór usługi/daty/godziny). Tu inny mechanizm: interaktywny
SELEKTOR PROBLEMU SKÓRY/POTRZEBY, nie kalendarz (wariant 2 już dotknął tematu "kiedy się umówić" —
ten wariant odpowiada na "co mi w ogóle pasuje", zanim klient w ogóle zadzwoni). Klient klika na
swoją główną troskę (np. "Zmarszczki mimiczne", "Utrata jędrności", "Przebarwienia",
"Cellulit/jędrność ciała") i widget pokazuje 1-2 rekomendowane zabiegi z krótkim wyjaśnieniem
DLACZEGO (nie z góry narzucona diagnoza — język typu "często polecany przy..." nie "wyleczy Twój
problem").

KRYTYCZNE OGRANICZENIE PRAWNO-ETYCZNE: to NIE może wyglądać jak automatyczna diagnoza medyczna
zastępująca lekarza. Każdy wynik selektora musi kończyć się jasnym zastrzeżeniem, że to
orientacyjna sugestia, a finalny dobór następuje podczas konsultacji z lekarzem. Wyraźnie inny
rejestr niż "diagnoza AI" — to ma być punkt wyjścia do rozmowy, nie jej zastąpienie.

Cała branża celuje w premium (patrz brief wariantu 1/2) — widget ma wyglądać elegancko i
klinicznie, nie jak quiz z lifestylowego magazynu (bez emoji-gradientów, bez "Twój wynik: Jesteś
typem Glow Girl!" tonu).

Różnicowanie względem medycyna-estetyczna-1 (jasna kość słoniowa + plum, statyczne karty
cennika) i medycyna-estetyczna-2 (ciemny róż-mauve na węglu, statyczny harmonogram dni) — trzeci,
odrębny mechanizm interakcji i odrębna paleta.

WYMAGANY RUCH (obowiązkowy próg dla wariantu 2+/plus): ambientowa, elegancka poświata w tle hero,
delikatny shimmer na primary CTA, WYRAŹNA wizualna reakcja przy wyborze problemu w selektorze
(podświetlenie, delikatny pulse na wyniku — to jest KLUCZOWY interaktywny element tego wariantu,
musi czuć się żywy), stopniowany fade-in kart. Pełny prefers-reduced-motion.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie, W TYM z wariantem 1 (plum
#6b3457 na kości słoniowej) i wariantem 2 (róż-mauve #c17b91 na węglu #1c1517) tej samej branży —
unikaj całej rodziny róż/plum/burgund dla tego wariantu. Zaproponuj coś chłodnego, klinicznego,
cyfrowego — np. głęboki, matowy granat/indygo z akcentem lodowo-błękitnym, LUB chłodny, ciemny
szałwiowo-szary. TYPOGRAFIA: zweryfikuj grepem że fonty nieużyte nigdzie w systemie (włącznie z
Piazzolla/Wix Madefor Text i Alegreya/Commissioner z wariantów 1-2 tej branży).

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TEGO DOKŁADNEGO URL, nie zgaduj innych):
- Nowoczesna konsultacja z tabletem, naturalne światło, elegancka klinika (bez zielonego ekranu
  na urządzeniu — sprawdzone wizualnie):
  https://images.pexels.com/photos/34159000/pexels-photo-34159000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w
raporcie. Selektor problemu może być czysto ikonowo-tekstowy (bez zdjęć przy każdej opcji) —
to spójne z wariantem 1, gdzie lista zabiegów też jest tekstowa, nie zdjęciowa.

LAYOUT — inny mechanizm niż medycyna-estetyczna-1/2: hero z krótkim wprowadzeniem + widget
selektora problemu jako centralny element (nie sidebar), sekcja "jak to działa" (3 kroki: wybierz
problem → zobacz sugestię → umów konsultację, żeby lekarz potwierdził plan), cennik/usługi w
innym układzie niż karty-kategorie (v1) i lista dwukolumnowa (v2) — np. accordion per kategoria
zabiegu, FAQ, kontakt z mapą.`,
});

VARIANTS.push({
  id: 'medycyna-estetyczna-4-kameralny-gabinet',
  tier: 'pro',
  name: 'Kameralny gabinet',
  visual: `STYL: adaptacja archetypu "Rodzinna firma" dla medycyny estetycznej. UWAGA — dosłowna
"trzecie pokolenie w rodzinnym gabinecie" nie ma sensu w tej branży (medycyna estetyczna jako
osobna specjalizacja to w Polsce zjawisko ostatnich ~15-20 lat, "dziadek robił botoks" byłoby
niewiarygodne). Zamiast pokoleniowej sagi: ciepło i ciągłość opieki przez MAŁY, ZGRANY ZESPÓŁ
(dwie lekarki-partnerki prowadzące gabinet razem) — "nie sieciówka z przypadkowym lekarzem za
każdym razem, tylko dwie osoby, które znają Twoją skórę od lat". Duch: kameralność, brak rotacji
personelu, osobista relacja lekarz-pacjent — to jest DOKŁADNIE ten sam mechanizm zaufania co w
innych branżach systemu (fryzjer-barber-4 "za każdym razem ta sama ekipa, nie loteria kogo
wyślą"), tylko przeniesiony na grunt medyczny: ciągłość opieki ma tu też realne znaczenie
kliniczne (lekarz znający historię skóry pacjenta podejmuje lepsze decyzje), nie tylko
sentymentalne.

Cała branża celuje w premium — ten wariant ma być ciepły, ale NADAL elegancki, nie
"przytulnie-rzemieślniczy" jak inne warianty 4 w systemie (Hydraulik/Elektryk/Remonty mają ciepłe,
rustykalne tony — to gabinet medyczny, więc ciepło wyraża się przez ton głosu i realną
osobistość, nie przez rustykalną/craftową estetykę wizualną).

MOTION-BASELINE — świadomy wyjątek archetypu 4 w całym systemie: WYCISZONY ruch nawet jako
wariant pro. Brak ambientowego glow w tle, brak shimmeru na CTA, brak marquee. Jedyny dozwolony
ruch: jednorazowy, stopniowany fade-in przy scrollu. Zapisz to jawnie w komentarzu HTML przy
:root, żeby było jasne że to decyzja, nie przeoczenie.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie, w tym z wariantami 1/2/3
tej branży (plum/kość słoniowa, róż-mauve/węgiel, indygo/lód) — zaproponuj coś ciepłego, ale
eleganckiego, np. przygaszony szałwiowo-zielony na ciepłej śmietankowej bieli, LUB stonowany
terakotowy róż (inny odcień niż już użyte). Unikaj typowych "rodzinna firma" ziemistych tonów już
zajętych w systemie (rdzawy pomarańcz hydraulik-4, zieleń szałwiowa elektryk-4, zieleń leśna
fryzjer-barber-4, oliwka remonty-4, brąz studio-paznokci-4, dusty-blue salon-fryzjerski-4) —
znajdź coś, co nie powtarza tej samej "rodziny ziemistej", tylko czuje się bardziej klinicznie-
ciepłe. TYPOGRAFIA: zweryfikuj grepem że nieużyta nigdzie w systemie (włącznie z Piazzolla/Wix
Madefor Text, Alegreya/Commissioner, Geologica/Sen z wariantów 1-3 tej branży).

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie zgaduj innych):
- Dwie lekarki-partnerki razem, ciepła, autentyczna chemia (nie sztywny portret korporacyjny):
  https://images.pexels.com/photos/33032998/pexels-photo-33032998.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Osobista konsultacja jeden-na-jeden, ciepły klimat:
  https://images.pexels.com/photos/7659861/pexels-photo-7659861.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w
raporcie.

TREŚĆ: nie zmyślaj fikcyjnych imion/nazwisk lekarek jako faktu marketingowego (to nie jest
firma-świadectwo, gdzie zmyślone imię byłoby fałszywą referencją) — możesz opisowo odnieść się
do "dwóch lekarek prowadzących gabinet" bez wymyślania konkretnych imion własnych, chyba że
jako świadomie fikcyjny, oczywisty placeholder tego samego typu co {{NAZWA_STRONY}} (sprawdź jak
inne warianty "Rodzinna firma" w systemie to rozwiązały — np. fryzjer-barber-4, salon-fryzjerski-4
— i zastosuj spójną konwencję).

LAYOUT — inny mechanizm niż medycyna-estetyczna-1/2/3: prosta, ciepła struktura bez gadżetów
(zgodnie z konwencją archetypu 4 w całym systemie) — np. hero z dwoma portretami/jednym wspólnym
zdjęciem zespołu, sekcja "dlaczego ten sam zespół ma znaczenie" (ciągłość opieki jako realna
wartość kliniczna, nie tylko miła atmosfera), prosta lista usług (nie karty/accordion jak w
poprzednich wariantach), opinie, FAQ, kontakt z mapą.`,
});

VARIANTS.push({
  id: 'medycyna-estetyczna-5-program-indywidualny',
  tier: 'premium',
  name: 'Program indywidualny',
  visual: `STYL: adaptacja archetypu "Premium/korporacyjny" dla medycyny estetycznej — OSTATNI,
piąty wariant tej branży. W innych branżach ten archetyp często idzie w B2B (firmy, hotele,
eventy) — dla medycyny estetycznej to nienaturalne (skóra to indywidualna sprawa pacjenta, nie
"grooming eventowy dla zespołu"). Zamiast tego: DŁUGOTERMINOWY, INDYWIDUALNY PROGRAM OPIEKI
prowadzony przez jednego, starszego/wiodącego lekarza — ograniczona liczba pacjentów w programie,
priorytetowe terminy, plan pielęgnacyjny rozpisany na miesiące/lata (nie pojedyncze zabiegi
"z ulicy"), dyskrecja. To najbliższe koncepcyjnie salon-fryzjerski-5-premium.html ("prywatny
gabinet stylisty", ograniczona liczba klientów dziennie, formularz zapytania zamiast telefonu) —
przeczytaj go WYŁĄCZNIE jako inspirację mechaniki (stats-strip, formularz zapytania jako primary
CTA, rejestr zaufania), NIGDY jako bazę do kopiowania wizualnego — Twoja wersja musi mieć inny
mechanizm wizualny każdej sekcji.

KRYTYCZNE OGRANICZENIE PRAWNO-ETYCZNE (patrz też brief wariantu 1/2/3/4 tej branży): żadnych
zdjęć/opisów "przed i po" jako dowodu efektu, żadnych gwarancji rezultatu nawet w kontekście
"programu premium". Ekskluzywność wyraża się przez UWAGĘ/CZAS/CIĄGŁOŚĆ (jeden lekarz, limitowana
liczba pacjentów, plan rozpisany na dłuższy czas), NIE przez obietnicę lepszych/pewniejszych
efektów niż w zwykłym gabinecie — to rozróżnienie jest ważne i musi być utrzymane w każdym
zdaniu marketingowym.

MOTION — konwencja premium w całym systemie: wyciszony, precyzyjny ruch. WYŁĄCZNIE jednorazowy
fade-in+translateY na kartach/wierszach przy scrollu, zero pętli/keyframes/glow w tle/shimmeru.
Zapisz to jawnie w komentarzu HTML przy :root.

PALETA — sprawdź grepem że nie koliduje z ŻADNYM wariantem w systemie, w tym: warianty 1-4 tej
branży (plum/kość słoniowa, róż-mauve/węgiel, indygo/lód, terakota/krem) ORAZ inne premium warianty
w systemie (hydraulik-5 granat/biel, elektryk-5 terakota/szary, fryzjer-barber-5 czerń/mosiądz,
studio-paznokci-5 achromatyczny écru, remonty-5 chłodny szaro-niebieski na ciemnym slate,
salon-fryzjerski-5 szmaragd/champagne). Zaproponuj coś chłodnego i klinicznie-premium, czego jeszcze
nie ma — np. głęboki onyks/prawie-czarny z chłodnym, stonowanym akcentem platynowo-srebrnym LUB
szaro-zielonym (NIE złoto/mosiądz — to już zajęte 3x w systemie; NIE ten sam odcień szaro-
niebieskiego co remonty-5). TYPOGRAFIA: zweryfikuj grepem że fonty nieużyte nigdzie w systemie
(włącznie z Piazzolla/Wix Madefor Text, Alegreya/Commissioner, Geologica/Sen, Frank Ruhl
Libre/Manrope z wariantów 1-4 tej branży).

ZDJĘCIA: świadomie ogranicz do minimum lub zera — ten wariant może być tekstowo-edytorialny
(patrz salon-fryzjerski-5 jako inspiracja mechaniki: hero bez zdjęcia, panoramiczny pas zdjęcia
wnętrza osobno). Jeśli chcesz zdjęcie, wybierz z już zweryfikowanych w tej branży (11024139,
34220297, 34159000, 33032998) żeby uniknąć ryzyka nowego 404 — sprawdź, że nie powtarza się z
wariantem, w którym już jest użyte. Jeśli żadne nie pasuje i wolisz zero zdjęć — to w pełni
uzasadniony wybór dla tego wariantu.

LAYOUT — inny mechanizm niż warianty 1-4 tej branży: formularz zapytania (nie telefon) jako
primary CTA w sekcji kontakt, sekcja "jak wygląda program" jako proces (konsultacja → plan →
regularne wizyty → przegląd i korekta planu), rejestr zaufania (liczby: lata praktyki lekarza
prowadzącego, limit pacjentów w programie, częstotliwość przeglądu planu — bez żadnych liczb
sugerujących gwarantowany efekt), cennik jako pakiety programu (nie pojedyncze zabiegi jak w
wariancie 1), FAQ, kontakt z formularzem + mapą.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS };
