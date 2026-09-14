// Logika podstawiania tokenów {{...}} i nakładania palety kolorów na zamrożony
// szablon HTML. Do Fazy 4 istniała w DWÓCH ręcznie synchronizowanych kopiach
// (generator/index.html i api/personalize/route.ts, każda z komentarzem "musi być
// zgodna z drugą") — ten moduł jest izomorficzny (fetch + string ops, zero API
// specyficznych dla przeglądarki/Node) i zastępuje obie kopie jednym źródłem prawdy,
// importowanym przez generator (klient) i /api/personalize (serwer).

export type ManifestEntry = {
  id: string;
  industry: string;
  label: string;
  title: string;
  tagline: string;
  tier: "free" | "pro" | "promax";
  thumb: string;
};

export type Palette = {
  id: string;
  name: string;
  dark?: boolean;
  accent: string;
  accentDark: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
};

export type PalettesByIndustry = Record<string, Palette[]>;

export type Firma = {
  nazwa_strony?: string;
  nazwa?: string;
  branza?: string;
  miasto?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  godz_pon_pt?: string;
  godz_sob?: string;
  paletteId?: string | null;
};

export function slugifyName(name: string | undefined | null): string {
  return (
    (name || "firma")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim()
      .slice(0, 30) || "firma"
  );
}

// Podstawia tokeny {{...}} zamrożonego szablonu prawdziwymi danymi klienta — bez AI,
// dla darmowej ścieżki (i jako baza pod nakładkę AI w wyższych planach). Lista
// tokenów musi być zgodna z buildTokenFirma() w scripts/generate-templates.js.
export function fillTemplate(html: string, firma: Firma): string {
  const map: Record<string, string> = {
    "{{NAZWA_STRONY}}": firma.nazwa_strony || firma.nazwa || firma.branza || "Firma",
    "{{MIASTO}}": firma.miasto || "",
    "{{TELEFON}}": firma.telefon || "",
    "{{EMAIL}}": firma.email || "",
    "{{ADRES}}": firma.adres || "",
    "{{GODZINY_PON_PT}}": firma.godz_pon_pt || "8:00–18:00",
    "{{GODZINY_SOB}}": firma.godz_sob || "9:00–14:00",
    "{{SLUG}}": slugifyName(firma.nazwa_strony || firma.nazwa),
  };
  let result = html;
  Object.keys(map).forEach((token) => {
    result = result.split(token).join(map[token]);
  });
  return result;
}

// Wstrzykuje <style> z nadpisaniem :root tuż przed </head> — późniejsza reguła
// wygrywa w kaskadzie, więc nie trzeba parsować/edytować oryginalnego bloku :root
// szablonu. Brak paletteId = szablon zostaje przy swoich domyślnych kolorach.
export function applyPalette(html: string, paletteId: string | null | undefined, palettesFlat: Palette[]): string {
  if (!paletteId) return html;
  const p = palettesFlat.find((x) => x.id === paletteId);
  if (!p) return html;
  const css =
    "<style>:root{--accent:" +
    p.accent +
    ";--accent-dark:" +
    p.accentDark +
    ";--bg:" +
    p.bg +
    ";--surface:" +
    p.surface +
    ";--text:" +
    p.text +
    ";--muted:" +
    p.muted +
    "}</style>";
  if (html.indexOf("</head>") !== -1) return html.replace("</head>", css + "</head>");
  return css + html;
}

export function flattenPalettes(byIndustry: PalettesByIndustry): Palette[] {
  return Object.values(byIndustry).flat();
}
