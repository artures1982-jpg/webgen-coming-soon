#!/usr/bin/env python3
"""
generate_context.py
Uruchom przed każdą sesją z Claude:
  python3 /Users/artursapoznikow/webgen-coming-soon/generate_context.py
Generuje context.md ze świeżym stanem projektu.
"""
import os, subprocess, datetime

REPO = '/Users/artursapoznikow/webgen-coming-soon'
OUT  = os.path.join(REPO, 'context.md')

def sh(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, cwd=REPO,
               stderr=subprocess.DEVNULL).decode().strip()
    except:
        return '—'

def count_lines(rel):
    try:
        return len(open(os.path.join(REPO, rel)).readlines())
    except:
        return 0

def find_anchors(rel, needles):
    result = {}
    try:
        for i, line in enumerate(open(os.path.join(REPO, rel)), 1):
            for needle in needles:
                if needle not in result and needle in line:
                    result[needle] = i
    except:
        pass
    return result

def script_close_lines(rel):
    hits = []
    try:
        for i, line in enumerate(open(os.path.join(REPO, rel)), 1):
            if line.strip() == '</script>':
                hits.append(i)
    except:
        pass
    return hits

def main():
    now  = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    head = sh('git rev-parse --short HEAD')
    branch = sh('git branch --show-current')
    commits = sh('git log --oneline -8')
    status  = sh('git status --short')

    gen_lines  = count_lines('test/generator/index.html')
    dash_lines = count_lines('test/dashboard/index.html')
    api_lines  = {f: count_lines(f'api/{f}') for f in [
        'generate.js','notify-client.js','register.js',
        'dashboard-data.js','deploy.js','pexels.js',
        'login.js','activate.js','create-checkout.js'
    ]}

    anchors = find_anchors('test/generator/index.html', [
        'const state = {', 'collectFirmaData', 'async function startGenerate',
        'makeVariantFetch', 'updateLivePreview', 'openVariantPopup',
        'id="panel-0"','id="panel-1"','id="panel-2"',
        'id="panel-3"','id="panel-4"','id="panel-5"','id="panel-6"',
        'id="variant-popup"','id="gen-fullscreen"',
        'branza-select','f-nazwa-strony','f-uslugi',
    ])

    script_ends = script_close_lines('test/generator/index.html')
    main_block_end = script_ends[0] if script_ends else '?'

    status_str = ('czyste — brak niezacommitowanych zmian'
                  if not status else f'NIEZACOMMITOWANE:\n{status}')

    out = []
    a = out.append

    a(f'# context.md — webgen.pl')
    a(f'> Auto-generated: {now} | HEAD: `{head}` | branch: `{branch}`')
    a(f'> Regeneruj: `python3 {REPO}/generate_context.py`')
    a('')
    a('---')
    a('')
    a('## Git — ostatnie commity')
    a('```')
    a(commits)
    a('```')
    a('')
    a(f'**Status repo:** {status_str}')
    a('')
    a('---')
    a('')
    a('## Rozmiary plików')
    a('')
    a(f'| Plik | Linii |')
    a(f'|------|-------|')
    a(f'| test/generator/index.html | {gen_lines} |')
    a(f'| test/dashboard/index.html | {dash_lines} |')
    for f, n in api_lines.items():
        a(f'| api/{f} | {n} |')
    a('')
    a('---')
    a('')
    a('## Kluczowe anchory — generator/index.html')
    a('')
    a('| Symbol | Linia |')
    a('|--------|-------|')
    for needle, line in sorted(anchors.items(), key=lambda x: x[1] or 0):
        a(f'| `{needle}` | L{line} |')
    a('')
    a(f'**Główny `</script>` blok kończy się na: L{main_block_end}**')
    a(f'Wszystkie `</script>` na liniach: {script_ends[:8]}')
    a('')
    a('---')
    a('')

    with open(OUT, 'w') as f:
        f.write('\n'.join(out))

    print(f'OK → {OUT}')
    print(f'HEAD: {head} | {gen_lines} linii generator | {dash_lines} linii dashboard')

if __name__ == '__main__':
    main()
    # Dopisz stałą część (stack, zasady, workflow, localStorage, panele, pending)
    static = '''## Stack i infrastruktura

| | |
|--|--|
| Repo lokalne | `/Users/artursapoznikow/webgen-coming-soon/` |
| GitHub | `artures1982-jpg/webgen-coming-soon` (branch: main) |
| Vercel project | `prj_NCSHiopDiHYgUCEjGGuedrj62U8H` |
| Vercel team | `team_9GrxtXBkSmlXnZNk3zGsngHW` |
| Runtime API | Vercel Edge Runtime (25s limit Hobby) |
| Model AI | `claude-sonnet-4-6` |
| Email | Resend (`RESEND_API_KEY`) |
| Płatności | Stripe (`STRIPE_SECRET_KEY`) |
| Zdjęcia | Pexels (`PEXELS_API_KEY`) |

---

## Narzędzia MCP — kolejność użycia

1. `Desktop Commander:read_multiple_files` → przeczytaj plik przed edycją
2. `Desktop Commander:write_file` → skrypt Python w `~/Downloads/` (max 25-30 linii)
3. `Control your Mac:osascript` → `python3 ~/Downloads/skrypt.py` + git push
4. `Vercel:list_deployments` → sprawdź READY po push
5. `Vercel:get_deployment_build_logs` → tylko gdy ERROR

**NIE używaj:** Claude in Chrome, Control Chrome, Cloudflare, Canva, Gmail, Zapier

---

## Krytyczne zasady kodu

### ZAKAZ template literals w api/*.js
```js
// BŁĄD → Vercel esbuild crashuje:
\'Authorization\': `Bearer ${KEY}`

// POPRAWNIE → konkatenacja:
\'Authorization\': \'Bearer \' + KEY
```

### ZAKAZ </body> jako anchor w Python patchach
Może trafić na `</body>` wewnątrz `iframe.srcdoc` stringu JS.

### Struktura script bloków w generator/index.html
- Jeden główny `<script>` blok z `const state = {}`
- Nowy JS wstrzykuj WEWNĄTRZ tego bloku (przed jego `</script>`)
- Dodatkowy JS (np. live preview) → osobny `<script>` przed `</body>`

### Workflow edycji
```
read_multiple_files → write_file ~/Downloads/patch.py → osascript python3 → git push → Vercel:list_deployments → [ERROR?] get_build_logs → close Terminal
```

---

## localStorage schema

```json
{
  "wg_user": {
    "email": "", "accountType": "firma|individual",
    "profileFirma": { "nazwa_firma": "", "nip": "", "adres_firma": "" },
    "created": "ISO", "plan": "free_trial", "activated": false
  },
  "wg_session": { "email": "", "session": "token", "activated": true },
  "wg_messages": [{ "type": "questionnaire", "read": false, "firma": {}, "slug": "" }],
  "wg_generated": { "html": "", "slug": "", "style": "classic" }
}
```

---

## Panele generatora

| Panel | Zawartość |
|-------|-----------|
| panel-0 | Rejestracja: typ konta (firmowy/indywidualny) + dane firmowe + email + RODO |
| panel-1 | Branża: dropdown grouped (12 kategorii, ~70 opcji) + miasto + dzielnica |
| panel-2 | Nazwa strony · kontakt · logo · usługi (przecinek) · layout picker z live preview · dane firmowe (details) |
| panel-3 | Social media: Facebook, Instagram, TikTok, WhatsApp, Booksy, Maps |
| panel-4 | Wybór planu: Managed START 249zł / PRO 399zł / PREMIUM 599zł |
| panel-5 | Dodatki |
| panel-6 | Generuj → 3 warianty równolegle → variant-popup → preview → aktywacja |

## Flow generowania (panel-6)

```
startGenerate()
  → 3x makeVariantFetch(\'classic\'|\'modern\'|\'elegant\')
    → fetch /api/generate (Edge, Sonnet 4.6, 25s)
  → done===1 → openVariantPopup() + notify-client email
  → done===2,3 → update iframe w tle
  → selectVariant() → preview-panel → btn-activate
```

## Live preview (panel-2)

Pola z `oninput="updateLivePreview()"`:
- `f-nazwa-strony` → `#mock-nazwa` (nav)
- `f-lata` → `#mock-lata` (O nas)
- `f-realizacje` → `#mock-real` (O nas)
- `f-uslugi` → `#mock-s1/s2/s3` (karty usług, zielone gdy wpisane)

---

## Pending

- [ ] Test pełnego flow generowania end-to-end (saldo Anthropic API)
- [ ] Stripe checkout live mode end-to-end
- [ ] Supabase Auth — prawdziwe hasła w DB (teraz localStorage only)
- [ ] Subdomena `*.webgen.pl` — deployment generowanych stron klientów
- [ ] Google Business Profile integracja
- [ ] Rotacja kluczy API (ANTHROPIC_API_KEY, RESEND, STRIPE, PEXELS)
- [ ] validateStep() — walidacja pól wymaganych przed przejściem
- [ ] Skrypt fix_nav_auth.py w Downloads — fix wgNavAuth

---

## Prompt startowy dla nowego chatu

```
Pracujemy nad webgen.pl. Przeczytaj context.md:
/Users/artursapoznikow/webgen-coming-soon/context.md

Następnie CLAUDE.md:
/Users/artursapoznikow/webgen-coming-soon/CLAUDE.md

Narzędzia (tylko te): Desktop Commander:read_multiple_files →
write_file ~/Downloads/ → osascript python3+git →
Vercel:list_deployments → get_deployment_build_logs jeśli ERROR.

Zakaz template literals w api/*.js. Zakaz </body> jako anchor.
Na końcu sesji: tell application "Terminal" to close every window

Dzisiaj: [OPISZ ZADANIE]
```
'''
    with open(OUT, 'a') as f:
        f.write(static)
