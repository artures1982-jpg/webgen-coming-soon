#!/usr/bin/env node
// scripts/generate-fotograf-slubny-pilot.js — pilot: warianty wizualne dla branży
// Fotograf ślubny (reportaż ślubny, sesje plenerowe, przygotowania, przyjęcie).
// Jedenasta branża w systemie.
//
// FORMUŁA 3 WARIANTÓW (decyzja Artura 03.09.2026, patrz docs/produkcja-szablonow/README.md):
//   1 = free  — archetyp zaufania („Zaufany fachowiec")
//   2 = pro   — archetyp WYLOSOWANY z puli 2-5: wypadło „Szybka interwencja 24h"
//   3 = pro   — „petarda": kinowa fotografia, najmocniejszy ruch w branży
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'Kadr',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@kadr.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'kadr-krakow',
  '{{GODZINY_PON_PT}}': '10:00 – 18:00',
  '{{GODZINY_SOB}}': '10:00 – 14:00',
};

// ZDJĘCIA ŚLUBNE — wspólna pula dla całej branży, wyszukane przez Pexels API i zweryfikowane
// (curl 200 + obejrzane wzrokowo). W tej branży FOTOGRAFIA JEST PRODUKTEM, więc kadry muszą
// bronić się same — żadnych sztywnych, katalogowych ujęć.
const FOTO = {
  zlota_godzina: 'https://images.pexels.com/photos/3361200/pexels-photo-3361200.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',        // para w polu pod słońce, backlight
  emocja_ceremonia: 'https://images.pexels.com/photos/29891248/pexels-photo-29891248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',    // wzruszenie w trakcie ceremonii, reportaż
  obrobka_zdjec: 'https://images.pexels.com/photos/16313529/pexels-photo-16313529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',       // fotografka przy obróbce, aparat + laptop
  czarno_biale: 'https://images.pexels.com/photos/25824234/pexels-photo-25824234.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',        // intymne zbliżenie cz-b, artystyczne
  // Dodane 04.09.2026 przy poprawce stykówki w wariancie 1 — razem z powyższymi układają się
  // w realne pokrycie JEDNEGO wesela (przygotowania → detale → ceremonia → przyjęcie):
  przygotowania: 'https://images.pexels.com/photos/33661438/pexels-photo-33661438.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',       // panna młoda, suknia w odbiciu lustra
  obraczki: 'https://images.pexels.com/photos/27393582/pexels-photo-27393582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',            // dłonie z obrączkami, cz-b
  przyjecie_taniec: 'https://images.pexels.com/photos/30146471/pexels-photo-30146471.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',    // wieczorne przyjęcie pod girlandami
  bukiet: 'https://images.pexels.com/photos/20654851/pexels-photo-20654851.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',              // bukiet pod welonem
  nowozency_taniec: 'https://images.pexels.com/photos/13434438/pexels-photo-13434438.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',    // nowożeńcy tańczą z gośćmi
};

const VARIANTS = [
  {
    id: 'fotograf-slubny-1-zaufany-fotograf',
    tier: 'free',
    name: 'Zaufany fotograf',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla fotografa ślubnego. Tu zaufanie nie
buduje się rzemiosłem technicznym, tylko PEWNOŚCIĄ, ŻE ZDJĘCIA REALNIE DOTRĄ — i to od tej samej
osoby, z którą para rozmawiała.

REALNE LĘKI PARY MŁODEJ (to jest oś całego wariantu, nie ogólne "jesteśmy godni zaufania"):
1. Fotograf zniknie po zaliczce — branża ma z tym udokumentowany problem.
2. Zdjęcia przyjdą po roku albo wcale (opóźnienia w dostarczeniu galerii to najczęstsza skarga).
3. Na ślub przyjdzie KTOŚ INNY niż osoba, z którą para rozmawiała i której portfolio widziała.
4. Efekt nie będzie taki jak w portfolio — bo portfolio to 10 najlepszych kadrów z 60 wesel.

MECHANIZM RÓŻNICUJĄCY (sedno wariantu): przeciwko lękowi nr 4 postaw UCZCIWOŚĆ PEŁNEJ GALERII —
pokazujemy CAŁY materiał z jednego wesela, nie tylko najlepsze kadry. To dokładnie ten sam typ
mechanizmu, co jawny rozkład kosztów w auta-z-ameryki-1 i uczciwa wycena w nieruchomosci-1:
pokazujemy to, co konkurencja chowa. Przeciwko lękom 1-3: umowa z KONKRETNYM terminem dostarczenia
galerii wpisanym w umowę (nie "do kilku miesięcy"), zaliczka i warunki jasno opisane, oraz
zapewnienie, że fotografuje ta sama osoba (a jeśli ma zastępstwo na wypadek choroby — powiedz to
wprost i uczciwie, bo para i tak o to zapyta).

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania):
templates/pilot/auta-z-ameryki-1-zaufany-importer.html i
templates/pilot/nieruchomosci-1-zaufany-posrednik.html (ten sam mechanizm „pokazujemy to, co inni
chowają"). Twoja wersja MUSI mieć inny mechanizm wizualny każdej sekcji — to branża, w której
FOTOGRAFIA JEST PRODUKTEM, więc zdjęcia mają dominować nad tabelami i ikonami.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html). UWAGA: rejestr "ciepły kremowy + elegancki akcent"
jest w systemie mocno zajęty przez branże beauty (fryzjer-barber, salon-fryzjerski,
studio-paznokci, medycyna-estetyczna) — NIE powielaj ich nastroju, mimo że tematycznie ślub też
jest "ładny i ciepły". Zaproponuj coś własnego i uzasadnij; kierunek do rozważenia: bardzo
wyciszona, galeryjno-edytorialna neutralność (jasny papier/off-white albo przeciwnie — głęboka
grafitowa czerń galerii), w której KOLOR NIOSĄ SAME ZDJĘCIA, a interfejs schodzi na drugi plan.
To jest uzasadnione merytorycznie: na stronie fotografa mocny kolor UI konkuruje z portfolio.
TYPOGRAFIA: zweryfikuj grepem że nieużyta nigdzie w systemie — w tej branży dobrze zadziała
elegancki, ale nie ozdobny krój; sprawdź czytelność pełnego zdania h1 na 390px.

ZDJĘCIA (zweryfikowane, użyj TYCH DOKŁADNYCH URL — pełna pula w stałej FOTO na górze pliku):
- Para w polu w złotej godzinie, pod słońce (materiał na hero):
  https://images.pexels.com/photos/3361200/pexels-photo-3361200.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Autentyczne wzruszenie w trakcie ceremonii — dowód na "reportaż, nie pozowanie":
  https://images.pexels.com/photos/29891248/pexels-photo-29891248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Fotografka przy obróbce (aparat + laptop) — ilustruje obietnicę dostarczenia w terminie:
  https://images.pexels.com/photos/16313529/pexels-photo-16313529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Intymne zbliżenie czarno-białe, artystyczne (galeria):
  https://images.pexels.com/photos/25824234/pexels-photo-25824234.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID Pexels, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz
w raporcie.

REGUŁA 6.8 z ZASADY.md (KRYTYCZNA w tej branży): przy dużych zdjęciach z tekstem na wierzchu
ryzyko nieczytelności i zasłaniania jest najwyższe w całym systemie. Każdy tekst/karta na zdjęciu
MUSI być zweryfikowana ZRZUTEM EKRANU na 360/390px — skan overflow tego nie wykrywa.

TREŚĆ — sekcje: nav, hero (obietnica: zdjęcia w umówionym terminie, od tej samej osoby),
portfolio/galeria, sekcja "cała galeria, nie tylko najlepsze kadry" (mechanizm uczciwości —
wyjaśnij, dlaczego to ma znaczenie), "jak pracuję" (reportaż zamiast pozowania — konkretnie, nie
hasłowo), pakiety/cennik z jasno opisanym terminem dostarczenia, opinie par (generyczne imiona +
miasto + np. miesiąc ślubu, NIGDY nazwy firm — ZASADY.md sekcja 5), FAQ (w tym: ile realnie czeka
się na galerię, co się dzieje jeśli fotograf zachoruje, czy można zobaczyć całe wesele a nie
wybrane kadry), kontakt z mapą. Gramatyka {{MIASTO}} poprawna; fotograf dojeżdża, więc {{MIASTO}}
to baza, nie granica działania.

KRYTYCZNE OGRANICZENIE UCZCIWOŚCIOWE: zero "gwarantujemy najpiękniejsze zdjęcia w życiu", zero
obietnic emocjonalnych bez pokrycia. Konkretne liczby (lata pracy, liczba obsłużonych wesel,
termin dostarczenia galerii w tygodniach, liczba kadrów w galerii) są DOZWOLONE i pożądane jako
treść docelowa (ZASADY.md sekcja 5) — i to one budują tu wiarygodność, nie przymiotniki.

LAYOUT — bespoke mechanizm każdej sekcji. Fotografia dominuje: galeria to nie dodatek, tylko
element pierwszoplanowy. NIE kopiuj osi procesu z auta-z-ameryki-1 ani układu kart z żadnej innej
branży.`,
  },
];

VARIANTS.push({
  id: 'fotograf-slubny-2-wolne-terminy',
  tier: 'pro',
  name: 'Wolne terminy',
  visual: `STYL: adaptacja archetypu "Szybka interwencja 24h" dla fotografa ślubnego — archetyp
WYLOSOWANY zgodnie z nową formułą 3 wariantów (patrz nagłówek pliku). W tej branży pilność jest
REALNA, ale ma zupełnie inny charakter niż awaria hydrauliczna, więc NIE rób z tego pogotowia:
zero syren, alarmowej czerwieni, migających pasków i języka zagrożenia. Ślub to wydarzenie
radosne — pilność ma być rzeczowa i uspokajająca, nie stresująca.

DWA REALNE SCENARIUSZE PILNOŚCI (oba muszą być obsłużone, bo to dwie różne pary na stronie):
1. **Znikające soboty w sezonie.** Terminy ślubne rezerwuje się 12-18 miesięcy naprzód, a soboty
   maj-wrzesień znikają najszybciej. Para planująca chce wiedzieć OD RAZU, czy jej data jest
   jeszcze wolna — bez wysyłania maila i czekania trzech dni na odpowiedź.
2. **Ratunek: fotograf odwołał na kilka tygodni przed ślubem.** To realny, częsty dramat
   (podwójna rezerwacja, choroba, zniknięcie). Para jest w panice, ma wszystko zaplanowane i
   nagle nie ma kto fotografować. Dla nich liczy się jedno: czy ktoś odpowie SZYBKO i czy ma
   wolny ten konkretny termin. Ten wariant ma być stroną, na którą taka para trafia o 23:00 i
   dostaje konkretną odpowiedź, a nie formularz "odezwiemy się w ciągu 5 dni roboczych".

MECHANIZM CENTRALNY: czytelny, realnie działający w JS **podgląd dostępności sobót** — np. siatka
miesięcy sezonu z oznaczonymi terminami wolnymi/zajętymi, gdzie klik w wolną datę wstawia ją do
formularza zapytania. To ma być konkret, nie ozdobnik: para ma zobaczyć swoją datę i od razu
wiedzieć, na czym stoi. Dodatkowo wyraźna, osobna ścieżka "mam ślub za kilka tygodni i zostałam
bez fotografa" z deklarowanym, realnym czasem odpowiedzi (np. "odpowiadam tego samego dnia,
także wieczorem" — jeśli tak deklarujesz, niech to będzie jedyna obietnica czasowa, nie mnóż ich).

KRYTYCZNE OGRANICZENIA UCZCIWOŚCIOWE: kalendarz dostępności to treść docelowa, którą klient
nadpisuje — ale NIE sugeruj fałszywego niedoboru ("została ostatnia sobota!", licznik odliczający,
"3 osoby oglądają ten termin"). To manipulacja, a w tej branży zaufanie jest walutą. Pokaż realny
obraz: część sobót zajęta, część wolna. Zero gwarancji typu "zawsze znajdziemy termin".

RÓŻNICOWANIE względem wariantu 1 (fotograf-slubny-1-zaufany-fotograf.html): tamten jest jasny
(chłodny papier #f2f1ec + petrol #33534b, Marcellus/Cabin), spokojny, galeryjny, bez ruchu, z
mechanizmem "stykówki" pokazującej pełną galerię. Ten ma być wyraźnie inny w nastroju i
mechanizmie — kalendarz zamiast stykówki. Zdjęcia NIE mogą trafić w te same role kompozycyjne.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html), w tym z wariantem 1 tej branży. UWAGA na dwie
pułapki naraz: (a) rejestr ciepłego kremu z eleganckim akcentem jest zajęty przez cztery branże
beauty, (b) ciemne tło z jaskrawym akcentem jest zajęte przez większość wariantów "2" w systemie
(elektryk-2, hydraulik-2, remonty-2, studio-paznokci-2, salon-fryzjerski-2, medycyna-estetyczna-2,
nieruchomosci-2, auta-z-ameryki-2). Znajdź własny rejestr i uzasadnij — kierunek do rozważenia:
ciepły, wieczorny (zmierzchowy) ton, w którym „wolne/zajęte" da się czytelnie odróżnić kolorem
bez sięgania po alarmową czerwień. TYPOGRAFIA: zweryfikuj grepem że nieużyta w systemie, w tym
Marcellus/Cabin z wariantu 1 tej branży.

WYMAGANY RUCH (wariant pro): reakcja na interakcję w kalendarzu (podświetlenie wybranej daty,
płynne wstawienie jej do formularza), stopniowany fade-in sekcji, delikatny shimmer na primary
CTA. ZERO alarmowego migania i pulsujących pasków — ruch ma być spokojny mimo tematu pilności.
Pełny prefers-reduced-motion, wymień jawnie każdą nietrywialną animację w komentarzu HTML.

ZDJĘCIA: użyj z puli FOTO na górze tego pliku (9 zweryfikowanych kadrów). Wariant 1 używa
wszystkich dziewięciu, więc powtórzenie ID jest nieuniknione — ale MUSISZ użyć ich w INNYCH
rolach kompozycyjnych i innym doborze niż wariant 1 (tam: hero split, stykówka-taśma, sticky-photo
przy "jak pracuję"). NIE zgaduj nowych ID Pexels; jeśli brakuje Ci konkretnego kadru, zostaw
"<!-- PHOTO NEEDED: opis -->" i wypisz w raporcie.

REGUŁA 6.8 z ZASADY.md: każdy tekst/karta/numer leżący na zdjęciu musi mieć zagwarantowany
kontrast i być zweryfikowany ZRZUTEM EKRANU na 360/390px — w wariancie 1 tej branży QA znalazł
dokładnie taki błąd (numer klatki czytelny tylko przypadkiem, bo kadr miał ciemny róg).

TREŚĆ — sekcje: nav, hero (obietnica: sprawdź swoją datę od razu), podgląd dostępności sobót,
wyraźna ścieżka ratunkowa dla par bez fotografa, "jak wygląda współpraca w krótkim terminie"
(co realnie da się zrobić, gdy zostały 4 tygodnie — uczciwie, bez obiecywania cudów), portfolio
skrócone (to nie jest wariant galeryjny), pakiety/cennik, opinie par (generyczne imiona + miasto
+ miesiąc ślubu, NIGDY nazwy firm — ZASADY.md sekcja 5), FAQ (w tym: czy da się ogarnąć ślub za
miesiąc, co jeśli moja data jest zajęta, czy dojeżdżasz poza miasto), kontakt z mapą. Gramatyka
{{MIASTO}} — pamiętaj o luce w grepie opisanej w ZASADY.md sekcja 2 (czytaj całe zdania, nie ufaj
samemu grepowi); fotograf dojeżdża, więc {{MIASTO}} to baza, nie granica.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS, FOTO };
