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

module.exports = { VARIANTS, SAMPLE_TOKENS };
