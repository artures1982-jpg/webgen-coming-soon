import type { MetadataRoute } from "next";

// Next.js App Router: plik generuje /robots.txt automatycznie. Treść 1:1 z
// robots.txt w korzeniu statycznego repo (stan 14.09).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: "https://www.webgen.pl/sitemap.xml",
  };
}
