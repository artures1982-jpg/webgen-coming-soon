import { NextResponse } from "next/server";

const BLOB_BASE = process.env.BLOB_BASE_URL;

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

export default async function middleware(req) {
  const hostname = req.headers.get("host") || "";
  const isMainDomain =
    hostname === "webgen.pl" ||
    hostname === "www.webgen.pl" ||
    hostname.includes("vercel.app") ||
    hostname.includes("localhost");

  if (isMainDomain) {
    return NextResponse.next();
  }

  const slug = hostname.replace(".webgen.pl", "");
  if (!slug) return NextResponse.next();

  const blobUrl = `${BLOB_BASE}/sites/${slug}/index.html`;

  try {
    const blobRes = await fetch(blobUrl);

    if (!blobRes.ok) {
      return new NextResponse(notFoundHTML(slug), {
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
      },
    });
  } catch (err) {
    console.error("[middleware] Error:", err.message);
    return NextResponse.next();
  }
}

function notFoundHTML(slug) {
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
a{background:#00E5A0;color:#080A0F;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700}
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
