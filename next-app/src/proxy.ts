// Port 1:1 z middleware.js + Faza 3: dołożony clerkMiddleware. Kolejność w handlerze
// jest świadoma: routing subdomen (*.webgen.pl → HTML klienta z Vercel Blob) NIE ma
// nic wspólnego z Clerk i musi się wykonać PRZED jakąkolwiek logiką auth — to cudza
// treść (strona klienta), nie trasa tej aplikacji do ochrony.
//
// Next.js 16 zmienił konwencję middleware.ts → proxy.ts — middleware.ts jest
// przestarzałe, patrz node_modules/next/dist/docs/.../proxy.md.
//
// CLERK_SECRET_KEY nie jest jeszcze ustawiony w tym projekcie (testy odłożone). WAŻNE:
// clerkMiddleware() rzuca twardy błąd na KAŻDYM requeście bez sekretnego klucza — nie
// tylko na trasach chronionych. Ten matcher to "/(.*)"  (cała aplikacja), więc bez
// poniższego warunku brak klucza wywalałby też już działające strony z Fazy 0-2
// (cennik, regulamin, wszystkie API routes) w 500, nie tylko auth. Dopóki klucza nie
// ma, eksportowana jest goła wersja (tylko routing subdomen, bez Clerk w ogóle) —
// dokładnie zachowanie sprzed Fazy 3. Migracja się aktywuje sama, bez zmiany kodu,
// w momencie gdy CLERK_SECRET_KEY zostanie dodany do środowiska.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: "/(.*)",
};

// Faza 4 doda realne strony /dashboard i /admin — matcher już czeka na nie tutaj,
// żeby ochrona tras była gotowa w momencie gdy strony powstaną, bez zapominania o niej.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

async function handleSubdomainRouting(request: NextRequest): Promise<NextResponse | null> {
  const hostname = request.headers.get("host") || "";

  if (
    hostname === "webgen.pl" ||
    hostname === "www.webgen.pl" ||
    hostname.includes("vercel.app") ||
    hostname.includes("localhost")
  ) {
    return null;
  }

  const slug = hostname.replace(".webgen.pl", "");
  if (!slug || slug === hostname) return null;

  const BLOB_BASE = process.env.BLOB_BASE_URL;
  if (!BLOB_BASE) return null;

  const blobUrl = BLOB_BASE + "/sites/" + slug + "/index.html";

  try {
    const blobRes = await fetch(blobUrl);

    if (!blobRes.ok) {
      return new NextResponse(notFoundHTML(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = await blobRes.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Webgen-Slug": slug,
      },
    });
  } catch {
    return null;
  }
}

const withClerk = clerkMiddleware(async (auth, req) => {
  const subdomainResponse = await handleSubdomainRouting(req);
  if (subdomainResponse) return subdomainResponse;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

const withoutClerk = async (req: NextRequest) => {
  const subdomainResponse = await handleSubdomainRouting(req);
  return subdomainResponse ?? NextResponse.next();
};

export default process.env.CLERK_SECRET_KEY ? withClerk : withoutClerk;

function notFoundHTML() {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Strona w przygotowaniu — webgen.pl</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#080A0F;color:#F0F2F7;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}
.wrap{max-width:480px}
.logo{font-size:28px;font-weight:800;margin-bottom:24px}
.logo span{color:#00E5A0}
h1{font-size:24px;font-weight:700;margin-bottom:12px}
p{color:#8892AA;line-height:1.65;margin-bottom:28px}
a{display:inline-block;background:#00E5A0;color:#080A0F;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">web<span>gen</span></div>
  <h1>Strona w przygotowaniu</h1>
  <p>Ta strona jest właśnie konfigurowana.<br>Wróć za chwilę lub przejdź do webgen.pl</p>
  <a href="https://webgen.pl">Przejdź do webgen.pl</a>
</div>
</body>
</html>`;
}
