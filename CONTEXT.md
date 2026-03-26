# 🚀 WEBGEN — Kontekst projektu

## CZYM JEST WEBGEN
Generator stron internetowych AI dla polskich firm usługowych (hydraulicy, elektrycy, fryzjerzy, salony beauty).
Model: firma wpisuje branżę + miasto → strona gotowa w 3 minuty → hosting na subdomenie webgen.pl.
Pierwsze 3 miesiące gratis → potem Managed START 249 zł/mies.

---

## INFRASTRUKTURA

### Vercel
- Project ID: `prj_NCSHiopDiHYgUCEjGGuedrj62U8H`
- Team ID: `team_9GrxtXBkSmlXnZNk3zGsngHW`
- Token: `VCP_TOKEN_HIDDEN`
- Domeny: `webgen.pl` + `*.webgen.pl`

### GitHub
- Repo: `github.com/artures1982-jpg/webgen-coming-soon`
- Lokalnie: `/Users/artursapoznikow/webgen-coming-soon/`

### Email
- Resend API: `re_2jFtP178_GuufxmnkoYciZsxN4XmAEHAs`
- Od: `hello@webgen.pl` → forward → `artures1982@icloud.com`

---

## STRIPE (test mode)

| Produkt | prod ID | Cena |
|---|---|---|
| Managed START | prod_U9AXx7uKqsLdX8 | 249 zł/mies |
| Managed PRO | prod_U9AeyIfgJv43pC | 399 zł/mies |
| Managed PREMIUM | prod_U9AwJXJQWseNmg | 599 zł/mies |
| Add-on SEO Lokalne | prod_U9AxPEN7k6gjIo | 149 zł |
| Add-on PageSpeed | prod_U9Axolzmc5D72F | 99 zł |
| Add-on WCAG | prod_U9AxOkKW55l7W3 | 79 zł |
| Add-on Wielojęzyczność | prod_U9Ax9vEQ9VJxaP | 149 zł |
| Add-on Własna domena | prod_UC2TxztZR03sfT | 49 zł |
| Add-on GA4 | prod_UC2Th78f9KEZi2 | 69 zł |
| Add-on Więcej zdjęć | prod_UC2TCgfEmLxql1 | 49 zł |
| Add-on Priorytetowe wsparcie | prod_UC2U1wMAJI2mze | 99 zł/mies |

Plany SaaS — zarchiwizowane (usunięte z oferty).
Secret: `sk_test_51TATJz...`

---

## STRUKTURA test/

```
index.html                      Home
cennik/index.html               Cennik (add-ony zablokowane — "po zakupie planu")
generator/index.html            Generator AI (panel-0 email-gate, kroky 1-6)
dashboard/index.html            Panel klienta (live Stripe API + localStorage)
admin/index.html                Panel admina
login/index.html                Logowanie → dashboard
activate/index.html             Aktywacja konta + ustawienie hasła
polityka-prywatnosci/index.html
regulamin/index.html
```

## API

```
/api/register.js        rejestracja → email potwierdzający (Resend)
/api/activate.js        walidacja tokenu + hasło → session
/api/login.js           login → session token
/api/dashboard-data.js  Stripe: subskrypcja + faktury dla email
/api/contact.js         formularz CTA
/api/generate.js        Claude API → HTML strony
/api/create-checkout.js Stripe checkout
```

---

## AUTH FLOW

1. Generator krok 0 → email + RODO → `/api/register` → email z linkiem
2. Link → `/test/activate/?token=...` → formularz hasła → `/api/activate`
3. Sukces → `wg_session` + `wg_user` w localStorage → redirect `/test/generator/?activated=1`
4. Logowanie: `/test/login/` → `/api/login` → redirect `/test/dashboard/`
5. Dashboard: auth-check → brak sesji → redirect `/test/login/`

**localStorage**: `wg_session {email, session, activated}`, `wg_user {email, activated}`, `wg_firma {nazwa, branza, miasto...}`

---

## NAV AUTH STATE (wgNavAuth)

Każda strona test/ ma snippet JS który:
- Jeśli zalogowany: `body.wg-logged-in`, ukrywa `.wg-nav-login` i `.wg-nav-cta`, pokazuje `.wg-nav-user` (avatar + email → dashboard)

**BUG AKTUALNY + FIX GOTOWY:**
```bash
python3 /Users/artursapoznikow/Downloads/fix_nav_auth.py
cd /Users/artursapoznikow/webgen-coming-soon
git add test/
git commit -m "fix: wgNavAuth document.addEventListener"
git push origin main
```
Błąd: `document.documentElement.addEventListener` → powinno być `document.addEventListener`

---

## SECURITY
- vercel.json: CSP, HSTS, X-Frame, nosniff + WAF bot-block na /api/
- robots.txt: blokuje /admin/, /dashboard/, /api/
- sitemap.xml
- Email-gate w generatorze (panel-0)

---

## .ENV
```
RESEND_API_KEY=re_2jFtP178_GuufxmnkoYciZsxN4XmAEHAs
STRIPE_SECRET_KEY=sk_test_51TATJz...
TOKEN_SECRET=webgen2025
ANTHROPIC_API_KEY=(⏳ do dodania)
VERCEL_TOKEN=VCP_TOKEN_HIDDEN
VERCEL_PROJECT_ID=prj_NCSHiopDiHYgUCEjGGuedrj62U8H
VERCEL_TEAM_ID=team_9GrxtXBkSmlXnZNk3zGsngHW
```

---

## BRAND
- Kolory: bg `#080A0F`, green `#00E5A0`, blue `#0066FF`, purple `#7B4FFF`
- Fonty: Bricolage Grotesque, JetBrains Mono

## PENDING
- ✅ Fix nav auth (fix_nav_auth.py gotowy — DO URUCHOMIENIA)
- ⏳ ANTHROPIC_API_KEY → Vercel → aktywuj generator
- ⏳ Stripe checkout end-to-end test
- ⏳ M3: Supabase Auth (prawdziwe hasła w DB)
- ⏳ Google Business Profile
