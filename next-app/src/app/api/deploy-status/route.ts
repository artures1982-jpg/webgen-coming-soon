// Odpytywane przez /checkout/success — mówi, czy webhook Stripe (api/webhooks/
// stripe/route.ts) zdążył już wdrożyć stronę po zakończonej płatności. Bez tego
// strona sukcesu nie miałaby jak wiedzieć, kiedy pokazać gotowy link (webhook
// działa asynchronicznie, poza requestem przekierowania ze Stripe).
import Stripe from "stripe";
import { clerkClient } from "@/lib/clerk-verify";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing");
}

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ error: "Brak session_id" }, { status: 400 });

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return Response.json({ error: "Nie znaleziono sesji płatności" }, { status: 404 });
  }

  const slug = session.metadata?.firma_slug;
  const clerkUserId = session.metadata?.clerk_user_id;
  if (!slug || !clerkUserId) {
    return Response.json({ error: "Ta sesja nie dotyczy aktywacji strony" }, { status: 400 });
  }

  if (!clerkClient) return Response.json({ error: "Clerk nieskonfigurowany" }, { status: 500 });

  const user = await clerkClient.users.getUser(clerkUserId);
  const meta = user.unsafeMetadata as { firma_slug?: string; site_url?: string } | null;

  if (meta?.firma_slug === slug && meta.site_url) {
    return Response.json({ ready: true, url: meta.site_url });
  }
  return Response.json({ ready: false });
}
