// api/contact.js — Edge Runtime
//
// Odbiera zgłoszenia z formularza leadowego na stronie głównej webgen.pl
// (sekcja CTA na dole index.html) i przekazuje je mailem na hello@webgen.pl.
// Wcześniej ten endpoint nie istniał — formularz robił fetch('/api/contact'),
// dostawał 404 i w .catch() i tak pokazywał fałszywy komunikat sukcesu, więc
// każdy lead był cicho gubiony. Patrz pamięć projektu
// project_homepage_contact_form_broken.
export const config = { runtime: 'edge' };

var RESEND_KEY = process.env.RESEND_API_KEY;
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

  var email = String(body.email || '').trim();
  var source = String(body.source || 'cta-home').slice(0, 100);
  var rodo = body.rodo === true;

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Podaj prawidłowy adres e-mail' }), { status: 400, headers: headers });
  }
  if (!rodo) {
    return new Response(JSON.stringify({ error: 'Wymagana zgoda RODO' }), { status: 400, headers: headers });
  }

  if (!RESEND_KEY) {
    return new Response(JSON.stringify({ error: 'Wysyłka wiadomości jest chwilowo niedostępna' }), { status: 500, headers: headers });
  }

  var htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
    + '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">'
    + '<h2 style="font-size:18px;margin:0 0 4px">Nowy lead ze strony głównej</h2>'
    + '<p style="color:#8892AA;font-size:13px;margin:0 0 20px">webgen.pl · ' + escapeHtml(source) + '</p>'
    + '<table style="border-collapse:collapse;width:100%">'
    + '<tr><td style="padding:6px 12px 6px 0;color:#8892AA;font-size:13px;white-space:nowrap;vertical-align:top">Email</td>'
    + '<td style="padding:6px 0;color:#1a1a1a;font-size:14px">' + escapeHtml(email) + '</td></tr>'
    + '</table>'
    + '<p style="margin:24px 0 0;font-size:12px;color:#aaa">Odpowiedz na tego maila, żeby napisać bezpośrednio do leada.</p>'
    + '</body></html>';

  var payload = {
    from: 'Lead ze strony głównej <hello@webgen.pl>',
    to: ['hello@webgen.pl'],
    subject: 'Nowy lead ze strony głównej — ' + email,
    html: htmlBody,
    reply_to: email,
  };

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
