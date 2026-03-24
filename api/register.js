const RESEND_API_KEY = process.env.RESEND_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, rodo } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!rodo) {
    return res.status(400).json({ error: 'RODO consent required' });
  }

  const firstName = name || 'tam';

  // Generuj prosty token potwierdzający (w produkcji: JWT lub DB)
  const token = Buffer.from(`${email}:${Date.now()}:webgen`).toString('base64url');
  const confirmUrl = `https://webgen.pl/test/generator/?confirmed=1&token=${token}&email=${encodeURIComponent(email)}`;

  const emailHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Potwierdź konto webgen</title>
</head>
<body style="margin:0;padding:0;background:#080A0F;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080A0F;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0E1117;border-radius:16px;border:1px solid rgba(240,242,247,.1);overflow:hidden">

        <!-- HEADER -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(240,242,247,.07)">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#00E5A0,#0066FF,#7B4FFF);display:inline-flex;align-items:center;justify-content:center;font-family:monospace;font-size:14px;font-weight:700;color:#fff;line-height:32px;text-align:center">W</div>
                    <span style="font-size:18px;font-weight:700;color:#F0F2F7">web<span style="background:linear-gradient(135deg,#00E5A0,#0066FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent">gen</span></span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 40px 32px">
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#F0F2F7;letter-spacing:-.02em">Potwierdź swój adres email</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#8892AA;line-height:1.6">Cześć ${firstName}! Kliknij przycisk poniżej, żeby aktywować konto i przejść do generatora stron.</p>

            <div style="text-align:center;margin:32px 0">
              <a href="${confirmUrl}" style="display:inline-block;background:#00E5A0;color:#080A0F;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:-.01em">
                Potwierdź i aktywuj konto →
              </a>
            </div>

            <div style="background:rgba(240,242,247,.04);border:1px solid rgba(240,242,247,.08);border-radius:10px;padding:20px;margin-top:28px">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#F0F2F7;text-transform:uppercase;letter-spacing:.08em;font-family:monospace">Co dostajesz za darmo:</p>
              <table cellpadding="0" cellspacing="0">
                <tr><td style="padding:4px 0"><span style="color:#00E5A0;margin-right:10px">✓</span><span style="font-size:14px;color:#8892AA">Strona firmowa z lokalnym SEO</span></td></tr>
                <tr><td style="padding:4px 0"><span style="color:#00E5A0;margin-right:10px">✓</span><span style="font-size:14px;color:#8892AA">Hosting na *.webgen.pl przez 3 miesiące</span></td></tr>
                <tr><td style="padding:4px 0"><span style="color:#00E5A0;margin-right:10px">✓</span><span style="font-size:14px;color:#8892AA">SSL + PageSpeed 90+ automatycznie</span></td></tr>
                <tr><td style="padding:4px 0"><span style="color:#00E5A0;margin-right:10px">✓</span><span style="font-size:14px;color:#8892AA">Generator AI — gotowe w 3 minuty</span></td></tr>
              </table>
            </div>

            <p style="margin:24px 0 0;font-size:12px;color:rgba(136,146,170,.5);line-height:1.6">
              Jeśli nie zakładałeś/aś konta na webgen.pl, możesz zignorować tę wiadomość.<br>
              Link jest ważny przez 24 godziny. Pytania? <a href="mailto:hello@webgen.pl" style="color:#00E5A0;text-decoration:none">hello@webgen.pl</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(240,242,247,.07)">
            <p style="margin:0;font-size:12px;color:rgba(136,146,170,.4);text-align:center">
              webgen.pl · Strony firmowe dla polskich firm · <a href="https://webgen.pl/test/polityka-prywatnosci/" style="color:rgba(136,146,170,.5);text-decoration:none">Polityka prywatności</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    if (!RESEND_API_KEY) {
      console.error('Brak RESEND_API_KEY');
      // Zwróć success mimo braku klucza (nie blokuj użytkownika)
      return res.status(200).json({ ok: true, note: 'no_key' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [email],
        subject: 'Potwierdź konto webgen — aktywuj bezpłatne 3 miesiące',
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(200).json({ ok: true, note: 'email_queued' }); // nie blokuj
    }

    // Wyślij też notyfikację do admina
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: ['artures1982@icloud.com'],
        subject: `Nowa rejestracja: ${email}`,
        html: `<p>Nowe konto: <strong>${email}</strong> (${name || 'brak imienia'})</p><p>Czas: ${new Date().toLocaleString('pl-PL')}</p>`,
      }),
    }).catch(() => {});

    return res.status(200).json({ ok: true, id: data.id });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(200).json({ ok: true, note: 'fallback' }); // nie blokuj
  }
};
