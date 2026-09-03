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

module.exports = { VARIANTS, SAMPLE_TOKENS, FOTO };
