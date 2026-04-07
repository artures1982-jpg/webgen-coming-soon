# Prompt startowy — webgen.pl dev session

> Wklej na początku każdej nowej rozmowy z Claude

---

## Wklej to:

```
Pracujemy nad projektem webgen.pl — SaaS generator stron firmowych.

PROJEKT:
- Repo lokalne: /Users/artursapoznikow/webgen-coming-soon/
- GitHub: artures1982-jpg/webgen-coming-soon (branch: main)
- Vercel project: prj_NCSHiopDiHYgUCEjGGuedrj62U8H
- Vercel team: team_9GrxtXBkSmlXnZNk3zGsngHW
- Stack: Edge Runtime, claude-sonnet-4-6, Resend, Stripe, Pexels

NARZĘDZIA — używaj TYLKO tych, w tej kolejności:

1. Desktop Commander:read_multiple_files
   → zawsze najpierw przeczytaj plik który edytujesz

2. Desktop Commander:write_file
   → pisz skrypty Python do ~/Downloads/ (max 25-30 linii na chunk)
   → NIE edytuj plików projektu bezpośrednio przez write_file
   → edycja = skrypt Python z str.replace() na pliku projektu

3. Control your Mac:osascript
   → uruchamiaj skrypty: do shell script "python3 ~/Downloads/skrypt.py 2>&1"
   → git: do shell script "cd /Users/artursapoznikow/webgen-coming-soon && git add -A && git commit -m '...' && git push origin main 2>&1"
   → na końcu sesji: tell application "Terminal" to close every window

4. Vercel:list_deployments (projectId + teamId jak wyżej)
   → po każdym push sprawdź czy state: READY

5. Vercel:get_deployment_build_logs
   → tylko gdy state: ERROR, szukaj linii "ERROR:"

NIE UŻYWAJ w tym projekcie:
- Claude in Chrome, Control Chrome (nie przeglądarka)
- Cloudflare Developer Platform (hosting na Vercel)
- Canva, Gmail, Google Calendar, Zapier

KRYTYCZNE ZASADY KODU:
- api/*.js: ZAKAZ template literals → zawsze konkatenacja stringów
  ŹLE:  `Bearer ${KEY}`  `Twoja strona ${nazwa}`
  OK:   'Bearer ' + KEY  'Twoja strona ' + nazwa
- generator/index.html: patche JS wstrzykuj WEWNĄTRZ głównego <script> bloku
- Python patche: NIE używaj </body> jako anchora (może być w JS stringu)

Pełny kontekst w pliku: /Users/artursapoznikow/webgen-coming-soon/CLAUDE.md

Co robimy dzisiaj: [OPISZ ZADANIE]
```

---

## Skrót — tylko gdy kontynuujesz poprzednią sesję

```
Kontynuujemy webgen.pl. Projekt: /Users/artursaropropnikow/webgen-coming-soon/
Narzędzia: Desktop Commander (read/write) → osascript (python3 + git) → Vercel (deploy check).
Zakaz template literals w api/*.js. Zakaz </body> jako anchor w patchach.
CLAUDE.md: /Users/artursapoznikow/webgen-coming-soon/CLAUDE.md

Dzisiaj: [OPISZ ZADANIE]
```
