// Test regresyjny na dziurę znalezioną w audycie 2026-09-09: /api/deploy przyjmowało
// dowolny POST {plan:'promax', ...} bez weryfikacji płatności — dało się aktywować
// płatny plan za darmo. Ten test nie woła Stripe (sieci) — sprawdza tylko że brak
// session_id jest odrzucany, zanim kod w ogóle sięgnie do sieci.
const test = require('node:test');
const assert = require('node:assert');
const handler = require('../api/deploy.js');

function mockRes() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
    end() { return this; },
  };
}

test('/api/deploy odrzuca plan płatny bez session_id (402), bez kontaktu ze Stripe', async () => {
  const req = {
    method: 'POST',
    headers: { origin: 'https://www.webgen.pl' },
    body: { slug: 'audyt-test', html: '<h1>x</h1>', plan: 'promax', email: 'x@x.com' },
  };
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 402);
  assert.match(res.body.error, /session_id/);
});

test('/api/deploy odrzuca brak slug/html (400), niezależnie od planu', async () => {
  const req = {
    method: 'POST',
    headers: { origin: 'https://www.webgen.pl' },
    body: { plan: 'free' },
  };
  const res = mockRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 400);
});
