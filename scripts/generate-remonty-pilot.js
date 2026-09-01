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

module.exports = { VARIANTS, SAMPLE_TOKENS };
