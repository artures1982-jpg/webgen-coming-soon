import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="pl" className={`${bricolage.variable} ${jetbrainsMono.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
