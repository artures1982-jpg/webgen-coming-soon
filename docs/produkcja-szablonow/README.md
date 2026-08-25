# Produkcja szablonów — projekt

Stan na: 25 sierpnia 2026

Projekt zbiera **proces wytwarzania szablonów stron** dla webgen.pl: jak powstaje pojedynczy
wariant wizualny, jakie zasady musi spełnić, jak go zweryfikować i jak wygląda podział pracy.
Powstał na bazie pilota branży **Hydraulik** (6 wariantów, komplet ukończony).

**Zanim zaczniesz kolejny wariant w drugiej (lub dowolnej następnej) branży, przeczytaj
`ZASADY.md` sekcja 0** — każda branża dostaje bespoke wykonanie, zero kopiowania layoutu z
odpowiednika w innej branży. Ta zasada była złamana dwukrotnie (elektryk-1, elektryk-4) zanim
trafiła do dokumentu.

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
