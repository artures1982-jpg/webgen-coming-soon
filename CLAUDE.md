# CLAUDE.md — webgen.pl

## Projekt

SaaS generator stron firmowych. Klient wypełnia formularz → AI (Claude Sonnet 4.6)
generuje 3 warianty HTML strony równolegle → klient wybiera i aktywuje subdomenę.

---

## Dostępne narzędzia MCP — kiedy używać

### 1. `Control your Mac:osascript`
**Używaj DO:**
- Uruchamiania skryptów Python: `python3 /Users/.../Downloads/skrypt.py`
- Git: `git add && git commit && git push`
- Zamykania Terminala po sesji: `tell application "Terminal" to close every window`
- Szybkich operacji na plikach bez pisania skryptu

**NIE używaj do:**
- Czytania dużych plików (użyj Desktop Commander:read_multiple_files)
- Pisania długich skryptów inline (ucieknij cudzysłowy — użyj write_file)

**Przykład:**
```
do shell script "python3 /Users/artursapoznikow/Downloads/fix.py 2>&1"
do shell script "cd /Users/artursapoznikow/webgen-coming-soon && git add -A && git commit -m 'fix: ...' && git push origin main 2>&1"
tell application "Terminal" to close every window
```

---

### 2. `Desktop Commander:write_file`
**Używaj DO:**
- Tworzenia skryptów Python w `~/Downloads/` (ZAWSZE przez Python, nie edytuj plików projektu bezpośrednio!)
- Pisania nowych plików projektu gdy Desktop Commander ma dostęp do katalogu
- Chunki max 25-30 linii, tryb `append` dla kolejnych chunków

**Workflow edycji pliku projektu:**
```
1. write_file → ~/Downloads/patch_nazwa.py  (skrypt Python)
2. osascript  → python3 ~/Downloads/patch_nazwa.py
3. osascript  → git commit + push
```

**NIGDY nie edytuj plików projektu bezpośrednio przez write_file** — używaj skryptów Python
które czytają plik, robią `str.replace()` i zapisują.

---

### 3. `Desktop Commander:read_multiple_files`
**Używaj DO:**
- Czytania plików projektu przed pisaniem patcha
- Czytania wielu plików naraz (np. `index.html` + `generate.js`)
- Diagnozowania błędów

**Przykład:**
```python
paths=[
  "/Users/artursapoznikow/webgen-coming-soon/api/generate.js",
  "/Users/artursapoznikow/webgen-coming-soon/test/generator/index.html"
]
```

---

### 4. `Vercel:list_deployments`
**Używaj DO:**
- Sprawdzania statusu po każdym `git push`
- Szukania ostatniego deploy ID do pobrania logów

**Zawsze podawaj:**
```
projectId: "prj_NCSHiopDiHYgUCEjGGuedrj62U8H"
teamId:    "team_9GrxtXBkSmlXnZNk3zGsngHW"
```

---

### 5. `Vercel:get_deployment_build_logs`
**Używaj DO:**
- Diagnozowania błędów builda (state: ERROR)
- Szukania linii z `ERROR:` w logach

**Przykład:** `idOrUrl: "dpl_..."` (z list_deployments)

---

### 6. `Vercel:get_deployment` / `Vercel:get_project`
**Używaj DO:**
- Sprawdzania szczegółów konkretnego deployu
- Weryfikacji env vars i ustawień projektu

---

## Narzędzia których NIE używamy w tym projekcie

| Narzędzie | Powód |
|---|---|
| `Claude in Chrome` | Projekt to kod lokalny, nie przeglądarka |
| `Control Chrome` | Nie potrzebujemy kontroli przeglądarki |
| `Cloudflare Developer Platform` | Hosting na Vercel, nie Cloudflare Workers |
| `Canva` | Nie tworzymy materiałów graficznych |
| `Gmail / Google Calendar` | Nie obsługujemy emaili klienta przez te narzędzia |
| `Zapier` | Automatyzacje nie są potrzebne w tej sesji |

---

## Stack i infrastruktura


- **Repo**: `/Users/artursapoznikow/webgen-coming-soon/` → GitHub `artures1982-jpg/webgen-coming-soon`
- **Vercel project**: `prj_NCSHiopDiHYgUCEjGGuedrj62U8H`
- **Vercel team**: `team_9GrxtXBkSmlXnZNk3zGsngHW`
- **Domeny**: `webgen.pl`, `www.webgen.pl`, `*.webgen.pl`
- **Runtime API**: Vercel Edge Runtime (25s limit Hobby)
- **Model AI**: `claude-sonnet-4-6`
- **Email**: Resend (`RESEND_API_KEY`)
- **Płatności**: Stripe (`STRIPE_SECRET_KEY`)
- **Zdjęcia**: Pexels (`PEXELS_API_KEY`)

---

## Architektura plików

```
/api/generate.js          Edge — 3x równoległe call Claude, generuje HTML
/api/notify-client.js     Edge — email po generowaniu (BEZ template literals!)
/api/pexels.js            Proxy Pexels API
/api/register.js          Rejestracja użytkownika
/api/dashboard-data.js    Dane Stripe → dashboard
/test/generator/index.html  ~3600 linii — główny generator UI
/test/dashboard/index.html  Panel klienta + wiadomości
/test/index.html            Landing page
/test/cennik/               Cennik
/test/login/                Login
```

---

## Krytyczne zasady kodu

### ZAKAZ template literals w api/*.js
```js
// ❌ ŹLE — Vercel esbuild ESM→CJS crashuje na tym:
headers: { 'Authorization': `Bearer ${KEY}` }
subject: `Twoja strona — ${nazwa}`

// ✅ DOBRZE — zawsze konkatenacja:
headers: { 'Authorization': 'Bearer ' + KEY }
subject: 'Twoja strona — ' + nazwa
```

### ZAKAZ </body> jako anchor w Python patchach
`</body>` może być wewnątrz JS stringa (`iframe.srcdoc`).
Zawsze używaj unikalnego anchora tekstowego z kodu JS.

### Jeden główny `<script>` blok w generator/index.html
- `const state = {}` zdefiniowany w głównym bloku (~L1621)
- Nowy JS wstrzykuj WEWNĄTRZ bloku, nie jako osobny `<script>`
- Anchor wstrzyknięcia: unikalny string tuż przed `</script>` głównego bloku

---

## Standardowy workflow zmian

```
1. Desktop Commander:read_multiple_files  → przeczytaj plik(i) które edytujesz
2. Desktop Commander:write_file           → skrypt Python w ~/Downloads/nazwa.py
3. Control your Mac:osascript             → python3 ~/Downloads/nazwa.py
4. Control your Mac:osascript             → git add + commit + push
5. Vercel:list_deployments                → czekaj na READY (30-60s)
6. Jeśli ERROR → Vercel:get_deployment_build_logs → diagnoza → fix → wróć do 2
7. Control your Mac:osascript             → tell application "Terminal" to close every window
```

---

## localStorage schema

```json
{
  "wg_user": {
    "email": "...", "accountType": "firma|individual",
    "profileFirma": { "nazwa_firma": "", "nip": "", "adres_firma": "" },
    "created": "ISO", "plan": "free_trial", "activated": false
  },
  "wg_session": { "email": "...", "session": "token", "activated": true },
  "wg_messages": [{ "type": "questionnaire", "read": false, "firma": {}, "slug": "" }],
  "wg_generated": { "html": "...", "slug": "...", "style": "classic" }
}
```

---

## Stan generatora

```
panel-0: Rejestracja (typ konta: firmowy/indywidualny + dane firmowe)
panel-1: Branża (dropdown grouped, 12 kategorii, ~70 opcji) + lokalizacja
panel-2: Dane strony + kontakt + logo + usługi + layout picker z live preview
panel-3: Social media i rezerwacje
panel-4: Wybierz plan (Managed START/PRO/PREMIUM)
panel-5: Dodatki
panel-6: Generuj — 3 warianty równolegle (klasyczny/nowoczesny/elegancki)
         → variant picker popup → preview → aktywacja
```

---

## Pending

- [ ] Test pełnego flow generowania end-to-end
- [ ] Stripe checkout live mode
- [ ] Supabase Auth (prawdziwe hasła w DB)
- [ ] Subdomena `*.webgen.pl` — deployment generowanych stron klientów
- [ ] Google Business Profile integracja
- [ ] Rotacja kluczy API
