// api/questionnaire-answer.js — obsluguje uzupelnienie brakujacych danych po wygenerowaniu
// strony (test/dashboard/index.html, submitQuestionnaire()). Dostepne dla kazdego planu — to
// dokonczenie profilu firmy, nie platna funkcja Pro (w przeciwienstwie do api/update-request.js).
const RESEND_API_KEY = process.env.RESEND_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientEmail, slug, firma } = req.body || {};
  if (!clientEmail || !firma) {
    return res.status(400).json({ error: 'Brak clientEmail lub firma' });
  }

  const rows = Object.keys(firma)
    .filter((k) => firma[k])
    .map((k) => '<p><strong>' + k + ':</strong> ' + String(firma[k]).replace(/\n/g, '<br>') + '</p>')
    .join('');

  const html = '<div style="font-family:sans-serif">'
    + '<h2>Uzupełnione dane firmy</h2>'
    + '<p><strong>Klient:</strong> ' + clientEmail + '</p>'
    + '<p><strong>Strona:</strong> ' + (slug ? slug + '.webgen.pl' : 'brak slug') + '</p>'
    + rows
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
          subject: 'Uzupełnione dane: ' + clientEmail + (slug ? ' (' + slug + ')' : ''),
          html,
        }),
      });
      emailSent = sendRes.ok;
      if (!sendRes.ok) {
        const errBody = await sendRes.text();
        console.error('questionnaire-answer: Resend send failed', sendRes.status, errBody);
      }
    } else {
      console.error('questionnaire-answer: RESEND_API_KEY not set');
    }
    return res.status(200).json({ ok: true, emailSent });
  } catch (err) {
    console.error('questionnaire-answer error:', err);
    return res.status(500).json({ error: String(err.message || err) });
  }
};
