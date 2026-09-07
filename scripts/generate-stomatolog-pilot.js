#!/usr/bin/env node
// scripts/generate-stomatolog-pilot.js — pilot: warianty wizualne dla branży
// Stomatolog (gabinety stomatologiczne — leczenie zachowawcze, protetyka, ortodoncja,
// higienizacja, drobna chirurgia stomatologiczna dla pacjentów indywidualnych).
//
// FORMUŁA 3 WARIANTÓW (decyzja Artura 03.09.2026, patrz docs/produkcja-szablonow/README.md):
//   1 = free  — archetyp zaufania („Zaufany fachowiec")
//   2 = pro   — archetyp WYLOSOWANY z puli 2-5: wypadł „Premium/korporacyjny"
//   3 = pro   — „petarda" (do ustalenia po akceptacji wariantu 2)
//
// Wariant 1 zaakceptowany przez Artura 07.09.2026. Tego dnia Artur też jawnie zwolnił z
// checkpointu akceptacji między wariantami 2 i 3 tej branży ("lecimy 2 i 3 bez zatwierdzeń") —
// dalej obowiązuje pełny flow z CLAUDE.md (designer-ux-ui → copywriter-szablonow → qa-szablonow
// → commit/push/deploy), tylko bez czekania na chat-approval między wariantami.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'Dentica',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@dentica.pl',
  '{{MIASTO}}': 'Wrocław',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'dentica-wroclaw',
  '{{GODZINY_PON_PT}}': '8:00 – 19:00',
  '{{GODZINY_SOB}}': '9:00 – 13:00',
};

// Zdjęcia wyszukane przez Pexels API, zweryfikowane curl 200 (200 OK na finalnym URL z
// parametrami, nie tylko na stronie pexels.com/photo/...) i obejrzane wzrokowo.
const FOTO = {
  konsultacja_model: 'https://images.pexels.com/photos/6627325/pexels-photo-6627325.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', // dentysta w gabinecie tłumaczy pacjentowi zabieg na modelu zębów, trzyma model między nimi — moment wyjaśniania, nie leczenia
  rtg_konsultacja: 'https://images.pexels.com/photos/6502030/pexels-photo-6502030.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',   // dentystka pokazuje pacjentowi zdjęcie RTG na ekranie, oboje patrzą na wynik — jawna diagnostyka przed planem
  // --- wariant 2 (pula rozłączna z wariantem 1, ZASADY.md sekcja 4) ---
  zespol_przy_fotelu: 'https://images.pexels.com/photos/4269949/pexels-photo-4269949.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', // dwoje specjalistów w nowoczesnym gabinecie przy fotelu pacjentki — koordynacja zespołu, nie jeden lekarz solo
  skaner_3d: 'https://images.pexels.com/photos/6812468/pexels-photo-6812468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',          // pacjent w panoramicznym/3D skanerze stomatologicznym — zaawansowana diagnostyka
};

const VARIANTS = [
  {
    id: 'stomatolog-1-uczciwy-plan-leczenia',
    tier: 'free',
    name: 'Uczciwy plan leczenia',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla gabinetu stomatologicznego.
Oś zaufania: UCZCIWY PLAN LECZENIA — pisemny, rozpisany na etapy plan z cenami, który pacjent
widzi PRZED rozpoczęciem leczenia, nie odkrywa go kawałek po kawałku na kolejnych wizytach.

REALNE LĘKI KLIENTA (oś całego wariantu, nie ogólne „jesteśmy godni zaufania"):
1. **Rozjeżdżający się rachunek.** Klient przychodzi na "przegląd", a w trakcie fotela słyszy o
   kolejnym potrzebnym zabiegu, o którym nikt wcześniej nie wspomniał — i płaci więcej, niż się
   spodziewał, bez realnej możliwości odmowy w danym momencie.
2. **Nadleczenie.** Podejrzenie, że zalecany zabieg (zwłaszcza kosmetyczny — wybielanie, licówki,
   "korekta zgryzu") wynika bardziej z cennika gabinetu niż z realnej potrzeby medycznej. To
   jeden z najczęściej powtarzanych zarzutów wobec prywatnej stomatologii w Polsce.
3. **NFZ vs prywatnie — niejasność.** Klient nie wie z góry, co jest refundowane, co dopłaca
   z własnej kieszeni, i czy w ogóle da się to sensownie połączyć w jednym gabinecie.
4. **Brak ciągłości.** W dużych sieciówkach pacjent trafia za każdym razem do innego lekarza,
   który nie zna historii leczenia i zaczyna diagnozę od zera.
5. **Ból i strach przed fotelem** — realny, ale NIE jest osią tego wariantu (patrz ograniczenie
   niżej); tu obsługiwany wyłącznie jako jedno pytanie w FAQ, nie jako główny mechanizm. Zostaw
   przestrzeń na to, żeby ta oś mogła stać się mechanizmem innego, przyszłego wariantu tej branży.

MECHANIZM RÓŻNICUJĄCY (sedno wariantu): PRZYKŁADOWY PLAN LECZENIA jako realny artefakt na stronie
— nie tabela cennika, tylko wygląd i logika prawdziwego planu, jaki pacjent dostaje na piśmie po
pierwszej wizycie. Plan dzieli zabiegi na TRZY jasno opisane kategorie, nie na listę usług:
- **KONIECZNE** — bez tego pogorszy się stan zdrowia (np. leczenie próchnicy, stanu zapalnego).
- **ZALECANE** — poprawia komfort i trwałość, ale nie jest leczeniem ratunkowym (np. wymiana
  starego wypełnienia, higienizacja przed dalszym leczeniem).
- **OPCJONALNE / ESTETYCZNE** — wyłącznie decyzja pacjenta, zero nacisku (np. wybielanie, licówki).
Przy każdej pozycji: orientacyjna cena, adnotacja czy NFZ refunduje część kosztu, i wprost
napisane, że nic z kategorii ZALECANE/OPCJONALNE nie jest wykonywane bez osobnej, świadomej zgody
pacjenta — także jeśli wypłynie dopiero w trakcie leczenia czegoś innego.
To jest inny mechanizm wizualny niż "jawny rozkład kosztów instalacji" we fotowoltaika-1 czy
uczciwa wycena w nieruchomosci-1: tam liczy się SUMA elementów jednej usługi, tu chodzi o
KLASYFIKACJĘ WEDŁUG KONIECZNOŚCI wielu możliwych zabiegów — zaprojektuj to jako właściwy dokument
(nagłówek z datą i numerem planu, trzy wyraźnie odróżnione bloki, adnotacje przy pozycjach), nie
jako kolejną tabelkę cennika.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania):
templates/pilot/fotowoltaika-1-uczciwe-wyliczenie.html (jawność jako oś zaufania) i
templates/pilot/nieruchomosci-1-zaufany-posrednik.html. Twoja wersja MUSI mieć inny mechanizm
wizualny każdej sekcji — to gabinet medyczny, nie usługa techniczna ani doradcza.

KRYTYCZNE OGRANICZENIE UCZCIWOŚCIOWE: zero "leczenie całkowicie bezbolesne", zero "NFZ pokryje
wszystko", zero "dokładna cena bez badania". Ostateczny plan i cena zależą od diagnostyki (badanie,
ewentualne RTG) — tekst ma mówić to wprost, a "przykładowy plan leczenia" musi być jawnie opisany
jako PRZYKŁAD poglądowy jednego pacjenta, nie jako cennik gabinetu ani gotowa oferta. Konkretne
liczby (lata działania gabinetu, liczba pacjentów, orientacyjne widełki cen w przykładowym planie)
są DOZWOLONE i pożądane jako treść docelowa (ZASADY.md sekcja 5) — jako przykład i widełki, nie
jako gwarancja.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html). UWAGA NA OCZYWISTY ODRUCH: "stomatolog" ciągnie
odruchowo w stronę sterylnego klinicznego błękitu/mięty — ta droga jest already przereklamowana
w bibliotece (hydraulik-1/3/6, fryzjer-barber-3, medycyna-estetyczna-3, remonty-1, salon-fryzjerski-4,
nieruchomosci-3, elektryk-3 — osiem wariantów w rejestrze bazujących na błękicie/cyjanie) i jest
dokładnie tym stereotypem, którego ten wariant — budujący zaufanie przez CIEPŁO, nie przez sterylność
— powinien unikać. Zielenie eko też są zajęte (nieruchomosci-2, elektryk-4, fryzjer-barber-4,
medycyna-estetyczna-5, salon-fryzjerski-1, studio-paznokci-3), złoto/żółć też (elektryk-1,
fryzjer-barber-2, salon-fryzjerski-2, studio-paznokci-5, nieruchomosci-1, remonty-4), a różowo-mauve
jest już zajęte przez medycyna-estetyczna (1, 2) i studio-paznokci (1, 2) — unikaj, bo to sąsiednia
branża medyczna i powtórzenie odcienia będzie czytane jako to samo studio. Kierunek do rozważenia:
ciepły, "papierowy" neutral (kremowy/kość słoniowa) z głęboką, spokojną barwą tekstu (np. atramentowy
granat-zieleń, nie czysty granat) i JEDNYM nasyconym akcentem spoza wyżej wymienionych rodzin —
zweryfikuj grepem i uzasadnij wybór w raporcie, niezależnie od tego, którą drogę wybierzesz.
TYPOGRAFIA: zweryfikuj grepem że nieużyta nigdzie w systemie; ton ma być spokojny i czytelny
(to dokument-plan leczenia jest częścią treści), nie ozdobny display-serif ani surowy technical mono.

ZDJĘCIA (zweryfikowane curl 200 i obejrzane, użyj TYCH DOKŁADNYCH URL — pula w stałej FOTO):
- Dentysta w gabinecie tłumaczy pacjentowi zabieg na fizycznym modelu zębów, trzymając go między
  sobą a pacjentem — moment WYJAŚNIANIA, nie leczenia, pasuje do hero:
  https://images.pexels.com/photos/6627325/pexels-photo-6627325.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Dentystka i pacjent patrzą razem na zdjęcie RTG na ekranie — jawna diagnostyka przed planem,
  pasuje do sekcji o przykładowym planie leczenia:
  https://images.pexels.com/photos/6502030/pexels-photo-6502030.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID Pexels, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz
w raporcie. Zwróć uwagę, że oba zdjęcia pokazują RÓŻNYCH pacjentów i różną scenę (model fizyczny
vs ekran) — to celowe, żeby uniknąć wrażenia jednej sesji zdjęciowej powtórzonej dwa razy.

TREŚĆ — sekcje: nav, hero (obietnica: plan leczenia na piśmie, z cenami, ZANIM cokolwiek zaczniemy
robić), sekcja "jak wygląda pierwsza wizyta" (konsultacja + diagnostyka, dopiero potem plan —
żadnego leczenia "od razu na pierwszej wizycie" bez planu), PRZYKŁADOWY PLAN LECZENIA (mechanizm
różnicujący opisany wyżej — konieczne/zalecane/opcjonalne, ceny orientacyjne, adnotacja NFZ),
sekcja "czego nie robimy" (nie leczymy na siłę, nie dokładamy zabiegów bez zgody, nie trzymamy
pacjenta w niepewności co do ceny), ciągłość opieki (jeden opiekujący się lekarz na każdej wizycie,
nie przypadkowy grafik), zespół/kwalifikacje z konkretami (specjalizacje, lata doświadczenia),
opinie klientów (generyczne imiona + {{MIASTO}} + rodzaj zabiegu np. "leczenie kanałowe", NIGDY
nazwy firm ani wymyślone nazwiska personelu — ZASADY.md sekcja 5), FAQ (w tym: czy zabieg będzie
bolał i jak wygląda znieczulenie — jedno pytanie, nie oś strony; co się dzieje, gdy w trakcie
leczenia okaże się, że trzeba więcej niż w planie; czy da się łączyć NFZ i prywatnie), kontakt
z mapą. Gramatyka {{MIASTO}} (ZASADY.md sekcja 2) — pamiętaj o luce w grepie: czytaj całe zdania.

REGUŁA 6.8 z ZASADY.md: każdy tekst/karta nachodząca na zdjęcie musi mieć zagwarantowany kontrast
i być zweryfikowana zrzutem na 360/390px. Zdjęcie z ekranem RTG ma jasne partie (monitor), sprawdź
to szczególnie przy overlayu.

LAYOUT — bespoke mechanizm każdej sekcji. NIE kopiuj "jawnego rozkładu kosztów" 1:1 z
auta-z-ameryki-1 ani "uczciwej wyceny" z nieruchomosci-1 — przykładowy plan leczenia to inny
artefakt (dokument z trzema kategoriami konieczności, nie lista pozycji jednej transakcji) i ma
dostać własną, unikalną kompozycję zaprojektowaną od zera.`,
  },
  {
    id: 'stomatolog-2-lekarz-prowadzacy',
    tier: 'pro',
    name: 'Lekarz prowadzący',
    visual: `STYL: adaptacja archetypu "Premium/korporacyjny" dla gabinetu stomatologicznego.
W innych branżach ten archetyp często idzie w B2B (firmy, deweloperzy, klienci korporacyjni) —
dla stomatologii to nienaturalne, pacjent indywidualny nie kupuje stomatologii "dla firmy".
Zamiast tego (ten sam ruch co medycyna-estetyczna-5 i salon-fryzjerski-5, patrz ZASADY.md sekcja 0
o zachowaniu ducha/tier zamiast dosłownej ramy): PROGRAM DLA ZŁOŻONYCH, WIELOETAPOWYCH PRZYPADKÓW
prowadzony przez JEDNEGO LEKARZA KOORDYNUJĄCEGO — pełna odbudowa uzębienia, wieloetapowa
implantologia, ortodoncja dorosłych połączona z protetyką. To pacjenci, których case nie mieści się
w jednej wizycie ani w jednej specjalizacji.

REALNY PROBLEM, KTÓRY TEN WARIANT ROZWIĄZUJE (oś ekskluzywności, nie "luksus" sam w sobie):
w złożonych przypadkach pacjent zwykle sam koordynuje chaos — chirurgia u jednego specjalisty,
protetyka u drugiego, każdy zna tylko swój fragment planu, pacjent tłumaczy historię leczenia od
nowa na każdej wizycie. Tu JEDEN lekarz prowadzący zna cały plan od początku do końca i koordynuje
pozostałych specjalistów pod jednym dachem — pacjent nie jest własnym menedżerem projektu swojego
leczenia. To jest realna, sprawdzalna przewaga operacyjna, nie tylko wrażenie luksusu.

MECHANIZM RÓŻNICUJĄCY (sedno wariantu): OŚ WIELOETAPOWEGO PROGRAMU prowadzona przez lekarza
koordynującego — konsultacja i diagnostyka 3D → plan całościowy rozpisany na etapy (miesiące, nie
jedna wizyta) → koordynacja specjalistów (chirurg, protetyk, ortodonta — w zależności od case'u)
pod nadzorem jednego lekarza prowadzącego → regularne przeglądy postępu między etapami. To inny
mechanizm niż PRZYKŁADOWY PLAN LECZENIA z wariantu 1 (tam: klasyfikacja pojedynczych zabiegów wg
konieczności na jednej wizycie; tu: harmonogram wieloetapowego programu rozłożonego w czasie) —
NIE kopiuj dokumentu-tabeli z wariantu 1, zaprojektuj oś/harmonogram od zera.

KRYTYCZNE OGRANICZENIE PRAWNO-ETYCZNE: żadnych zdjęć/opisów "przed i po" jako dowodu efektu,
żadnych gwarancji sukcesu zabiegu czy rezultatu odbudowy — to zabiegi medyczne, nie kosmetyczne
usługi z pewnym efektem. Ekskluzywność wyraża się przez UWAGĘ/KOORDYNACJĘ/CIĄGŁOŚĆ (jeden lekarz
zna cały plan, limitowana liczba miejsc w programie, regularne przeglądy postępu), NIE przez
obietnicę lepszego lub pewniejszego wyniku niż w zwykłym leczeniu wieloetapowym rozproszonym
między gabinetami. To rozróżnienie musi być utrzymane w każdym zdaniu marketingowym.

MOTION — konwencja premium w całym systemie: wyciszony, precyzyjny ruch. WYŁĄCZNIE jednorazowy
fade-in+translateY na kartach/wierszach przy scrollu, zero pętli/keyframes/glow w tle/shimmeru.
Zapisz to jawnie w komentarzu HTML przy :root.

PALETA — sprawdź grepem że nie koliduje z ŻADNYM wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html), w tym: WŁASNY wariant 1 tej branży (fiolet-ink
#5b3e78 na kremie #f7f1e6 — inna rodzina barwy, nie kolejny fiolet) ORAZ cała klaster premium w
systemie: hydraulik-5 (granat/biel), elektryk-5 (terakota/szary), fryzjer-barber-5 (czerń/mosiądz),
studio-paznokci-5 (achromatyczny ecru), remonty-5 (chłodny szaro-niebieski na ciemnym slate),
salon-fryzjerski-5 (szmaragd/champagne), medycyna-estetyczna-5 (onyks/szaro-zielony srebrny).
Odrzuć też odruch "stomatolog = kliniczny błękit/mięta" (już 8 wariantów w systemie na tej drodze,
patrz brief wariantu 1). Kierunek do rozważenia, jeszcze nieobecny w bibliotece: głęboki, ciepły
niemal-czarny (espresso/grafit-brąz — NIE terakota-rdza jak hydraulik-4/elektryk-5, cieplejszy i
ciemniejszy) z chłodnym, stonowanym akcentem pewter/platynowym LUB porcelanowo-lodowatym — kontrast
"ciepła baza / zimny metaliczny akcent" jeszcze nie występuje w klastrze premium. Zweryfikuj grepem
i uzasadnij wybór w raporcie niezależnie od tego, którą drogę wybierzesz.
TYPOGRAFIA: zweryfikuj grepem że nieużyta nigdzie w systemie, włącznie z Literata/Lato (wariant 1
tej branży). Premium znosi spokojny, precyzyjny krój — unikaj ozdobnego display, ale też surowego
technical mono.

ZDJĘCIA (zweryfikowane curl 200, obejrzane wzrokowo, pula ROZŁĄCZNA z wariantem 1 — użyj TYCH
DOKŁADNYCH URL, są w stałej FOTO):
- Dwoje specjalistów przy fotelu pacjentki w nowoczesnym gabinecie (koordynacja zespołu, nie jeden
  lekarz solo) — pasuje do hero:
  https://images.pexels.com/photos/4269949/pexels-photo-4269949.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Pacjent w panoramicznym/3D skanerze stomatologicznym (zaawansowana diagnostyka) — pasuje do
  sekcji o diagnostyce 3D:
  https://images.pexels.com/photos/6812468/pexels-photo-6812468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID Pexels, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz
w raporcie. Rozważ też wariant z ograniczoną liczbą zdjęć (patrz salon-fryzjerski-5 jako inspiracja
mechaniki, WYŁĄCZNIE ducha — hero bez zdjęcia, tekstowo-edytorialny ton) — jeśli to lepiej pasuje
do "cichego" premium tonu, to w pełni uzasadniony wybór, o ile użyjesz zdjęć z puli powyżej tam,
gdzie się pojawią.

TREŚĆ — sekcje: nav, hero (obietnica: jeden lekarz zna cały Twój plan od początku do końca — nie
tłumaczysz historii leczenia od nowa na każdej wizycie), "dla kogo jest ten program" (pełna
odbudowa, wieloetapowa implantologia, ortodoncja dorosłych połączona z protetyką — nie rutynowy
przegląd ani pojedynczy zabieg), OŚ WIELOETAPOWEGO PROGRAMU (mechanizm różnicujący opisany wyżej),
diagnostyka 3D (skaner/tomografia — dokładniejszy plan, mniej niewygodnych wycisków — po ludzku,
nie jako specyfikacja sprzętu), koordynacja specjalistów pod jednym dachem, rejestr zaufania
(liczby: lata praktyki lekarza prowadzącego, liczba skoordynowanych programów, limit miejsc w
programie — bez żadnych liczb sugerujących gwarantowany efekt), FAQ (w tym: czy nadal mam kontakt
z tym samym lekarzem na każdym etapie, ile trwa taki program, co jeśli mam już rozpoczęte leczenie
gdzie indziej i chcę je przenieść), kontakt — formularz zapytania jako primary CTA (nie sam telefon,
to sygnał "umów konsultację programu", nie "zadzwoń po drobny zabieg") + mapa.
Gramatyka {{MIASTO}} (ZASADY.md sekcja 2) — czytaj całe zdania, grep tego nie łapie.

ZAKAZ KALKI MIĘDZYWARIANTOWEJ (ZASADY.md 5.1, REJESTR-BLEDOW.md B-08/B-13 — teraz obowiązuje,
bo istnieje już wariant 1 tej branży): PRZED napisaniem hero-note i pierwszego zdania stopki
przeczytaj te dwa miejsca w stomatolog-1-uczciwy-plan-leczenia.html i napisz świadomie inny
szkielet zdania, nie ten sam wzorzec "Siedziba w mieście {{MIASTO}} — [usługa] na terenie regionu"
odtworzony od zera. To samo dotyczy akapitu kontaktowego i otwarcia pierwszej odpowiedzi FAQ.

REGUŁA 6.8 z ZASADY.md: każdy tekst/karta nachodząca na zdjęcie musi mieć zagwarantowany kontrast
i być zweryfikowana zrzutem na 360/390px.

LAYOUT — bespoke mechanizm każdej sekcji, inny niż wariant 1 tej branży (dokument-plan) i inny niż
klaster premium w innych branżach (patrz PALETA wyżej po listę — przeczytaj co najwyżej jeden z
nich WYŁĄCZNIE jako inspirację ducha "premium = uwaga/czas/ciągłość", nigdy jako bazę wizualną).
Oś wieloetapowego programu i sekcja koordynacji specjalistów to naturalnie unikalne dla tego
wariantu elementy — zaprojektuj je od zera.`,
  },
];

module.exports = { VARIANTS, SAMPLE_TOKENS, FOTO };
