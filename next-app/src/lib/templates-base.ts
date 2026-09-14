// Baza URL dla plików szablonów (manifest.json, palettes.json, pilot/*.html) — te
// pliki fizycznie żyją w templates/ w KORZENIU repo (poza next-app/), serwowane
// dziś przez statyczny serwis pod webgen.pl, nie przez ten projekt Next.js (patrz
// decyzja architektoniczna w src/app/api/personalize/route.ts). Bez tej stałej
// względne fetch('/templates/...') z klienta 404-owałyby na każdym wdrożeniu
// next-app (izolowany projekt Vercel, inna domena niż webgen.pl) — złapane przy
// weryfikacji Fazy 4 (generator), gdy podgląd palety/szablonu nie ładował się
// wcale mimo poprawnego kodu.
//
// NEXT_PUBLIC_ prefiks bo to wartość używana też po stronie klienta (przeglądarka);
// sama wartość nie jest sekretem — to publiczny adres CDN treści szablonów.
//
// Musi być "www." — webgen.pl (bez www) robi 307 na www.webgen.pl, a ta odpowiedź
// przekierowania NIE ma nagłówka Access-Control-Allow-Origin (tylko finalny cel go
// ma). Przeglądarka sprawdza CORS na KAŻDYM skoku przekierowania, więc fetch() z
// klienta na "https://webgen.pl/..." kończy się "Failed to fetch" mimo że cel
// końcowy jest poprawnie skonfigurowany pod CORS — złapane przy weryfikacji Fazy 4.
export const TEMPLATES_BASE = process.env.NEXT_PUBLIC_TEMPLATES_BASE_URL || "https://www.webgen.pl";
