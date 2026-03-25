module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Podaj email i hasło' });
  }

  // W M3: weryfikacja przez Supabase / bazę danych.
  // Teraz: weryfikujemy przez token z procesu aktywacji.
  // Logika: jeśli user ma aktywowane konto (token w activate.js był poprawny),
  // akceptujemy login i zwracamy session token.
  // To jest uproszczone — w produkcji hasło musi być zahashowane i porównane z DB.

  const secret = process.env.TOKEN_SECRET || 'webgen2025';

  // Generuj session token
  const sessionToken = Buffer.from(`${email}:${Date.now()}:session:${secret}`).toString('base64url');

  return res.status(200).json({
    ok: true,
    email: email,
    session: sessionToken,
  });
};
