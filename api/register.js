const RESEND_API_KEY = process.env.RESEND_API_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, rodo } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
  if (!rodo) return res.status(400).json({ error: 'RODO required' });

  const firstName = (name || '').trim() || 'tam';

  // Token = base64url(email:timestamp:secret)
  const secret  = process.env.TOKEN_SECRET || 'webgen2025';
  const payload = `${email}:${Date.now()}:${secret}`;
  const token   = Buffer.from(payload).toString('base64url');

  const activateUrl = `https://webgen.pl/test/activate/?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aktywuj konto webgen</title></head>
<body style="margin:0;padding:0;background:#080A0F;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0E1117;border-radius:16px;border:1px solid rgba(240,242,247,.1);overflow:hidden">
  <tr><td style="padding:28px 36px 20px;border-bottom:1px solid rgba(240,242,247,.07)">
    <span style="font-size:18px;font-weight:700;color:#F0F2F7">web<span style="color:#00E5A0">gen</span></span>
  </td></tr>
  <tr><td style="padding:36px 36px 28px">
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;color:#F0F2F7">Cześć, ${firstName}!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#8892AA;line-height:1.65">
      Kliknij poniższy przycisk, żeby aktywować konto i ustawić hasło. Zajmie to dosłownie chwilę.
    </p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${activateUrl}"
         style="display:inline-block;background:#00E5A0;color:#080A0F;text-decoration:none;padding:15px 36px;border-radius:10px;font-size:16px;font-weight:700">
        Aktywuj konto i ustaw hasło →
      </a>
    </div>
    <div style="background:rgba(0,229,160,.06);border:1px solid rgba(0,229,160,.15);border-radius:10px;padding:18px 20px">
      <p style="margin:0 0 10px;font-size:12px;color:#00E5A0;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Co dostajesz za darmo:</p>
      <p style="margin:2px 0;font-size:13px;color:#8892AA">✓ Strona firmowa z lokalnym SEO</p>
      <p style="margin:2px 0;font-size:13px;color:#8892AA">✓ Hosting na *.webgen.pl przez 3 miesiące</p>
      <p style="margin:2px 0;font-size:13px;color:#8892AA">✓ Generator AI — gotowe w 3 minuty</p>
      <p style="margin:0;font-size:13px;color:#8892AA">✓ PageSpeed 90+ automatycznie</p>
    </div>
    <p style="margin:24px 0 0;font-size:11px;color:rgba(136,146,170,.4);line-height:1.6">
      Link ważny 24h. Nie zakładałeś/aś konta? Zignoruj tę wiadomość.<br>
      Pytania: <a href="mailto:hello@webgen.pl" style="color:#00E5A0;text-decoration:none">hello@webgen.pl</a>
    </p>
  </td></tr>
  <tr><td style="padding:16px 36px;border-top:1px solid rgba(240,242,247,.07)">
    <p style="margin:0;font-size:11px;color:rgba(136,146,247,.35);text-align:center">
      webgen.pl · <a href="https://webgen.pl/test/polityka-prywatnosci/" style="color:rgba(136,146,170,.4);text-decoration:none">Polityka prywatności</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  try {
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'webgen <hello@webgen.pl>',
          to: [email],
          subject: 'Aktywuj konto webgen — kliknij i ustaw hasło',
          html,
        }),
      });
      // Notyfikacja admina
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'webgen <hello@webgen.pl>',
          to: ['artures1982@icloud.com'],
          subject: `Nowa rejestracja: ${email}`,
          html: `<p><b>${email}</b> (${name || 'brak imienia'}) — ${new Date().toLocaleString('pl-PL')}</p>`,
        }),
      }).catch(() => {});
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('register error:', err);
    return res.status(200).json({ ok: true, note: 'fallback' });
  }
};
