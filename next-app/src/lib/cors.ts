// src/lib/cors.ts — wspólny wzorzec CORS powtórzony dziś ręcznie w każdym z 12
// plików api/*.js (allowlist + te same 3 nagłówki). Jeden helper zamiast
// kopiowania — ta sama lekcja co przy <Nav> w Fazie 0/1.
const ALLOWED_ORIGINS = ["https://webgen.pl", "https://www.webgen.pl"];

export function corsHeaders(req: Request, methods = "POST, OPTIONS"): HeadersInit {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function optionsResponse(req: Request, methods = "POST, OPTIONS") {
  return new Response(null, { status: 204, headers: corsHeaders(req, methods) });
}
