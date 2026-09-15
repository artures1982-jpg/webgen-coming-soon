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
var WAITLIST_SEGMENT_NAME = 'Webgen Waitlist';

// Segmenty zastąpiły Audiences w API Resend (Audiences są deprecated) — patrz
// https://resend.com/docs/api-reference/segments. Szukamy segmentu po nazwie
// i tworzymy go przy pierwszym leadzie, żeby nie wymagać ręcznej konfiguracji
// w panelu Resend ani nowej zmiennej środowiskowej.
async function getOrCreateWaitlistSegmentId() {
  var listRes = await fetch('https://api.resend.com/segments', {
    headers: { Authorization: 'Bearer ' + RESEND_KEY },
  });
  if (listRes.ok) {
    var listData = await listRes.json();
    var existing = (listData.data || []).find(function (s) { return s.name === WAITLIST_SEGMENT_NAME; });
    if (existing) return existing.id;
  }
  var createRes = await fetch('https://api.resend.com/segments', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: WAITLIST_SEGMENT_NAME }),
  });
  if (createRes.ok) {
    var createData = await createRes.json();
    return createData.id;
  }
  return null;
}

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
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: headers });
  }

  // Realny zapis leada do listy (segment Resend), żeby przyszła automatyczna
  // sekwencja maili miała po kim wysyłać — do tej pory lead trafiał WYŁĄCZNIE
  // jako pojedynczy mail do hello@webgen.pl, nigdzie nie było trwałej listy.
  // Best-effort: błąd (np. duplikat e-maila) nie psuje odpowiedzi klientowi.
  try {
    var segmentId = await getOrCreateWaitlistSegmentId();
    var contactPayload = { email: email, unsubscribed: false, properties: { source: source } };
    if (segmentId) contactPayload.segments = [segmentId];
    await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload),
    });
  } catch (e) {
    // cichy fallback — lead już bezpiecznie trafił do hello@webgen.pl wyżej
  }

  // Odpala Automation w Resend (harmonogram dzień 2/5/8 skonfigurowany w
  // panelu Resend, krok Delay + Send Email — zero własnego crona/serwera).
  // Nazwa eventu musi odpowiadać triggerowi ustawionemu w tej automatyzacji.
  // Dopóki automatyzacja nie istnieje w panelu, ten request jest no-opem —
  // bezpieczne do wdrożenia przed jej skonfigurowaniem.
  try {
    await fetch('https://api.resend.com/events/send', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'webgen.waitlist_signup', email: email, payload: { source: source } }),
    });
  } catch (e) {
    // cichy fallback — lead już bezpiecznie trafił do hello@webgen.pl wyżej
  }

  // Potwierdzenie do zgłaszającego się — zadaje pytania kwalifikujące (branża,
  // czy ma już stronę, czego potrzebuje), żeby odpowiedź (reply_to hello@webgen.pl)
  // od razu dała kontekst zamiast czekać biernie na start produkcji. Celowo
  // best-effort: błąd tej wysyłki NIE psuje odpowiedzi klientowi — lead i tak
  // jest już bezpiecznie zapisany w mailu wyżej.
  try {
    var confirmHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
      + '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;line-height:1.6">'
      + '<h2 style="font-size:20px;margin:0 0 12px">Dzięki za zgłoszenie! \u{1F44B}</h2>'
      + '<p style="margin:0 0 16px">Zapisaliśmy Twój email — damy Ci znać, jak tylko wystartujemy z pełną aktywacją stron.</p>'
      + '<p style="margin:0 0 16px">Zanim to nastąpi, chcielibyśmy lepiej zrozumieć czego potrzebujesz. Odpowiedz na tego maila i napisz:</p>'
      + '<ul style="margin:0 0 16px;padding-left:20px">'
      + '<li style="margin-bottom:6px">W jakiej branży działasz? (np. hydraulik, elektryk, fryzjer, stomatolog...)</li>'
      + '<li style="margin-bottom:6px">Masz już jakąś stronę, czy zaczynasz od zera?</li>'
      + '<li style="margin-bottom:6px">Czego szukasz najbardziej — szybkiej gotowej strony, czy pełnej personalizacji treści i zdjęć przez AI?</li>'
      + '</ul>'
      + '<p style="margin:0 0 16px">Im więcej nam powiesz, tym lepiej dobierzemy dla Ciebie szablon i plan, gdy ruszymy.</p>'
      + '<p style="margin:0 0 4px">W międzyczasie możesz przejrzeć nasze gotowe warianty szablonów:</p>'
      + '<p style="margin:0 0 20px"><a href="https://www.webgen.pl/galeria/" style="color:#00A876;font-weight:600">www.webgen.pl/galeria →</a></p>'
      + '<p style="margin:0;color:#8892AA;font-size:13px">Do usłyszenia,<br>zespół Webgen</p>'
      + '</body></html>';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [email],
        subject: 'Dzięki za zgłoszenie — powiedz nam czego szukasz',
        html: confirmHtml,
        reply_to: 'hello@webgen.pl',
      }),
    });
  } catch (e) {
    // cichy fallback — lead już bezpiecznie trafił do hello@webgen.pl wyżej
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: headers });
}
