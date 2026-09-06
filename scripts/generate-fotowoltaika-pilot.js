#!/usr/bin/env node
// scripts/generate-fotowoltaika-pilot.js — pilot: warianty wizualne dla branży
// Fotowoltaika / pompy ciepła (instalacje PV dla domów jednorodzinnych, magazyny energii,
// dotacje Mój Prąd i Czyste Powietrze, serwis i monitoring).
//
// FORMUŁA 3 WARIANTÓW (decyzja Artura 03.09.2026, patrz docs/produkcja-szablonow/README.md):
//   1 = free  — archetyp zaufania („Zaufany fachowiec")
//   2 = pro   — archetyp WYLOSOWANY z puli 2-5: wypadł „Nowoczesny cyfrowy"
//   3 = pro   — „petarda"
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym.
// Pierwsza branża budowana z serwerem MCP qa-szablony i osobnym agentem qa-szablonow w pętli.

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'Solvea',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@solvea.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'solvea-krakow',
  '{{GODZINY_PON_PT}}': '8:00 – 17:00',
  '{{GODZINY_SOB}}': '9:00 – 13:00',
};

// Zdjęcia wyszukane przez Pexels API, zweryfikowane curl 200 i obejrzane wzrokowo.
const FOTO = {
  dach_panele: 'https://images.pexels.com/photos/12243093/pexels-photo-12243093.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',   // panele na dachu domu, realna zabudowa
  inspektor: 'https://images.pexels.com/photos/4254163/pexels-photo-4254163.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',        // inspektor z dokumentacją przy panelach
};

const VARIANTS = [
  {
    id: 'fotowoltaika-1-uczciwe-wyliczenie',
    tier: 'free',
    name: 'Uczciwe wyliczenie',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla firmy montującej fotowoltaikę.
Oś zaufania: UCZCIWE WYLICZENIE OSZCZĘDNOŚCI. To jest branża z realnym, udokumentowanym problemem
reputacyjnym — akwizycja domokrążna, zawyżone obietnice zwrotu i sprzedawcy liczący oszczędności
na nieaktualnych zasadach.

REALNE LĘKI KLIENTA (oś całego wariantu, nie ogólne „jesteśmy godni zaufania"):
1. **Zawyżone wyliczenia.** Sprzedawca pokazuje „zwrot w 5 lat", a realnie wychodzi 8-12.
2. **Net-billing.** Od 2022 obowiązuje rozliczanie wartościowe (sprzedajesz nadwyżkę taniej, niż
   potem kupujesz), a nie dawny net-metering. Część sprzedawców nadal liczy po staremu, co samo
   z siebie zawyża prognozę. Kluczowe pojęcie: AUTOKONSUMPCJA — ile prądu zużywasz w ciągu dnia,
   gdy instalacja produkuje. Im więcej, tym lepszy zwrot; oddawanie do sieci jest dużo mniej
   opłacalne niż zużycie na miejscu.
3. **Ukryte koszty.** Przyłącze, modernizacja zabezpieczeń, wymiana instalacji w starym domu,
   dopłata za trudny dach (dachówka karpiówka, strome połacie, azbest).
4. **Firma zniknie przed gwarancją.** 25 lat gwarancji na panele od firmy działającej dwa lata.
5. **Dotacje.** „Załatwimy Mój Prąd i Czyste Powietrze", a potem klient sam się użera z wnioskiem.

MECHANIZM RÓŻNICUJĄCY (sedno wariantu): wyliczenie oparte na TWOICH FAKTURACH, nie na średniej
krajowej. Pokaż jawnie, co wchodzi do rachunku i czego nie da się obiecać. To ten sam typ
uczciwości co jawny rozkład kosztów w auta-z-ameryki-1, uczciwa wycena w nieruchomosci-1 i pełna
galeria w fotograf-slubny-1: POKAZUJEMY TO, CO KONKURENCJA CHOWA.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania):
templates/pilot/auta-z-ameryki-1-zaufany-importer.html (jawny rozkład kosztów jako sekcja) i
templates/pilot/nieruchomosci-1-zaufany-posrednik.html. Twoja wersja MUSI mieć inny mechanizm
wizualny każdej sekcji — to instalacje techniczne na budynku, nie usługa doradcza.

KRYTYCZNE OGRANICZENIE UCZCIWOŚCIOWE: zero „gwarantowanego zwrotu w X lat", zero „rachunek za
prąd spadnie do zera", zero „dotacja pewna". Zwrot ZALEŻY od autokonsumpcji, taryfy, cen energii
i realnego zużycia — i tekst ma to mówić wprost, bo właśnie na tym polega przewaga tego wariantu.
Konkretne liczby (lata na rynku, liczba instalacji, moc zainstalowana w kWp, orientacyjne widełki
zwrotu) są DOZWOLONE i pożądane jako treść docelowa (ZASADY.md sekcja 5) — ale jako widełki
zależne od warunków, nie obietnice.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (grep -rhoE
"#[0-9a-fA-F]{3,6}" templates/pilot/*.html). UWAGA, DWIE OCZYWISTE DROGI SĄ ZAJĘTE: „eko-zieleń"
(nieruchomosci-2 #2fd66f, elektryk-4 szałwia, fryzjer-barber-4 leśna, medycyna-estetyczna-5
szaro-zielona, salon-fryzjerski-1 teal, studio-paznokci-3 emerald) oraz „słoneczna żółć/złoto"
(elektryk-1, fryzjer-barber-2, salon-fryzjerski-2, studio-paznokci-5, nieruchomosci-1 mosiądz).
Nie idź w żadną z nich automatycznie. Kierunek do rozważenia wynikający z samego produktu: panele
są ciemne, grafitowo-granatowe, montowane na dachu pod niebem — rozważ głęboki grafit/antracyt
panelu z czystym, chłodnym akcentem nieba ALBO ciepły, techniczny miedziany akcent (miedź to
materiał instalacyjny). Cokolwiek wybierzesz, zweryfikuj grepem i uzasadnij.
TYPOGRAFIA: zweryfikuj grepem że nieużyta nigdzie w systemie; ta branża jest techniczno-budowlana,
więc pasuje czytelny, rzeczowy krój, nie ozdobny serif.

ZDJĘCIA (zweryfikowane curl 200 i obejrzane, użyj TYCH DOKŁADNYCH URL — pula w stałej FOTO):
- Panele na dachu domu jednorodzinnego w realnej zabudowie, czyste niebo:
  https://images.pexels.com/photos/12243093/pexels-photo-12243093.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Inspektor w kasku z dokumentacją sprawdzający panele — ilustruje audyt i rzetelne wyliczenie:
  https://images.pexels.com/photos/4254163/pexels-photo-4254163.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej — NIE zgaduj ID Pexels, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz
w raporcie. Pamiętaj o ZASADY.md sekcja 4: zdjęcie NIE MOŻE powtarzać się w innym wariancie tej
branży (kontrola sprawdz_szablon w MCP to wykrywa).

TREŚĆ — sekcje: nav, hero (obietnica: wyliczenie z Twoich faktur, nie ze średniej), sekcja
„co realnie wpływa na zwrot" (autokonsumpcja, net-billing, taryfa, kierunek i kąt dachu — jawnie
i po ludzku), jawny rozkład kosztów instalacji (panele, falownik, montaż, przyłącze i możliwe
prace dodatkowe — z zaznaczeniem, co wycenia się dopiero po oględzinach dachu), sekcja o
dotacjach (Mój Prąd, Czyste Powietrze — co realnie robimy za klienta, a czego nie obiecujemy),
„dlaczego my" z konkretnymi liczbami, opinie klientów (generyczne imiona + miasto + moc
instalacji np. „6,5 kWp", NIGDY nazwy firm — ZASADY.md sekcja 5), FAQ (w tym: ile realnie trwa
zwrot, co się dzieje przy awarii falownika, czy opłaca się magazyn energii), kontakt z mapą.
Gramatyka {{MIASTO}} (ZASADY.md sekcja 2) — pamiętaj o luce w grepie: czytaj całe zdania. Firma
dojeżdża, więc {{MIASTO}} to siedziba, nie granica działania.

REGUŁA 6.8 z ZASADY.md: każdy tekst/karta na zdjęciu musi mieć zagwarantowany kontrast i być
zweryfikowany zrzutem na 360/390px. Zdjęcie dachu jest jasne (niebo), więc to realne ryzyko.

LAYOUT — bespoke mechanizm każdej sekcji. NIE kopiuj „trasy" z auta-z-ameryki-1 ani osi procesu
z nieruchomosci-1. Rozkład kosztów i sekcja o czynnikach wpływających na zwrot to naturalne,
unikalne dla tej branży elementy — zaprojektuj je od zera.`,
  },
];

module.exports = { VARIANTS, SAMPLE_TOKENS, FOTO };
