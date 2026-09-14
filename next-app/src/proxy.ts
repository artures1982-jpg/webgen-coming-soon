// Port 1:1 z middleware.js (był gołym Edge Middleware Vercela, nie Next.js) — routing
// subdomen *.webgen.pl → HTML z Vercel Blob. Model API niemal identyczny: NextResponse
// zamiast gołego Response, ale logika bez zmian.
//
// Next.js 16 zmienił konwencję middleware.ts → proxy.ts (funkcja proxy zamiast
// middleware) — middleware.ts jest teraz przestarzałe, patrz
// node_modules/next/dist/docs/.../proxy.md. Domyślny runtime to teraz Node.js
// (wcześniej tylko Edge), więc nie trzeba już nic ustawiać ręcznie.
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: "/(.*)",
};

export default async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Przepuść główną domenę, vercel.app i localhost normalnie.
  if (
    hostname === "webgen.pl" ||
    hostname === "www.webgen.pl" ||
    hostname.includes("vercel.app") ||
    hostname.includes("localhost")
  ) {
    return NextResponse.next();
  }

  const slug = hostname.replace(".webgen.pl", "");
  if (!slug || slug === hostname) return NextResponse.next();

  const BLOB_BASE = process.env.BLOB_BASE_URL;
  if (!BLOB_BASE) return NextResponse.next();

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
    return NextResponse.next();
  }
}

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
