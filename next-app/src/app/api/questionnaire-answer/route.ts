// Port 1:1 z api/questionnaire-answer.js — dostępne dla każdego planu (dokończenie
// profilu firmy), w przeciwieństwie do update-request.js (płatna funkcja Pro).
import { corsHeaders, optionsResponse } from "@/lib/cors";
import { verifyRequest } from "@/lib/clerk-verify";

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
  const { slug, firma } = body || {};
  if (!firma) return Response.json({ error: "Brak firma" }, { status: 400, headers });

  const rows = Object.keys(firma)
    .filter((k) => firma[k])
    .map((k) => "<p><strong>" + k + ":</strong> " + String(firma[k]).replace(/\n/g, "<br>") + "</p>")
    .join("");

  const html =
    '<div style="font-family:sans-serif">' +
    "<h2>Uzupełnione dane firmy</h2>" +
    "<p><strong>Klient:</strong> " + clientEmail + "</p>" +
    "<p><strong>Strona:</strong> " + (slug ? slug + ".webgen.pl" : "brak slug") + "</p>" +
    rows +
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
          subject: "Uzupełnione dane: " + clientEmail + (slug ? " (" + slug + ")" : ""),
          html,
        }),
      });
      emailSent = sendRes.ok;
      if (!sendRes.ok) {
        const errBody = await sendRes.text();
        console.error("questionnaire-answer: Resend send failed", sendRes.status, errBody);
      }
    } else {
      console.error("questionnaire-answer: RESEND_API_KEY not set");
    }
    return Response.json({ ok: true, emailSent }, { headers });
  } catch (err) {
    console.error("questionnaire-answer error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
