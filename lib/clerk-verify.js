// lib/clerk-verify.js — wspoldzielona weryfikacja sesji Clerk dla API (Node runtime).
// Uzywane przez kazdy endpoint ktory musi znac PRAWDZIWY, zweryfikowany email klienta
// zamiast ufac wartosci z req.body/query (to byla dziura bezpieczenstwa przed migracja).
const { verifyToken, createClerkClient } = require('@clerk/backend');

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const clerkClient = CLERK_SECRET_KEY ? createClerkClient({ secretKey: CLERK_SECRET_KEY }) : null;

function extractEmail(user) {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  const addr = primary || user.emailAddresses[0];
  return addr ? addr.emailAddress : null;
}

// Zwraca { userId, email } dla wazniego tokena Bearer, albo null.
async function verifyRequest(req) {
  if (!CLERK_SECRET_KEY) {
    console.error('clerk-verify: CLERK_SECRET_KEY not set');
    return null;
  }
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7);

  try {
    const claims = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(claims.sub);
    const email = extractEmail(user);
    if (!email) return null;
    return { userId: claims.sub, email };
  } catch (err) {
    console.error('clerk-verify: token verification failed', err.message || err);
    return null;
  }
}

module.exports = { verifyRequest };
