# Architektura generowania stron — plan

Stan na: 4 września 2026. Dokument powstał po pytaniu Artura: *„czy można stworzyć z tego workera
albo jakieś MCP umieścić np. w Oracle i żeby generował stronę na żądanie w Webgen?"*

---

## 1. Sedno: to są dwa różne systemy, nie jeden

Najważniejsze rozróżnienie, bez którego każda decyzja architektoniczna pójdzie w złą stronę:

| | **Studio produkcji szablonów** | **Runtime generowania stron** |
|---|---|---|
| Co robi | Tworzy nowe warianty do biblioteki | Wydaje stronę konkretnemu klientowi |
| Jak często | Kilkanaście razy na branżę, raz | Przy każdym kliencie, w kółko |
| Czas | 10–20 minut na wariant | Sekundy |
| Koszt | 250–400 tys. tokenów (3 agenty) | Grosze |
| Człowiek | Akceptacja Artura obowiązkowa | Zero ludzi w pętli |
| Charakter | Osąd, smak, wyjątki | Deterministyczny |

**Pipeline, który mamy dziś (brief → designer → copywriter → QA → weryfikacja → deploy), jest
studiem.** Jego produktem jest biblioteka szablonów — i to właśnie ta biblioteka sprawia, że
runtime może być tani i szybki.

**Czego NIE robić:** nie odpalać pipeline'u studia przy każdym kliencie. Kilkanaście minut
oczekiwania i rachunek za tokeny wyższy niż cena strony. To nie jest kwestia optymalizacji, tylko
niewłaściwego użycia narzędzia.

---

## 2. Ustalenie faktu: limit 25 s jest samonarzucony

`CLAUDE.md` opisuje runtime jako **„Vercel Edge Runtime (25s limit Hobby)"**. To już nieaktualne:

- `api/generate.js` — nadal `export const config = { runtime: 'edge' }`, `max_tokens: 8000`,
  plus hack „domknij jeśli urwane (max_tokens)" sklejający niedokończony HTML. To są objawy
  wciskania pełnej strony w ciasny limit.
- `api/personalize.js` — **już zmigrowany**, ma w nagłówku komentarz: *„Node runtime (nie Edge) —
  dłuższy limit czasu (300s Fluid Compute vs 25s Edge Hobby)"*. Migracja jest więc sprawdzona
  we własnym kodzie.
- Dokumentacja Vercela (zweryfikowana 04.09.2026): `maxDuration` konfigurowalne **do 1800 s**,
  Fluid Compute włączane ustawieniem, Edge Functions **odradzane** przez samego Vercela.

**Wniosek:** ograniczenie, wokół którego zbudowana jest architektura generowania (dzielenie na
3 równoległe wywołania, ucinanie odpowiedzi), prawdopodobnie zniknęło. To trzeba naprawić, ZANIM
dołoży się jakąkolwiek nową infrastrukturę na problem, którego może już nie być.

---

## 3. Plan w trzech etapach

### Etap 1 — migracja `generate.js` z Edge na Node/Fluid *(najtańszy, największy zysk)*

Zero nowej infrastruktury, ścieżka sprawdzona w `personalize.js`.

- `export const config = { runtime: 'edge' }` → runtime Node (domyślny, Fluid Compute)
- `maxDuration` w `vercel.json` dla `api/generate.js` (start: 120–300 s, jest zapas do 1800)
- usunięcie hacka „domknij jeśli urwane", podniesienie `max_tokens`
- **uwaga na zakaz z `CLAUDE.md`**: w `api/*.js` nadal obowiązuje zakaz template literals
  (esbuild ESM→CJS się na nich wykłada) — migracja runtime tego nie zmienia

### Etap 2 — runtime z biblioteki, nie z AI *(sedno produktu)*

Gdy klient wypełnia formularz, „generowanie" to:

1. wybór branży i wariantu z biblioteki (dziś 47 szablonów w 11 branżach)
2. podstawienie tokenów — `String.split().join()`, milisekundy, zero AI
3. dobór zdjęć (Pexels API, już jest `api/pexels.js`)
4. **opcjonalnie** personalizacja tekstu przez AI — płatny dodatek, `api/personalize.js` już istnieje

Ścieżka główna nie potrzebuje agentów **ani nawet wywołania modelu**. AI staje się płatnym
ulepszeniem, nie warunkiem działania — co jednocześnie rozwiązuje problem kosztów i awaryjności
(strona powstaje nawet, gdy API modelu leży).

### Etap 3 — worker produkcyjny do rozbudowy biblioteki *(opcjonalny)*

Dopiero tutaj worker ma sens: kolejka „zbuduj wariant 2 dla branży X", leci w tle, gotowy plik
czeka na akceptację Artura. **Bramka akceptacji zostaje** — to ona wyłapała puste klatki w
stykówce, zbitą nawigację i kartę zasłaniającą zdjęcie. Automat tego nie zobaczy.

---

## 4. MCP — gdzie realnie pomoże

MCP to protokół dla klientów AI, nie dla klientów webgen. **Nie pomoże parze młodej wygenerować
strony.** Ma natomiast jeden konkretny sens: opakować kontrole z `ZASADY.md` w narzędzia —

- `sprawdz_szablon(plik)`: hex poza `:root`, gramatyka `{{MIASTO}}` (z luką z sekcji 2), balans
  tagów, tokeny, przelewy 320–1280 px, klik w hamburger, reguła 6.8

Dziś każda sesja odtwarza te sprawdzenia z dokumentu i za każdym razem trochę inaczej. Jako MCP
byłyby jednym wywołaniem, identycznym na każdej maszynie i w każdej sesji.

---

## 5. Oracle — kiedy tak, kiedy nie

Darmowy tier ARM (4 vCPU / 24 GB) jest dobry do: kolejki produkcyjnej, przebiegów Playwrighta,
obróbki zdjęć — czyli do **etapu 3**, nie do runtime.

**Nie przenosić webgen na Oracle „bo darmowe".** Projekt jest w całości na Vercelu; dołożenie
drugiej infrastruktury to stały koszt utrzymania w zamian za rozwiązanie problemu, który po
etapie 1 może przestać istnieć. Sięgać po Oracle dopiero, gdy realnie uderzymy w limit.

---

## Kolejność, gdyby robić to jutro

1. **Etap 1** (godziny) — zdejmuje ograniczenie, które kształtowało architekturę
2. **Etap 2** (dni) — zamienia produkt z „AI generuje stronę" na „biblioteka wydaje stronę,
   AI ją ulepsza za dopłatą"
3. **MCP z kontrolami** (dni) — przyspiesza studio i ujednolica jakość
4. **Etap 3 + Oracle** — tylko jeśli po powyższym nadal będzie potrzeba
