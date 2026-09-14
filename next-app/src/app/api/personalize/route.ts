// Port 1:1 z api/personalize.js — mechaniczne wypełnienie wybranego szablonu + paleta,
// pod bramką isProEmail. Zero AI w runtime (patrz historia tego pliku w statycznym repo).
//
// DECYZJA ARCHITEKTONICZNA (do potwierdzenia): templates/manifest.json, templates/pilot/*.html
// i templates/palettes.json fizycznie żyją w korzeniu repo, POZA next-app/ — plan migracji
// (sekcja 2) mówi, że te pliki nie stają się komponentami React, ale nie rozstrzyga gdzie mają
// fizycznie leżeć dla Next.js. Ten port ROZWIĄZUJE to na razie przez fetch() z produkcji
// (https://webgen.pl/templates/...) zamiast czytania lokalnego fs — dokładnie to, co dziś robi
// klient w przeglądarce, tylko przeniesione na serwer. Zaleta: zero duplikacji plików, zero
// ryzyka rozjazdu dwóch kopii. Wada: ten endpoint w next-app zależy od tego, że produkcja
// (główny statyczny serwis) jest dostępna. Do zmiany na lokalny odczyt dopiero przy realnym
// cutover, gdy pliki szablonów fizycznie przeniosą się do next-app/ (albo współdzielonego
// katalogu w monorepo).
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProEmail } from "@/lib/entitlement";

const TEMPLATES_BASE = process.env.TEMPLATES_BASE_URL || "https://webgen.pl";

type ManifestEntry = { id: string; industry: string; tier: string };
type Palette = {
  id: string;
  accent: string;
  accentDark: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
};
type Firma = {
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

function slugify(name: string) {
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

// Bliźniak fillTemplate() z generator/index.html — lista tokenów musi zostać
// zsynchronizowana ręcznie przy zmianie.
function fillTemplate(html: string, firma: Firma) {
  const map: Record<string, string> = {
    "{{NAZWA_STRONY}}": firma.nazwa_strony || firma.nazwa || firma.branza || "Firma",
    "{{MIASTO}}": firma.miasto || "",
    "{{TELEFON}}": firma.telefon || "",
    "{{EMAIL}}": firma.email || "",
    "{{ADRES}}": firma.adres || "",
    "{{GODZINY_PON_PT}}": firma.godz_pon_pt || "8:00–18:00",
    "{{GODZINY_SOB}}": firma.godz_sob || "9:00–14:00",
    "{{SLUG}}": slugify(firma.nazwa_strony || firma.nazwa || ""),
  };
  let result = html;
  Object.keys(map).forEach((token) => {
    result = result.split(token).join(map[token]);
  });
  return result;
}

// Bliźniak applyPalette() z generator/index.html.
function applyPalette(html: string, paletteId: string | null | undefined, palettesByIndustry: Record<string, Palette[]>) {
  if (!paletteId) return html;
  const all = Object.values(palettesByIndustry).flat();
  const p = all.find((x) => x.id === paletteId);
  if (!p) return html;
  const css =
    "<style>:root{--accent:" + p.accent + ";--accent-dark:" + p.accentDark +
    ";--bg:" + p.bg + ";--surface:" + p.surface + ";--text:" + p.text +
    ";--muted:" + p.muted + "}</style>";
  if (html.indexOf("</head>") !== -1) return html.replace("</head>", css + "</head>");
  return css + html;
}

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  const email = authSession.email;

  const body = await req.json().catch(() => ({}));
  const templateId: string | undefined = body.templateId;
  const firma: Firma | undefined = body.firma;

  if (!templateId || !firma) {
    return Response.json({ error: "Brak templateId lub firma" }, { status: 400, headers });
  }

  const isPro = await isProEmail(email);
  if (!isPro) {
    return Response.json(
      { error: "Personalizacja AI wymaga aktywnego planu Pro", code: "PRO_REQUIRED" },
      { status: 402, headers }
    );
  }

  let manifest: ManifestEntry[] = [];
  try {
    const manifestRes = await fetch(TEMPLATES_BASE + "/templates/manifest.json");
    manifest = manifestRes.ok ? await manifestRes.json() : [];
  } catch {
    manifest = [];
  }
  const tpl = manifest.find((t) => t.id === templateId);
  if (!tpl) {
    return Response.json({ error: "Nie znaleziono szablonu: " + templateId }, { status: 404, headers });
  }

  let rawHtml: string;
  try {
    const tplRes = await fetch(TEMPLATES_BASE + "/templates/pilot/" + tpl.id + ".html");
    if (!tplRes.ok) throw new Error("status " + tplRes.status);
    rawHtml = await tplRes.text();
  } catch {
    return Response.json({ error: "Nie udało się wczytać pliku szablonu" }, { status: 500, headers });
  }

  let palettesByIndustry: Record<string, Palette[]> = {};
  try {
    const palettesRes = await fetch(TEMPLATES_BASE + "/templates/palettes.json");
    palettesByIndustry = palettesRes.ok ? await palettesRes.json() : {};
  } catch {
    palettesByIndustry = {};
  }

  const html = applyPalette(fillTemplate(rawHtml, firma), firma.paletteId, palettesByIndustry);

  return Response.json(
    {
      success: true,
      html,
      slug: slugify(firma.nazwa_strony || firma.nazwa || ""),
      templateId,
      chars: html.length,
    },
    { headers }
  );
}
