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

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
  <div style="background:#080A0F;border-radius:12px;padding:28px 32px;margin-bottom:24px;text-align:center">
    <div style="font-size:28px;font-weight:800;color:#00E5A0;letter-spacing:-.02em">webgen</div>
    <div style="font-size:12px;color:rgba(240,242,247,.4);margin-top:4px;font-family:monospace;letter-spacing:.1em">AI WEBSITE GENERATOR</div>
  </div>

  <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">🎉 Twoja strona jest gotowa!</h2>
  <p style="color:#555;margin:0 0 20px">Wygenerowaliśmy 3 warianty strony dla <strong>${nazwa}</strong> (${branza}, ${miasto}).</p>

  <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin-bottom:20px">
    <div style="font-size:12px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Podgląd strony</div>
    <a href="${preview}" style="color:#0066cc;font-size:16px;font-weight:600;text-decoration:none">${preview} →</a>
  </div>

  ${missingHtml}

  <div style="background:#f0fff8;border:1px solid #00c98a;border-radius:8px;padding:16px 20px;margin-top:20px">
    <div style="font-size:13px;color:#006644;font-weight:600;margin-bottom:6px">Co dalej?</div>
    <div style="font-size:13px;color:#00553a;line-height:1.7">
      ✅ Strona jest gotowa i dostępna pod adresem podglądu<br>
      ✅ Aktywujemy ją na Twojej domenie w ciągu 24h od wyboru planu<br>
      ✅ Odpowiedz na tego emaila jeśli chcesz coś zmienić
    </div>
  </div>

  <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center">
    webgen.pl · Twoja strona AI w 5 minut<br>
    <a href="https://webgen.pl" style="color:#aaa">webgen.pl</a>
  </p>
</body>
</html>`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'webgen <hello@webgen.pl>',
        to: [email],
        subject: `✅ Twoja strona jest gotowa — ${nazwa}`,
        html
      })
    });

    const result = await r.json();
    return new Response(JSON.stringify({ ok: r.ok, result }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), { status: 500, headers: corsHeaders });
  }
}
