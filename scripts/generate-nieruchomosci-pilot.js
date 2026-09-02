#!/usr/bin/env node
// scripts/generate-nieruchomosci-pilot.js — pilot: warianty wizualne dla branży
// Nieruchomości (agencja sprzedaży mieszkań / biuro pośrednictwa: sprzedaż mieszkań i domów,
// wycena, doradztwo przy zakupie, obsługa formalności). Dziewiąta branża w systemie 5 archetypów.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym
// (patrz pamięć feedback_sequential_variant_workflow).

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'Metrum',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@metrum.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'metrum-krakow',
  '{{GODZINY_PON_PT}}': '9:00 – 18:00',
  '{{GODZINY_SOB}}': '10:00 – 14:00',
};

const VARIANTS = [
  {
    id: 'nieruchomosci-1-zaufany-posrednik',
    tier: 'free',
    name: 'Zaufany pośrednik',
    visual: `STYL: adaptacja archetypu "Zaufany fachowiec" dla agencji sprzedaży mieszkań — tu
zaufanie nie buduje się rzemiosłem, tylko UCZCIWOŚCIĄ WYCENY i ZNAJOMOŚCIĄ LOKALNEGO RYNKU.
Duch: "pośrednik, który mówi Ci prawdę o realnej cenie mieszkania i prowadzi Cię przez cały
proces (nie tylko wystawia ogłoszenie i znika)" — to jest branża, w której klienci najbardziej
boją się dwóch rzeczy: zawyżonej/zaniżonej wyceny i zostawienia samemu sobie z papierologią
(akt notarialny, kredyt kupującego, księga wieczysta). Klientela: sprzedający mieszkanie/dom,
przeważnie 30-55 lat, często sprzedają raz na kilka-kilkanaście lat i nie znają procesu.

Przeczytaj WYŁĄCZNIE jako inspirację ducha (nigdy jako bazę do kopiowania):
templates/pilot/remonty-1-zaufany-fachowiec.html i templates/pilot/hydraulik-1-zaufany-fachowiec.html
(oba najbliższe tematycznie — rzemieślnicze zaufanie) — Twoja wersja MUSI mieć inny mechanizm
wizualny każdej sekcji; nieruchomości to usługa doradczo-transakcyjna, nie fizyczna robota, więc
ton i struktura mają się różnić głębiej niż paletą.

PALETA — sprawdź grepem że nie koliduje z żadnym wariantem w systemie (uruchom:
grep -rhoE "#[0-9a-fA-F]{3,6}" templates/pilot/*.html). Zaproponuj kombinację w duchu "ustabilizowana,
poważna instytucja finansowa, ale ciepła, nie korporacyjnie zimna" — np. głęboki granat/indygo
(NIE dokładnie #1f3350 z hydraulik-5 ani #173aa8/#2454eb z hydraulik-6 — inny, cieplejszy odcień
granatu, bliżej indygo) w połączeniu z przygaszonym, antycznym mosiądzem/starym złotem (NIE jaskrawy
bursztyn/żółte złoto — tych odcieni jest już w systemie sporo: elektryk-1 #e8a317, fryzjer-barber-2
#e0a527, salon-fryzjerski-2 #f0c419, studio-paznokci-5 #9c7238, salon-fryzjerski-5 #8a6a2e —
Twój mosiądz ma być bardziej stonowany/zgaszony, bliżej "starego mosiądzu" niż "złota"), na ciepłej
kości słoniowej/kremie. Typografia: elegancki, ale nie zbyt ozdobny serif nagłówkowy (sygnalizuje
powagę transakcji finansowej) + czytelny, neutralny sans na treść — zweryfikuj grepem że oba
nieużyte w systemie.

ZDJĘCIA (już wyszukane i zweryfikowane curl 200, użyj TYCH DOKŁADNYCH URL, nie zgaduj innych):
- Pośredniczka pokazująca nowoczesne, jasne mieszkanie młodej rodzinie z dzieckiem (ciepła,
  autentyczna scena, nie sztywny stock):
  https://images.pexels.com/photos/7937330/pexels-photo-7937330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- Zbliżenie na dłonie przekazujące klucze przy finalizacji (uniwersalny, bezpieczny wybór —
  bez twarzy, działa jako motyw "domknięcia transakcji"):
  https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej zdjęć (np. do kart "aktualne oferty") — NIE zgaduj ID Pexels (ID strony
czasem nie pokrywa się z ID CDN, co już raz spowodowało 404 w tym projekcie). Zostaw czytelny
placeholder w kodzie: <!-- PHOTO NEEDED: krótki opis --> i wypisz w raporcie, uzupełnię i
zweryfikuję curl-em. Alternatywa w pełni akceptowalna dla kart ofert: potraktuj je jako
tekstowo-liczbowe karty (adres/dzielnica, metraż, liczba pokoi, cena, status) bez zdjęcia albo
z jednolitym tłem/ikoną zamiast fotografii — to częste w realnych serwisach nieruchomości i nie
wygląda na niedopracowane.

TREŚĆ — sekcje: nav, hero (obietnica: uczciwa wycena + pełne prowadzenie przez proces), usługi
(sprzedaż mieszkania/domu, bezpłatna wycena nieruchomości, doradztwo przy zakupie, pomoc w
formalnościach — akt notarialny/księga wieczysta/kredyt kupującego), sekcja "aktualne oferty" —
3-4 przykładowe karty ofert mieszkań (adres/dzielnica w {{MIASTO}}, metraż, liczba pokoi, cena,
status typu "nowa oferta"/"zarezerwowane") jako TREŚĆ DOCELOWA (klient nadpisze przy edycji, nie
placeholder-lorem), proces sprzedaży krok po kroku (np. bezpłatna wycena → przygotowanie
ogłoszenia i zdjęć → prezentacje → negocjacje → finalizacja u notariusza), sekcja "dlaczego my"/
"zaufali nam", opinie klientów (generyczne imiona indywidualnych sprzedających, NIGDY nazwy firm
klientów — sekcja "zaufali nam" jeśli ją dodajesz musi używać generycznych etykiet kategorii typu
"Sprzedający mieszkania", "Kupujący pierwsze M", nie zmyślonych nazw firm/deweloperów, patrz
ZASADY.md sekcja 5), FAQ, kontakt z mapą.

KRYTYCZNE OGRANICZENIE UCZCIWOŚCIOWE: zero obietnic typu "sprzedamy Twoje mieszkanie w 24h",
"zawsze najwyższa cena na rynku", "gwarantowana sprzedaż" — to nierealne i podważa dokładnie tę
uczciwość, którą ten wariant ma sprzedawać. Konkretne liczby (lata na rynku, liczba
sfinalizowanych transakcji, rok założenia, średni czas sprzedaży w dniach) są DOZWOLONE i pożądane
(ZASADY.md sekcja 5, decyzja 25.08.2026) — to nadpisywalna treść docelowa, nie fałszywa referencja
osoby trzeciej.

LAYOUT — zaproponuj bespoke mechanizm każdej sekcji, różny od remonty-1/hydraulik-1: to usługa
doradcza przy jednej z największych transakcji w życiu klienta, więc hero i "dlaczego my" mają
grać spokojem i konkretem (liczby, proces), nie rzemieślniczym "przyjedziemy szybko". Sekcja
"aktualne oferty" to naturalny, unikalny dla tej branży element — żadna inna branża w systemie go
nie ma, więc zaprojektuj jej mechanizm od zera (karty, nie kopiuj układu cennika z innych branż).`,
  },
];

module.exports = { VARIANTS, SAMPLE_TOKENS };
