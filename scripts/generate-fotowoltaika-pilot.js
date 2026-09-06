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
  // --- wariant 2 (pula rozłączna z wariantem 1, ZASADY.md sekcja 4) ---
  osiedle_z_gory: 'https://images.pexels.com/photos/9875676/pexels-photo-9875676.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',   // top-down osiedle domów, panele na wielu dachach
  falownik_wnetrze: 'https://images.pexels.com/photos/38171183/pexels-photo-38171183.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', // wnętrze falownika, listwy i elektronika z bliska
  technik_na_macierzy: 'https://images.pexels.com/photos/19895911/pexels-photo-19895911.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', // z drona: technik idący po macierzy paneli
  macierz_z_gory: 'https://images.pexels.com/photos/7211069/pexels-photo-7211069.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',   // top-down równa macierz paneli na dachu
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
  {
    id: 'fotowoltaika-2-instalacja-na-zywo',
    tier: 'pro',
    name: 'Instalacja na żywo',
    visual: `STYL: archetyp "Nowoczesny cyfrowy" (WYLOSOWANY, nie wybrany) dla firmy fotowoltaicznej.

MECHANIZM RÓŻNICUJĄCY — sedno wariantu: PANEL MONITORINGU, KTÓRY KLIENT WIDZI ZANIM KUPI.
Cała branża sprzedaje "aplikację do podglądu produkcji" jako punkt na liście korzyści.
Tutaj ta aplikacja JEST stroną: na stronie stoi realny, działający panel z produkcją
przykładowej instalacji, a klient może go dotknąć, przełączyć zakres i zobaczyć, jak wygląda
codzienność po montażu. To jest odpowiednik "pokaż, nie obiecuj" z wariantu 1, ale zbudowany
z danych, nie z tabeli kosztów.

DWA REALNE ELEMENTY INTERAKTYWNE (oba muszą DZIAŁAĆ, nie być atrapą — ZASADY.md, i patrz
REJESTR-BLEDOW.md B-04: element z atrybutem disabled przechodzi testy programistyczne, a dla
człowieka jest martwy; używaj aria-disabled zamiast disabled):
1. **Panel produkcji na żywo** — wykres/słupki produkcji przykładowej instalacji z przełącznikiem
   zakresu (dziś / miesiąc / rok). Dane wpisane na sztywno w JS jako zestaw przykładowy, jawnie
   opisane jako przykładowa instalacja o konkretnej mocy, NIGDY udawane jako dane real-time
   klienta. Wykres rysuj natywnie (SVG albo divy z CSS) — ZERO bibliotek zewnętrznych, plik ma
   pozostać samodzielnym HTML bez build-stepu.
2. **Dobór mocy z rachunku** — suwak "ile płacisz miesięcznie za prąd" (np. 150–900 zł) →
   wyliczenie orientacyjnej mocy instalacji w kWp i rocznej produkcji w kWh, aktualizowane
   na żywo. OBOWIĄZKOWO z widoczną, nieusuwalną adnotacją, że to szacunek wstępny, bo realna
   moc zależy od autokonsumpcji, dachu i taryfy — ta branża ma problem reputacyjny z zawyżonymi
   wyliczeniami i wariant 2 nie może go pogłębiać.

NIE KOPIUJ mechanizmu z templates/pilot/remonty-3-kalkulator-online.html — tam kalkulator liczy
koszt remontu i jest osią całej strony. Tu suwak jest elementem DRUGIM, podporządkowanym panelowi
produkcji, i ma inny język wizualny. Przeczytaj remonty-3 wyłącznie po to, żeby się od niego
odróżnić, nie żeby się nim wzorować.

DRUGI FILAR TREŚCI — SERWIS ZDALNY: "zanim zadzwonisz, my już wiemy". Monitoring alarmowy
falownika: system wykrywa spadek produkcji albo awarię i firma dzwoni pierwsza. To jest realna,
sprawdzalna przewaga operacyjna i naturalne przedłużenie cyfrowej osi wariantu. Pokaż to jako
konkretny scenariusz (co się dzieje w godzinach od wykrycia do wizyty), nie jako hasło.

PALETA — TWARDE OGRANICZENIE. fotowoltaika-1 to stonowany błękit na jasnym neutralu i JUŻ JEST
TO TRZECI TAKI ZESTAW W BIBLIOTECE. Wariant 2 ma iść w przeciwną stronę: CIEMNY INTERFEJS
(grafit/prawie-czerń jako tło, panel monitoringu czyta się wtedy jak realny dashboard) z JEDNYM
mocno nasyconym akcentem. Zweryfikuj grepem (grep -rhoE "#[0-9a-fA-F]{3,6}" templates/pilot/*.html)
i omijaj: indygo-fiolet (remonty-3), teal (salon-fryzjerski-1), emerald (studio-paznokci-3),
eko-zieleń (nieruchomosci-2, elektryk-4), żółć/złoto (elektryk-1, fryzjer-barber-2), oraz
oczywiście błękit wariantu 1 (#3d6b91). Kierunki warte rozważenia: elektryzujący limonkowy /
chartreuse albo ostry cyjan-elektryk na grafitcie. Uzasadnij wybór w raporcie.
UWAGA: ciemne tło + jasny tekst to inny reżim kontrastu — sprawdź kontrast tekstu drugorzędnego
(--muted), bo to najczęstsze miejsce, gdzie ciemny motyw się sypie.
TYPOGRAFIA: inna niż Titillium Web / PT Sans (wariant 1) i nieużyta nigdzie w systemie
(zweryfikuj grepem). Dashboard znosi krój techniczny; cyfry w panelu produkcji powinny mieć
tabelaryczne odstępy (font-variant-numeric: tabular-nums), żeby nie skakały przy animacji.

ZDJĘCIA (zweryfikowane curl 200, obejrzane wzrokowo, pula ROZŁĄCZNA z wariantem 1 — użyj TYCH
DOKŁADNYCH URL, są w stałej FOTO):
- Osiedle z lotu ptaka, panele na wielu dachach (naturalny obraz "monitorujemy setki instalacji"):
  https://images.pexels.com/photos/9875676/pexels-photo-9875676.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Wnętrze falownika z bliska, listwy i elektronika (diagnostyka, serwis zdalny):
  https://images.pexels.com/photos/38171183/pexels-photo-38171183.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Z drona: technik idący po macierzy paneli (serwis w terenie, mocny kadr):
  https://images.pexels.com/photos/19895911/pexels-photo-19895911.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Top-down równa macierz paneli na dachu (precyzja montażu, geometryczna faktura):
  https://images.pexels.com/photos/7211069/pexels-photo-7211069.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Magazynu energii NIE ilustrujemy zdjęciem — dostępne stocki miały widoczne logo obcej firmy.
Ten temat pokaż elementem graficznym/danymi. Jeśli potrzebujesz więcej zdjęć, NIE zgaduj ID
Pexels: zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w raporcie.

TREŚĆ — sekcje: nav, hero (obietnica: zobacz panel, zanim podpiszesz), panel produkcji na żywo,
dobór mocy z rachunku, serwis zdalny i monitoring alarmowy (scenariusz godzina po godzinie),
co wchodzi w instalację (falownik, optymalizatory, magazyn energii — po ludzku, czym się różnią
i kiedy realnie się opłacają), dotacje (Mój Prąd, Czyste Powietrze — co robimy za klienta,
czego nie obiecujemy), opinie klientów (generyczne imiona + {{MIASTO}} + moc instalacji, NIGDY
nazwy firm ani zaszytych miast — to był realny błąd wariantu 1, ZASADY.md sekcja 5), FAQ, kontakt
z mapą. Gramatyka {{MIASTO}} wg ZASADY.md sekcja 2 — czytaj CAŁE zdania, grep tego nie łapie.

RUCH — to wariant "cyfrowy", więc ruch jest częścią przekazu, ale ma być funkcjonalny, nie
dekoracyjny: liczby w panelu doliczają się przy wejściu w widok, słupki wykresu wyrastają,
wskaźnik "na żywo" pulsuje, przełącznik zakresu animuje przejście. Wszystko pod
prefers-reduced-motion. Baseline ruchu z ZASADY.md obowiązuje jak zwykle.

REGUŁA 6.8 z ZASADY.md ORAZ REJESTR-BLEDOW.md: karta/tekst na zdjęciu musi być zweryfikowana
zrzutem na 360 i 390px. To już trzeci powtórzony błąd tego typu w projekcie — panel monitoringu
nałożony na zdjęcie hero jest DOKŁADNIE tym wzorcem, który dwa razy zasłonił zdjęcie na telefonie.
Na mobile panel ma iść POD zdjęcie, nie na nie.

LAYOUT — bespoke. Panel monitoringu, oś serwisu zdalnego i sekcja porównania falownik /
optymalizatory / magazyn to naturalnie unikalne dla tej branży elementy — zaprojektuj je od zera.
Nie przenoś siatki sekcji z fotowoltaika-1.`,
  },
];

module.exports = { VARIANTS, SAMPLE_TOKENS, FOTO };
