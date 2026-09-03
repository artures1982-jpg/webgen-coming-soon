#!/usr/bin/env node
// scripts/generate-auta-z-ameryki-pilot.js — pilot: warianty wizualne dla branży
// Auta z Ameryki (sprowadzanie i zakup samochodów na amerykańskich licytacjach: Copart, IAAI —
// wyszukanie auta, licytacja w imieniu klienta, transport morski, odprawa celna, akcyza,
// naprawa/serwis, rejestracja w Polsce). Dziesiąta branża w systemie.
//
// UWAGA — ta branża dostaje TYLKO 3 WARIANTY (decyzja Artura, 2026-09-03):
//   1 = free, 2 i 3 = pro. Nie ma wariantów 4 i 5.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym.

// ZDJĘCIA AMERYKAŃSKIE — wspólna pula dla całej branży (feedback Artura 2026-09-03: „za mało
// zdjęć nawiązujących do aut z Ameryki, może jakieś flagi amerykańskie"). Wszystkie zweryfikowane
// przez Pexels API, curl 200. UWAGA: świadomie ZERO zdjęć klasyków/zlotów/parad — klient importuje
// współczesne auta (przykład w wariancie 1 to Mustang 2019), więc vintage przekłamywałby ofertę.
// Bezpieczne motywy „amerykańskości" to flaga, drogi i infrastruktura — nie sugerują epoki.
const US_PHOTOS = {
  flaga: 'https://images.pexels.com/photos/15084216/pexels-photo-15084216.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  autostrada_i5: 'https://images.pexels.com/photos/16392127/pexels-photo-16392127.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  route66: 'https://images.pexels.com/photos/210112/pexels-photo-210112.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  pickup_arkansas: 'https://images.pexels.com/photos/9704513/pexels-photo-9704513.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  port_przeladunkowy: 'https://images.pexels.com/photos/29566901/pexels-photo-29566901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  plac_z_panorama: 'https://images.pexels.com/photos/29566908/pexels-photo-29566908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  mechanik_dokumentacja: 'https://images.pexels.com/photos/6870324/pexels-photo-6870324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
};

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'Atlantic Motors',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@atlanticmotors.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'atlanticmotors-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 18:00',
  '{{GODZINY_SOB}}': '10:00 – 14:00',
};

const VARIANTS = [
  {
    id: 'auta-z-ameryki-1-zaufany-importer',
    tier: 'free',
    name: 'Zaufany importer',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla firmy sprowadzającej auta z USA.
Tu zaufanie nie buduje się rzemiosłem, tylko PRZEJRZYSTOŚCIĄ KOSZTÓW I DOKUMENTACJI. To jest
branża z realnym problemem reputacyjnym: klienci najbardziej boją się (1) ukrytych kosztów, które
"wyskakują" po wygranej licytacji — transport, cło, akcyza, VAT, naprawa, (2) ukrytego zakresu
uszkodzeń auta powypadkowego, (3) tego, że firma zniknie po przelewie zaliczki. Duch wariantu:
"pokazujemy Ci pełny rachunek ZANIM licytujemy, i pełną dokumentację auta ZANIM zapłacisz".

Klientela: mężczyźni i kobiety 28-55 lat, często kupują auto z USA pierwszy raz w życiu, znają
temat z YouTube/forów, są jednocześnie zainteresowani (bo taniej) i nieufni (bo słyszeli historie).

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania):
templates/pilot/nieruchomosci-1-zaufany-posrednik.html (uczciwa wycena + prowadzenie przez proces —
bardzo bliski mechanizm zaufania, ale zupełnie inna branża i estetyka) oraz
templates/pilot/remonty-1-zaufany-fachowiec.html. Twoja wersja MUSI mieć inny mechanizm wizualny
każdej sekcji — to logistyka i motoryzacja, nie usługa doradcza przy biurku.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (uruchom:
grep -rhoE "#[0-9a-fA-F]{3,6}" templates/pilot/*.html). Kierunek: surowy, techniczno-logistyczny
rejestr (stal, asfalt, kontener, hala portowa) — ciemniejsza, "męska" baza z JEDNYM czytelnym
akcentem. Unikaj rodzin już zajętych w systemie: czerwień/pomarańcz alarmowy (elektryk-2 #ff5a1f,
hydraulik-2 #e0361c), złoto/bursztyn (elektryk-1, fryzjer-barber-2, salon-fryzjerski-2/5,
studio-paznokci-5), limonka (remonty-2 #c9d92e), żywa zieleń (nieruchomosci-2 #2fd66f), niebieski
cyfrowy (hydraulik-3/6, fryzjer-barber-3, medycyna-estetyczna-3, nieruchomosci-3 #3b2fd6), granat
+ mosiądz (nieruchomosci-1, hydraulik-5), chłodny szaro-niebieski slate (remonty-1/5). Zaproponuj
coś własnego i uzasadnij (np. przemysłowy antracyt + stonowany akcent stalowo-turkusowy LUB głęboki
oliwkowo-khaki militarno-transportowy — cokolwiek, byle zweryfikowane grepem). TYPOGRAFIA:
zweryfikuj grepem że nieużyta nigdzie w systemie — dla tej branży pasuje mocny, kondensowany
lub techniczny krój nagłówkowy (rejestr motoryzacyjno-przemysłowy), NIE elegancki serif.

ZDJĘCIA (już wyszukane przez Pexels API i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie
zgaduj innych):
- Rząd aut w porcie przeładunkowym, dźwigi i kontenery w tle (transport morski z USA):
  https://images.pexels.com/photos/29566901/pexels-photo-29566901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Mechanik z dokumentacją oglądający auto w warsztacie (weryfikacja stanu i papierów):
  https://images.pexels.com/photos/6870324/pexels-photo-6870324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID Pexels, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w
raporcie, główna sesja dośle zweryfikowany URL przez API.

TREŚĆ — sekcje: nav, hero (obietnica: pełny koszt "pod klucz" znany przed licytacją, zero
niespodzianek), sekcja "jak to działa" — proces krok po kroku (wybór auta i weryfikacja historii
VIN → wycena całkowitego kosztu → licytacja w Twoim imieniu → transport morski → odprawa celna i
akcyza → serwis/naprawa → rejestracja i odbiór), sekcja "co składa się na cenę" — JAWNY rozkład
kosztów jako treść (cena z licytacji, opłaty aukcyjne, transport lądowy w USA, fracht morski,
cło 10%, akcyza 3,1% lub 18,6% zależnie od pojemności, VAT 23%, transport w PL, ewentualna
naprawa) — to jest KLUCZOWY element zaufania w tej branży, nie chowaj go, sekcja "dlaczego my"
(realne liczby: lata na rynku, liczba sprowadzonych aut, średni czas od licytacji do odbioru),
opinie klientów (generyczne imiona + miasto + model auta w stylu "Ford Mustang 2019", NIGDY nazwy
firm — ZASADY.md sekcja 5), FAQ (w tym: czy auto powypadkowe da się zarejestrować w PL, ile trwa
cały proces, co jeśli auto okaże się gorsze niż na zdjęciach z licytacji), kontakt z mapą.

KRYTYCZNE OGRANICZENIE UCZCIWOŚCIOWE: zero obietnic typu "gwarantujemy najniższą cenę",
"auto bez wad", "100% pewności" — to branża, w której klient kupuje auto powypadkowe zza oceanu
na podstawie zdjęć; przesadzone obietnice są dokładnie tym, co robi konkurencja naciągająca ludzi.
Ton ma być rzeczowy i konkretny: podaj realne procenty ceł/akcyzy/VAT jako treść docelową
(dozwolone i pożądane — ZASADY.md sekcja 5), ale NIE gwarantuj wyniku licytacji ani stanu auta
ponad to, co pokazuje dokumentacja. Gramatyka {{MIASTO}} (ZASADY.md sekcja 2) poprawna w każdym
użyciu — uwaga: ta firma działa ogólnopolsko, więc {{MIASTO}} to siedziba, nie zasięg; sformułuj
to tak, żeby nie sugerowało, że sprowadzają auta tylko dla klientów z jednego miasta.

LAYOUT — bespoke mechanizm każdej sekcji: to branża "procesu i liczb", więc rozkład kosztów oraz
oś procesu to naturalne, unikalne dla niej elementy — zaprojektuj je od zera (NIE kopiuj osi
procesu z nieruchomosci-1 ani rozkładu cennika z żadnego innego wariantu).`,
  },
];

VARIANTS.push({
  id: 'auta-z-ameryki-2-kalkulator-sprowadzenia',
  tier: 'pro',
  name: 'Kalkulator sprowadzenia',
  visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" dla firmy sprowadzającej auta z USA.
Mechanizm centralny: REALNIE DZIAŁAJĄCY KALKULATOR KOSZTU SPROWADZENIA (JS, przelicza na żywo,
bez przeładowania) — to jest dokładnie ta rzecz, której klient tej branży szuka w Google
("kalkulator sprowadzenia auta z USA"), więc kalkulator ma być bohaterem strony, nie dodatkiem.

WEJŚCIA kalkulatora (dobierz sensowne kontrolki — suwak/pola/segmented):
- cena z licytacji w USD (suwak lub pole, zakres ok. 2 000 – 60 000 USD),
- pojemność silnika (przełącznik: do 2000 cm³ / powyżej 2000 cm³) — to decyduje o stawce akcyzy,
- opcjonalnie: stan (jezdne / do naprawy) wpływający na widełki kosztu naprawy, oraz port
  docelowy albo odległość dostawy w PL, jeśli chcesz dodać transport krajowy jako pozycję.

WYJŚCIE: rozpisany rachunek pozycja po pozycji (cena auta, opłaty aukcyjne, transport lądowy w
USA, fracht morski, cło 10%, akcyza 3,1% albo 18,6%, VAT 23%, transport krajowy) + WYRAŹNA suma
"koszt pod dom" w PLN. UWAGA — cała branża w tym wariancie 2 używa frazy „pod dom", NIE „pod
klucz" (decyzja Artura, wariant 1 został już na to przerobiony) — trzymaj się „pod dom".

MATEMATYKA MUSI SIĘ ZGADZAĆ (to branża, w której klient sprawdza wynik własnym kalkulatorem —
w wariancie 1 wyłapano już realny błąd tego typu): cło liczone od wartości celnej (cena auta +
transport), akcyza od wartości celnej powiększonej o cło, VAT od całości powiększonej o cło i
akcyzę. Zastosuj kurs USD/PLN jako jawną, edytowalną albo widocznie podaną stałą (np. ok. 4,00
PLN/USD) i JAWNIE zaznacz, że kurs jest przykładowy i zmienny. Sprawdź swoje liczby ręcznie na
2-3 przykładach zanim oddasz plik.

KRYTYCZNE ZASTRZEŻENIA UCZCIWOŚCIOWE (widoczne przy kalkulatorze, nie w drobnym druku):
kalkulator daje SZACUNEK, nie ofertę — realna kwota zależy od kursu waluty w dniu odprawy,
faktycznych opłat aukcyjnych, stanu auta i zakresu naprawy. Zero "gwarantowanej ceny końcowej".
FAQ musi mieć pytanie wprost adresujące dokładność kalkulatora.

RÓŻNICOWANIE: wariant 1 tej branży (auta-z-ameryki-1-zaufany-importer.html) jest JASNY
(chłodne szaro-zielone tło #eef1ef + przemysłowa oliwka #595c2d, kondensowany Big Shoulders
Display) i statyczny — z rozpisaną tabelą kosztów jako treścią. Ten wariant ma być wyraźnie inny:
ciemniejszy, "terminalowy" rejestr (klimat panelu aukcyjnego / dashboardu), a rozpiska kosztów
ma tu być WYNIKIEM interakcji, nie statyczną listą. NIE powielaj mechanizmu "trasy" transportowej
z wariantu 1.

PALETA — sprawdź grepem że nie koliduje z ŻADNYM wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html), w tym z wariantem 1 tej branży. Uwaga: rodzina
"ciemne tło + jaskrawy akcent" jest w systemie mocno zajęta — limonka (remonty-2), zieleń
(nieruchomosci-2), cyan/niebieski (hydraulik-3/6, fryzjer-barber-3, medycyna-estetyczna-3),
magenta (studio-paznokci-2), złoto (fryzjer-barber-2, salon-fryzjerski-2), czerwień/pomarańcz
(elektryk-2, hydraulik-2), fiolet (elektryk-3, remonty-3), wino/bordo (nieruchomosci-5).
Propozycja kierunku do zweryfikowania: ciemny grafit/węgiel z akcentem MIEDZIANYM/rdzawym
(miedź na ciemnym tle nie występuje — elektryk-5 #a85c32 i hydraulik-4 #c1613a to terakota na
JASNYCH tłach) — ale jeśli grep pokaże kolizję nastroju, wybierz coś innego i uzasadnij.
TYPOGRAFIA: zweryfikuj grepem że nieużyta w systemie, w tym Big Shoulders Display/Overpass z
wariantu 1 tej branży. Dla kalkulatora rozważ krój z porządnymi cyframi tabelarycznymi
(font-variant-numeric: tabular-nums) — liczby zmieniają się na żywo i nie mogą "skakać".

WYMAGANY RUCH (obowiązkowy próg dla wariantu pro): płynna animacja liczb w wyniku przy każdej
zmianie kontrolki (count-up/tween, nie przeskok), wyraźna wizualna reakcja na interakcję
(podświetlenie zmienionej pozycji rachunku), shimmer na primary CTA, ambientowa poświata lub
subtelny efekt tła w hero, stopniowany fade-in sekcji. Pełny prefers-reduced-motion — wymień
jawnie każdą nietrywialną animację w komentarzu HTML.

ZDJĘCIE (wyszukane przez Pexels API, zweryfikowane curl 200, użyj TEGO DOKŁADNEGO URL):
- Długi rząd aut na placu z amerykańską panoramą miasta w tle (klimat placu aukcyjnego w USA):
  https://images.pexels.com/photos/29566908/pexels-photo-29566908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
UWAGA: wariant 1 tej branży używa zdjęcia z tej samej serii (port, ID 29566901) w układzie
hero-split — NIE stawiaj tego zdjęcia w tej samej roli kompozycyjnej, żeby warianty nie wyglądały
jak ta sama strona w innym kolorze. Ten wariant może być niemal bezzdjęciowy (kalkulator jako
bohater) i użyć fotografii np. jako wąskiego pasa/tła sekcji. Jeśli chcesz więcej zdjęć — NIE
zgaduj ID, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w raporcie.

ZASADA 6.8 z ZASADY.md (KRYTYCZNA, świeżo dodana po realnym błędzie w wariancie 1 tej branży):
jeśli dodajesz jakąkolwiek kartę/badge nachodzącą na zdjęcie — musi mieć override na mobile
(position:relative + ujemny margines albo position:static), inaczej zasłania fotografię na
telefonie. Skan overflow tego NIE wykrywa. Zweryfikuj zrzutem ekranu na 360/390px.

TREŚĆ — sekcje: nav, hero z kalkulatorem jako centralnym elementem, sekcja "jak liczymy" (co
dokładnie składa się na każdą pozycję rachunku i skąd biorą się stawki), sekcja pokazująca
różnicę między "ceną z licytacji" a realnym kosztem końcowym (psychologiczny sedno tej branży),
opinie klientów (generyczne imiona + miasto + model auta, NIGDY nazwy firm — ZASADY.md sekcja 5),
FAQ (w tym dokładność kalkulatora i wpływ kursu waluty), kontakt z mapą. Gramatyka {{MIASTO}}
poprawna; firma działa ogólnopolsko, {{MIASTO}} to siedziba, nie zasięg.`,
});

VARIANTS.push({
  id: 'auta-z-ameryki-3-auto-na-zamowienie',
  tier: 'pro',
  name: 'Auto na zamówienie',
  visual: `STYL: wariant PREMIUM/CONCIERGE — trzeci i OSTATNI w tej branży. Artur wprost:
"to ma być petarda". To ma być najbardziej efektowny wariant całej branży i jeden z
najmocniejszych wizualnie w całym systemie — kinowa fotografia samochodowa, mocna typografia,
dużo czerni i światła.

UWAGA — ŚWIADOME ODSTĘPSTWO OD KONWENCJI SYSTEMU: w branżach 5-wariantowych archetyp "premium"
ma wyciszony, precyzyjny ruch (tylko fade-in). TUTAJ TA KONWENCJA NIE OBOWIĄZUJE — ta branża ma
tylko 3 warianty (1 free + 2 pro), a Artur zamówił efekt "petardy". Ten wariant ma mieć
NAJMOCNIEJSZY ruch z całej branży: parallax albo powolny ken-burns na kinowym hero, wyraźne
staged reveals, hover-zoom na galerii, licznik, shimmer na CTA, poświata. Pełny
prefers-reduced-motion nadal obowiązkowy — wymień jawnie każdą nietrywialną animację w
komentarzu HTML.

MECHANIZM CENTRALNY: klient nie przegląda gotowych ofert — MÓWI, JAKIEGO AUTA CHCE, a firma
poluje na nie na amerykańskich licytacjach. Zbuduj interaktywne "zlecenie poszukiwania": klient
wybiera/wpisuje markę i model, rocznik (zakres), budżet (suwak), typ nadwozia — a widget składa
z tego czytelne podsumowanie zlecenia na żywo ("Szukamy dla Ciebie: Dodge Challenger R/T,
2019-2022, do 180 000 zł pod dom"). To ma być realnie działający JS, nie mockup. Podsumowanie
niech ląduje w polu formularza kontaktowego, żeby wysłanie zlecenia było naturalnym następnym
krokiem.

USŁUGA CONCIERGE — realne, konkretne wyróżniki (nie puste "premium"): dedykowany opiekun
zlecenia, RAPORT FOTO/WIDEO Z OGLĘDZIN auta w USA PRZED licytacją (to jest najmocniejszy,
najbardziej namacalny argument w tej branży — klient widzi auto na żywo, zanim ktokolwiek
zalicytuje), licytacja w imieniu klienta z ustalonym górnym limitem, transport w dedykowanym
kontenerze zamiast roll-on/roll-off, pełny detailing i przegląd przed wydaniem, komplet
dokumentów i rejestracja.

KRYTYCZNE OGRANICZENIA UCZCIWOŚCIOWE (te same co w wariantach 1-2, tu tym ważniejsze, bo premium
kusi do przesady): zero "gwarantujemy wygraną licytację", zero "gwarantowanej ceny", zero "auto
bez wad". Ekskluzywność wyraża się przez UWAGĘ i DOKUMENTACJĘ (dedykowany opiekun, raport wideo
przed licytacją, limit zleceń jednocześnie), NIE przez obietnicę lepszego wyniku licytacji.
Fraza „pod dom", NIE „pod klucz" (spójnie z wariantami 1-2).

PALETA — sprawdź grepem że nie koliduje z ŻADNYM wariantem w systemie, W SZCZEGÓLNOŚCI z
wariantem 1 tej branży (jasna oliwka #595c2d na #eef1ef) i wariantem 2 (grafit #14161a/#1e2126
+ miedź #d97f4a). Kierunek: głęboka, kinowa czerń/karbon z jednym mocnym akcentem. Propozycja do
zweryfikowania: nasycony, szlachetny karmazyn/racing red (musi czytać się jako "premium
motorsport", NIE jako alarmowa czerwień elektryk-2 #ff5a1f / hydraulik-2 #e0361c) LUB chłodny
chrom/stal na czerni. Sprawdź też, że nie powtarzasz wina/bordo z nieruchomosci-5 (#6e0f22 na
#0c0708) — jeśli Twój karmazyn wychodzi zbyt blisko, wybierz inny kierunek i uzasadnij.
TYPOGRAFIA: zweryfikuj grepem że nieużyta w systemie, w tym Big Shoulders Display/Overpass
(wariant 1) i Rajdhani/Heebo (wariant 2). Tu pasuje mocny, szeroki krój display o dużym
kontraście — typografia ma być częścią efektu "petardy".

ZDJĘCIA (wyszukane przez Pexels API, zweryfikowane curl 200 — użyj TYCH DOKŁADNYCH URL; to
świadomie WSPÓŁCZESNE amerykańskie ikony, nie klasyki, bo klient premium zamawia właśnie takie
auta):
- RAM 1500 Rebel na moście o wschodzie słońca, kinowy kadr w ruchu (materiał na hero):
  https://images.pexels.com/photos/18491928/pexels-photo-18491928.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Dodge Challenger od przodu, podświetlone reflektory, złota godzina, palmy:
  https://images.pexels.com/photos/36655832/pexels-photo-36655832.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Czarna Corvette na dachu parkingu z panoramą miasta, ktoś ją fotografuje — idealnie ilustruje
  RAPORT FOTO/WIDEO Z OGLĘDZIN:
  https://images.pexels.com/photos/8561774/pexels-photo-8561774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Do dyspozycji masz też wspólną pulę US_PHOTOS z góry tego pliku (flaga, autostrada I-5,
Route 66, port) — użyj, jeśli wzmocnią kompozycję. NIE zgaduj nowych ID Pexels; brakujące kadry
zgłoś jako "<!-- PHOTO NEEDED: opis -->".
ZAKAZ zdjęć klasyków/zlotów/vintage'u (przekłamują ofertę — klient importuje współczesne auta)
oraz aut z widoczną europejską tablicą rejestracyjną (przeczy "sprowadzone z USA" — odrzucono
już z tego powodu dwa kadry Mustanga).

REGUŁA 6.8 z ZASADY.md (KRYTYCZNA): przy kinowych, pełnoekranowych zdjęciach z tekstem na
wierzchu ryzyko nieczytelności i zasłaniania jest największe w całej branży. Każdy tekst/karta na
zdjęciu MUSI być zweryfikowana ZRZUTEM EKRANU na 360/390px — skan overflow tego nie wykrywa.
W wariancie 2 tej branży nakładka na pasie zdjęciowym była już z tego powodu poprawiana.

TREŚĆ — sekcje: nav, kinowe hero (pełnowymiarowe zdjęcie + mocna typografia + CTA), widget
zlecenia poszukiwania, sekcja "jak działa concierge" (kroki z naciskiem na raport wideo przed
licytacją), galeria/showcase sprowadzonych aut z hover-zoom, rejestr zaufania (liczby bez
sugerowania gwarantowanego wyniku), opinie klientów (generyczne imiona + miasto + model auta,
NIGDY nazwy firm — ZASADY.md sekcja 5), FAQ, kontakt z formularzem (podsumowanie zlecenia
wstawione automatycznie) i mapą. Gramatyka {{MIASTO}}; firma działa ogólnopolsko, {{MIASTO}} to
siedziba, nie zasięg.

LAYOUT — bespoke, inny niż wariant 1 (trasa transportowa, statyczna rozpiska kosztów, jasny) i
wariant 2 (kalkulator-terminal, ciemny grafit, słupki porównania). Tu bohaterem jest FOTOGRAFIA
i zlecenie na konkretne auto, nie tabela liczb.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS, US_PHOTOS };
