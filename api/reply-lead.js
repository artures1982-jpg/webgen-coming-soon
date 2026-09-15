// api/reply-lead.js — panel admina, "Odpowiedz leadowi": wysyła mail jako hello@webgen.pl
// przez Resend (ta sama domena, z której już wychodzą powiadomienia o leadach — patrz
// api/contact.js) zamiast zmuszać Artura do konfiguracji hello@webgen.pl jako osobnego konta
// pocztowego (dziś to tylko przekierowanie na iCloud). Uprzywilejowana akcja — wymaga Clerk
// + allowlist admina po stronie SERWERA, nigdy ufania samej bramce klienckiej w admin/index.html.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const { verifyRequest } = require('../lib/clerk-verify');
const { ADMIN_ALLOWED_EMAILS } = require('../lib/admin-allowlist');

const ALLOWED_ORIGINS = ['https://webgen.pl', 'https://www.webgen.pl'];

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

module.exports = async (req, res) => {
  const reqOrigin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[1]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authSession = await verifyRequest(req);
  if (!authSession || !ADMIN_ALLOWED_EMAILS.includes(authSession.email)) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  const { to, subject, message } = req.body || {};
  if (!to || !isValidEmail(to)) return res.status(400).json({ error: 'Nieprawidłowy adres odbiorcy' });
  if (!subject || !subject.trim()) return res.status(400).json({ error: 'Brak tematu' });
  if (!message || !message.trim()) return res.status(400).json({ error: 'Brak treści wiadomości' });

  const html = '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">'
    + escapeHtml(message).replace(/\n/g, '<br>')
    + '</div>';

  if (!RESEND_API_KEY) {
    console.error('reply-lead: RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Wysyłka wiadomości jest chwilowo niedostępna' });
  }

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [to],
        subject: subject.trim(),
        html,
        reply_to: 'hello@webgen.pl',
      }),
    });
    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      console.error('reply-lead: Resend send failed', sendRes.status, errBody);
      return res.status(502).json({ error: 'Nie udało się wysłać wiadomości' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('reply-lead error:', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
};
