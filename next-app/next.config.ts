import type { NextConfig } from "next";
import path from "path";

// Odtworzenie 1:1 ustawień z korzenia repo (vercel.json) — patrz
// docs/plan-migracji-nextjs.md, Faza 0, punkt 2. `cleanUrls`/`trailingSlash`
// z vercel.json nie mają tu odpowiednika do ustawienia: Next.js App Router
// domyślnie routuje bez rozszerzeń plików i bez końcowego slasha — to już jest
// zachowanie "cleanUrls:true, trailingSlash:false" bez żadnej konfiguracji.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            // connect-src rozszerzony o https://www.webgen.pl względem 1:1 kopii z
            // korzenia repo — na statycznej stronie fetch('/templates/...') jest
            // same-origin ('self' wystarcza), ale generator w next-app pobiera te
            // pliki cross-origin z produkcji (patrz src/lib/templates-base.ts).
            // Bez tego wpisu przeglądarka cicho blokuje fetch (CSP), obserwowane
            // jako "Failed to fetch" bez czytelnego komunikatu — złapane przy
            // weryfikacji Fazy 4.
            // https://*.clerk.accounts.dev — Frontend API domena KAŻDEJ instancji
            // Development Clerka (nie tylko naszej) — bez tego przeglądarka blokuje
            // sam skrypt Clerka na testowym kluczu (ClerkRuntimeError
            // failed_to_load_clerk_js), złapane przy testach end-to-end na kluczu
            // pk_test_ z instancji dev webgen.
            // frame-src — bez tego niewidoczny Cloudflare Turnstile (bot-check przy
            // rejestracji Clerka) renderuje się w iframe, które CSP cicho blokuje
            // (brak frame-src = domyślnie default-src 'self'), więc formularz wisi
            // w nieskończoność bez żadnego błędu JS — złapane przy testach e2e.
            // https://www.googletagmanager.com (script) + google-analytics.com/
            // analytics.google.com (connect) — gtag.js, patrz src/app/layout.tsx.
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com https://clerk.webgen.pl https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://api.anthropic.com https://resend.com https://api.pexels.com https://clerk.webgen.pl https://*.clerk.accounts.dev https://www.webgen.pl https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com; img-src 'self' data: https:; frame-src https://challenges.cloudflare.com https://clerk.webgen.pl https://*.clerk.accounts.dev https://js.stripe.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/prywatnosc",
        destination: "/polityka-prywatnosci",
        permanent: true,
      },
      {
        source: "/start",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
