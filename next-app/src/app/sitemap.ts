import type { MetadataRoute } from "next";

// Next.js App Router: plik generuje /sitemap.xml automatycznie. Treść 1:1 z
// sitemap.xml w korzeniu statycznego repo (stan 14.09) — obejmuje też /galeria/ i
// /generator/, które fizycznie jeszcze nie żyją w tej apce (migrują w późniejszych
// fazach) — sitemap opisuje docelową strukturę produkcji, nie stan tego branchu.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.webgen.pl/", changeFrequency: "weekly", priority: 1.0 },
    { url: "https://www.webgen.pl/cennik/", changeFrequency: "weekly", priority: 0.9 },
    { url: "https://www.webgen.pl/galeria/", changeFrequency: "weekly", priority: 0.8 },
    { url: "https://www.webgen.pl/generator/", changeFrequency: "monthly", priority: 0.7 },
    {
      url: "https://www.webgen.pl/polityka-prywatnosci/",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: "https://www.webgen.pl/regulamin/", changeFrequency: "yearly", priority: 0.3 },
  ];
}
