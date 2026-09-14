// Port 1:1 z api/contact.js — formularz leadowy na stronie głównej webgen.pl.
const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?webgen\.pl$/i;

function corsHeaders(origin: string | null) {
  const allow = ORIGIN_RE.test(origin || "") ? origin! : "https://www.webgen.pl";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function escapeHtml(s: unknown) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Nieprawidłowy JSON" }, { status: 400, headers });
  }

  const email = String(body.email || "").trim();
  const source = String(body.source || "cta-home").slice(0, 100);
  const rodo = body.rodo === true;

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Podaj prawidłowy adres e-mail" }, { status: 400, headers });
  }
  if (!rodo) {
    return Response.json({ error: "Wymagana zgoda RODO" }, { status: 400, headers });
  }

  if (!RESEND_KEY) {
    return Response.json({ error: "Wysyłka wiadomości jest chwilowo niedostępna" }, { status: 500, headers });
  }

  const htmlBody =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">' +
    '<h2 style="font-size:18px;margin:0 0 4px">Nowy lead ze strony głównej</h2>' +
    '<p style="color:#8892AA;font-size:13px;margin:0 0 20px">webgen.pl · ' + escapeHtml(source) + "</p>" +
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td style="padding:6px 12px 6px 0;color:#8892AA;font-size:13px;white-space:nowrap;vertical-align:top">Email</td>' +
    '<td style="padding:6px 0;color:#1a1a1a;font-size:14px">' + escapeHtml(email) + "</td></tr>" +
    "</table>" +
    '<p style="margin:24px 0 0;font-size:12px;color:#aaa">Odpowiedz na tego maila, żeby napisać bezpośrednio do leada.</p>' +
    "</body></html>";

  const payload = {
    from: "Lead ze strony głównej <hello@webgen.pl>",
    to: ["hello@webgen.pl"],
    subject: "Nowy lead ze strony głównej — " + email,
    html: htmlBody,
    reply_to: email,
  };

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const errText = await r.text();
      return Response.json({ error: "Resend error: " + errText.slice(0, 200) }, { status: 502, headers });
    }
    return Response.json({ ok: true }, { headers });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers });
  }
}
