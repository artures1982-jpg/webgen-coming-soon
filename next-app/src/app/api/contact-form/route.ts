// Port 1:1 z api/contact-form.js — odbiera zgłoszenia z formularzy na WDROŻONYCH
// stronach klientów (slug.webgen.pl). Adres docelowy NIGDY nie jest brany z ciała
// requestu (otwarty przekaźnik spamu) — czytany z meta tagu wstrzykniętego przez
// /api/deploy do HTML zapisanego w Vercel Blob.
const BLOB_BASE = process.env.BLOB_BASE_URL;
const RESEND_KEY = process.env.RESEND_API_KEY;

const MAX_FIELDS = 20;
const MAX_FIELD_LEN = 4000;
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

  const slug = String(body.slug || "").trim();
  const fields = body.fields;

  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return Response.json({ error: "Brak lub nieprawidłowy slug" }, { status: 400, headers });
  }
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return Response.json({ error: "Brak pól formularza" }, { status: 400, headers });
  }

  const keys = Object.keys(fields).slice(0, MAX_FIELDS);
  if (keys.length === 0) {
    return Response.json({ error: "Pusty formularz" }, { status: 400, headers });
  }

  if (!BLOB_BASE) {
    return Response.json({ error: "Serwer nie jest skonfigurowany (brak BLOB_BASE_URL)" }, { status: 500, headers });
  }

  let siteHtml: string;
  try {
    const siteRes = await fetch(BLOB_BASE + "/sites/" + slug + "/index.html");
    if (!siteRes.ok) {
      return Response.json({ error: "Nie znaleziono strony o podanym slugu" }, { status: 404, headers });
    }
    siteHtml = await siteRes.text();
  } catch {
    return Response.json({ error: "Nie udało się odczytać strony" }, { status: 502, headers });
  }

  const m = siteHtml.match(/<meta\s+name="webgen-contact-email"\s+content="([^"]*)"/i);
  const toEmail = m ? m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&") : "";

  if (!toEmail || !EMAIL_RE.test(toEmail)) {
    return Response.json(
      { error: "Ta strona nie ma jeszcze skonfigurowanego adresu do formularza — zadzwoń zamiast tego.", code: "NO_CONTACT_EMAIL" },
      { status: 422, headers }
    );
  }

  if (!RESEND_KEY) {
    return Response.json({ error: "Wysyłka wiadomości jest chwilowo niedostępna" }, { status: 500, headers });
  }

  let rows = "";
  let replyTo: string | null = null;
  keys.forEach((k) => {
    const raw = String(fields[k] == null ? "" : fields[k]).slice(0, MAX_FIELD_LEN);
    if (!replyTo && /email/i.test(k) && EMAIL_RE.test(raw.trim())) replyTo = raw.trim();
    rows +=
      '<tr><td style="padding:6px 12px 6px 0;color:#8892AA;font-size:13px;white-space:nowrap;vertical-align:top">' +
      escapeHtml(k) +
      '</td><td style="padding:6px 0;color:#1a1a1a;font-size:14px;white-space:pre-wrap">' +
      escapeHtml(raw) +
      "</td></tr>";
  });

  const htmlBody =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">' +
    '<h2 style="font-size:18px;margin:0 0 4px">Nowa wiadomość ze strony</h2>' +
    '<p style="color:#8892AA;font-size:13px;margin:0 0 20px">' + escapeHtml(slug) + '.webgen.pl</p>' +
    '<table style="border-collapse:collapse;width:100%">' + rows + "</table>" +
    '<p style="margin:24px 0 0;font-size:12px;color:#aaa">Wysłane przez formularz kontaktowy na Twojej stronie webgen.pl.' +
    (replyTo ? " Odpowiedz na tego maila, żeby napisać bezpośrednio do nadawcy." : "") +
    "</p></body></html>";

  const payload: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    reply_to?: string;
  } = {
    from: "Formularz na Twojej stronie <hello@webgen.pl>",
    to: [toEmail],
    subject: "Nowa wiadomość ze strony " + slug,
    html: htmlBody,
  };
  if (replyTo) payload.reply_to = replyTo;

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
