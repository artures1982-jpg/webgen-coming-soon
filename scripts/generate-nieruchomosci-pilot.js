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

VARIANTS.push({
  id: 'nieruchomosci-2-sprzedaz-w-twoim-terminie',
  tier: 'pro',
  name: 'Sprzedaż w Twoim terminie',
  visual: `STYL: adaptacja archetypu "Szybka interwencja 24h" dla agencji sprzedaży mieszkań —
UWAGA: dosłowne "pogotowie nieruchomości"/alarm/syreny nie mają sensu w tej branży (sprzedaż
mieszkania to nie awaria wymagająca natychmiastowej interwencji; to samo ograniczenie zadziałało
już w branży medycyna estetyczna, gdzie Artur wprost zabronił ram urgency/alarmu). Problem realnych
klientów tego wariantu to presja czasu z INNEGO powodu: przeprowadzka (nowa praca, już kupione
kolejne M i kredyt tyka), rozwód z terminem podziału majątku, spadek do szybkiego rozliczenia —
klient NIE MA miesięcy na czekanie, aż ktoś przypadkiem trafi na ogłoszenie.

MECHANIZM RÓŻNICUJĄCY (sedno wariantu, inny niż "szybka interwencja" w innych branżach): szybkość
NIE bierze się z obietnicy "zrobimy to błyskawicznie", tylko z tego, że agencja ma już GOTOWĄ,
AKTYWNĄ BAZĘ KUPUJĄCYCH szukających konkretnych typów mieszkań — oferta trafia od razu do kogoś,
kto już czeka, zamiast czekać aż nowe ogłoszenie kogoś znajdzie samo. To uczciwy, konkretny
mechanizm (nie pusta obietnica), spójny z uczciwością zbudowaną w wariancie 1 tej branży.

ZAKAZ (patrz brief wariantu 1, ta sama zasada obowiązuje tu jeszcze mocniej z racji archetypu):
zero "sprzedamy w 24h", zero "gwarantowana szybka sprzedaż za każdą cenę", zero języka
alarmowego/pogotowia. Konkretne liczby (rozmiar bazy kupujących, średni czas do pierwszego
kontaktu z zainteresowanym, liczba dopasowań w ostatnim miesiącu) SĄ dozwolone i pożądane jako
treść docelowa (ZASADY.md sekcja 5) — ale nie wolno formułować ich jako gwarancji wyniku dla
konkretnego mieszkania klienta.

Drugi wariant tej branży — różnicowanie względem nieruchomosci-1 (jasna kość słoniowa + granat/
mosiądz, statyczne sekcje, ton: spokojna uczciwość i proces). Ten wariant ma być bardziej
energetyczny/pilny w tonie (ale nie alarmowy) i wizualnie ciemniejszy.

WYMAGANY RUCH (obowiązkowy próg dla wariantu 2+, patrz .claude/agents/designer-ux-ui.md sekcja
"Nie czekaj aż użytkownik poprosi o więcej ruchu"): scrollujący marquee pasek "ostatnio
dopasowani kupujący" (np. krótkie wpisy typu "Kawalerka, Podgórze — dopasowana w 6 dni"), delikatny
glow/pulse na liczniku wielkości bazy kupujących w hero (subtelny, nie neonowy alarm), shimmer na
primary CTA, stopniowany fade-in kart. Pełny prefers-reduced-motion — wymień jawnie każdą
nietrywialną animację w komentarzu HTML.

PALETA — sprawdź grepem że nie koliduje z ŻADNYM wariantem w systemie (uruchom:
grep -rhoE "#[0-9a-fA-F]{3,6}" templates/pilot/*.html), w tym z nieruchomosci-1 (granat #2f2a58 +
mosiądz #a9814f na kości słoniowej #f8f2e2) i z całą rodziną "ciemne tło + jaskrawy akcent" już
zajętą w systemie (czerwień/pomarańcz: elektryk-2, hydraulik-2; złoto/bursztyn: fryzjer-barber-2,
salon-fryzjerski-2; limonka: remonty-2; róż/magenta: studio-paznokci-2; przygaszony róż-mauve:
medycyna-estetyczna-2; niebieski/cyan: hydraulik-3/6, fryzjer-barber-3, medycyna-estetyczna-3).
Zaproponuj coś jeszcze nieużytego jako główny wyrazisty akcent na ciemnym tle — np. wyrazista,
nasycona ZIELEŃ trawiasto-szmaragdowa (NIE zgaszona szałwia jak elektryk-4/fryzjer-barber-4/
medycyna-estetyczna-5, NIE niebiesko-zielony teal jak studio-paznokci-3 — czysta, żywa zieleń typu
"zielone światło/dopasowanie", co tematycznie pasuje do mechanizmu "kupujący już czeka") na bardzo
ciemnym, chłodnym grafitowym tle (inny odcień grafitu niż remonty-2 #16181a/#212426 i
studio-paznokci-3 #0e1116/#171b21 — zweryfikuj różnicę). TYPOGRAFIA: zweryfikuj grepem że nieużyta
nigdzie w systemie, w tym Vollkorn/Inter Tight z nieruchomosci-1.

ZDJĘCIA (już wyszukane przez Pexels API i zweryfikowane, użyj TEGO DOKŁADNEGO URL, nie zgaduj
innych):
- Szczęśliwa para niosąca kartony do nowego mieszkania, uśmiechnięci, ciepłe światło — symbolizuje
  świeży start po szybkiej sprzedaży/przeprowadzce:
  https://images.pexels.com/photos/7489130/pexels-photo-7489130.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Jeśli potrzebujesz więcej zdjęć — NIE zgaduj ID, zostaw "<!-- PHOTO NEEDED: opis -->" i wypisz w
raporcie. Sekcja bazy kupujących/dopasowań może być czysto UI/liczbowa (licznik, marquee, karty
"dopasowań") bez dodatkowych zdjęć — spójne z konwencją nieruchomosci-1 (sekcja "aktualne oferty"
też jest bezzdjęciowa).

TREŚĆ — sekcje: nav, hero (obietnica: oferta trafia od razu do czekających kupujących + licznik
wielkości bazy jako żywy element, nie statyczna liczba), marquee pasek "ostatnio dopasowani
kupujący" (przewijający się, kilka krótkich wpisów typu dzielnica + typ + "dopasowane w X dni" —
treść docelowa, nie placeholder), sekcja "jak przyspieszamy sprzedaż" (multi-kanałowy marketing
oferty, aktywna baza kupujących z zapisanymi kryteriami wyszukiwania, elastyczne pokazy wieczorami/
w weekendy, przygotowanie oferty pod realne oczekiwania kupujących z bazy), porównanie tempa
(np. "średni czas do pierwszego kontaktu z zainteresowanym kupującym" jako konkretna, uczciwa
liczba — NIE gwarancja czasu sprzedaży całej transakcji), opinie klientów którzy sprzedawali pod
presją czasu (generyczne imiona + miasto + krótki kontekst typu "przeprowadzka", NIGDY nazwy firm),
FAQ (w tym pytanie wprost adresujące sceptycyzm: "czy to nie obniża ceny sprzedaży?" — odpowiedź
uczciwa, że baza kupujących przyspiesza dotarcie do oferty, nie wymusza niższej ceny), kontakt z
mapą.

LAYOUT — bespoke mechanizm każdej sekcji, inny niż nieruchomosci-1 (tam: numerowane wiersze usług,
ticket-cards ofert, pionowa oś procesu) — zaproponuj np. hero z licznikiem/widgetem bazy kupujących
jako centralny wizualny element (nie karta z boku jak w wariancie 1), marquee jako osobny,
wyrazisty pasek między sekcjami, kafle "jak przyspieszamy" w innym układzie niż numerowana lista.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS };
