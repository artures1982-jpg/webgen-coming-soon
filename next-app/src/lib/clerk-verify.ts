// src/lib/clerk-verify.ts — port 1:1 z lib/clerk-verify.js (Faza 2 migracji).
// Weryfikacja sesji Clerk dla Route Handlers — zwraca PRAWDZIWY, zweryfikowany
// email klienta zamiast ufać wartości z req.body/query.
import { verifyToken, createClerkClient } from "@clerk/backend";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const clerkClient = CLERK_SECRET_KEY ? createClerkClient({ secretKey: CLERK_SECRET_KEY }) : null;

export type ClerkSession = { userId: string; email: string };

function extractEmail(user: {
  emailAddresses: { id: string; emailAddress: string }[];
  primaryEmailAddressId: string | null;
}): string | null {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  const addr = primary || user.emailAddresses[0];
  return addr ? addr.emailAddress : null;
}

// Przyjmuje standardowy Web Request (Route Handlers) — czyta nagłówek Authorization
// przez req.headers.get(), nie req.headers.authorization jak w starym Node (req,res).
export async function verifyRequest(req: Request): Promise<ClerkSession | null> {
  if (!CLERK_SECRET_KEY || !clerkClient) {
    console.error("clerk-verify: CLERK_SECRET_KEY not set");
    return null;
  }
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7);

  try {
    const claims = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(claims.sub);
    const email = extractEmail(user);
    if (!email) return null;
    return { userId: claims.sub, email };
  } catch (err) {
    console.error("clerk-verify: token verification failed", err instanceof Error ? err.message : err);
    return null;
  }
}
