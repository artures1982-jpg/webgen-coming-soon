// Bazowy URL next-app do budowania success_url/cancel_url Stripe (i innych
// bezwzględnych linków) — NIGDY nie hardcoduj domeny, bo next-app dziś żyje pod
// zmieniającym się adresem preview, nie pod produkcyjnym webgen.pl (patrz plan
// docelowego flow aktywacji strony). Kolejność: jawny env > Vercel'owy env
// ustawiany automatycznie na KAŻDYM deployu > origin samego requestu (dev lokalny).
export function getAppUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL;
  return new URL(req.url).origin;
}
