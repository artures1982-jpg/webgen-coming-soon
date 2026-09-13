import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${bricolage.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
