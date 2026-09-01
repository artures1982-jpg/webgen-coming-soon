#!/usr/bin/env node
// scripts/generate-remonty-pilot.js — pilot: warianty wizualne dla Firma remontowo-budowlana
// (start od wariantu 1 free), szósta branża w systemie 5 archetypów.
//
// Budowany PRZYROSTOWO, jeden wariant na raz, z checkpointem akceptacji Artura po każdym
// (decyzja 2026-09-01, patrz docs/produkcja-szablonow/README.md i pamięć
// feedback_sequential_variant_workflow). Na razie zdefiniowany tylko VARIANTS[0].

const SAMPLE_TOKENS = {
  '{{NAZWA_STRONY}}': 'RenoMax',
  '{{TELEFON}}': '500 123 456',
  '{{EMAIL}}': 'kontakt@renomax.pl',
  '{{MIASTO}}': 'Kraków',
  '{{ADRES}}': 'ul. Przykładowa 12',
  '{{SLUG}}': 'renomax-krakow',
  '{{GODZINY_PON_PT}}': '7:00 – 18:00',
  '{{GODZINY_SOB}}': '9:00 – 13:00',
};

const VARIANTS = [
  {
    id: 'remonty-1-zaufany-fachowiec',
    tier: 'free',
    name: 'Zaufany fachowiec',
    visual: `STYL: "Zaufany fachowiec" dla firmy remontowo-budowlanej (remonty mieszkań i domów,
łazienki, kuchnie, wykończenia po deweloperze). Szósta branża w systemie — punkty odniesienia do
odróżnienia: hydraulik-1, elektryk-1, studio-paznokci-1, fryzjer-barber-1 (przeczytaj wszystkie
cztery wyłącznie jako inspirację ducha, nigdy jako bazę).

STORYTELLING (KRYTYCZNE, patrz .claude/agents/copywriter-szablonow.md sekcja "Storytelling" —
dodana po zgłoszeniu Artura, że pilot Fryzjer/Barber wypadł "sucho"): sekcja "Nasza historia"
MUSI nieść konkretną, namacalną narrację właściciela (pierwsze zlecenie, jak firma wyglądała na
starcie, konkretny szczegół), nie ogólnik "działamy od X lat". H1 w hero NIE może być czystą
etykietą kategoria+miasto.

PALETA (jako zmienne CSS, zablokowane wartości, sprawdzone grepem po templates/pilot/*.html że
nie kolidują z żadnym istniejącym wariantem w systemie): --bg chłodny, jasny, "betonowo-stalowy"
błękitno-szary (np. #eef2f3 — inny rejestr niż ciepłe ivory/beże większości poprzedników),
--surface głębszy chłodny szaro-błękit, wyraźnie ciemniejszy od --bg (np. #dde4e6), --accent
stonowany stalowy niebiesko-szary (np. #4a6572 — solidny, "budowlany", inna rodzina niż
navy/violet/cyan/magenta/emerald/bordo/amber już użyte), --accent-dark głębszy grafitowo-stalowy
(np. #2c3e46), --text ciemny niebiesko-grafitowy (np. #1e2a2e), --muted chłodny szary (np.
#5c6b6f).
TYPOGRAFIA: nagłówki mocny, sturdy grotesk (np. Barlow, waga 700-800 — inny niż Barlow Condensed
z hydraulik-2/elektryk-2), tekst czytelny sans (np. Noto Sans).

ZDJĘCIA (już wyszukane i wizualnie zweryfikowane przez Artura/sesję, zero kolizji ID z resztą
systemu):
- HERO (mieszkanie w trakcie remontu — gołe ściany, drabina, autentyczny "work in progress",
  NIE glossy gotowy wnętrze): https://images.pexels.com/photos/36035073/pexels-photo-36035073.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- REALIZACJA 1 (nowoczesna łazienka po remoncie, szklana kabina prysznicowa):
  https://images.pexels.com/photos/7031840/pexels-photo-7031840.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- REALIZACJA 2 (nowoczesna kuchnia po remoncie, jasna zabudowa, okrągły stół):
  https://images.pexels.com/photos/7166645/pexels-photo-7166645.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940

LAYOUT:
1. Nav: logo "RenoMax" jako wordmark z małą ikoną (np. kątownik/poziomica), linki, CTA
   "Bezpłatna wycena" jako wypełniona pigułka.
2. Hero: pełnoekranowe zdjęcie mid-remontu jako tło z overlay, tekst wyrównany do lewej w górnej
   połowie (nie dół jak fryzjer-1, nie środek jak hydraulik-1). H1 NIE etykieta — konkretny hook
   związany z podejściem firmy (np. o rozmowie/wycenie/rzetelności, nie "Remonty — Kraków").
3. Sekcja "Nasza historia": pojedynczy, tekstowy blok (bez zdjęcia — kontrast wobec fotograficznych
   "o nas" poprzedników) z konkretną narracją początków firmy (patrz STORYTELLING powyżej),
   pull-quote-style pierwsze zdanie wyróżnione wizualnie.
4. Sekcja "Nasze realizacje": 2 duże zdjęcia (łazienka, kuchnia) każde z konkretnym opisem
   projektu (metraż, zakres prac, czas realizacji — nie ogólnik "pięknie wykonane").
5. Sekcja CENNIK: usługi z orientacyjną ceną za m² (realistyczne dla branży remontowej — nie
   sztywna cena jak u fryzjera, tylko "od X zł/m²"), karty z ikoną.
6. Sekcja "Jak pracujemy": 4 kroki poziomo (oględziny+wycena → projekt+harmonogram →
   realizacja z raportem → odbiór+gwarancja).
7. Opinie: 2-3 krótkie cytaty klientów.
8. FAQ — accordion.
9. Kontakt: split formularz + dane + mapa.
10. Stopka: 2-kolumnowa.`,
  },
];

VARIANTS.push({
  id: 'remonty-2-szybki-start',
  tier: 'pro',
  name: 'Szybki start / bez czekania',
  visual: `STYL: adaptacja archetypu "Szybka interwencja 24h" — dla remontów realistyczna rama to
NIE fizyczne zagrożenie (jak hydraulik/elektryk), tylko realny, powszechny ból tej branży: firmy
remontowe są zwykle zarezerwowane na miesiące do przodu. Ten wariant sprzedaje SZYBKI START —
zarezerwowany bufor mocy przerobowej na mniejsze/pilne prace (awarie, poprawki przed sprzedażą,
szkody po zalaniu), nie pełne metraże jak wariant 1. Duch: "inni każą czekać, my zaczynamy w tym
tygodniu" — energia i dostępność, nie fałszywy alarm.

Drugi wariant tej branży — różnicowanie względem remonty-1 (jasny stalowo-szary #eef2f3/#4a6572,
Barlow/Noto Sans, hero pełnoekranowe zdjęcie z lewym tekstem, storytelling bez zdjęcia, portfolio
2 zdjęcia, cennik 6 kart, proces 4 kroki na ciemnym pasie): ten wariant ciemny, bez zdjęcia w
hero (typograficzny hero na hazard-stripe teksturze), storytelling Z JEDNYM zdjęciem zespołu.

WYMAGANY RUCH (wariant PRO, patrz .claude/agents/designer-ux-ui.md "Wariant 1 spokojny, wariant
2+ może żyć"): pulsująca plakietka dostępności w nav, marquee pasek wolnych terminów, glow-border
shimmer na CTA telefon w hero, jednorazowy fade-in scenariusza i kart. WYMÓG
prefers-reduced-motion — wymień explicite w CSS: (1) plakietka "wolne terminy" w nav, (2) marquee
pasek pod hero, (3) shimmer/glow CTA telefon, (4) fade-in scenariusza (storytelling), (5) fade-in
kart "Naprawimy szybko", (6) fade-in plakietek USP.

PALETA (zablokowane, sprawdzone grepem że nie kolidują z żadnym wariantem w systemie): --bg
neutralny, chłodny ciemny grafit "asfalt" (np. #16181a — inny niż navy/violet/plum/brown-black
dotychczasowych ciemnych wariantów), --surface odrobinę jaśniejszy neutralny grafit (np.
#212426), --accent jaskrawy limonkowo-żółty "hi-vis" (np. #c9d92e — kolor kamizelki
ostrzegawczej/taśmy budowlanej, żadna dotychczasowa branża go nie używa), --accent-dark
przygaszona oliwkowa żółć (np. #8a9820), --text ciepława prawie-biel (np. #eef0e6), --muted
stonowany chłodny szaro-zielony (np. #9aa39c).
TYPOGRAFIA: nagłówki bardzo mocny, kanciasty display (np. Anton — inny niż wszystkie
dotychczasowe), tekst czytelny sans (np. Rubik). Zweryfikuj grepem po templates/pilot/*.html.

ZDJĘCIE (już wyszukane, zero kolizji ID): zespół przy pracy przy zabudowie z drewna, dynamiczna,
energiczna scena (kilku pracowników naraz — wspiera narrację "mobilizujemy ekipę szybko"):
https://images.pexels.com/photos/6454230/pexels-photo-6454230.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Użyte WYŁĄCZNIE w sekcji storytelling, NIE w hero (hero jest typograficzny, bez zdjęcia — patrz
LAYOUT).

STORYTELLING (KRYTYCZNE, ta sama zasada co wariant 1): sekcja z konkretnym scenariuszem, nie
ogólnikiem — np. realna sytuacja klientki, której zalało łazienkę dzień przed wprowadzeniem
najemcy, i jak szybko zareagowała ekipa. H1 w hero nie może być etykietą.

LAYOUT:
1. Nav: ciemna, logo jak w wariancie 1 (ale kolorystyka ciemna), mała pulsująca plakietka
   "🟢 Wolne terminy w tym tygodniu" obok CTA "Sprawdź terminy" (wypełniona pigułka --accent).
2. Hero: BEZ zdjęcia — ciemne tło z subtelną diagonalną teksturą "hazard stripe"
   (repeating-linear-gradient w var(--accent) przy niskiej przezroczystości przez color-mix),
   duży, kanciasty H1 (nie etykieta — konkretny hook o czekaniu/szybkim starcie), lead, CTA
   telefon z animowanym glow-border (shimmer), drugorzędny link "Zobacz wolne terminy".
3. Pasek marquee pod hero: przesuwający się poziomo tekst z rotującymi wolnymi terminami i
   numerem telefonu, pauza na hover, statyczny pod reduced-motion.
4. Sekcja storytelling (z JEDNYM zdjęciem zespołu, w przeciwieństwie do beztekstowego wariantu 1):
   konkretny scenariusz klientki (patrz STORYTELLING), zdjęcie obok tekstu, fade-in przy scrollu.
5. Sekcja "Naprawimy szybko": siatka kart typowych pilnych prac (przeciekający dach po burzy,
   pęknięta rura i zalana podłoga, poprawki przed sprzedażą mieszkania, szkody po zalaniu
   sąsiada, drobne prace przed odbiorem najmu, naprawa po awarii) z subtelnym glow-border na
   hover (bez pętli).
6. Sekcja "Dlaczego szybciej niż inni": 3-4 plakietki USP z jednorazowym fade-in.
7. FAQ — accordion, ciemna stylistyka.
8. Kontakt: pasmo CTA telefon (duży przycisk) + pasek danych + mapa — BEZ pełnego formularza
   (świadomy wyjątek, ten sam powód co w innych branżach: telefon szybszy niż formularz przy
   pilnej sprawie).
9. Stopka: ciemna, minimalna, jedna linia + copyright.`,
});

VARIANTS.push({
  id: 'remonty-3-kalkulator-online',
  tier: 'pro',
  name: 'Nowoczesny cyfrowy',
  visual: `STYL: adaptacja archetypu "Nowoczesny cyfrowy" — w innych branżach to formularz
wyceny/rezerwacja online jako primary CTA. Dla remontów naturalny cyfrowy odpowiednik to
KALKULATOR KOSZTU REMONTU ONLINE — wybierasz typ pomieszczenia, metraż i standard wykończenia,
widget od razu pokazuje orientacyjne widełki cenowe. Duch: "policz orientacyjny koszt w 60
sekund, zanim jeszcze zadzwonisz" — samoobsługowa transparentność zamiast czekania na telefon
od handlowca.

Trzeci wariant tej branży — różnicowanie względem remonty-1 (jasny stalowo-szary, hero pełne
zdjęcie) i remonty-2 (ciemny neutralny asfalt + limonka, hero typograficzny na hazard-stripe):
ten wariant ciemny, ale INNY odcień niż wariant 2 — nie kolejny "prawie czarny" neutralny
grafit, tylko średnio-ciemny indygo-fiolet (żeby nie wpaść w ten sam rejestr "prawie czarny"
co większość dark-mode wariantów w całym systemie).

WYMAGANY RUCH: kalkulator MUSI być realnie interaktywny (JS, nie tylko wygląda jak widget) —
klik w typ pomieszczenia/standard aktualizuje wyświetlaną wycenę. Poprawka 2026-09-01 (Artur:
"czemu wciąż brak błysków/refleksów i ruchu") — pierwsza wersja była zbyt spokojna jak na tier
pro; dodano: pulsująca poświata w tle hero za kalkulatorem (radial-gradient, keyframe
heroGlowPulse, pętla), shimmer-sweep na przyciskach CTA (.btn-glow, ten sam mechanizm co
remonty-2 — dopuszczalne powtórzenie uniwersalnej techniki), świecący pierścień na AKTYWNYM
chipie (box-shadow, statyczny, nie pętla), jednorazowy błysk/flash-sweep na boksie wyniku przy
KAŻDYM przeliczeniu (klasa .flash dodawana w JS przy recalc, animacja .7s). Dodatkowo:
jednorazowy fade-in sekcji "Jak to działa" i kart zaufania. WYMÓG prefers-reduced-motion —
KONKRETNA LISTA: (1) pulsująca poświata hero, (2) shimmer-sweep na CTA, (3) flash-sweep na
wyniku kalkulatora, (4) fade-in sekcji. Sama aktualizacja liczby w kalkulatorze (zmiana treści)
nie wymaga wyłącznika, ale towarzyszący jej flash-sweep (ruch wizualny) już tak.

PALETA (zablokowane, sprawdzone grepem że nie kolidują z żadnym wariantem w systemie): --bg
średnio-ciemny indygo-fiolet, WYRAŹNIE jaśniejszy niż "prawie czarne" tła innych dark-mode
wariantów w systemie, żeby nie zlewać się z tamtym rejestrem (np. #221f42), --surface jaśniejszy
indygo (np. #2c2856), --accent nasycony elektryczny fiolet-magenta (np. #a855f7 — inna rodzina
niż niebiesko-fioletowy #7c5cff z elektryk-3), --accent-dark głębszy fiolet (np. #7c3aed), --text
jasna lawenda-biel (np. #f0edf9), --muted stonowany fioletowo-szary (np. #a79bc7).
TYPOGRAFIA: nagłówki mocny geometryczny grotesk (np. Chivo — nieużyty jeszcze w systemie), tekst
czytelny sans (np. Hanken Grotesk — nieużyty jeszcze w systemie). Zweryfikuj grepem.

ZDJĘCIE (już wyszukane, zero kolizji ID): dłonie analizujące plan pomieszczeń na papierze —
wspiera narrację "planowanie/wycena zanim zaczniemy pracę fizycznie":
https://images.pexels.com/photos/9052461/pexels-photo-9052461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Użyte jako mniejszy, inset element w hero (obok/za kalkulatorem), NIE jako dominujące tło —
kalkulator jest głównym elementem wizualnym hero.

STORYTELLING: sekcja z konkretnym powodem zbudowania kalkulatora (np. frustracja klientów
rozbieżnymi, nieporównywalnymi wycenami od różnych ekip — real pain point), nie ogólnik.

LAYOUT — inny mechanizm niż hydraulik-3/elektryk-3/studio-paznokci-3/fryzjer-barber-3 (sprawdź
te pliki dla przypomnienia ich konkretnych mechanizmów przed projektowaniem) i inny niż
remonty-1/2:
1. Nav: ciemna, sticky, CTA "Policz koszt" (pigułka) przewija do kalkulatora w hero.
2. Hero: 2 kolumny — lewo tekst (eyebrow, H1 nie-etykieta, lead, brak CTA telefon jako primary —
   scroll-link do kalkulatora), prawo KALKULATOR: 4 chipy typu pomieszczenia (Łazienka / Kuchnia
   / Salon / Całe mieszkanie), pole/suwak metrażu, 3 chipy standardu (Podstawowy / Standard /
   Premium), duży wynik "Orientacyjny koszt: XX XXX – YY YYY zł" aktualizowany po każdej zmianie
   (prosta matematyka w JS: stawka za m² × metraż, różna stawka per pomieszczenie+standard).
   Zdjęcie z listy powyżej jako mały, częściowo zasłonięty inset za/obok kalkulatora.
3. Sekcja storytelling: dlaczego kalkulator (patrz wyżej), fade-in przy scrollu.
4. Sekcja "Jak to działa": 3 kroki (Policz orientacyjny koszt online → Umów bezpłatne oględziny
   → Otrzymaj dokładną wycenę pisemną) jako pozioma lista, fade-in przy scrollu.
5. Sekcja zaufania: mała statystyka "X wyliczeń w tym miesiącu" + jeden krótki cytat w stylu
   dymka czatu.
6. FAQ — accordion, ciemna stylistyka.
7. Kontakt: skrót wyniku z kalkulatora (jeśli użyty) + CTA "Umów oględziny" + dane + mapa. Bez
   pełnego formularza — kalkulator + jeden przycisk to primary CTA tego wariantu.
8. Stopka: ciemna, minimalna.`,
});

VARIANTS.push({
  id: 'remonty-4-rodzinna-firma',
  tier: 'pro',
  name: 'Rodzinna firma',
  visual: `STYL: archetyp "Rodzinna firma" — firma rodzinna, stała, mała ekipa, którą klient
poznaje osobiście, nie anonimowi podwykonawcy zmieniający się z remontu na remont. Duch: "za
każdym razem ta sama ekipa — nie loteria, kogo firma akurat wyśle".

RÓŻNICA WOBEC REMONTY-1: wariant 1 już opowiada historię założyciela (2011, jeden bus) w duchu
transparentności/zaufania (to teraz uniwersalny wymóg storytellingu, nie unikalna cecha
wariantu 1) — wariant 4 NIE powtarza tej samej historii innymi słowami. Tu punkt ciężkości to
CIĄGŁOŚĆ i ZNAJOMOŚĆ ekipy TERAZ (kto przyjedzie, ile lat razem pracują), nie geneza firmy.

WAŻNE OGRANICZENIE: zdjęcie przedstawia dwóch konkretnych, prawdziwych ludzi ze zdjęcia
stockowego — NIE przypisuj im wymyślonej relacji (np. "ojciec i syn") ani imion, to byłoby
zmyślanie faktu o rozpoznawalnych osobach. Pisz o "naszej stałej ekipie" / "tym samym zespole"
ogólnie, bez fabrykowania szczegółów biograficznych konkretnych osób na zdjęciu.

WYCISZONY RUCH (świadomy wyjątek od nowego progu ruchu dla wariantów 2+, patrz
.claude/agents/designer-ux-ui.md — archetyp 4 zostaje spokojny mimo tieru pro): WYŁĄCZNIE
jednorazowy fade-in przy scrollu na liście/kartach, zero ambientowego glow w tle, zero
shimmer na CTA. WYMÓG prefers-reduced-motion: fade-in musi mieć natychmiastowy stan końcowy.

PALETA — POPRAWKA 2026-09-01 (Artur: "kolorystyka taka sama jak w poprzednich a miało tak nie
być"): pierwsza wersja (ceglasta czerwień #a14a3a na ciepłej glinie #f2e6d8) była technicznie
inna liczbowo od reszty systemu, ale PERCEPCYJNIE wpadała w ten sam rejestr "ciepła kremowa +
czerwono-ceglasty/terakotowy akcent" co fryzjer-barber-1 (bordo/kamienny beż) i
hydraulik-4-rodzinna-firma (terakota/ivory) — sam numer hex nie wystarczy, jeśli nastrój na oko
jest ten sam. Poprawiona paleta (zablokowana): --bg zneutralizowany, stonowany szaro-beż z
lekkim zielonym odcieniem (NIE różowo-pomarańczowa glina — np. #e6e3d5), --surface głębszy
stonowany szaro-beż (np. #d9d4c0), --accent oliwkowo-musztardowy brąz-zieleń (np. #7d6b2e —
genuinie inna rodzina barw niż WSZYSTKIE dotychczasowe czerwienie/terakoty/pomarańcze w
systemie, i inna niż istniejące zielenie sage/forest #6b8f5e/#3f6b4a — bardziej żółto-zielony,
"oliwkowy", nie "leśny"), --accent-dark głębsza oliwka (np. #574a1f), --text ciemny
oliwkowo-brązowy, --muted stonowany szaro-brąz.
TYPOGRAFIA: nagłówki ciepły literacki serif (np. Spectral — nieużyty jeszcze w systemie), tekst
czytelny sans (np. Be Vietnam Pro — nieużyty jeszcze w systemie). Zweryfikuj grepem.

ZDJĘCIA — POPRAWKA 2026-09-01 (Artur: "zdjęcie powtarza się na całej stronie tylko jedno"):
jedno zdjęcie użyte identycznie w hero+ekipa+kontakt czytało się jako lenistwo, nie spójność.
Teraz DWA różne, tematycznie spójne zdjęcia:
- HERO + KONTAKT (mały kadr) — dwóch uśmiechniętych pracowników w identycznych kombinezonach,
  spokojna, portretowa scena: https://images.pexels.com/photos/3879758/pexels-photo-3879758.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
- SEKCJA "POZNAJ NASZĄ EKIPĘ" — inne, dynamiczne zdjęcie: dwóch roześmianych pracowników na
  budowie w kaskach i kamizelkach, energiczna scena "przy pracy" (kontrast wobec spokojnego
  zdjęcia hero — ta sama ekipa, inny moment):
  https://images.pexels.com/photos/38706757/pexels-photo-38706757.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
Powtórzenie hero→kontakt (to samo zdjęcie, mniejszy kadr) zostaje — to ustalony wzorzec
hydraulik-4/elektryk-4/fryzjer-4/studio-4 i nie było tym, co Artur zgłosił; problemem było
DOKŁADNIE TO SAMO zdjęcie w PEŁNOWYMIAROWEJ sekcji "ekipa" tuż pod hero.

LAYOUT — inny mechanizm niż remonty-1/2/3 i sprawdź konkretne mechanizmy hydraulik-4/
elektryk-4/fryzjer-4 (przeczytaj wszystkie trzy) zanim zaprojektujesz:
1. Nav: jasna, statyczna, prosty sticky, CTA "Zadzwoń: {{TELEFON}}" jako główne CTA (osobisty
   kontakt, nie kalkulator/marquee jak poprzednie warianty).
2. Hero: zdjęcie w dużym zaokrąglonym kwadracie PO PRAWEJ + tekst po lewej (eyebrow, H1 o
   ciągłości ekipy — nie etykieta, lead, CTA telefon).
3. Sekcja "Poznaj naszą ekipę": zdjęcie (to samo, mniejsze) PO LEWEJ tym razem (odwrócona
   kolejność względem hero) + tekst PO PRAWEJ o stałości zespołu, z konkretem (lata razem, ile
   realizacji rocznie) — fade-in przy scrollu.
4. Sekcja usług: JEDNOKOLUMNOWA lista (nie siatka kart jak remonty-1) — nazwa usługi + krótki
   opis + ikona, oddzielone cienką linią, fade-in przy scrollu.
5. Sekcja opinii: JEDEN duży, wyśrodkowany cytat (nie siatka 3 jak remonty-1).
6. FAQ — accordion, jasna stylistyka.
7. Kontakt: zdjęcie (małe, okrągłe) + telefon jako duży link + dane + mapa. Bez formularza —
   telefon jest głównym, osobistym kanałem kontaktu tego wariantu.
8. Stopka: jasna, prosta, wyśrodkowana, jedna linia + copyright.`,
});

module.exports = { VARIANTS, SAMPLE_TOKENS };
