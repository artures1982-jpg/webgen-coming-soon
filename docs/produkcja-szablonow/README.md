# Produkcja szablonów — projekt

Stan na: 6 września 2026 — **10 branż ukończonych, 47 wariantów** w `templates/pilot/`, wszystkie
komplety. Dodatkowo **1 branża porzucona na etapie briefu** (`fizjoterapia` — zero plików, patrz
sekcja niżej); nie licz jej do statusu ukończonych. Statusy niżej liczone z plików, nie z pamięci
sesji.

Projekt zbiera **proces wytwarzania szablonów stron** dla webgen.pl: jak powstaje pojedynczy
wariant wizualny, jakie zasady musi spełnić, jak go zweryfikować i jak wygląda podział pracy.
Powstał na bazie pilota branży **Hydraulik** (6 wariantów, komplet ukończony).

**Zanim zaczniesz kolejny wariant w drugiej (lub dowolnej następnej) branży, przeczytaj
`ZASADY.md` sekcja 0** — każda branża dostaje bespoke wykonanie, zero kopiowania layoutu z
odpowiednika w innej branży. Ta zasada była złamana dwukrotnie (elektryk-1, elektryk-4) zanim
trafiła do dokumentu.

## ⚠️ AKTUALNA FORMUŁA BRANŻY — 3 warianty (decyzja Artura, 03.09.2026)

**Każda NOWA branża od teraz dostaje dokładnie TRZY warianty, nie pięć:**

| # | Tier | Co to jest |
|---|------|------------|
| 1 | free | Archetyp zaufania („Zaufany fachowiec") zaadaptowany do branży |
| 2 | pro | **Losowy archetyp** z puli 2–5 („Szybka interwencja 24h", „Nowoczesny cyfrowy", „Rodzinna firma", „Premium/korporacyjny") — zaadaptowany, nie przeszczepiony dosłownie |
| 3 | pro | **„Petarda"** — wariant popisowy: kinowa fotografia, mocna typografia, najmocniejszy ruch w branży |

**Ważne dla wariantu 3**: systemowa konwencja, że archetyp premium ma wyciszony ruch (tylko
fade-in), **NIE obowiązuje w „petardzie"** — ten wariant ma być najbardziej animowany w swojej
branży. Zapisz to jawnie w briefie jako świadome odstępstwo, żeby nikt później nie odczytał tego
jako przypadkowego złamania zasady.

Ta decyzja **zastępuje** wcześniejszą formułę 5 archetypów (26.08.2026, patrz niżej). **Nie
retrofituj gotowych branż** — Hydraulik (6 wariantów) oraz Elektryk, Fryzjer-barber, Salon
fryzjerski, Studio paznokci, Remonty, Medycyna estetyczna i Nieruchomości (po 5) zostają bez
zmian. `auta-z-ameryki` była pierwszą branżą zbudowaną wg nowej formuły (3/3, wariant 3 jako
petarda), jeszcze zanim reguła została sformułowana ogólnie.

---

**Poprzednia decyzja produktowa (26.08.2026), zastąpiona powyższą — zostawiona dla kontekstu
istniejących branż:** archetyp 6 „Minimalistyczny one-pager" jest WYCOFANY z
systemu na przyszłość. Branże z tamtego okresu (Elektryk, Studio paznokci i kolejne) dostawały 5
archetypów: 1 (free, „Zaufany fachowiec") + 2–5 (pro). Nie buduj już wariantu 6 dla żadnej
branży — Elektryk zostaje na 5/5 po ukończeniu wariantu 5, nie ma zaplanowanego wariantu 6.
Dodatkowo: **wariant 2 i wyżej to szablony premium (pro) — wolno (należy) używać tam ruchu**
(animacje, poświata/glow, fade-in przy scrollu, shimmer, poruszające się paski) jako trzeciego
wymiaru różnicowania obok struktury i palety — patrz `.claude/agents/designer-ux-ui.md` sekcja
„Wariant 1 (free) spokojny, wariant 2+ (pro) może żyć". `hydraulik-6-minimalistyczny.html`
zostaje jako już wysłana, historyczna praca — ta decyzja NIE każe go usuwać ani wycofywać,
dotyczy wyłącznie tego, co budujemy od teraz.

Dokumenty w tym katalogu:

| Plik | Zawartość |
|------|-----------|
| `README.md` | Ten plik — pipeline, status, podział pracy, stan środowiska |
| `ZASADY.md` | Twarde reguły + pułapki wykryte w praktyce + checklista weryfikacji |

---

## Pipeline — jak powstaje jeden wariant

Od 25.08.2026 pipeline korzysta z dwóch subagentów zdefiniowanych w `.claude/agents/`
(`designer-ux-ui`, `copywriter-szablonow`) — dostępnych dla **każdej** sesji Claude Code
pracującej na tym repo, nie tylko dla tej, która je odpaliła. Nie zastępują sesji „generacja"
(patrz niżej) — dochodzą jako przegląd/QA wokół jej pracy.

```
1. BRIEF          scripts/generate-hydraulik-pilot.js → VARIANTS[n].visual
                    + stała CSS_VAR_REQUIREMENT (wspólna dla wszystkich wariantów)
                    ↓
2. DESIGN BRIEF   subagent designer-ux-ui czyta rodzeństwo wariantów (tej i innych branż)
                    i proponuje layout różnicujący nav/hero/usługi/sekcje — zanim powstanie kod
                    ↓
3. PROMPT         lib/promptBuilder.js → buildTemplatePrompt(styleConfig, firmaTokens)
                    (skleja: SYSTEM_BASE + visual + CSS_VAR_REQUIREMENT + dane/tokeny + TRYB SZABLONU)
                    ↓
4. GENERACJA      node scripts/generate-hydraulik-pilot.js   ← wymaga ANTHROPIC_API_KEY
                    ALBO autorsko, na podstawie tego samego briefu (patrz „Stan środowiska")
                    ↓
5. COPY PASS      subagent copywriter-szablonow przepisuje treść wygenerowanego pliku pod
                    ton wariantu + gramatykę {{MIASTO}}/referencji (ZASADY.md sekcje 2 i 5)
                    ↓
6. DESIGN QA PASS subagent designer-ux-ui na gotowym pliku: literały hex poza :root, zdjęcia,
                    mapa, pułapki mobile (ZASADY.md sekcje 1/3/4/6) + czy copy nie rozjechał layoutu
                    + jeśli odpowiednik archetypu istnieje w innej branży: diff CSS (ZASADY.md
                    sekcja 0) — NIE briefuj agenta że podobieństwo jest zamierzone, każ mu polować
                    + paleta odróżnia się nastrojem (jasność/tło/kontrast), nie tylko odcieniem
                    akcentu na tym samym jasnym tle
                    ↓
7. WERYFIKACJA    podgląd w przeglądarce, sekcja po sekcji (checklista w ZASADY.md) — robi to
                    główna sesja, subagenci nie mają dostępu do przeglądarki
                    ↓
8. 3 PLIKI        templates/pilot/<id>.html              ← literalne tokeny {{...}}
                  preview/hydraulik/<id>.html            ← identyczna kopia
                  preview/hydraulik/<id>-preview-wypelniony.html ← dane przykładowe
                    ↓
9. COMMIT         branch preview/hydraulik-pilot → push → podgląd na Vercelu
```

### Dane przykładowe (wersja „wypełniony")

Stały zestaw dla wszystkich wariantów — dzięki temu style da się porównywać 1:1:

| Token | Wartość |
|-------|---------|
| `{{NAZWA_STRONY}}` | HydroFix |
| `{{TELEFON}}` | 500 123 456 |
| `{{EMAIL}}` | kontakt@hydrofix.pl |
| `{{MIASTO}}` | Kraków |
| `{{ADRES}}` | ul. Przykładowa 12 |
| `{{SLUG}}` | hydrofix-krakow |
| `{{GODZINY_PON_PT}}` | 7:00 – 20:00 |
| `{{GODZINY_SOB}}` | 8:00 – 14:00 |

Generowanie kopii wypełnionej to zwykły `String.split().join()` po mapie tokenów — bez
regexów, żeby nie rozjechać znaków specjalnych w polskich nazwach.

---

## Status pilota Hydraulik — 6/6

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `hydraulik-1-zaufany-fachowiec` | Zaufany fachowiec | free | Ciepły, lokalny; zdjęcia w kartach usług |
| 2 | `hydraulik-2-szybka-interwencja` | Szybka interwencja 24h | pro | Alarm 24/7, telefon ogromną czcionką, pulsujący pasek |
| 3 | `hydraulik-3-nowoczesny-cyfrowy` | Nowoczesny cyfrowy | pro | Ciemny motyw, glassmorphism, formularz wyceny jako CTA |
| 4 | `hydraulik-4-rodzinna-firma` | Rodzinna firma | pro | Kremowy, osobisty, „poznaj właściciela", oś czasu |
| 5 | `hydraulik-5-premium-korporacyjny` | Premium / korporacyjny | pro | B2B, case studies z metrykami, granat + serif |
| 6 | `hydraulik-6-minimalistyczny` | Minimalistyczny one-pager | pro | Bez zdjęć i mapy, maksymalnie lekki |

### Świadome wyjątki — NIE traktować jako błędy do naprawienia

Każdy z nich był kiedyś zgłoszony jako „brak" i wymagał wyjaśnienia. Są celowe:

- **Wariant 2** — siatka 6 ikon typów awarii zamiast zdjęć (szybkie skanowanie wzrokiem
  w sytuacji awaryjnej działa lepiej niż fotografia).
- **Wariant 4** — usługi jako prosta lista tekstowa, nie karty ze zdjęciami (kontrast wobec
  pozostałych wariantów, mniej „sprzedażowo").
- **Wariant 6** — brak zdjęć, brak mapy, brak hamburgera, brak FAQ (priorytet: waga i szybkość
  strony; adres zostaje czystym tekstem).

---

## Status pilota Elektryk — 5/5

Druga branża w systemie, pierwsza budowana już po Hydrauliku — i pierwsza, na której wyszło, że
„ten sam archetyp w innej branży" kusi do przeklejenia layoutu rodzeństwa.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `elektryk-1-zaufany-fachowiec` | Zaufany fachowiec | free | Biel + elektryczny bursztyn (`#e8a317`) na kremowym surface, Manrope/Source Sans 3; hero fotograficzny, karty usług ze zdjęciami |
| 2 | `elektryk-2-szybka-interwencja` | Szybka interwencja 24h | pro | Prawie czarny grafit w hero + hi-vis pomarańcz (`#ff5a1f`), Barlow Condensed; siatka dużych ikon zagrożeń zamiast zdjęć, pozioma listwa certyfikacji |
| 3 | `elektryk-3-nowoczesny-cyfrowy` | Nowoczesny cyfrowy | pro | Ciemne indygo (`#0d0a1a`) + neonowy fiolet (`#7c5cff`), Sora/Inter; formularz wyceny online jako primary CTA zamiast telefonu |
| 4 | `elektryk-4-rodzinna-firma` | Rodzinna firma | pro | Kremowy len (`#faf6ec`) + szałwiowa zieleń (`#6b8f5e`), Quicksand/Karla; młody właściciel, który przejął rzemiosło po rodzicu, sekcja „Jak to się zaczęło" |
| 5 | `elektryk-5-premium-korporacyjny` | Premium / korporacyjny | pro | Chłodny tintowany grafit (`#f2f4f6`) + terakotowa miedź (`#a85c32`), Bodoni Moda/IBM Plex Sans; B2B, „Nasz proces" + realizacje + „Zaufali nam", formularz zapytania |

### Poprawki po feedbacku i świadome decyzje

- **Warianty 1–4 były pierwotnie kalką layoutu hydraulika** (najjaskrawiej wariant 4: CSS/markup
  1:1 z `hydraulik-4-rodzinna-firma.html`, tylko przekolorowany — złapał to Artur). Przepisane od
  zera; to z tego incydentu powstała **ZASADA 0** w `ZASADY.md`. Brief wariantu 4 ma dziś jawne
  ostrzeżenie „PRZECZYTAJ PRZED KODOWANIEM".
- **Brak wariantu 6** jest świadomy, nie niedokończony — archetyp 6 („Minimalistyczny one-pager")
  został wycofany decyzją z 26.08.2026, gdy elektryk był na 5/5.
- Hamburger nie działał na mobile (`overflow-x:auto` przycinał dropdown) — naprawione wspólnie
  ze studiem paznokci.

---

## Status pilota Studio paznokci — 5/5

Trzecia branża w systemie i pierwsza „beauty" — czyli pierwsza, w której archetypy pisane pod
awarię i zagrożenie trzeba było przetłumaczyć na branżę, gdzie żadne zagrożenie nie istnieje.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `studio-paznokci-1-zaufany-fachowiec` | Zaufany fachowiec | free | Ciepła kość słoniowa (`#faf3ee`) + dusty-rose (`#c9718c`), Playfair Display/Mulish; cennik jako sekcja główna + galeria realnych stylizacji |
| 2 | `studio-paznokci-2-express` | Express / ostatnia chwila | pro | Ciemny plum (`#1f1420`) + neonowa magenta (`#ff4d8f`), Unbounded/Outfit; zabiegi 20–30 min „na już", glow/shimmer/pulsowanie |
| 3 | `studio-paznokci-3-nowoczesny-cyfrowy` | Nowoczesny cyfrowy | pro | Grafit (`#0e1116`) + miętowy neon (`#2dd4a7`), Plus Jakarta Sans/Instrument Sans; widget rezerwacji w stylu Booksy jako primary CTA |
| 4 | `studio-paznokci-4-rodzinna-firma` | Rodzinna firma | pro | Piaskowy beż (`#ece1d3`) + karmelowy brąz (`#b8763f`), Lora/Figtree; jednoosobowe studio, „znasz mnie nie tylko z Instagrama" zamiast „nie tylko z faktury" |
| 5 | `studio-paznokci-5-premium` | Premium | pro | Perłowa platyna (`#f1eee6`) + antyczne złoto (`#9c7238`), Cormorant Garamond/Epilogue; edytorialne portfolio, „Nasz proces", współprace z markami zamiast B2B deweloperskiego |

### Poprawki po feedbacku i świadome decyzje

- **Wariant 2 jest pierwszym w systemie zbudowanym po decyzji „wariant 2+ może żyć"** — to on
  ustawił próg ruchu dla wszystkich późniejszych wariantów pro.
- **Wariant 2 świadomie nie używa ramy „ostrzeżenie/zagrożenie"** znanej z hydraulik-2/elektryk-2.
  Pilność wynika z ograniczonej dostępności i tempa, nie z awarii — to nie jest pominięcie
  archetypu, tylko jego wymagany reframing dla branży beauty.
- **Wariant 4** wyszedł jako kopia hydraulik-4/elektryk-4 i został przepisany; przy tej samej
  okazji wariant 5 dostał złoty wow-efekt (był za płaski jak na tier premium).
- **Wariant 5 nie mówi językiem deweloperskim** („inwestorzy przemysłowi", „zarządcy
  nieruchomości") — archetyp przeniesiony duchem, nie słownictwem. Świadome, nie przeoczone.

---

## Status pilota Fryzjer / Barber — 5/5

Czwarta branża, pozycjonowana wyłącznie jako **męski barbershop** („strzyżenie i broda") — celowo
rozdzielona od późniejszego, unisex `salon-fryzjerski`. To nie duplikat branży.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `fryzjer-barber-1-zaufany-fachowiec` | Zaufany fachowiec | free | Kamienny szaro-beż (`#f1ede5`) + bordo (`#7a2430`), Bitter/Public Sans; przejrzysty cennik + portfolio realnych cięć |
| 2 | `fryzjer-barber-2-bez-kolejki` | Bez kolejki / Walk-in | pro | Ciepły węgiel (`#1a1512`) + amber (`#e0a527`), Oswald/Rubik; walk-in bez zapisu, wolne miejsca „dziś" na żywo, pulsujący pasek |
| 3 | `fryzjer-barber-3-nowoczesny-cyfrowy` | Nowoczesny cyfrowy | pro | Chłodny grafit (`#0f1418`) + niebieski (`#3d8ef0`), Urbanist/Inter; rezerwacja online w 60 sekund jako primary CTA |
| 4 | `fryzjer-barber-4-rodzinna-firma` | Rodzinna firma | pro | Jasny szałwiowo-szary (`#eef0e8`) + butelkowa zieleń (`#3f6b4a`), Domine/Nunito Sans; „Trzy pokolenia przy jednym fotelu", pływający owalny portret w hero, pozioma oś czasu |
| 5 | `fryzjer-barber-5-premium` | Premium | pro | Chłodny popiel (`#e9e7e2`) + stare złoto (`#a8813a`), Libre Caslon Text/DM Sans; realne B2B — barber in-house na eventy firmowe, umowy z hotelami, karty firmowe |

### Poprawki po feedbacku i świadome decyzje

- **Cała branża powstała jednym commitem 5/5**, przed wprowadzeniem trybu „jeden wariant na raz".
  Została później przepuszczona przez **retrospektywny QA właściwym flow** (designer-ux-ui +
  copywriter-szablonow na gotowych plikach). Jeśli szukasz w historii osobnych commitów per
  wariant — nie ma ich i to nie jest brakujący ślad.
- **Wariant 5 jest najbliżej dosłownego archetypu B2B** ze wszystkich branż usługowo-beauty
  (barbershop naprawdę obsługuje firmy i hotele), ale słownictwo deweloperskie z
  hydraulika/elektryka nadal jest tu zakazane.

---

## Fizjoterapia — branża rozpoczęta i porzucona (0/5)

**Piąta branża w numeracji, jedyna nieukończona.** Wyjaśnia lukę w ordinalach: Remonty są opisane
niżej jako „szósta branża", mimo że ukończonych poprzedników jest czterech — piąte miejsce zajmuje
właśnie fizjoterapia.

Kolejność wg pierwszych commitów: hydraulik (24.08) → elektryk (25.08) → studio paznokci (26.08) →
fryzjer/barber (01.09) → **fizjoterapia (01.09, porzucona na kroku 1)** → remonty (01.09).

Co realnie istnieje:

- **tylko brief** `scripts/generate-fizjoterapia-pilot.js` (utworzony 01.09.2026 ok. 20:36),
  z **jednym zdefiniowanym wariantem** — `fizjoterapia-1-zaufany-fachowiec` (tier free);
- **zero plików** w `templates/pilot/` i **zero** w `preview/` — katalog `preview/fizjoterapia/`
  nie powstał;
- plik briefu jest **nieśledzony przez gita** (nie ma go w indeksie, nigdy nie był commitowany),
  więc historia gita sama z siebie tej branży nie pokaże — stąd zagadka brakującego ogniwa;
- proces zatrzymał się na kroku 1 pipeline'u; kroki 2–9 nigdy się nie odbyły.

Jeśli branża kiedyś wróci, wraca **wg aktualnej formuły 3 wariantów** (patrz góra pliku), nie wg
5 archetypów zakładanych w istniejącym briefie — nagłówek tamtego pliku opisuje nieaktualny już
system.

---

## Status pilota Remonty (firma remontowo-budowlana) — 5/5

Szósta branża w systemie, pierwsza zbudowana w trybie "jeden wariant na raz, akceptacja po
każdym" (patrz pamięć `feedback_sequential_variant_workflow`).

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `remonty-1-zaufany-fachowiec` | Zaufany fachowiec | free | Stalowo-szary, storytelling z historią założyciela, cennik za m² |
| 2 | `remonty-2-szybki-start` | Szybki start / bez czekania | pro | Ciemny asfalt + hi-vis limonka, marquee wolnych terminów, kalkulator-adjacent karty ze zdjęciami |
| 3 | `remonty-3-kalkulator-online` | Nowoczesny cyfrowy | pro | Indygo-fiolet, realnie interaktywny kalkulator kosztu remontu (JS) |
| 4 | `remonty-4-rodzinna-firma` | Rodzinna firma | pro | Oliwkowo-musztardowy/kamienny beż, stała ekipa, świadomie wyciszony ruch |
| 5 | `remonty-5-premium` | Premium | pro | Zdesaturowana platyna na chłodnym łupku, B2B (deweloperzy/zarządcy/inwestorzy), pełny formularz |

### Poprawki po feedbacku — warto znać przy kolejnych branżach

- **Wariant 4** pierwotnie użył jednego zdjęcia 3× (hero/ekipa/kontakt) i ciepłej
  kremowo-czerwonej palety, która percepcyjnie powielała fryzjer-barber-1/hydraulik-4, mimo
  innych liczb hex — poprawione na dwa różne zdjęcia i oliwkowo-musztardowy rejestr.
  Wniosek: różnica hex nie wystarczy, sprawdzaj nastrój "na oko" (sprawdzian mrużenia oczu),
  szczególnie dla ciepłych jasnych palet, których w systemie jest już dużo.
- **Wariant 2 i 3** pierwotnie wyszły za spokojne jak na tier pro — teraz obowiązuje
  konkretny minimalny próg ruchu dla każdego wariantu 2+ (patrz
  `.claude/agents/designer-ux-ui.md` sekcja "Nie czekaj aż użytkownik poprosi o więcej
  ruchu"), z wyjątkiem archetypu 4 (zostaje wyciszony świadomie).

---

## Status pilota Salon fryzjerski (unisex, damski i męski) — 5/5

Siódma branża — świadomie **odrębna** od zamkniętej już `fryzjer-barber`. Tamta to męski
barbershop, ta to salon unisex: strzyżenie, koloryzacja, stylizacja dla obu płci w jednym miejscu.
Wskazówka tonalna od Artura: „najbardziej podobały mi się strony paznokci wizualnie" — wzięta jako
kierunek (ciepło, elegancja, dobra fotografia), nie jako zgoda na kopiowanie palety.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `salon-fryzjerski-1-zaufany-fachowiec` | Zaufany fachowiec | free | Ciepłe ivory (`#f5efe4`) + głęboki teal (`#147d72`), Frank Ruhl Libre/Albert Sans; usługi damskie i męskie w jednej siatce, hero magazynowy |
| 2 | `salon-fryzjerski-2-dzis-wolny-termin` | Dziś wolny termin | pro | Masłowa biel (`#fffaf0`) + słoneczna żółć (`#f0c419`), Familjen Grotesk/Onest; wieczorne i weekendowe terminy dla pracujących 9–17 |
| 3 | `salon-fryzjerski-3-wybierz-stylistke` | Nowoczesny cyfrowy | pro | Śliwkowy bordo (`#3a1f2e`) + koral (`#ff7a5c`), DM Serif Display/Schibsted Grotesk; widget **dwuetapowy** — najpierw konkretny stylista, dopiero potem jego wolne godziny |
| 4 | `salon-fryzjerski-4-rodzinna-firma` | Rodzinna firma | pro | Pudrowy róż-brzoskwinia (`#f8ede9`) + przydymiony błękit (`#5b7c99`), Newsreader/Lexend; „dwa pokolenia jednego salonu" (matka i córka), świadomie wyciszony ruch |
| 5 | `salon-fryzjerski-5-premium` | Premium | pro | Ciepły szampan (`#f6ecd8`) + butelkowa zieleń (`#0b5c3f`), Petrona/Red Hat Display; „prywatny gabinet stylisty" — concierge dla klienta VIP, nie B2B; formularz zapytania jako primary CTA |

### Poprawki po feedbacku i świadome decyzje

- **Wariant 2 świadomie zrywa z parą „ciemne tło + hi-vis limonka"** użytą w fryzjer-barber-2 i
  remonty-2 — to był już trzeci raz ten sam pomysł w systemie. Jasna, masłowo-żółta wersja
  archetypu 2 jest celowa.
- **Wariant 3 wbrew pierwotnemu briefowi używa realnych zdjęć, nie awatarów-inicjałów.** Brief
  zakazywał zdjęć twarzy podpisanych jako personel; po podglądzie okazało się, że sama siatka
  inicjałów wygląda na niedokończoną — zmiana jest zamierzona, brief w skrypcie tego nie nadgonił
  (patrz „Znane rozjazdy brief ↔ plik" niżej).
- **Wariant 2** dostał zdjęcia dopiero w poprawce (karty usług i sekcja storytellingu były puste).
- **Wariant 5** miał nieczytelny `h1` (font Italiana) i logo uciekające z centrum na mobile —
  naprawione; przy okazji poprawiono CTA w navie łamiące się na trzy linie w siedmiu wariantach.
- **Warianty 1–3** przeszły retrospektywny QA właściwym flow (design + copy) już po zbudowaniu.

---

## Status pilota Medycyna estetyczna — 5/5

Ósma branża. **Cała celuje w premium** (instrukcja Artura, 02.09.2026) — także wariant free ma
wyglądać elegancko i klinicznie czysto. Zero różowego spa-kitchu, zero „efekty od razu, promocja
−50%".

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `medycyna-estetyczna-1-zaufany-lekarz` | Zaufany lekarz | free | Ciepła kość słoniowa (`#faf7f4`) + śliwkowy plum (`#6b3457`), Piazzolla/Wix Madefor Text; kwalifikacje medyczne i „cennik bez niedomówień" zamiast obietnic efektu |
| 2 | `medycyna-estetyczna-2-elastyczne-terminy` | Elastyczne terminy | pro | Ciemny burgund-brąz (`#1c1517`) + przygaszony róż (`#c17b91`), Alegreya/Commissioner; wygoda zamiast urgency — „wtedy, kiedy Ty masz czas", nie „dzwoń teraz" |
| 3 | `medycyna-estetyczna-3-dobierz-zabieg` | Dobierz zabieg | plus | Nocny granat (`#11121f`) + lodowy błękit (`#8fc9e8`), Geologica/Sen; interaktywny selektor troski skórnej → 1–2 rekomendowane zabiegi z jawnym zastrzeżeniem, że to nie diagnoza |
| 4 | `medycyna-estetyczna-4-kameralny-gabinet` | Kameralny gabinet | pro | Ciepły piaskowy (`#faf3ec`) + terakota (`#b06856`), Frank Ruhl Libre/Manrope; dwie lekarki-partnerki zamiast sieciówki z rotacją, świadomie wyciszony ruch |
| 5 | `medycyna-estetyczna-5-program-indywidualny` | Program indywidualny | premium | Głęboka butelkowa zieleń (`#141814`) + szałwiowa patyna (`#a7c2ac`), EB Garamond/Libre Franklin; długoterminowy program opieki, ograniczona liczba pacjentów, formularz zapytania |

### Poprawki po feedbacku i świadome decyzje

- **Wariant 2 nie jest „pogotowiem" i to jest polecenie, nie przeoczenie.** Artur wprost zabronił
  ram urgency dla tej branży (02.09.2026): żadnych syren, alarmowej czerwieni, marquee, języka
  zagrożenia. Archetyp „Szybka interwencja 24h" został przełożony na **wygodę terminu**.
- **Wariant 3 ma tier `plus`, nie `pro`** — jedna z dwóch branż (obok Nieruchomości), gdzie tiery
  różnicują się drobniej niż free/pro.
- **Wariant 5 pojechał najpierw bez zdjęć** — Artur: „brak zdjęć niedopuszczalny". Zdjęcia dodane
  w osobnej poprawce. Traktuj to jako twardą regułę dla wariantów premium: wyciszony ruch owszem,
  brak fotografii nie.
- **Wariant 4 nie opowiada sagi pokoleniowej** — „dziadek robił botoks" byłoby niewiarygodne.
  Archetyp „Rodzinna firma" przeniesiony na mały, stały zespół. To świadoma adaptacja.

---

## Status pilota Nieruchomości (agencja sprzedaży mieszkań) — 5/5

Dziewiąta branża w systemie, zbudowana w całości w trybie "jeden wariant na raz, akceptacja po
każdym" wraz z niezależnym DESIGN QA PASS po copywriterze (patrz pamięć
`feedback_design_qa_pass_after_copywriter` — wcześniej ten krok bywał pomijany).

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `nieruchomosci-1-zaufany-posrednik` | Zaufany pośrednik | free | Granat-indygo + antyczny mosiądz na kości słoniowej; uczciwa wycena, unikalna sekcja "aktualne oferty" |
| 2 | `nieruchomosci-2-sprzedaz-w-twoim-terminie` | Sprzedaż w Twoim terminie | pro | Żywa zieleń na ciemnym grafitowym tle; "Szybka interwencja 24h" bez urgency — tempo z realnej bazy kupujących, nie z pustych obietnic |
| 3 | `nieruchomosci-3-kalkulator-wyceny` | Kalkulator wyceny | plus | Indygo na niemal-bieli "digital paper" — świadome zerwanie z konwencją "ciemny + neon" wszystkich innych wariantów 3 w systemie; realnie działający kalkulator JS |
| 4 | `nieruchomosci-4-kameralne-biuro` | Kameralne biuro | pro | Stonowany greige + przydymiony cynamonowy róż; ta sama para pośredniczek od wyceny po notariusza, świadomie wyciszony ruch |
| 5 | `nieruchomosci-5-segment-premium` | Segment premium | premium | Wino/bordo na niemal czarnym + platynowy szary; dyskretna sprzedaż segmentu premium (off-market) zamiast B2B-deweloperskiego, formularz zapytania jako primary CTA |

### Poprawki po feedbacku — warto znać przy kolejnych branżach

- **Pułapka logo w navie/stopce na wąskim viewport z długą nazwą firmy klienta**: `.logo-name` z
  samym `white-space:nowrap` (bez `min-width:0`/`flex-shrink` na rodzicu) wypycha nav poza
  viewport przy realistycznie długich nazwach firm — SAMPLE_TOKENS (`Metrum`) jest za krótkie,
  żeby to złapać. Znalezione i naprawione w wariancie 3, retrofitowane do 1/2. Wzorzec: kontener
  `.logo` dostaje `min-width:0` (+ `flex-shrink:1` we flexie / `minmax(0,auto)` w gridzie),
  `.logo-name` dostaje `display:inline-block;overflow:hidden;text-overflow:ellipsis;max-width:100%`
  — sam `max-width` nie działa na zwykłym inline `<span>`, stąd `inline-block` jest konieczny,
  szczególnie gdy logo-name występuje osobno w stopce poza flex/grid kontenerem navu.
- **Kopiowanie tekstu między siostrzanymi wariantami tego samego archetypu w różnych branżach**:
  wariant 4 wyszedł od designera z tekstem niemal 1:1 sklonowanym z
  `medycyna-estetyczna-4-kameralny-gabinet.html` (te same zdania ze zmienionym rzeczownikiem) —
  złapane i przepisane przez copywriter-szablonow. CSS/mechanizm sekcji był w tym przypadku
  faktycznie odrębny (QA potwierdził), więc problem dotyczył wyłącznie warstwy tekstowej — warto
  o tym pamiętać przy każdym wariancie, który ma "przeczytaj X jako inspirację ducha" w briefie.
- **Redukcja kosztu sesji per wariant** (od wariantu 4): nie wywoływać `list_deployments` do zdobycia linku
  — używać stabilnego `branchAlias` z Vercela i odpytywać go `curl`-em w tle; prosić subagentów o
  raporty ~100-150 słów zamiast pełnego audytu; ograniczyć własne zrzuty ekranu do 2-3 kluczowych
  (QA subagent i tak weryfikuje mobile/motion/mapę realnie przez Playwright). Szczegóły w pamięci
  `feedback_reduce_token_usage_per_variant`.

---

## Status pilota Auta z Ameryki (sprowadzanie aut z USA) — 3/3

**Pierwsza branża zbudowana wg nowej formuły 3 wariantów** (1 free, 2 archetyp, 3 „petarda") —
jeszcze zanim reguła została spisana ogólnie na górze tego pliku. Branża z realnym problemem
reputacyjnym: klient boi się ukrytych kosztów po licytacji, ukrytego zakresu uszkodzeń i tego, że
firma zniknie po zaliczce. Cała komunikacja jest zbudowana wokół tych trzech lęków.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `auta-z-ameryki-1-zaufany-importer` | Zaufany importer | free | Chłodny beton (`#eef1ef`) + wojskowa oliwka (`#595c2d`), Big Shoulders Display/Overpass; „pełny rachunek zanim licytujemy, pełna dokumentacja zanim zapłacisz" |
| 2 | `auta-z-ameryki-2-kalkulator-sprowadzenia` | Kalkulator sprowadzenia | pro | Ciemny grafit (`#14161a`) + miedziany pomarańcz (`#d97f4a`), Rajdhani/Heebo; realnie działający kalkulator JS (cena z licytacji w USD, akcyza wg pojemności, stan jezdne/do naprawy) — bohater strony, nie dodatek |
| 3 | `auta-z-ameryki-3-auto-na-zamowienie` | Auto na zamówienie | pro | Czerń (`#0a0a0b`) + muscle-car czerwień (`#d1121f`), Bebas Neue/Inter; **„petarda"** — concierge, kinowe hero z ken-burns/parallax, oś kroków, licznik, hover-zoom galerii |

### Świadome odstępstwa — NIE zgłaszać jako błędy

- **Wariant 3 łamie konwencję „premium ma wyciszony ruch"** — i tak ma być. W branżach
  5-wariantowych archetyp premium dostaje tylko fade-in; tu Artur zamówił „petardę", więc to
  wariant z **najmocniejszym** ruchem w branży. Zapisane jawnie w briefie. `prefers-reduced-motion`
  pozostaje obowiązkowy bez wyjątku.
- **Brak wariantów 4 i 5** — formuła 3 wariantów, nie niedokończona branża.

### Poprawki po feedbacku

- Karta kosztu zasłaniała zdjęcie hero na mobile → reguła 6.8 w `ZASADY.md` (dziś rejestr, B-01).
- Warianty 1 i 2 dostały więcej amerykańskich motywów na prośbę Artura.
- Wariant 1: „pod klucz" → „pod dom" (17 wystąpień) — kalka językowa z branży budowlanej.
- Krok 04 przyklejał się do wyróżnionej karty w osi concierge.

---

## Status pilota Fotograf ślubny — 3/3

**Druga branża wg formuły 3 wariantów** i pierwsza, w której archetyp wariantu 2 był **losowany**
zgodnie z regułą. Wylosowała się „Szybka interwencja 24h" — zaadaptowana na dwa realne scenariusze
pilności tej branży: **znikające soboty w sezonie** (terminy rezerwuje się 12–18 miesięcy naprzód,
soboty maj–wrzesień idą pierwsze) oraz **ratunek dla par po odwołaniu fotografa**. Zero syren i
alarmowej czerwieni — ślub jest wydarzeniem radosnym, pilność ma uspokajać, nie stresować.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `fotograf-slubny-1-zaufany-fotograf` | Zaufany fotograf | free | Jasny len (`#f2f1ec`) + głęboka butelkowa zieleń (`#33534b`), Marcellus/Cabin; pełna stykówka z jednego wesela jako dowód uczciwości („portfolio to 10 kadrów z 60 wesel") + termin dostarczenia galerii w cenniku |
| 2 | `fotograf-slubny-2-wolne-terminy` | Wolne terminy | pro | Chłodny wrzos (`#efe6ec`) + bursztyn (`#d38b3f`), Crimson Pro/Raleway; klikalny kalendarz — „kliknijcie swoją datę, od razu zobaczycie, na czym stoicie" + osobna ścieżka dla par po odwołaniu fotografa |
| 3 | `fotograf-slubny-3-historia-jednego-dnia` | Historia jednego dnia | pro | Czerń (`#0d0c0a`) + kremowa kość (`#eee6d6`), Prata/Space Mono; **„petarda"** — jeden ślub opowiedziany chronologicznie, godzina po godzinie, prawie wyłącznie zdjęciami; najmocniejszy ruch w branży |

### Świadome odstępstwa — NIE zgłaszać jako błędy

- **Powtórzenia zdjęć między wariantami** — te same fotografie występują we wszystkich trzech
  wariantach. **Decyzja Artura z 06.09.2026: zostają.** Patrz `REJESTR-BLEDOW.md` B-09, gdzie ta
  branża jest wpisana jako jawne odstępstwo od reguły „zero powtórzeń w obrębie branży".
- **Wariant 3 łamie konwencję wyciszonego premium** — tak samo jak `auta-z-ameryki-3`; to jest
  definicja „petardy", nie przeoczenie.

### Poprawki po feedbacku — źródło większości rejestru błędów

Ta branża wygenerowała najwięcej pozycji w `REJESTR-BLEDOW.md` — warto ją czytać jako zbiór
przypadków testowych, nie tylko jako status:

- **B-02** nawigacja zbita w lewo na mobile (wariant 1), **B-03** sekcja z `max-width` bez
  `margin:0 auto` — w trzech plikach naraz, **B-04** `disabled` na przycisku blokujące `click`
  (wariant 2), **B-06** mechanizm konceptualny (puste klatki w stykówce) odczytany przez Artura
  jako zepsuta strona, **B-12** nieaktualny mirror w `preview/` złapany przez QA przed produkcją.

---

## Status pilota Fotowoltaika — 1/3 (w budowie)

**Pierwsza branża budowana z serwerem MCP `qa-szablony` i osobnym agentem `qa-szablonow`
w pętli** — czyli pierwsza, w której kontrolę robi ktoś inny niż budowniczy. Archetyp wariantu 2
wylosowany: „Nowoczesny cyfrowy".

Oś branży: **realny problem reputacyjny** — akwizycja domokrążna, zawyżone prognozy zwrotu
i sprzedawcy liczący oszczędności wg net-meteringu, który nie obowiązuje od 2022. Stąd twarde
ograniczenie briefu: zero „gwarantowanego zwrotu w X lat", zero „rachunek spadnie do zera",
zero „dotacja pewna". Widełki zależne od autokonsumpcji — tak, obietnice — nie.

| # | ID | Nazwa | Tier | Charakterystyka |
|---|----|-------|------|-----------------|
| 1 | `fotowoltaika-1-uczciwe-wyliczenie` | Uczciwe wyliczenie | free | Kremowy papier (`#f3f1ea`) + stalowy błękit (`#3d6b91`), Titillium Web/PT Sans; wyliczenie z faktur klienta zamiast średniej krajowej, jawny rozkład kosztów instalacji z zaznaczeniem, co wycenia się dopiero po oględzinach dachu, sekcja o net-billingu i autokonsumpcji po ludzku |
| 2 | — | Nowoczesny cyfrowy (wylosowany) | pro | do zbudowania |
| 3 | — | „petarda" | pro | do zbudowania |

### Co złapał niezależny QA (czego nie złapał budowniczy)

- **Zaszyte miasta w opiniach** — „Katarzyna, Gliwice" i „Piotr, Bielsko-Biała" zamiast
  `{{MIASTO}}`. Klient z Gdańska dostawałby referencje ze Śląska. Zamienione na token.
- **Dwa niesparowane cudzysłowy** polskie w treści.

Uwaga do rozstrzygnięcia przy wariancie 2: `fotowoltaika-1` to trzeci w bibliotece „stonowany
błękit na jasnym neutralu". Warianty 2 i 3 muszą wyraźnie odejść od tej palety.

---

## Znane rozjazdy brief ↔ plik

Skrypty `scripts/generate-<branża>-pilot.js` są źródłem briefu, ale **nie zawsze były
aktualizowane po poprawkach na gotowym pliku**. Miejsca, w których plik HTML jest źródłem prawdy,
a brief został z tyłu:

- ~~**`salon-fryzjerski-3-wybierz-stylistke`**~~ — **ZAMKNIĘTE 06.09.2026.** Brief kazał użyć
  awatarów-inicjałów zamiast zdjęć personelu, plik po poprawce na życzenie Artura miał realne
  zdjęcia (commit `1181a6e`). Brief został zaktualizowany i zawiera dziś notatkę wyjaśniającą,
  **dlaczego** pierwotne ograniczenie istniało (unikanie „fabrykowania tożsamości" — stockowa
  twarz podpisana wymyślonym imieniem jako personel firmy) i dlaczego zostało zniesione.
  **Ograniczenie nadal obowiązuje dla awatarów w sekcjach opinii** — tam zostaje litera zamiast
  twarzy. Zmiana dotyczy wyłącznie widgetu wyboru stylistki.
- **Nazewnictwo wersji wypełnionych** — obowiązująca konwencja to `<pełne-id>-preview-wypelniony.html`
  i trzymają się jej `nieruchomosci`, `auta-z-ameryki`, `fotograf-slubny`. Siedem wcześniejszych
  branż używa skróconej formy `<branża>-<numer>-preview-wypelniony.html` (np.
  `elektryk-1-preview-wypelniony.html`). To dług historyczny, nie błąd do zgłaszania per wariant —
  ale **nowe branże budujemy pełną nazwą**.
- **`fizjoterapia`** — istnieje `scripts/generate-fizjoterapia-pilot.js`, ale **nie ma żadnego
  pliku** w `templates/pilot/` ani `preview/`. Branża zaczęta, nieukończona; nie licz jej do
  statusu. Pełne wyjaśnienie i miejsce w numeracji branż: sekcja „Fizjoterapia — branża
  rozpoczęta i porzucona" wyżej.
- ~~**Brakujące galerie `preview/<branża>/index.html`**~~ — **ZAMKNIĘTE 06.09.2026.** Trzy
  najnowsze branże (`nieruchomosci`, `auta-z-ameryki`, `fotograf-slubny`) nie miały strony
  galerii; zostały utworzone. Wszystkie 10 ukończonych branż ma dziś swój `index.html`
  w `preview/`.

Zanim uznasz różnicę brief ↔ plik za błąd w pliku, sprawdź tę listę i historię gita — poprawka
mogła być zamierzona.

---

## Podział pracy między sesjami

Pilot powstawał w dwóch równoległych sesjach Claude Code na tym samym repo:

| Rola | Zakres |
|------|--------|
| Sesja „brief + release" | Dopracowuje `VARIANTS[n].visual`, wybiera i weryfikuje zdjęcia, robi commit + push, sprawdza na Vercelu |
| Sesja „generacja" | Czyta brief z repo, autorsko pisze HTML (krok 4), odpala subagentów `copywriter-szablonow` i `designer-ux-ui` (kroki 5–6) zamiast ręcznie pilnować całej ZASADY.md z pamięci, weryfikuje w przeglądarce, oddaje **niescommitowane** |

Subagenci nie są przypisani do żadnej z dwóch sesji — żyją w `.claude/agents/` i każda sesja
pracująca na tym repo może je odpalić. W praktyce najczęściej robi to sesja „generacja", bo to
ona ma gotowy plik do przeglądu.

Wnioski z tego trybu pracy:

- **Zdjęcia wybiera i weryfikuje jedna strona**, druga używa dokładnie podanych URL-i.
  Mimo to warto obejrzeć miniaturkę przed użyciem — Pexels zwraca trafione alt-teksty przy
  nietrafionych zdjęciach.
- **Przełączenie brancha w jednej sesji zmienia pliki widziane przez drugą.** Jeśli coś wygląda
  na „cofnięte", to najczęściej to, a nie realny regres.
- Brief trzyma się w repo (nie w treści czatu) — dzięki temu obie sesje czytają to samo źródło.

---

## Stan środowiska — znane ograniczenia

- **`ANTHROPIC_API_KEY` w `.env` / `.env.local` ma zerowe saldo** (`400: credit balance is too
  low`). Skrypt `scripts/generate-hydraulik-pilot.js` nie przejdzie, dopóki konto nie zostanie
  zasilone. Warianty 2–6 powstały autorsko na podstawie tego samego briefu. Dotyczy to też
  produkcyjnych ścieżek: `api/generate.js`, `api/personalize.js`.
- **CSP w `vercel.json` blokował embed Google Maps** — naprawione, ale przy dodawaniu nowych
  zewnętrznych zasobów trzeba pamiętać o tym pliku.
- **Narzędzie do zmiany rozmiaru okna przeglądarki bywa bezskuteczne** w sesji generującej
  (viewport zostaje na stałej szerokości). Weryfikacja wąskich ekranów (<480 px) musi wtedy iść
  na stronę, która ma działający podgląd mobilny.
