// Port 1:1 z ADMIN_ALLOWED_EMAILS w admin/index.html — allowlist e-maila zamiast
// hardcoded hasła (patrz CLAUDE.md). Wydzielone do wspólnego modułu, bo teraz
// używane w DWÓCH miejscach: AdminShell.tsx (bramka po stronie klienta — UX) i
// src/app/api/admin/stripe-summary/route.ts (prawdziwa autoryzacja po stronie
// serwera — bez tego dowolny zalogowany klient mógłby wywołać ten endpoint i
// zobaczyć zbiorcze MRR całego biznesu).
export const ADMIN_ALLOWED_EMAILS = ["artures1982@icloud.com"];
