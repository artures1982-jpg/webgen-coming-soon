// Port 1:1 z api/pexels.js — proxy wyszukiwania zdjęć Pexels.
import { corsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req, "GET, OPTIONS");
}

export async function GET(req: Request) {
  const headers = corsHeaders(req, "GET, OPTIONS");
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "professional service";
  const per_page = Math.min(parseInt(searchParams.get("per_page") || "36", 10) || 36, 40);

  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  if (!PEXELS_KEY) {
    return Response.json({ error: "PEXELS_API_KEY not configured" }, { status: 500, headers });
  }

  try {
    const url = "https://api.pexels.com/v1/search?query=" + encodeURIComponent(q) + "&per_page=" + per_page;
    const response = await fetch(url, { headers: { Authorization: PEXELS_KEY } });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: "Pexels " + response.status, details: errText },
        { status: response.status, headers }
      );
    }

    const data = await response.json();
    const photos = (data.photos || []).map(
      (p: { id: number; alt?: string; src: unknown; photographer: string }) => ({
        id: p.id,
        alt: p.alt || "",
        src: p.src,
        photographer: p.photographer,
      })
    );

    return Response.json({ total_results: data.total_results || 0, photos }, { headers });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
