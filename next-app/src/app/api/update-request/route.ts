// Port 1:1 z api/update-request.js — "Wyślij aktualizację strony" w panelu klienta,
// funkcja Pro (bramkowana isProEmail tak samo jak personalizacja AI).
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";
import { isProEmail } from "@/lib/entitlement";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const authSession = await verifyRequest(req);
  if (!authSession) return Response.json({ error: "Brak autoryzacji" }, { status: 401, headers });
  const clientEmail = authSession.email;

  const body = await req.json().catch(() => ({}));
  const { slug, update } = body || {};
  if (!update) return Response.json({ error: "Brak update" }, { status: 400, headers });

  const telefon = (update.telefon || "").trim();
  const godz = (update.godz || "").trim();
  const opis = (update.opis || "").trim();
  if (!telefon && !godz && !opis) {
    return Response.json({ error: "Opisz co chcesz zmienić" }, { status: 400, headers });
  }

  const isPro = await isProEmail(clientEmail);
  if (!isPro) {
    return Response.json(
      { error: "Aktualizacje treści na życzenie są dostępne w planie Pro", code: "PRO_REQUIRED" },
      { status: 402, headers }
    );
  }

  const rows: string[] = [];
  if (telefon) rows.push("<p><strong>Nowy telefon:</strong> " + telefon + "</p>");
  if (godz) rows.push("<p><strong>Nowe godziny:</strong> " + godz + "</p>");
  if (opis) rows.push("<p><strong>Opis zmiany:</strong> " + opis.replace(/\n/g, "<br>") + "</p>");

  const html =
    '<div style="font-family:sans-serif">' +
    "<h2>Prośba o aktualizację strony</h2>" +
    "<p><strong>Klient:</strong> " + clientEmail + "</p>" +
    "<p><strong>Strona:</strong> " + (slug ? slug + ".webgen.pl" : "brak slug") + "</p>" +
    rows.join("") +
    "</div>";

  let emailSent = false;
  try {
    if (RESEND_API_KEY) {
      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "webgen <hello@webgen.pl>",
          to: ["artures1982@icloud.com"],
          subject: "Aktualizacja treści: " + clientEmail + (slug ? " (" + slug + ")" : ""),
          html,
        }),
      });
      emailSent = sendRes.ok;
      if (!sendRes.ok) {
        const errBody = await sendRes.text();
        console.error("update-request: Resend send failed", sendRes.status, errBody);
      }
    } else {
      console.error("update-request: RESEND_API_KEY not set");
    }
    return Response.json({ ok: true, emailSent }, { headers });
  } catch (err) {
    console.error("update-request error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
