# Zasady produkcji szablonów + pułapki z praktyki

Stan na: 25 sierpnia 2026

Wszystko poniżej wynika z realnych błędów wykrytych w pilocie Hydraulika — każda pozycja
kosztowała co najmniej jedną poprawkę. Kanoniczne źródło reguł to stała `CSS_VAR_REQUIREMENT`
w `scripts/generate-hydraulik-pilot.js`; ten plik ją tłumaczy i uzupełnia o kontekst.

**Aktualizacja 26.08.2026 — archetyp 6 wycofany na przyszłość:** system schodzi z 6 do 5
archetypów dla wszystkich nowych branż — patrz `README.md` u góry po szczegóły. Wzmianki o
"wariancie 6" niżej w tym dokumencie (sekcje o mapie/nav/hex) opisują już wysłany, historyczny
`hydraulik-6-minimalistyczny.html` i zostają jako dokumentacja tamtego wyjątku — nie buduj już
nowych wariantów 6.

---

## 0. Bespoke wykonanie per branża — ZERO reużycia layoutu między branżami

**Decyzja produktowa (24.08.2026, potwierdzona wprost przez Artura przy wyborze między dwiema
opcjami):** każda z 16 branż dostaje **własne, bespoke wykonanie** każdego z 6 archetypów —
docelowo 16 × 6 = **96 osobno zaprojektowanych szablonów**, NIE 6 layoutów reużywanych między
branżami ze zmienionym kolorem/fontem/treścią/zdjęciem.

To była już dwukrotnie złamana zasada, zanim trafiła do tego dokumentu — za pierwszym razem
niezauważona (`elektryk-1-zaufany-fachowiec.html`, ~86% CSS identyczne z
`hydraulik-1-zaufany-fachowiec.html` — cała struktura hero, sekcji "o nas", stopki, formularza
kontaktowego, odznaki ratingu skopiowana 1:1), za drugim razem złapana przez Artura na żywym
deployu (`elektryk-4-rodzinna-firma.html` skopiowany z `hydraulik-4-rodzinna-firma.html`: "identyczny
z hydraulikiem, a nie miało być wszystko na jedno kopyto"). Oba przypadki miały wspólną przyczynę:
ta zasada żyła wcześniej wyłącznie w pamięci jednej sesji Claude Code, nie w repo — żadna inna
sesja ani subagent nie miały jak jej znać. Stąd jest teraz tutaj, w kanonicznym dokumencie.

**Co wolno, a czego nie:**
- Plik odpowiednika archetypu w innej branży (np. `hydraulik-4-rodzinna-firma.html` przy pisaniu
  `elektryk-4-rodzinna-firma.html`) wolno przeczytać wyłącznie jako **inspirację ducha archetypu**
  (ton, ogólny cel, np. "Rodzinna firma" = osobisty ton + zdjęcie właściciela + bezpośredni
  kontakt) — NIGDY jako plik bazowy do skopiowania i przemalowania.
- Każda sekcja (nav, hero, prezentacja usług, historia/oś czasu, kontakt, stopka) ma dostać
  **inny mechanizm wizualny** niż odpowiednik w innej branży — inny sposób pokazania tej samej
  koncepcji, nie ten sam kod z innymi zmiennymi CSS. Przykład z realnej naprawy: hydraulik-4 ma
  pływający pigułkowy nav + organiczny "blob" kształt zdjęcia w hero + poziomą oś czasu z
  ponumerowanymi kropkami + wyśrodkowaną sekcję z gigantycznym cudzysłowem + okrągły portret w
  kontakcie — elektryk-4 dostał: zwykły pełnoszerokościowy nav + prostokątne zdjęcie z dymkiem
  cytatu + narrację tekstową z plakietkami zamiast osi czasu + cytat jako notatkę w sekcji
  kontaktu (bez osobnej sekcji) + kwadratową "wizytówkę" zamiast okrągłego portretu.
- Wspólne mogą (i powinny) zostać: **techniczne wymogi** z sekcji 1-7 poniżej (architektura
  CSS-var, gramatyka `{{MIASTO}}`, format embedu mapy, pułapki mobile, tryb tokenów) — to są
  reguły branżowo-niezależne, wypracowane raz i mające obowiązywać wszędzie. Różnicować trzeba
  WYKONANIE (layout, komponenty, kompozycję), nie te reguły.

**Opis archetypu to duch/tier, nie dosłowna treść do wymuszenia na każdej branży (dodane
26.08.2026).** Przykładowe sformułowania w briefie danego archetypu (np. archetyp 5
"Premium/korporacyjny" opisany dla Hydraulika/Elektryka jako "klienci B2B, deweloperzy, case
studies") są ilustracją TEGO, jak ten archetyp wyszedł w KONKRETNEJ branży — nie specyfikacją do
powielenia słowo w słowo w każdej kolejnej. Artur wprost: "studio paznokci korporacyjnej nie
zrobisz, więc stwórz po prostu kolejny szablon premium". Gdy dosłowna rama archetypu nie pasuje do
branży (nie ma tu klientów B2B ani deweloperów), zachowaj TIER/DUCHA (np. archetyp 5 = wyżej
pozycjonowana, premium jakość, wyższa cena, poważniejszy ton — niekoniecznie dosłownie "B2B") i
przeprojektuj treść tak, żeby miała sens w tej branży. To ten sam ruch, który już raz zadziałał
przy archetypie 2 ("Szybka interwencja 24h" = alarm/zagrożenie u Hydraulika/Elektryka →
przeformułowane na "pilność przez ograniczoną dostępność terminu" w Studio paznokci, bo zagrożenia
tam nie ma) — teraz to jawna, ogólna zasada, nie decyzja ad-hoc za każdym razem.

**Różnicowanie dotyczy też palety, nie tylko layoutu (dodane 26.08.2026).** Struktura może się
różnić sekcja po sekcji, a paleta i tak wpadać w ten sam rejestr — jeden stonowany akcent na
białym/kremowym tle w każdym wariancie. To też jest reskin, tylko po kolorze zamiast po layoucie.
Wymagaj od `designer-ux-ui` żeby aktywnie różnicował jasność i temperaturę tła (nie tylko odcień
`--accent`), rozważał ciemne/mocno tintowane tła, duotone/gradient tam gdzie pasuje, i stosował
"sprawdzian mrużenia oczu" — dwa warianty obok siebie powinny się różnić nastrojem koloru samym
w sobie, bez patrzenia na layout. Szczegóły i konkretne wskazówki: `.claude/agents/designer-ux-ui.md`,
sekcja "Baw się jasnością i tłem". Nie zwalnia to z architektury CSS-var (sekcja 1 niżej) —
odważny kolor i dokładnie 8 zmiennych w `:root` nie wykluczają się.

**Szybkie sprawdzenie przy odbiorze wariantu** (rób to zawsze, gdy analogiczny archetyp istnieje
już w innej branży):

```bash
# % linii CSS identycznych z odpowiednikiem w innej branży — jeśli wynik >40-50%
# (poza generycznym resetem: *, body, html, a, ul, img, .btn, .wrap), to sygnał kopiowania
diff <(sed -n '/<style>/,/<\/style>/p' templates/pilot/<nowy>.html) \
     <(sed -n '/<style>/,/<\/style>/p' templates/pilot/<odpowiednik-innej-branzy>.html) | wc -l
```

Gdy briefujesz subagenta `designer-ux-ui` do Design QA na wariancie, który ma odpowiednik w innej
branży: NIE mów mu, że podobieństwo strukturalne do tego odpowiednika jest zamierzone/oczekiwane —
to dokładnie ta pomyłka, która pozwoliła błędowi w `elektryk-4` przejść przez pierwszy QA pass
niezauważenie. Zamiast tego każ mu aktywnie polować na 1:1 powtórzenia (nazwy klas z tymi samymi
wartościami, te same proporcje grid, te same mechanizmy komponentów) i raportować je jako problem
domyślnie, chyba że to jeden z technicznych wymogów wspólnych z akapitu wyżej.

---

## 1. Architektura CSS-var

W `:root` definiuje się **dokładnie 8 zmiennych**:

```
--accent  --accent-dark  --bg  --surface  --text  --muted  --head  --body
```

W całym pozostałym CSS — wyłącznie `var(--nazwa)`. Cel: zmiana kolorystyki i typografii
przez podmianę **samego bloku `:root`**, bez dotykania reszty kodu (personalizacja bez
regeneracji przez AI).

### Stan faktyczny — 25.08.2026, doprowadzone do stanu 3/4 we wszystkich 6 wariantach

| Wariant | Literały poza `:root` |
|---------|----------------------|
| 1 — Zaufany fachowiec | ✅ brak (było `#fff` ×28, `#f5b700` ×1 na gwiazdki) |
| 2 — Szybka interwencja | ✅ brak (było `#fff` ×20) |
| 3 — Nowoczesny cyfrowy | ✅ brak |
| 4 — Rodzinna firma | ✅ brak |
| 5 — Premium | ✅ brak (było `#fff` ×3) |
| 6 — Minimalistyczny | ✅ brak (było `#fff` ×1) |

**Decyzja podjęta i wdrożona:** 1/2/5/6 doprowadzone do stanu 3/4 (commit `0fc126c`). Reguła
zastosowana: `#fff` samodzielny (kolor tekstu/tła) → `var(--bg)` (identyczna wartość
`#ffffff` w każdym z tych 4 wariantów, zero zmiany wizualnej); `#fff` wewnątrz `color-mix()`
→ słowo kluczowe `white`; wariant 1 dodatkowo `#f5b700` (gwiazdki oceny) → `var(--accent)`.
Każdy z 6 wariantów ma teraz dokładnie 6 unikalnych hexów, każdy występujący raz — czyli
wyłącznie w `:root`. Sprawdzone: `grep -oE '#[0-9a-fA-F]{3,6}' <plik> | sort | uniq -c` daje
6 wierszy z licznikiem 1 dla każdego wariantu.

> Przyjęty wyjątek: słowa kluczowe `white` / `black` **wewnątrz `color-mix()`** są dopuszczone
> jako neutralne punkty odniesienia (np. `color-mix(in srgb, var(--text) 90%, black)`).

---

## 2. Gramatyka wokół `{{MIASTO}}`

`{{MIASTO}}` podstawia **dowolne polskie miasto w mianowniku** (Kraków, Warszawa, Łódź…).
Nie da się automatycznie wygenerować poprawnej odmiany, więc:

| ❌ Nigdy | ✅ Zamiast tego |
|---------|----------------|
| `w {{MIASTO}}` | `w mieście {{MIASTO}}` |
| `z {{MIASTO}}` / `do {{MIASTO}}` | `na terenie miasta {{MIASTO}}` |
| `poza {{MIASTO}}` | `poza miastem {{MIASTO}}` |
| `Usługi w {{MIASTO}}` | `Usługi — {{MIASTO}}` (myślnik/dwukropek zamiast przyimka) |

Rzeczownik pospolity „miasto" się odmienia, nazwa własna zostaje w mianowniku jako
dopowiedzenie — to poprawna polszczyzna.

**Zawsze bezpieczne:** `{{MIASTO}}` samodzielnie, bez przyimka — w adresie
(`{{ADRES}}, {{MIASTO}}`), w `<title>`, w tagu lokalizacji, w podpisie (`Marta, {{MIASTO}}`).

---

## 3. Mapa dojazdu

Realny, działający embed — **nigdy** placeholder ani zastępczy prostokąt:

```html
<iframe src="https://www.google.com/maps?q={{ADRES}}, {{MIASTO}}&output=embed"
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        style="border:0;width:100%;height:320px"></iframe>
```

Ten format nie wymaga klucza API i zadziała automatycznie po podstawieniu danych.

⚠️ **CSP w `vercel.json`** musi przepuszczać Google Maps — raz już blokował działający embed.
Przy dodawaniu nowych zewnętrznych zasobów sprawdź ten plik.

Wyjątek: wariant 6 celowo nie ma mapy.

---

## 4. Zdjęcia

- **URL-e są z góry wybrane i zapisane w briefie** (`VARIANTS[n].visual`). Nie wymyślaj
  własnych, nie podmieniaj „na lepsze".
- **Obejrzyj miniaturkę przed użyciem**, nawet jeśli URL przyszedł zweryfikowany. Pexels
  regularnie zwraca kompletnie nietrafione zdjęcia pod sensownie brzmiącym alt-textem.
- **Krótkie zapytania (1–2 słowa)** przy szukaniu — długie frazy zwracają 0 wyników.
- **Każda karta usługi / case study dostaje WŁASNE zdjęcie.** Zdjęcie jako tło całej sekcji
  zamiast zdjęć w kartach było zgłaszane jako błąd dwa razy.
- **Overlay: ~50–80 % krycia.** Przy 88 %+ zdjęcie renderuje się jak jednolita czerń i cały
  sens fotografii znika. Sprawdź to **wizualnie**, nie tylko w kodzie.
- Ciemny/neonowy styl **nie zwalnia** z wymogu prawdziwej fotografii — sama gradientowa
  poświata i glassmorphism to za mało (zgłoszone: „to nie może tak wyglądać").
- **Zawsze curl-zweryfikuj finalny URL zdjęcia przed wklejeniem do pliku**, nie tylko obejrzyj
  stronę pexels.com/photo/... w przeglądarce — ID w adresie strony Pexela czasem NIE odpowiada
  faktycznemu ID pliku w CDN (`images.pexels.com/photos/<ID>/pexels-photo-<ID>.jpeg` zwraca 404
  mimo że strona z tym ID istnieje i wygląda poprawnie). Sprawdzenie: `curl -s -o /dev/null -w
  '%{http_code}\n' '<pełny URL z parametrami>'` musi zwrócić 200. Znaleziony realnie na pilocie
  Remonty (ID 3284980 renderował się poprawnie na stronie Pexela, ale jego CDN URL dawał 404 —
  obraz nie ładował się w karcie, tylko pokazywał alt-text).

### Naprawione: powtarzalność zdjęć między wariantami

Zdjęcie **6419128** występowało w wariantach 1, 2, 3 i 5 — przy prezentacji wszystkich
wariantów obok siebie (galeria `preview/hydraulik/index.html`) powtórzenie było widoczne.
Zamienione (commit `0fc126c`) w wariantach 1, 2, 3 na inne, już zweryfikowane zdjęcia
(odpowiednio `38028968`, `16509869`, `38028966`), każde dobrane tak, by nie kolidować z
fotografiami już użytymi w tym samym wariancie. Wariant 5 zostaje przy `6419128` — jedyne
pozostałe użycie. Przy rozszerzaniu pilota na kolejne branże warto pilnować tej samej zasady:
sprawdzać przed użyciem, czy dane zdjęcie nie powtarza się już w innym wariancie tej samej
branży.

---

## 5. Treść — czego nie wolno zmyślać

- **Brak fikcyjnych referencji.** Sekcja „zaufali nam" nie może zawierać wymyślonych,
  realnie brzmiących nazw firm ani prawdziwych marek — to wprowadzałoby w błąd co do realnych
  klientów. Używaj generycznych etykiet kategorii: „Deweloperzy mieszkaniowi",
  „Biura i powierzchnie komercyjne", „Zarządcy nieruchomości".
- **Nie ma tokenu na imię właściciela** — istnieje tylko `{{NAZWA_STRONY}}` (nazwa firmy).
  W wersji z literalnymi tokenami nie wstawiaj wymyślonego imienia ani `[Imię]`;
  pisz „Zadzwoń bezpośrednio do mnie — `{{NAZWA_STRONY}}`".
- Reszta treści (USP, FAQ, opisy usług, obszar działania) to **docelowy tekst marketingowy**,
  nie placeholder — ma być gotowy do publikacji.

### Konkretne liczby i daty — DOZWOLONE (decyzja produktowa, 25.08.2026)

Lata na rynku, liczba klientów, rok założenia, procenty w sekcji „o nas", konkretne punkty
osi czasu (np. `2005 / 2011 / 2016 / Dziś`) — **wstawiaj normalnie**. To docelowa treść
szablonu, którą **klient nadpisuje podczas edycji strony**; konkret sprzedaje lepiej niż
etykiety względne i lepiej wygląda w porównywarce wariantów.

> Wcześniej ten dokument zakazywał wymyślonych dat rocznych. Zakaz **zniesiony** — kolidował
> z briefem, który wprost prosi o oś czasu „rok założenia → dziś", i z założeniem promptu, że
> treść jest docelowa, nie placeholderowa. **Nie „naprawiaj" konkretnych liczb w istniejących
> wariantach** — patrz wariant 4 (`2005 / 2011 / 2016`), to jest poprawne.

Granica pozostaje przy **stwierdzeniach o osobach trzecich**: fikcyjne nazwy firm-klientów
w sekcji „zaufali nam" (punkt pierwszy powyżej) i wymyślone imię właściciela dalej są zakazane —
tego klient nie „poprawia przy edycji", tylko musiałby najpierw zauważyć, że jest nieprawdziwe.

---

## 6. Pułapki CSS na mobile

### 6.1 `aspect-ratio` na `<img>` z atrybutami HTML `width`/`height`

Jeśli `<img>` ma atrybuty `width="940" height="650"` (typowe dla SEO/CLS), a w CSS ustawiasz
tylko `width` + `aspect-ratio` **bez jawnego `height`**, część przeglądarek usztywnia wysokość
na wartość z atrybutu HTML i **ignoruje `aspect-ratio`**. Przy zwężaniu ekranu obrazek robi
się drastycznie, nienaturalnie wysoki.

```css
/* ✅ zawsze dopisz height:auto w tej samej regule */
.hero-photo{ width:100%; height:auto; aspect-ratio:4/3.3; object-fit:cover; }
```

### 6.2 Przycisk telefonu z pełnym numerem w nav

Pełny tekst „Zadzwoń: {{TELEFON}}" obok hamburgera nie mieści się na wąskich ekranach —
rozpycha pasek nawigacji, nachodzi na logo i ikonę menu. Poniżej 700 px zwiń przycisk do
samej ikony (okrągły, ~44×44 px, emoji 📞, bez tekstu). Pełny tekst zostaw tylko w hero
i w sekcji kontaktu.

```css
.nav-phone .icon{ display:none; }
@media (max-width:700px){
  .nav-phone{ width:44px; height:44px; padding:0; justify-content:center; border-radius:50%; }
  .nav-phone .txt{ display:none; }
  .nav-phone .icon{ display:inline; }
}
```

**Rozszerzenie 2026-09-02 (realny błąd, znaleziony przez Artura na telefonie, dotknął 7
wariantów naraz — remonty 1/3/4/5, salon-fryzjerski 1/2):** ta sama pułapka dotyczy KAŻDEGO
tekstowego przycisku CTA w nav-actions, nie tylko przycisku telefonu. Wielowyrazowe CTA typu
"Sprawdź wolne terminy", "Zadzwoń: {{TELEFON}}", "Umów konsultację" obok hamburgera na wąskim
ekranie łamie się wewnątrz pigułki na 2-3 linie, robiąc przycisk absurdalnie wysokim i
rozpychając cały pasek — dokładnie ten sam mechanizm co 6.2, tylko nikt wcześniej nie
rozszerzył go poza `.nav-phone`. Napraw tak samo dla KAŻDEGO `.btn` w `.nav-actions`:

```css
@media (max-width:700px){
  .nav-actions > .btn{ display:none; }
}
```

I dołóż ten sam CTA jako pierwszy, wyróżniony link na górze rozwijanego menu mobilnego (nie
gub akcji, tylko przenieś ją do miejsca z realnym miejscem na tekst):

```html
<nav class="nav-links-mobile" id="navLinks">
  <a href="#kontakt" class="mobile-cta">Sprawdź wolne terminy</a>
  <a href="#sekcja">Inny link</a>
  ...
</nav>
```

**Sprawdzenie przy odbiorze:** na viewporcie ≤390px sam napis CTA w pasku nav (jeśli go tam
zostawiłeś) nigdy nie powinien zająć więcej niż jedną linię — jeśli zajmuje, brakuje tej reguły.

### 6.3 Nav bez hamburgera (wariant 6)

Gdy nie ma rozwijanego menu, kotwice + telefon muszą się zmieścić w jednym pasku na **każdej**
szerokości. Zastosowany zestaw zabezpieczeń: mniejszy `font-size` i `gap` poniżej 480 px,
telefon zwinięty do ikony, `white-space:nowrap` na elementach oraz `overflow-x:auto` na całym
pasku (bez widocznego scrollbara) jako ostatnia linia obrony.

### 6.4 `overflow-x:auto` na `.nav .wrap` PRZYCINA rozwijane menu mobilne (KRYTYCZNE,
znaleziony realny błąd — hamburger "nie działał" na trzech już wysłanych plikach)

Jeśli wariant MA hamburger (w odróżnieniu od 6.3) i mobilny dropdown (`.nav-links` z
`position:absolute; top:100%`) jest zagnieżdżony WEWNĄTRZ `.nav .wrap`, a `.wrap` dostaje
`overflow-x:auto` jako zabezpieczenie przed poziomym rozjechaniem (patrz 6.3) — to `overflow-x`
ustawione na cokolwiek innego niż `visible`, przy `overflow-y` domyślnie `visible`, jest z
definicji CSS **wymuszane na `overflow-y:auto`** też. Efekt: `.wrap` zaczyna przycinać wszystko,
co wystaje poza jego wysokość — łącznie z rozwijanym menu, które z założenia ma wystawać *pod*
pasek nav. JS poprawnie przełącza klasę `.open`, `display:flex` się włącza, ale menu jest
niewidoczne (przycięte do zera wysokości paska nav) — wygląda jak "hamburger nie działa", choć
kliknięcie technicznie działa.

Znaleziony na żywo w `elektryk-3-nowoczesny-cyfrowy.html`, `elektryk-5-premium-korporacyjny.html`
(tam nawet bez media query — `overflow-x:auto` był bezwarunkowy) i `studio-paznokci-2-express.html`
(26.08.2026, zgłoszony bezpośrednio przez Artura: "Hamburger nie działa widoku mobilnym").
`studio-paznokci-1-zaufany-fachowiec.html` przypadkiem tego uniknął, bo mobilny dropdown już był
tam osobnym elementem `<nav class="mobile-menu">` poza `.wrap` — nie przez świadome unikanie tej
pułapki, tylko przez inną strukturę HTML.

**Naprawa — rozdziel nav linki na dwie kopie, jedną wewnątrz `.wrap` (desktop), jedną jako
rodzeństwo `.wrap` wewnątrz `header.nav` (mobilny dropdown), nie jeden wspólny element:**

```html
<header class="nav">
  <div class="wrap">
    <a href="#" class="logo">...</a>
    <nav class="nav-links nav-links-desktop">...</nav> <!-- widoczny >700px -->
    <div class="nav-actions">...<button class="nav-toggle" id="navToggle">...</button></div>
  </div>
  <nav class="nav-links nav-links-mobile" id="navLinks">...</nav> <!-- dropdown, POZA .wrap -->
</header>
```

```css
.nav-links-desktop{ display:flex; }
.nav-links-mobile{ display:none; }
@media (max-width:700px){
  .nav-links-desktop{ display:none; }
  .nav-links-mobile{ position:absolute; top:100%; left:0; right:0; display:none; /* ...reszta stylu dropdownu... */ }
  .nav-links-mobile.open{ display:flex; }
}
```

JS musi celować w element PO ID (`getElementById('navLinks')`), nigdy `querySelector('.nav-links')`
— po rozdwojeniu klasy `.nav-links` na dwa elementy, `querySelector` złapie pierwszy w kolejności
DOM (desktopowy), nie mobilny dropdown, co jest drugim, niezależnym sposobem na "hamburger nie
działa" nawet przy poprawnej strukturze HTML.

**Sprawdzenie przy odbiorze wariantu z hamburgerem:** jeśli plik ma zarówno `overflow-x:auto`,
jak i rozwijany dropdown nav, zweryfikuj że dropdown NIE jest potomkiem elementu z tym
`overflow-x:auto` — i zawsze faktycznie KLIKNIJ hamburger w przeglądarce na wąskim viewporcie,
nie tylko sprawdź CSS na papierze (dokładnie to trzykrotnie przeszło przez QA niezauważone, bo
sam CSS *wyglądał* poprawnie — problem był w interakcji z ancestor-em, nie w regule dropdownu).

### 6.5 `display:none` na CSS Grid item PRZESUWA sąsiednie elementy (logo w navie z
wyśrodkowanym logo wychodzi z centrum na mobile)

Wzorzec navu z logo wyśrodkowanym w gridzie 3-kolumnowym (`grid-template-columns:1fr auto 1fr`
lub równe stałe wartości np. `44px 1fr 44px`, logo w środkowej kolumnie `justify-self:center`)
łamie się, gdy jedna z bocznych kolumn chowa swoją zawartość przez `display:none` na mobile (np.
`.nav-links-left{display:none}` przy zwijaniu do hamburgera). `display:none` usuwa element
CAŁKOWICIE z listy grid items — pozostałe elementy (logo, prawa kolumna z hamburgerem) są wtedy
auto-placed od nowa, od pierwszej wolnej kolumny, więc logo ląduje w kolumnie 1 zamiast 2, a
kolumna 3 zostaje pusta. Efekt: logo "ucieka" w lewo zamiast być wyśrodkowane, mimo że
`grid-template-columns` i `justify-self:center` w CSS wyglądają poprawnie na papierze —
znaleziony na żywo w `salon-fryzjerski-5-premium.html` (zgłoszony przez Artura ze zrzutem ekranu
z telefonu, 2026-09-02).

**Naprawa — przypnij pozostałe elementy do konkretnych kolumn jawnie, w tym samym media query,
żeby nie zależały od auto-placement:**

```css
@media (max-width:700px){
  .nav .wrap{grid-template-columns:44px 1fr 44px;}
  .nav-links-left, .nav-links-right{display:none;}
  .logo-name{grid-column:2;}   /* bez tego auto-placement wsadzi logo w kolumnę 1 */
  .nav-right{grid-column:3;}
}
```

**Sprawdzenie przy odbiorze**: jeśli nav ma logo wyśrodkowane gridem i JAKAKOLWIEK sąsiadująca
kolumna znika przez `display:none` na mobile, zawsze zweryfikuj wizycznie (screenshot lub
`getBoundingClientRect()`) że logo faktycznie jest w geometrycznym środku paska — nie ufaj
samemu odczytaniu CSS, bo `grid-template-columns` w DevTools/computed style pokaże poprawne
szerokości torów niezależnie od tego, w który tor faktycznie trafił dany element.

### 6.6 `max-width:700px` jako próg hamburgera nie gwarantuje, że desktopowy nav mieści się
tuż PONAD tym progiem (systemowy błąd, znaleziony w 3 z 5 wariantów branży Remonty)

Próg `@media (max-width:700px)` dla przełączenia na hamburger jest wygodną, powtarzaną w całym
systemie wartością — ale nikt nigdy nie sprawdzał, czy sam desktopowy pasek nav (logo + komplet
linków + CTA) faktycznie MIEŚCI SIĘ przy szerokości tuż powyżej 700px. Jeśli nie mieści się —
np. dłuższa nazwa firmy, więcej linków, szerszy CTA — strona ma realny poziomy scroll w paśmie
mniej więcej 700–900px (typowy tablet w pionie, mały laptop), mimo że zarówno wersja mobilna
(<700px, hamburger) jak i pełna desktopowa (>900-960px) wyglądają poprawnie. To pasmo rzadko
jest testowane ręcznie (nikt nie sprawdza "akurat 720px"), więc błąd przechodzi niezauważony.
Znaleziony przez `designer-ux-ui` w retrofit QA 2026-09-02: `remonty-1`, `remonty-4` i
`remonty-5` (3 z 5 wariantów tej samej branży) miały dokładnie ten sam objaw, zweryfikowany
realnym renderem (Playwright, skan 1px po szerokości `scrollWidth` vs `clientWidth`).

**Naprawa** — podnieś próg hamburgera do wartości z bezpiecznym marginesem ponad realnie
zmierzoną szerokość minimalną navu (nie zgaduj — zmierz), typowo `960px` zamiast `700px` gdy nav
ma logo + 4-6 linków + CTA:

```css
@media (max-width:960px){   /* nie 700px — zmierzone realnie, nie założone */
  .nav-links-desktop{ display:none; }
  .nav-toggle{ display:flex; }
}
```

Jeśli plik ma też inne reguły w media query na `700px` niezwiązane z nav (np. układ siatki
kart), NIE przenoś ich hurtowo do nowego progu — rozdziel na osobne bloki, żeby nie zmieniać
zachowania rzeczy, które działały poprawnie na starym progu.

**Sprawdzenie przy odbiorze**: nie testuj tylko 390px i 1280px. Zeskanuj (lub przynajmniej
ręcznie sprawdź kilka punktów) cały zakres 700–1000px pod kątem poziomego scrolla — to pasmo
między "mobile" a "desktop" jest tym, które najczęściej się pomija.

---

## 7. Tryb szablonu

Tokeny wstawiane **dosłownie**, z podwójnymi klamrami, w każdym miejscu gdzie normalnie
pojawiłyby się dane firmy — `<title>`, meta, JSON-LD, nagłówki, `href="tel:"`, `alt`, stopka,
canonical (`https://{{SLUG}}.webgen.pl`):

```
{{NAZWA_STRONY}} {{TELEFON}} {{EMAIL}} {{MIASTO}} {{ADRES}} {{SLUG}}
{{GODZINY_PON_PT}} {{GODZINY_SOB}}
```

---

## Checklista weryfikacji przed oddaniem

Przejść **w przeglądarce**, na wersji wypełnionej, sekcja po sekcji:

- [ ] Strona ładuje się w całości, brak błędów w konsoli
- [ ] Wszystkie zdjęcia faktycznie widoczne (nie czarne prostokąty, nie 404)
- [ ] Overlay przepuszcza zdjęcie — tekst czytelny, fotografia rozpoznawalna
- [ ] Embed mapy ładuje kafelki i pokazuje właściwe miasto *(poza wariantem 6)*
- [ ] Nav: kotwice + telefon mieszczą się bez łamania i nachodzenia
- [ ] Nav na ≤390px: CTA-przycisk w pasku (jeśli jest) mieści się w jednej linii, nie łamie się na 2-3 (sekcja 6.2 rozszerzenie)
- [ ] Nav z wyśrodkowanym logo na ≤390px: logo faktycznie w geometrycznym środku paska, nie przesunięte w lewo/prawo (sekcja 6.5)
- [ ] Zakres 700–1000px (nie tylko 390px i desktop pełnej szerokości): brak poziomego scrolla, desktopowy nav faktycznie mieści się tuż nad progiem hamburgera (sekcja 6.6)
- [ ] Czcionka `--head` czytelna jako pełny `h1` (zdanie), nie tylko jako krótkie logo — sprawdzone na szerokości telefonu
- [ ] Wąski ekran (<480 px): nic się nie rozjeżdża, zdjęcia nie są nienaturalnie wysokie
- [ ] Formularz przyjmuje dane i pokazuje potwierdzenie po wysłaniu
- [ ] `grep -c '{{'` na wersji z tokenami > 0 — tokeny nie zostały przypadkiem podstawione
- [ ] Brak `[Imię]` i wymyślonych nazw firm-klientów *(konkretne liczby i daty są OK — sekcja 5)*
- [ ] Brak `w {{MIASTO}}` / `z {{MIASTO}}` / `poza {{MIASTO}}` bez rzeczownika „miasto"
- [ ] Świadome wyjątki wariantu (patrz `README.md`) nie zostały „naprawione"

### Szybkie sprawdzenia z terminala

```bash
# tokeny obecne w wersji szablonowej
grep -c '{{' templates/pilot/<id>.html

# błędna gramatyka wokół miasta (powinno nie zwrócić nic)
grep -nE '(w|z|do|poza) \{\{MIASTO\}\}' templates/pilot/<id>.html

# literały hex poza :root (świadomość stanu, patrz sekcja 1)
grep -oE '#[0-9a-fA-F]{3,6}' templates/pilot/<id>.html | sort | uniq -c
```
