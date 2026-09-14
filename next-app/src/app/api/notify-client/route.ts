// Port 1:1 z api/notify-client.js (był Edge Runtime — już standardowy Request/Response,
// więc port jest głównie mechaniczny). Brak Clerk auth w oryginale — email pochodzi z
// body, zaufany jak w reszcie generatora (to powiadomienie "strona gotowa", nie operacja
// wrażliwa na dane).
import { corsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

type Firma = { branza?: string; miasto?: string; nazwa?: string };

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  try {
    const body = await req.json();
    const email: string | undefined = body.email;
    const firma: Firma = body.firma || {};
    const slug: string = body.slug || "";
    const hasMissing: boolean = body.hasMissing;
    void slug;

    if (!email || !firma) {
      return Response.json({ error: "Brak danych" }, { status: 400, headers });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return Response.json({ ok: true, skipped: "no resend key" }, { headers });
    }

    const branza = firma.branza || "uslugi";
    const miasto = firma.miasto || "Polska";
    const nazwa = firma.nazwa || firma.branza || "Twoja firma";

    const logoBlock =
      '<div style="background:#080A0F;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center">' +
      '<div style="font-size:26px;font-weight:800;color:#00E5A0;letter-spacing:-.02em">webgen</div>' +
      '<div style="font-size:11px;color:rgba(240,242,247,.4);margin-top:4px;font-family:monospace;letter-spacing:.1em">AI WEBSITE GENERATOR</div>' +
      "</div>";

    const heroBlock =
      '<h2 style="font-size:20px;font-weight:700;margin:0 0 8px">\u{1F389} Twoja strona jest gotowa, ' + nazwa + "!</h2>" +
      '<p style="color:#555;margin:0 0 20px;line-height:1.6">Wygenerowalismy 3 warianty strony dla branzy <strong>' + branza + "</strong> w <strong>" + miasto + "</strong>.</p>";

    let msgBlock: string;
    let ctaBlock: string;
    if (hasMissing) {
      msgBlock =
        '<div style="background:#fffbea;border:1px solid #fbbf24;border-radius:10px;padding:16px 20px;margin-bottom:20px">' +
        '<div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px">\u{1F4AC} Masz nowa wiadomosc w panelu klienta</div>' +
        '<div style="font-size:13px;color:#78350f;line-height:1.6">Przygotowalismy kilka pytan, ktore pomoga nam zoptymalizowac Twoja strone. Odpowiedz zajmie 2 minuty.</div>' +
        "</div>";
      ctaBlock =
        '<a href="https://webgen.pl/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:16px">Otworz panel klienta →</a>';
    } else {
      msgBlock =
        '<div style="background:#f0fff8;border:1px solid #00c98a;border-radius:10px;padding:16px 20px;margin-bottom:20px">' +
        '<div style="font-size:13px;font-weight:700;color:#065f46;margin-bottom:6px">✅ Strona jest kompletna</div>' +
        '<div style="font-size:13px;color:#047857;line-height:1.6">Twoja strona jest gotowa do aktywacji. Wybierz plan w panelu klienta.</div>' +
        "</div>";
      ctaBlock =
        '<a href="https://webgen.pl/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:16px">Panel klienta →</a>';
    }

    const footerBlock =
      '<p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center">' +
      "webgen.pl · Twoja strona AI w 5 minut<br>" +
      '<a href="https://webgen.pl" style="color:#aaa">webgen.pl</a>' +
      "</p>";

    const htmlBody =
      '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
      '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1a1a1a">' +
      logoBlock + heroBlock + msgBlock + ctaBlock + footerBlock +
      "</body></html>";

    const subject = "✅ Twoja strona jest gotowa - " + nazwa;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "webgen <hello@webgen.pl>",
        to: [email],
        subject,
        html: htmlBody,
      }),
    });

    const result = await r.json();
    return Response.json({ ok: r.ok, result }, { headers });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500, headers }
    );
  }
}
