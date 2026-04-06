// api/notify-client.js — Edge Runtime
export const config = { runtime: 'edge' };

export default async function handler(req) {
  var corsHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    var body = await req.json();
    var email = body.email;
    var firma = body.firma || {};
    var slug  = body.slug  || '';
    var hasMissing = body.hasMissing;

    if (!email || !firma) {
      return new Response(JSON.stringify({ error: 'Brak danych' }), { status: 400, headers: corsHeaders });
    }

    var RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no resend key' }), { status: 200, headers: corsHeaders });
    }

    var branza = firma.branza || 'uslugi';
    var miasto = firma.miasto || 'Polska';
    var nazwa  = firma.nazwa  || firma.branza || 'Twoja firma';

    // Buduj HTML przez konkatenacje - bez template literals
    var logoBlock = '<div style="background:#080A0F;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center">'
      + '<div style="font-size:26px;font-weight:800;color:#00E5A0;letter-spacing:-.02em">webgen</div>'
      + '<div style="font-size:11px;color:rgba(240,242,247,.4);margin-top:4px;font-family:monospace;letter-spacing:.1em">AI WEBSITE GENERATOR</div>'
      + '</div>';

    var heroBlock = '<h2 style="font-size:20px;font-weight:700;margin:0 0 8px">\u{1F389} Twoja strona jest gotowa, ' + nazwa + '!</h2>'
      + '<p style="color:#555;margin:0 0 20px;line-height:1.6">Wygenerowalismy 3 warianty strony dla branzy <strong>' + branza + '</strong> w <strong>' + miasto + '</strong>.</p>';

    var msgBlock, ctaBlock;
    if (hasMissing) {
      msgBlock = '<div style="background:#fffbea;border:1px solid #fbbf24;border-radius:10px;padding:16px 20px;margin-bottom:20px">'
        + '<div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px">\u{1F4AC} Masz nowa wiadomosc w panelu klienta</div>'
        + '<div style="font-size:13px;color:#78350f;line-height:1.6">Przygotowalismy kilka pytan, ktore pomoga nam zoptymalizowac Twoja strone. Odpowiedz zajmie 2 minuty.</div>'
        + '</div>';
      ctaBlock = '<a href="https://webgen.pl/test/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:16px">Otworz panel klienta \u2192</a>';
    } else {
      msgBlock = '<div style="background:#f0fff8;border:1px solid #00c98a;border-radius:10px;padding:16px 20px;margin-bottom:20px">'
        + '<div style="font-size:13px;font-weight:700;color:#065f46;margin-bottom:6px">\u2705 Strona jest kompletna</div>'
        + '<div style="font-size:13px;color:#047857;line-height:1.6">Twoja strona jest gotowa do aktywacji. Wybierz plan w panelu klienta.</div>'
        + '</div>';
      ctaBlock = '<a href="https://webgen.pl/test/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:16px">Panel klienta \u2192</a>';
    }

    var footerBlock = '<p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center">'
      + 'webgen.pl \u00B7 Twoja strona AI w 5 minut<br>'
      + '<a href="https://webgen.pl" style="color:#aaa">webgen.pl</a>'
      + '</p>';

    var htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
      + '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1a1a1a">'
      + logoBlock
      + heroBlock
      + msgBlock
      + ctaBlock
      + footerBlock
      + '</body></html>';

    var subject = '\u2705 Twoja strona jest gotowa - ' + nazwa;
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [email],
        subject: subject,
        html: htmlBody
      })
    });

    var result = await r.json();
    return new Response(JSON.stringify({ ok: r.ok, result: result }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: corsHeaders });
  }
}
