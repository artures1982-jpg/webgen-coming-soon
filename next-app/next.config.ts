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
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com https://clerk.webgen.pl https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://api.anthropic.com https://resend.com https://api.pexels.com https://clerk.webgen.pl https://www.webgen.pl; img-src 'self' data: https:; worker-src 'self' blob:; object-src 'none'; base-uri 'self';",
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
