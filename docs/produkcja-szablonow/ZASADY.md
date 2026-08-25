# Zasady produkcji szablonów + pułapki z praktyki

Stan na: 25 sierpnia 2026

Wszystko poniżej wynika z realnych błędów wykrytych w pilocie Hydraulika — każda pozycja
kosztowała co najmniej jedną poprawkę. Kanoniczne źródło reguł to stała `CSS_VAR_REQUIREMENT`
w `scripts/generate-hydraulik-pilot.js`; ten plik ją tłumaczy i uzupełnia o kontekst.

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
