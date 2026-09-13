// Faza 0 migracji do Next.js — eksperyment: czy zakaz template literals w api/*.js
// (CLAUDE.md, spowodowany zachowaniem esbuild ESM→CJS na starym Edge bundlerze Vercela)
// dotyczy też Route Handlers w Next.js, czy był to problem specyficzny dla poprzedniego
// setupu. Świadomie używamy dokładnie tego wzorca, który wcześniej crashował build.
export async function GET() {
  const KEY = process.env.TEST_KEY || "dummy-key";
  const headers = { Authorization: `Bearer ${KEY}` };
  const subject = `Testowy temat — ${new Date().toISOString()}`;
  return Response.json({ ok: true, headers, subject });
}
