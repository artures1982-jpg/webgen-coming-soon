// Klient Google Analytics Data API (GA4) — czyta zagregowane dane usługi webgen.pl
// (konto serwisowe webgen-analytics-reader@ketobaza-tts.iam.gserviceaccount.com,
// rola Przeglądający, utworzone 2026-09-15). Autoryzacja przez JWT podpisany kluczem
// konta serwisowego (RS256, wbudowany moduł crypto — bez nowej zależności, ten sam
// styl co reszta projektu), wymienany na access token w standardowym OAuth2
// server-to-server flow (grant_type=jwt-bearer). NIE wymaga logowania użytkownika —
// to read-only dostęp do JEDNEJ usługi (webgen.pl), nie do konta Google Artura.
import crypto from "node:crypto";

const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT;
const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

type ServiceAccount = { client_email: string; private_key: string };

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: nowSec + 3600,
    iat: nowSec,
  };
  const signingInput = base64url(JSON.stringify(header)) + "." + base64url(JSON.stringify(claims));
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), sa.private_key);
  const jwt = signingInput + "." + base64url(signature);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed: " + res.status + " " + (await res.text()));
  const data = await res.json();
  return data.access_token;
}

export type AnalyticsSummary = {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  rangeDays: number;
};

// Puste dane (0/0/0) w pierwszych ~48h po utworzeniu usługi to oczekiwany stan
// Google Analytics, nie błąd — patrz project_admin_reply_lead_feature.md /
// pamięć sesji o utworzeniu usługi 2026-09-15.
export async function fetchAnalyticsSummary(rangeDays: number = 7): Promise<AnalyticsSummary> {
  if (!SERVICE_ACCOUNT_JSON || !PROPERTY_ID) {
    throw new Error("GOOGLE_ANALYTICS_SERVICE_ACCOUNT / GOOGLE_ANALYTICS_PROPERTY_ID not set");
  }
  const sa: ServiceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
  const accessToken = await getAccessToken(sa);

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${rangeDays}daysAgo`, endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
  });
  if (!res.ok) throw new Error("runReport failed: " + res.status + " " + (await res.text()));
  const data = await res.json();

  const row = data.rows?.[0]?.metricValues;
  return {
    activeUsers: row ? Number(row[0]?.value || 0) : 0,
    sessions: row ? Number(row[1]?.value || 0) : 0,
    screenPageViews: row ? Number(row[2]?.value || 0) : 0,
    rangeDays,
  };
}
