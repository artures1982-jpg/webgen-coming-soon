# qa-szablony — lokalny serwer MCP

Deterministyczne kontrole jakości szablonów webgen.pl, wg reguł z
`docs/produkcja-szablonow/ZASADY.md`. Serwer po stdio, uruchamiany lokalnie przez Claude Code —
zero API, zero hostingu. Sieć jest używana wyłącznie do sprawdzenia HTTP 200 na zdjęciach Pexels.

## Instalacja

```bash
cd mcp/qa-szablony
npm install
npx playwright install chromium   # tylko dla sprawdz_mobile
```

## Rejestracja w Claude Code

```bash
claude mcp add qa-szablony -- node /Users/artursapoznikow/webgen-coming-soon/mcp/qa-szablony/src/server.js
```

## Narzędzia

- **`sprawdz_szablon(sciezka)`** — 12 kontroli statycznych: hex poza `:root` (sekcja 1),
  gramatyka `{{MIASTO}}` (2), embed mapy (3), zdjęcia Pexels + duplikaty w branży (4),
  zabezpieczenie logo/navu (6.5/6.6), realna treść bloku `prefers-reduced-motion`, balans
  tagów, `<!-- PHOTO NEEDED -->`, liczba tokenów (fail przy >0 dla `-preview-wypelniony`),
  kolizje palety/fontów wobec innych plików w `templates/pilot/`, podobieństwo CSS wobec
  rodzeństwa branży (sekcja 0 — zawsze tylko `warn`, nigdy `fail`, bo to przesłanka nie
  werdykt), spójność mirrora `templates/pilot/` ↔ `preview/<branża>/`.

- **`sprawdz_mobile(sciezka)`** — Playwright: skan poziomego overflow 320–1280px, realny klik
  hamburgera z odczytem `boundingBox` po kliknięciu, realny scroll przez `mouse.wheel` (nie
  `scrollIntoView`/`scrollBy` — przy `scroll-behavior:smooth` dają fałszywy pusty render),
  zrzuty ekranu 360/390px jako artefakty. Reguła 6.8 (karta zasłaniająca zdjęcie hero) NIE
  jest oceniana automatycznie — zwraca wyłącznie zrzuty, `wymaga_oceny_wzrokowej: true`.

- **`porownaj_teksty(plik_a, plik_b)`** — sekcja 5.1: kalki tekstowe w trzech stałych
  miejscach (akapit kontaktowy, pierwsze zdanie stopki, otwarcie pierwszej odpowiedzi FAQ) +
  duplikacja wewnątrz jednego pliku (oś czasu vs FAQ).

## Kształt raportu

Każdy check ma `id`, `sekcja` (numer/nazwa z ZASADY.md), `status`
(`ok` / `fail` / `warn` / `n-a`), `znaleziska`, `wymaga_oceny_wzrokowej`. Pola ocenne
(diff CSS rodzeństwa, karta na zdjęciu hero) nigdy nie zwracają werdyktu — tylko dowody
(procenty, zrzuty, najbardziej podobne bloki selektorów) i jawną flagę do oceny człowieka/modela.
