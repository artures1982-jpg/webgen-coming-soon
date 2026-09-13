// api/contact-form.js — Edge Runtime
//
// Odbiera zgłoszenia z formularzy kontaktowych na WDROŻONYCH stronach klientów
// (slug.webgen.pl) i przekazuje je mailem na adres kontaktowy tej konkretnej
// firmy. Do tej pory formularz na każdym z 53 wariantów był czysto dekoracyjny
// (JS robił preventDefault + fałszywy komunikat "wysłano", nic nigdzie nie
// leciało) — patrz pamięć projektu project_contact_form_decorative_bug.
//
// Bezpieczeństwo: adres docelowy NIGDY nie jest brany z ciała requestu (byłby
// to otwarty przekaźnik spamu na dowolny email) — jest odczytywany z meta tagu
// wstrzykniętego przez /api/deploy do HTML zapisanego w Vercel Blob, czyli ze
// źródła, którego odwiedzający formularz nie kontroluje.
export const config = { runtime: 'edge' };

var BLOB_BASE = process.env.BLOB_BASE_URL;
var RESEND_KEY = process.env.RESEND_API_KEY;

var MAX_FIELDS = 20;
var MAX_FIELD_LEN = 4000;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?webgen\.pl$/i;

function corsHeaders(origin) {
  var allow = ORIGIN_RE.test(origin || '') ? origin : 'https://www.webgen.pl';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req) {
  var origin = req.headers.get('origin');
  var headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: headers });
  }

  var body;
  try { body = await req.json(); } catch (e) {
    return new Response(JSON.stringify({ error: 'Nieprawidłowy JSON' }), { status: 400, headers: headers });
  }

  var slug = String(body.slug || '').trim();
  var fields = body.fields;

  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return new Response(JSON.stringify({ error: 'Brak lub nieprawidłowy slug' }), { status: 400, headers: headers });
  }
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return new Response(JSON.stringify({ error: 'Brak pól formularza' }), { status: 400, headers: headers });
  }

  var keys = Object.keys(fields).slice(0, MAX_FIELDS);
  if (keys.length === 0) {
    return new Response(JSON.stringify({ error: 'Pusty formularz' }), { status: 400, headers: headers });
  }

  if (!BLOB_BASE) {
    return new Response(JSON.stringify({ error: 'Serwer nie jest skonfigurowany (brak BLOB_BASE_URL)' }), { status: 500, headers: headers });
  }

  // 1. Znajdź adres kontaktowy tej strony — jedyne źródło prawdy to HTML
  //    zapisany przez /api/deploy, nigdy ciało tego requestu.
  var siteHtml;
  try {
    var siteRes = await fetch(BLOB_BASE + '/sites/' + slug + '/index.html');
    if (!siteRes.ok) {
      return new Response(JSON.stringify({ error: 'Nie znaleziono strony o podanym slugu' }), { status: 404, headers: headers });
    }
    siteHtml = await siteRes.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Nie udało się odczytać strony' }), { status: 502, headers: headers });
  }

  var m = siteHtml.match(/<meta\s+name="webgen-contact-email"\s+content="([^"]*)"/i);
  var toEmail = m ? m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&') : '';

  if (!toEmail || !EMAIL_RE.test(toEmail)) {
    return new Response(JSON.stringify({
      error: 'Ta strona nie ma jeszcze skonfigurowanego adresu do formularza — zadzwoń zamiast tego.',
      code: 'NO_CONTACT_EMAIL',
    }), { status: 422, headers: headers });
  }

  if (!RESEND_KEY) {
    // Świadomie NIE zwracamy tu ok:true (inaczej niż notify-client.js) — to jest
    // jedyna droga dostarczenia realnej wiadomości od klienta, fałszywy sukces
    // ukrywałby utratę leada.
    return new Response(JSON.stringify({ error: 'Wysyłka wiadomości jest chwilowo niedostępna' }), { status: 500, headers: headers });
  }

  // 2. Zbuduj treść maila z dowolnych pól formularza (różne warianty szablonów
  //    mają różne pola — imię/telefon/wiadomość, albo usługa/budżet/termin itd.)
  var rows = '';
  var replyTo = null;
  keys.forEach(function (k) {
    var raw = String(fields[k] == null ? '' : fields[k]).slice(0, MAX_FIELD_LEN);
    if (!replyTo && /email/i.test(k) && EMAIL_RE.test(raw.trim())) replyTo = raw.trim();
    rows += '<tr><td style="padding:6px 12px 6px 0;color:#8892AA;font-size:13px;white-space:nowrap;vertical-align:top">' + escapeHtml(k) + '</td>'
      + '<td style="padding:6px 0;color:#1a1a1a;font-size:14px;white-space:pre-wrap">' + escapeHtml(raw) + '</td></tr>';
  });

  var htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
    + '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">'
    + '<h2 style="font-size:18px;margin:0 0 4px">Nowa wiadomość ze strony</h2>'
    + '<p style="color:#8892AA;font-size:13px;margin:0 0 20px">' + escapeHtml(slug) + '.webgen.pl</p>'
    + '<table style="border-collapse:collapse;width:100%">' + rows + '</table>'
    + '<p style="margin:24px 0 0;font-size:12px;color:#aaa">Wysłane przez formularz kontaktowy na Twojej stronie webgen.pl.'
    + (replyTo ? ' Odpowiedz na tego maila, żeby napisać bezpośrednio do nadawcy.' : '') + '</p>'
    + '</body></html>';

  var payload = {
    from: 'Formularz na Twojej stronie <hello@webgen.pl>',
    to: [toEmail],
    subject: 'Nowa wiadomość ze strony ' + slug,
    html: htmlBody,
  };
  if (replyTo) payload.reply_to = replyTo;

  try {
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      var errText = await r.text();
      return new Response(JSON.stringify({ error: 'Resend error: ' + errText.slice(0, 200) }), { status: 502, headers: headers });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: headers });
  }
}
