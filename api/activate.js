module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, email, password } = req.body || {};
  if (!token || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Hasło musi mieć minimum 6 znaków' });
  }

  // Walidacja tokenu
  try {
    const decoded  = Buffer.from(token, 'base64url').toString('utf8');
    const secret   = process.env.TOKEN_SECRET || 'webgen2025';
    const parts    = decoded.split(':');
    const tokenEmail = parts[0];
    const timestamp  = parseInt(parts[1]);
    const tokenSecret = parts.slice(2).join(':');

    if (tokenEmail !== email) {
      return res.status(400).json({ error: 'Nieprawidłowy token (email mismatch)' });
    }
    if (tokenSecret !== secret) {
      return res.status(400).json({ error: 'Nieprawidłowy token' });
    }
    // Token ważny 24h
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Link wygasł. Zarejestruj się ponownie.' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Nieprawidłowy token' });
  }

  // W M3 tu będzie zapis do Supabase.
  // Teraz: generujemy session token i zwracamy go klientowi
  const sessionToken = Buffer.from(`${email}:${Date.now()}:session`).toString('base64url');

  return res.status(200).json({
    ok: true,
    session: sessionToken,
    email: email,
    message: 'Konto aktywowane!',
  });
};
