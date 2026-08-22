// api/update-request.js — obsluguje formularz "Wyslij aktualizacje strony" w panelu klienta
// (test/dashboard/index.html, buildUpdateForm/sendUpdateRequest). Funkcja Pro: "aktualizacje
// tresci na zyczenie" — konkurencja w tym segmencie (Arena Stron, RimSet.pl) explicite sprzedaje
// to jako uzasadnienie ceny abonamentu, wiec bramkujemy tak samo jak personalizacje AI.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const { isProEmail } = require('../lib/entitlement');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientEmail, slug, update } = req.body || {};
  if (!clientEmail || !update) {
    return res.status(400).json({ error: 'Brak clientEmail lub update' });
  }
  const telefon = (update.telefon || '').trim();
  const godz = (update.godz || '').trim();
  const opis = (update.opis || '').trim();
  if (!telefon && !godz && !opis) {
    return res.status(400).json({ error: 'Opisz co chcesz zmienić' });
  }

  const isPro = await isProEmail(clientEmail);
  if (!isPro) {
    return res.status(402).json({ error: 'Aktualizacje treści na życzenie są dostępne w planie Pro', code: 'PRO_REQUIRED' });
  }

  const rows = [];
  if (telefon) rows.push('<p><strong>Nowy telefon:</strong> ' + telefon + '</p>');
  if (godz) rows.push('<p><strong>Nowe godziny:</strong> ' + godz + '</p>');
  if (opis) rows.push('<p><strong>Opis zmiany:</strong> ' + opis.replace(/\n/g, '<br>') + '</p>');

  const html = '<div style="font-family:sans-serif">'
    + '<h2>Prośba o aktualizację strony</h2>'
    + '<p><strong>Klient:</strong> ' + clientEmail + '</p>'
    + '<p><strong>Strona:</strong> ' + (slug ? slug + '.webgen.pl' : 'brak slug') + '</p>'
    + rows.join('')
    + '</div>';

  let emailSent = false;
  try {
    if (RESEND_API_KEY) {
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'webgen <hello@webgen.pl>',
          to: ['artures1982@icloud.com'],
          subject: 'Aktualizacja treści: ' + clientEmail + (slug ? ' (' + slug + ')' : ''),
          html,
        }),
      });
      emailSent = sendRes.ok;
      if (!sendRes.ok) {
        const errBody = await sendRes.text();
        console.error('update-request: Resend send failed', sendRes.status, errBody);
      }
    } else {
      console.error('update-request: RESEND_API_KEY not set');
    }
    return res.status(200).json({ ok: true, emailSent });
  } catch (err) {
    console.error('update-request error:', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
};
