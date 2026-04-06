// api/notify-client.js — Edge Runtime
// Wysyła email do klienta po wygenerowaniu strony z prośbą o uzupełnienie danych
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const { email, firma, slug } = body;
    if (!email || !firma) return new Response(JSON.stringify({ error: 'Brak danych' }), { status: 400, headers: corsHeaders });

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_KEY) return new Response(JSON.stringify({ ok: true, skipped: 'no resend key' }), { status: 200, headers: corsHeaders });

    const branza  = firma.branza  || 'Twoja branża';
    const miasto  = firma.miasto  || 'Twoje miasto';
    const nazwa   = firma.nazwa   || 'Twoja firma';
    const preview = `https://${slug}.webgen.pl`;

    // Buduj listę brakujących danych
    const missing = [];
    if (!firma.adres)      missing.push('📍 Adres siedziby (ulica, numer, kod)');
    if (!firma.godz_pon_pt) missing.push('🕐 Godziny otwarcia Pon–Pt');
    if (!firma.lata)       missing.push('📅 Ile lat działa firma?');
    if (!firma.realizacje) missing.push('🏆 Ile realizacji/projektów dotychczas?');
    if (!firma.certyfikaty) missing.push('🎓 Certyfikaty lub uprawnienia (jeśli masz)');
    if (!firma.instagram && !firma.facebook) missing.push('📱 Link do Instagram lub Facebook');
    if (!firma.google_ocena) missing.push('⭐ Ocena Google (gwiazdki + liczba opinii)');
    if (!firma.whatsapp)   missing.push('💬 Numer WhatsApp do kontaktu z klientami (opcjonalnie)');

    const missingHtml = missing.length > 0
      ? `<p style="margin:16px 0 8px;font-weight:600;color:#1a1a1a">Chcemy jeszcze uzupełnić kilka szczegółów:</p>
         <ul style="margin:0;padding-left:20px;line-height:2;color:#333">${missing.map(m => `<li>${m}</li>`).join('')}</ul>
         <p style="margin:16px 0;font-size:14px;color:#555">Odpowiedz na tego emaila z brakującymi informacjami — zaktualizujemy stronę bezpłatnie w ciągu 24h.</p>`
      : `<p style="color:#555;margin:16px 0">Twoja strona jest kompletna — nie potrzebujemy żadnych dodatkowych danych.</p>`;

    const { hasMissing } = body;
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1a1a1a">
  <div style="background:#080A0F;border-radius:12px;padding:24px 32px;margin-bottom:24px;text-align:center">
    <div style="font-size:26px;font-weight:800;color:#00E5A0;letter-spacing:-.02em">webgen</div>
    <div style="font-size:11px;color:rgba(240,242,247,.4);margin-top:4px;font-family:monospace;letter-spacing:.1em">AI WEBSITE GENERATOR</div>
  </div>

  <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">🎉 Twoja strona jest gotowa, ${nazwa}!</h2>
  <p style="color:#555;margin:0 0 20px;line-height:1.6">Wygenerowaliśmy 3 warianty strony dla branży <strong>${branza}</strong> w <strong>${miasto}</strong>.</p>

  ${hasMissing ? `
  <div style="background:#fffbea;border:1px solid #fbbf24;border-radius:10px;padding:16px 20px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px">💬 Masz nową wiadomość w panelu klienta</div>
    <div style="font-size:13px;color:#78350f;line-height:1.6">Przygotowaliśmy kilka pytań, które pomogą nam w pełni zoptymalizować Twoją stronę. Odpowiedź zajmie 2 minuty.</div>
  </div>
  <a href="https://webgen.pl/test/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:10px">Otwórz panel klienta →</a>
  ` : `
  <div style="background:#f0fff8;border:1px solid #00c98a;border-radius:10px;padding:16px 20px;margin-bottom:20px">
    <div style="font-size:13px;font-weight:700;color:#065f46;margin-bottom:6px">✅ Strona jest kompletna</div>
    <div style="font-size:13px;color:#047857;line-height:1.6">Twoja strona jest gotowa do aktywacji. Wybierz plan w panelu klienta.</div>
  </div>
  <a href="https://webgen.pl/test/dashboard/" style="display:block;text-align:center;background:#00E5A0;color:#080A0F;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:10px">Panel klienta →</a>
  `}

  <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center">
    webgen.pl · Twoja strona AI w 5 minut<br>
    <a href="https://webgen.pl" style="color:#aaa">webgen.pl</a>
  </p>
</body>
</html>\`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [email],
        subject: '✅ Twoja strona jest gotowa — ' + nazwa,
        html
      })
    });

    const result = await r.json();
    return new Response(JSON.stringify({ ok: r.ok, result }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: corsHeaders });
  }
}
