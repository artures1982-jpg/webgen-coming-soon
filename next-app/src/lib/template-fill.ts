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
  opis?: string;
  lata?: string;
  realizacje?: string;
  uslugi_lista?: string[];
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  booksy?: string;
  maps?: string;
  google_ocena?: string;
  google_opinie?: string;
  hero_base64?: string;
  heroUrl?: string;
};

// Klucze bloków warunkowych <!--IF:KLUCZ-->...<!--ENDIF--> — blok znika całkowicie
// (razem ze znacznikami), gdy odpowiadające pole firma jest puste, więc martwy
// link social nigdy nie trafia do wygenerowanego HTML (bez potrzeby JS-a chowającego
// go przez CSS). Wywoływane PRZED zwykłym podstawianiem tokenów — {{TOKENY}} wewnątrz
// zachowanego bloku podstawiają się w normalnym przebiegu fillTemplate() niżej.
// Wartość może być jednym polem, albo listą pól gdzie WYSTARCZY, że którekolwiek
// jest niepuste (np. HERO_IMG: klient mógł wybrać zdjęcie przez wgranie pliku
// [hero_base64] albo przez Pexels [heroUrl] — oba trafiają do tego samego bloku).
const CONDITIONAL_FIELDS: Record<string, keyof Firma | (keyof Firma)[]> = {
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  WHATSAPP: "whatsapp",
  BOOKSY: "booksy",
  MAPS: "maps",
  GOOGLE_OCENA: "google_ocena",
  HERO_IMG: ["hero_base64", "heroUrl"],
};

function stripConditionals(html: string, firma: Firma): string {
  let result = html;
  Object.keys(CONDITIONAL_FIELDS).forEach((key) => {
    const fields = CONDITIONAL_FIELDS[key];
    const keys = Array.isArray(fields) ? fields : [fields];
    const filled = keys.some((k) => !!firma[k]);
    const re = new RegExp("<!--IF:" + key + "-->([\\s\\S]*?)<!--ENDIF-->", "g");
    result = result.replace(re, filled ? "$1" : "");
  });
  return result;
}

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
    "{{OPIS}}": firma.opis || "",
    "{{FACEBOOK}}": firma.facebook || "",
    "{{INSTAGRAM}}": firma.instagram || "",
    "{{TIKTOK}}": firma.tiktok || "",
    "{{MAPS}}": firma.maps || "",
    "{{BOOKSY}}": firma.booksy || "",
    "{{GOOGLE_OCENA}}": firma.google_ocena || "",
    "{{GOOGLE_OPINIE}}": firma.google_opinie || "",
    // liczba opinii jest opcjonalna NAWET gdy ocena jest podana — osobny warunkowy
    // blok tylko dla niej byłby zagnieżdżony wewnątrz <!--IF:GOOGLE_OCENA-->, a
    // stripConditionals() nie obsługuje zagnieżdżania różnych kluczy; prościej
    // policzyć gotowy sufiks tu, niż komplikować mechanizm dla jednego przypadku.
    "{{GOOGLE_OPINIE_SUFFIX}}": firma.google_opinie ? " (" + firma.google_opinie + " opinii)" : "",
    // wa.me wymaga pełnego numeru z kierunkowym — pole zbiera numer "bez +48"
    // (patrz placeholder w SocialStep.tsx), więc doklejamy prefiks tu.
    "{{WHATSAPP_WA_LINK}}": firma.whatsapp ? "https://wa.me/48" + firma.whatsapp.replace(/\D/g, "") : "",
    // base64 (wgrane z dysku LUB wygenerowane przez AI dla Pro Max) ma pierwszeństwo
    // przed URL-em z Pexels — zgodne z tym, co HeroUpload.tsx sam robi wewnętrznie
    // przy wgraniu pliku (czyści heroUrl), więc to nie nowa reguła, tylko ta sama
    // preferencja zastosowana też tutaj.
    "{{HERO_IMG}}": firma.hero_base64 || firma.heroUrl || "",
  };
  let result = stripConditionals(html, firma);
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
