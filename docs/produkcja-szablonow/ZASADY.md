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
