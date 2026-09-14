// Port 1:1 z api/deploy.js — NAJWYŻSZE RYZYKO w całej Fazie 2: zapisuje do Vercel Blob
// (ten sam bucket co produkcja) i dodaje subdomeny do PRAWDZIWEGO projektu Vercel przez
// VERCEL_PROJECT_ID. Nie testować tego endpointu z realnymi credentialami produkcyjnymi
// bez świadomej decyzji — bug tutaj może nadpisać/utworzyć prawdziwą subdomenę klienta.
import { put } from "@vercel/blob";
import Stripe from "stripe";
import { corsHeaders, optionsResponse } from "@/lib/cors";

// Leniwa inicjalizacja — patrz komentarz w api/create-checkout/route.ts.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "sk_missing");
}

async function verifyPaidSession(sessionId: string, slug: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const paid =
    session.status === "complete" &&
    (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  if (!paid) throw new Error("Płatność nie została potwierdzona przez Stripe");
  if (session.metadata && session.metadata.firma_slug && session.metadata.firma_slug !== slug) {
    throw new Error("Slug nie zgadza się z opłaconą sesją");
  }
}

const VERCEL_API = "https://api.vercel.com";
const TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

function escapeAttr(s: string) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Wstrzykuje meta tagi, po których /api/contact-form rozpoznaje dokąd odesłać
// wiadomość z formularza na wdrożonej stronie.
function injectContactMeta(html: string, slug: string, contactEmail?: string) {
  let tags = '<meta name="webgen-slug" content="' + escapeAttr(slug) + '">';
  if (contactEmail) {
    tags += '\n<meta name="webgen-contact-email" content="' + escapeAttr(contactEmail) + '">';
  }
  if (html.indexOf("</head>") === -1) return html; // malformed HTML — nie blokuj deployu
  return html.replace("</head>", tags + "\n</head>");
}

async function saveToBlob(slug: string, html: string) {
  const blob = await put("sites/" + slug + "/index.html", html, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return blob.url;
}

async function addSubdomain(subdomain: string) {
  const res = await fetch(VERCEL_API + "/v10/projects/" + PROJECT_ID + "/domains?teamId=" + TEAM_ID, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: subdomain }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (data?.error?.code === "domain_already_in_use") {
      return { verified: true, existing: true };
    }
    throw new Error(data?.error?.message || "Vercel API error: " + res.status);
  }

  return data;
}

async function checkDomain(subdomain: string) {
  const res = await fetch(
    VERCEL_API + "/v9/projects/" + PROJECT_ID + "/domains/" + subdomain + "?teamId=" + TEAM_ID,
    { headers: { Authorization: "Bearer " + TOKEN } }
  );
  return res.json();
}

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  const headers = corsHeaders(req);

  const body = await req.json().catch(() => ({}));
  const { slug, html, plan, contact_email, session_id } = body;

  if (!slug || !html) {
    return Response.json({ error: "Wymagane: slug, html" }, { status: 400, headers });
  }

  const finalHtml = injectContactMeta(html, slug, contact_email);

  if (plan && plan !== "free") {
    if (!session_id) {
      return Response.json({ error: "Brak potwierdzenia płatności (session_id)" }, { status: 402, headers });
    }
    try {
      await verifyPaidSession(session_id, slug);
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 402, headers });
    }
  }

  const subdomain = slug + ".webgen.pl";

  try {
    const blobUrl = await saveToBlob(slug, finalHtml);
    console.log("[deploy] Blob saved: " + blobUrl);

    const domainResult = await addSubdomain(subdomain);
    console.log("[deploy] Domain added: " + subdomain, domainResult);

    const domainStatus = await checkDomain(subdomain);

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setMonth(trialEnd.getMonth() + 6);
    const emailReminder = new Date(trialEnd);
    emailReminder.setMonth(emailReminder.getMonth() - 1);

    return Response.json(
      {
        success: true,
        slug,
        subdomain,
        url: "https://" + subdomain,
        blob_url: blobUrl,
        verified: domainStatus.verified ?? false,
        plan: plan || "free",
        trial_end: trialEnd.toISOString().split("T")[0],
        email_reminder_date: emailReminder.toISOString().split("T")[0],
        note: "Plan Start: 6 miesiecy bezplatnie. Email reminder wysylany miesiac przed wygasnieciem.",
      },
      { headers }
    );
  } catch (err) {
    console.error("[deploy] Error:", err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500, headers });
  }
}
