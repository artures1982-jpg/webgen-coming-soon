# Migracja do Next.js — plan od zera

Stan na: 7 września 2026, **odświeżone 14 września 2026** (sekcja 1 i 5 zawierały nieaktualne
liczby/założenia — poprawki oznaczone niżej). Poprzedni dokument na ten temat (rozmowa z innej
sesji, „Faza 0") nie został nigdzie zapisany — ten plik go zastępuje jako jedyne źródło prawdy.

---

## 1. Stan obecny — co naprawdę mamy dziś

Sprawdzone w kodzie, nie z pamięci:

- **Zero frameworku.** `package.json` ma 3 zależności (`@clerk/backend`, `@vercel/blob`, `stripe`),
  zero skryptu builda, zero `next`/`react`. To czysty statyczny Vercel deploy: pliki `.html` +
  `vercel.json` (rewrites/redirects/headers/CSP) + katalog `api/` z **12 Serverless Functions**
  (stan 14.09 — przybyły `contact.js`/`contact-form.js` od 7.09) + jeden `middleware.js` w Edge
  Middleware Vercela (nie Next.js).
- **~9050 linii** w głównych plikach produktowych (stan 14.09) — `generator/index.html` 3532,
  `index.html` 2070, `dashboard/index.html` 1238, `admin/index.html` 1494. To vanilla JS renderujący
  panele przez ręczne pokazywanie/ukrywanie divów.
- **Generator stracił własny wybór branży/galerii (zmiana z 13.09).** Panel 1 dziś tylko pokazuje
  podsumowanie szablonu wybranego wcześniej w `/galeria/` (deep-link `?template=`) — realnie
  *mniej* stanu do migracji na React niż zakładał ten dokument 7.09, nie więcej.
- **`api/personalize.js` przepisany dwukrotnie 13-14.09** — już nie woła żadnego modelu AI w
  runtime (ani Claude, ani przymierzanego Groq/Pexels — cofnięte tego samego dnia jako zbyt
  ryzykowne względem wartości). Dziś to czyste `String.split().join()` na pliku z `templates/pilot/`
  + nałożenie jednej z 48 predefiniowanych palet kolorów (`templates/palettes.json`, 12 branż × 4).
  To **dokładnie** architektura, o której mówi sekcja 2 tego dokumentu i Etap 2
  `architektura-generowania.md` — dziś zrealizowana w praktyce, nie tylko postulowana.
- **Subdomeny `*.webgen.pl` już działają**, wbrew temu, co mówi sekcja „Pending" w `CLAUDE.md`.
  `middleware.js` przechwytuje request po hoście, ściąga `sites/<slug>/index.html` z Vercel Blob
  i serwuje. `api/deploy.js` zapisuje tam gotową stronę klienta (`@vercel/blob` → `put()`). Cały
  łańcuch generator → personalize → deploy → Blob → middleware → subdomena jest zamknięty i
  produkcyjny już dziś. **CLAUDE.md trzeba poprawić niezależnie od tej migracji** — to nieaktualny
  wpis, nie brakująca funkcja.
- **Etap 1 z `docs/architektura-generowania.md` (Edge→Node dla `generate.js`) nie został zrobiony.**
  `api/generate.js` i `api/notify-client.js` nadal mają `runtime: 'edge'` i 25 s limitu. To jest
  tańsza, już zaplanowana poprawka niezwiązana z Next.js — patrz sekcja 6.
- **53 zamrożone szablony** w `templates/pilot/` (12 branż) to surowy HTML z literalnymi tokenami
  `{{MIASTO}}` itd., produkowane przez osobny pipeline agentów (`designer-ux-ui` →
  `copywriter-szablonow` → `qa-szablonow`, kontrolowany serwerem MCP `qa-szablony`). To jest dziś
  produkt firmy — nie eksperyment do przepisania.

---

## 2. Kluczowe rozstrzygnięcie zakresu — co NIE migruje

Zanim jest jakikolwiek harmonogram, trzeba to ustalić, bo błędna decyzja tutaj psuje cały plan:

**`templates/pilot/*.html` (53 pliki) NIE stają się komponentami React.** Powody:
- Cały pipeline produkcji (agenci, `ZASADY.md`, MCP `qa-szablony`) jest napisany pod kontrolę
  surowego HTML/CSS — hex poza `:root`, balans tagów, gramatyka tokenów, gap 320–1280px. Przepisanie
  na JSX unieważnia każde z tych narzędzi i wymaga przepisania całej instrukcji agentów od zera,
  za zero realnej korzyści.
- `docs/architektura-generowania.md` (Etap 2, już zaakceptowany kierunek) mówi wprost: docelowy
  runtime to `String.split().join()` na zamrożonym pliku, „milisekundy, zero AI". To jest **cecha**,
  nie dług techniczny — im prościej wydaje się gotowy szablon klientowi, tym taniej i pewniej.

Next.js ma **owinąć** ten pipeline (routing, auth, dashboard, API), a nie go zastąpić. Szablon
nadal jest plikiem tekstowym czytanym i podstawianym w route handlerze — dokładnie jak dziś, tylko
że handler żyje w `app/api/.../route.ts` zamiast w `api/*.js`.

---

## 3. Korzyści — konkretne, nie ogólnikowe

| # | Korzyść | Dlaczego akurat tutaj to boli |
|---|---------|-------------------------------|
| 1 | **Generator/dashboard/admin jako komponenty** | `generator/index.html` to 3599 linii w jednym `<script>` z twardą zasadą w CLAUDE.md „nowy JS wstrzykuj WEWNĄTRZ bloku" — to jest już dziś nie do utrzymania ręcznie, React/state to naturalne rozwiązanie problemu, który sami już nazwaliście regułą obejścia. |
| 2 | **Jeden model routingu zamiast ręcznej listy w `vercel.json`** | Dziś każda czysta ścieżka (`/generator`, `/dashboard`, `/cennik`...) to osobny wpis w `rewrites`. Rośnie liniowo z każdą nową sekcją; file-based routing Next.js to zdejmuje. |
| 3 | **Subdomeny klienckie stają się natywnym wzorcem, nie hackiem** | Middleware routing po hoście + fetch z Blob **już działa** (sekcja 1) i migruje do Next.js Middleware niemal 1:1 (to ten sam model API — `NextResponse` zamiast gołego `Response`). Niskie ryzyko, realny zysk: łatwiej dołożyć np. ISR/cache per-slug. |
| 4 | **Oficjalny `@clerk/nextjs`** zamiast ręcznego `shared/clerk.js` + `lib/clerk-verify.js` na każdym endpointzie | Mniej własnego kodu auth do utrzymania, middleware-based session zamiast ręcznego `Authorization: Bearer` na każdym fetchu. |
| 5 | **`next/image` dla zdjęć Pexels** | Ostatni commit na branchu (`d9352c9`) to ręczne dopasowanie rozmiaru zdjęć Pexels do wyświetlanej wielkości — dokładnie to, co `next/image` robi automatycznie. Dziś to praca ręczna powtarzana za każdym razem. |
| 6 | **TypeScript na API** | Redukuje klasę błędów typu „zapomniałem że to pole przychodzi z Clerk, nie z body" — mieliście już incydent z odczytem złej wartości (fotowoltaika suwak godzin, inna kategoria błędu, ale ten sam rodzaj „wygląda dobrze, jest źle"). |
| 7 | **Jeden współdzielony komponent `<Nav>`** | **Nowy przykład z 14.09, nie hipotetyczny:** ten sam pasek nawigacji (logo + linki + hamburger + wstrzykiwany JS-em chip zalogowanego usera) jest dziś ręcznie skopiowany w 5 plikach (`index.html`, `cennik/`, `regulamin/`, `polityka-prywatnosci/`, `generator/`). Bug znaleziony dziś przez Artura (zalogowany klient na telefonie nie miał jak otworzyć menu — wstrzyknięty chip wypychał hamburger poza ekran) trzeba było naprawić identyczną łatką w 5 miejscach osobno. Jeden komponent React naprawiłby to raz, nie pięć razy, i uniemożliwił powrót tego samego bugu przy szóstej stronie. |

---

## 4. Zagrożenia — konkretne, nie ogólnikowe

| # | Ryzyko | Konkretny scenariusz szkody |
|---|--------|------------------------------|
| 1 | **Dotyka żywej, indeksowanej produkcji w trakcie migracji** | `index.html` (coming soon) jest jedyną indeksowaną stroną i właśnie przeszła 4 rundy poprawek PageSpeed. Migracja w locie = ryzyko cofnięcia tych poprawek lub przestoju na stronie, która faktycznie ma ruch. |
| 2 | **Koliduje z aktywną produkcją szablonów** | **Poprawka 14.09:** `preview/hydraulik-pilot` (opisany tu 7.09 jako 128 commitów przed `main`) dziś ma **zero** commitów przed `main` — cała produkcja szablonów przeniosła się na bezpośrednie commity na `main` (widać to po dzisiejszej sesji: palety, fix formularza kontaktowego na 53 plikach, wszystko na `main`). Ryzyko kolizji więc nie znika, tylko zmienia mechanizm: nie ma już izolacji branchem — długa migracja frameworku i sesja dopisująca kolejną branżę do `templates/pilot/` będą dotykać tego samego brancha, więc kolidują wprost przez pliki, nie przez `git checkout`. Pamięć „shared working dir git hazard" dotyczy więc teraz `main` wprost. |
| 3 | **Auth to zmiana modelu, nie przepięcie biblioteki** | Dziś Clerk działa przez `window.getClerk()` po stronie klienta; `@clerk/nextjs` to głównie sesje weryfikowane po stronie serwera przez middleware. To realna zmiana zachowania w miejscach z pieniędzmi i dostępem (dashboard, allowlist admina) — wymaga równoległego testu, nie „powinno działać tak samo". |
| 4 | **CSP już raz ugryzło ten projekt** | Commit `055dce4` naprawiał CSP blokujący iframe podglądu w galerii. Next.js dev mode i ewentualne domeny `next/image` wymagają ponownego audytu `Content-Security-Policy` w `vercel.json` — łatwo o cichą regresję (obrazek/skrypt po prostu się nie załaduje, bez czytelnego błędu). |
| 5 | **SEO/URL parity jest łatwe do przeoczenia** | `cleanUrls: true`, `trailingSlash: false`, oraz `noindex` na `start/cennik/generator/login/rejestracja` (celowa decyzja Artura, patrz `seo_noindex_deferred` w pamięci) — każdy z tych detali trzeba odtworzyć jawnie w konwencjach Next.js (`metadata` export, routing), inaczej znika po cichu przy przepisywaniu `<head>`. |
| 6 | **Zakaz template literals może, ale nie musi, zniknąć** | Dzisiejszy zakaz w `api/*.js` to efekt konkretnego zachowania esbuild przy ESM→CJS na Edge. Next.js buduje inaczej (własny bundler) — trzeba to **zweryfikować eksperymentem**, nie założyć. Błędne założenie w dowolną stronę = albo niepotrzebnie trzymana niewygodna konwencja, albo powrót buga, który już raz kosztował produkcyjny fix. |
| 7 | **To wielotygodniowy przepisz, a nie to jest dziś wąskim gardłem** | Własny dokument projektu (`architektura-generowania.md`) już ustalił, że rzeczywisty problem (limit 25s na `generate.js`) rozwiązuje się w godziny samą zmianą `runtime: 'edge'` → Node — i to nawet nie zostało jeszcze zrobione. Zaczynanie migracji frameworku przed domknięciem już uzgodnionego, tańszego planu przesuwa w czasie rzeczywisty priorytet produktowy (tania biblioteka szablonów) na rzecz przepisania, które płaci się głównie w generatorze/adminie. |
| 8 | **Koszt tokenów/sesji** | Pamięć projektu odnotowuje powtarzający się problem z długością sesji („Długość kontekstu = główny koszt", „Minimize session usage"). Migracja obejmująca 8000+ linii w kilku plikach to typowy kandydat na niekontrolowany rozrost jednej sesji, jeśli nie zostanie pocięta na wąskie, zamykane etapy. |

---

## 5. Rekomendacja co do kolejności względem innych planów

Trzy równoległe tory istnieją już dziś w tym repo:

1. **Produkcja biblioteki szablonów** (`preview/hydraulik-pilot`, 12/12+ branż) — aktywna, codzienna.
2. **`architektura-generowania.md` Etap 1–3** — uzgodniony, tańszy, Etap 1 nie zrobiony.
3. **Ta migracja** — nowa, nieuzgodniona co do zakresu i terminu.

**Rekomendacja: Etap 1 z toru 2 (Edge→Node dla `generate.js`, godziny pracy) idzie przed
migracją do Next.js**, niezależnie od niej — zdejmuje realne ograniczenie architektury już teraz,
zero konfliktu z torem 1. Sama migracja do Next.js (ten dokument) powinna zaczynać się dopiero od
**Fazy 0** (patrz niżej), która świadomie nie dotyka niczego produkcyjnego ani niczego na
`preview/hydraulik-pilot` — więc nie musi czekać na koniec produkcji szablonów, może iść równolegle,
pod warunkiem że nie miesza się do tego samego brancha/plików co sesja budująca kolejną branżę.

---

## 6. Plan fazowy

Każda faza kończy się punktem kontrolnym — Artur ocenia wynik i decyduje, czy jest zielone
światło na następną. Żadna faza nie zaczyna kolejnej automatycznie (ta sama zasada, którą już
stosujecie przy wariantach szablonów).

### Faza 0 — Fundament, zero zmian widocznych na produkcji

**Cel:** sprawdzić wykonalność i policzyć realny koszt, zanim zapadnie decyzja o reszcie.

- Scaffolding Next.js (App Router, TypeScript) w osobnym katalogu/branchu, **bez dotykania**
  plików na `main` ani `preview/hydraulik-pilot`.
- Odtworzyć 1:1 w `next.config`: `cleanUrls`, `trailingSlash: false`, wszystkie `headers` (CSP
  włącznie), wszystkie `redirects`.
- Eksperyment: jeden endpoint API z `Bearer ${token}`-stylem template literalu — sprawdzić, czy
  build faktycznie się wywraca, czy zakaz z CLAUDE.md dotyczy tylko starego Edge bundlera.
- Zdeployować jedną **nieistotną, statyczną, bez-auth** stronę (kandydat: `polityka-prywatnosci/`
  — czysta treść prawna, brak logiki, brak ruchu biznesowego) na osobnym preview URL-u Vercela,
  nie podmieniać niczego na `main`.

**Ryzyko:** brak — nic nie idzie na produkcję. Koszt: czas/tokeny na setup.
**Kryterium przejścia do Fazy 1:** działający `npm run dev`, potwierdzone zachowanie template
literals, jedna strona renderuje się identycznie na preview URL-u co dzisiejszy statyczny plik.

### Faza 1 — Strony statyczne niskiego ryzyka

`start/`, `cennik/`, `polityka-prywatnosci/`, `regulamin/`, `robots.txt`/`sitemap.xml` — treść bez
stanu, bez auth. `index.html` (coming soon) **celowo zostaje na koniec tej fazy, nie na początku**
— to jedyna indeksowana strona, najdroższa do zepsuć.

**Ryzyko:** średnie — te strony właśnie przeszły rundę poprawek PageSpeed (fonty, LCP, preload),
łatwo je przypadkiem cofnąć przy przepisywaniu `<head>`. Wymaga porównania Lighthouse przed/po,
nie tylko wizualnego review.
**Kryterium przejścia:** wszystkie noindex-tagi i meta z sekcji 4.5 potwierdzone 1:1, PageSpeed nie
gorszy niż dziś.

### Faza 2 — API routes i middleware

10 plików z `api/*.js` → Route Handlers, `middleware.js` → Next.js Middleware (routing subdomen
per host — patrz sekcja 3.3, powinno przenieść się niemal bez zmian logiki).

**Ryzyko:** wysokie — to ścieżki z realnymi pieniędzmi (`create-checkout.js`, Stripe) i realnym
dostępem klientów (`dashboard-data.js`, `deploy.js` piszący do Blob, który serwuje żywe subdomeny).
Wymaga równoległego testu każdego endpointu ze starą i nową wersją przed przełączeniem, nie
„wygląda że działa".
**Kryterium przejścia:** każdy endpoint przetestowany z realnym tokenem Clerk i realną kartą testową
Stripe, subdomena testowa nadal serwuje się poprawnie przez nowy middleware.

### Faza 3 — Auth: `@clerk/nextjs`

Zamiana modelu z client-side SDK (`shared/clerk.js`) na server-verified middleware sessions.
Dotyka `login/`, `rejestracja/`, panel-0 generatora, `dashboard/`, allowlist w `admin/`.

**Ryzyko:** wysokie — to zmiana zachowania, nie przepięcie biblioteki (sekcja 4.3). Robić dopiero
gdy Faza 2 już stoi na nowym middleware/route handlers, żeby nie mieszać dwóch źródeł niepewności
naraz.
**Kryterium przejścia:** logowanie, rejestracja, dostęp do dashboardu i blokada admina dla
nie-allowlisted e-maila przetestowane end-to-end na koncie testowym.

### Faza 4 — Generator, dashboard, admin jako komponenty React

Właściwy cel migracji z perspektywy DX — rozbicie 3599/1232/1485-liniowych plików na komponenty
i wspólny stan. Największa realna korzyść (sekcja 3.1) i największy koszt przepisania w całym
planie.

**Ryzyko:** wysokie, ale zlokalizowane — nie dotyka klienta końcowego (odbiorcy gotowej strony),
tylko wewnętrzne narzędzie (generator) i panel klienta. Błąd tu jest widoczny i odwracalny (stary
plik `.html` może zostać obok jako fallback do czasu pełnej pewności).
**Kryterium przejścia:** pełny flow „rejestracja → wybór szablonu → personalizacja → aktywacja
subdomeny" przechodzi end-to-end na nowym generatorze, bez regresji względem dzisiejszego.

### Faza 5 (opcjonalna, po wszystkim) — biblioteka szablonów jako route, nie folder plików

Dopiero tutaj `templates/pilot/*.html` dostaje **jeden** dynamiczny route (`app/s/[slug]/route.ts`),
który czyta plik tekstowo i robi dokładnie to samo podstawienie tokenów co dziś —
**bez zamiany treści na komponenty** (sekcja 2). Korzyść: subdomeny klienckie i galeria (`/galeria/`)
przestają potrzebować osobnych statycznych `index.html` per branża, mogą być generowane z jednego
route'a + listy manifestu.

**Ryzyko:** niskie, jeśli Fazy 0–4 stoją — to głównie zmiana miejsca, w którym żyje ten sam kod.
**Kryterium:** brak presji czasowej — robić tylko jeśli po Fazie 4 nadal wygląda na wartą zachodu.

---

## 7. Otwarte pytania — tylko Artur może je rozstrzygnąć

- **Kiedy zaczynamy Fazę 0?** Może iść równolegle z produkcją szablonów (nie dotyka tych samych
  plików), ale wymaga świadomej decyzji, żeby nie mieszać dwóch dużych torów pracy w jednej sesji.
- **Czy Etap 1 z `architektura-generowania.md` (Edge→Node, godziny pracy) robimy od razu, niezależnie
  od tej migracji?** Rekomendacja w sekcji 5 mówi tak — potrzebne potwierdzenie.
- **App Router czy Pages Router?** Dokument zakłada App Router (obecny standard Next.js/Vercel),
  ale to decyzja do jawnego potwierdzenia, nie domyślne założenie.
- **Czy stary statyczny `main` zostaje jako fallback aż do końca Fazy 4, czy przełączamy się
  wcześniej?** Wpływa na to, jak długo utrzymujemy dwa równoległe źródła prawdy.
- **Aktualizacja `CLAUDE.md`** — sekcja „Pending" wymienia `*.webgen.pl` jako niezrobione, a
  działa już dziś (sekcja 1). To niezależna poprawka dokumentacji, wykonalna od razu, bez związku
  z resztą tego planu.
