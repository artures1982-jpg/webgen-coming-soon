import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google tag (gtag.js) — usługa GA4 "Webgen" utworzona 2026-09-15, identyfikator
// pomiaru G-N2TJE2MCE2. strategy="afterInteractive" (zalecane przez Next.js dla
// analytics — ładuje się po hydracji, nie blokuje LCP/TTI jak plain <script> w
// <head>). Ten sam tag co na statycznych stronach (index.html itd.).
const GA_MEASUREMENT_ID = "G-N2TJE2MCE2";

// next/font: fonty samohostowane przez Next (zero requestu do fonts.googleapis.com,
// zero CLS) zamiast <link href="https://fonts.googleapis.com/..."> jak dziś na
// statycznych stronach — patrz docs/plan-migracji-nextjs.md, sekcja 3, wiersz 5
// (ten sam argument co next/image dla zdjęć Pexels).
const bricolage = Bricolage_Grotesque({
  variable: "--font-head",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "webgen.pl",
};

// Nav (pełna nawigacja marketingowa) przeniesiony do (marketing)/layout.tsx — strony
// auth (login/rejestracja) w oryginale mają celowo minimalny, rozpraszający-mniej
// top-bar (samo logo, bez linków/hamburgera), patrz (auth)/layout.tsx. ClerkProvider
// zostaje tutaj, bo obie grupy tras go potrzebują.
// Klucz PUBLICZNY Clerk (bezpieczny do embedowania w kliencie — to nie sekret) jest
// wpisany wprost jako fallback, tym samym wzorcem co dziś w shared/clerk.js na
// statycznej stronie. Ten projekt Vercel nie ma jeszcze ustawionej zmiennej
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (brak narzędzia do zarządzania env vars w tej
// sesji) — bez fallbacku build/runtime na Vercelu nie miałby żadnego klucza.
const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_live_Y2xlcmsud2ViZ2VuLnBsJA";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <html lang="pl" className={`${bricolage.variable} ${jetbrainsMono.variable}`}>
        <body>
          {children}
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}
