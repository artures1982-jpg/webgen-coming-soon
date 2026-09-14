// Logika deployu strony klienta (Vercel Blob + subdomena) i zapisu powiązania
// klient→strona na koncie Clerk — wydzielona z api/deploy/route.ts, żeby ten sam
// kod mógł wywoływać zarówno darmowa ścieżka (klient woła bezpośrednio po kliknięciu
// "Aktywuj stronę") jak i webhook Stripe (płatne plany, po potwierdzeniu płatności,
// patrz api/webhooks/stripe/route.ts).
//
// NAJWYŻSZE RYZYKO w całym projekcie: zapisuje do PRAWDZIWEGO Vercel Blob (ten sam
// bucket co produkcja) i dodaje subdomeny do PRAWDZIWEGO projektu Vercel przez
// VERCEL_PROJECT_ID. Nie testować z realnymi credentialami produkcyjnymi bez
// świadomej decyzji.
import { put } from "@vercel/blob";
import { clerkClient } from "@/lib/clerk-verify";

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

export async function saveToBlob(pathPrefix: string, slug: string, html: string): Promise<string> {
  const blob = await put(pathPrefix + "/" + slug + "/index.html", html, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function addSubdomain(subdomain: string) {
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

export async function checkDomain(subdomain: string) {
  const res = await fetch(
    VERCEL_API + "/v9/projects/" + PROJECT_ID + "/domains/" + subdomain + "?teamId=" + TEAM_ID,
    { headers: { Authorization: "Bearer " + TOKEN } }
  );
  return { status: res.status, data: await res.json() };
}

// Sluga nie sprawdzano dotąd wcale — addSubdomain() traktuje "domain_already_in_use"
// jako sukces, więc dwóch klientów z tą samą nazwą firmy cicho nadpisywało sobie
// nawzajem stronę (ten sam deterministyczny path w Blob, addRandomSuffix:false).
// Wywołuj PRZED saveToBlob/addSubdomain, żeby zablokować kolizję zamiast ją ukrywać.
export async function isSlugTaken(slug: string): Promise<boolean> {
  const { status, data } = await checkDomain(slug + ".webgen.pl");
  // Vercel zwraca 404 + {error:{code:"not_found"}} gdy domena nie istnieje.
  if (status === 404) return false;
  return !!(data && data.name && !data.error);
}

export type DeployResult = {
  slug: string;
  subdomain: string;
  url: string;
  blobUrl: string;
  verified: boolean;
};

export async function performDeploy(slug: string, html: string, contactEmail?: string): Promise<DeployResult> {
  const finalHtml = injectContactMeta(html, slug, contactEmail);
  const subdomain = slug + ".webgen.pl";

  const blobUrl = await saveToBlob("sites", slug, finalHtml);
  console.log("[deploy-site] Blob saved: " + blobUrl);

  const domainResult = await addSubdomain(subdomain);
  console.log("[deploy-site] Domain added: " + subdomain, domainResult);

  const { data: domainStatus } = await checkDomain(subdomain);

  return {
    slug,
    subdomain,
    url: "https://" + subdomain,
    blobUrl,
    verified: domainStatus?.verified ?? false,
  };
}

// Jedyny trwały zapis "ten klient ma tę stronę" — unsafeMetadata na koncie Clerk,
// zamiast nowej bazy danych (patrz plan). updateUserMetadata() robi deep-merge na
// unsafeMetadata (potwierdzone w node_modules/@clerk/backend), więc nie nadpisuje
// accountType/profileFirma zapisanych wcześniej przez GeneratorShell.
export async function updateUserSiteMetadata(
  clerkUserId: string,
  info: { firma_slug: string; site_url: string; site_plan: string }
) {
  if (!clerkClient) {
    console.error("deploy-site: clerkClient not initialized (brak CLERK_SECRET_KEY)");
    return;
  }
  await clerkClient.users.updateUserMetadata(clerkUserId, {
    unsafeMetadata: {
      firma_slug: info.firma_slug,
      site_url: info.site_url,
      site_plan: info.site_plan,
      site_activated_at: new Date().toISOString(),
    },
  });
}
