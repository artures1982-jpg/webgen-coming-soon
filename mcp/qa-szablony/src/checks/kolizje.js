import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_DIR } from '../lib/paths.js';

function extractRootVars(html) {
  const m = /:root\s*\{([\s\S]*?)\}/.exec(html);
  if (!m) return { hex: [], head: null, body: null };
  const body = m[1];
  const hex = (body.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map((h) => h.toLowerCase()).sort();
  const headM = /--head\s*:\s*([^;]+);/.exec(body);
  const bodyM = /--body\s*:\s*([^;]+);/.exec(body);
  return {
    hex,
    head: headM ? headM[1].trim() : null,
    body: bodyM ? bodyM[1].trim() : null,
  };
}

export function checkKolizjePaletyFontow(html, absPath) {
  const mine = extractRootVars(html);
  const base = path.basename(absPath);
  const findings = [];

  if (fs.existsSync(TEMPLATES_DIR)) {
    const siblings = fs.readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.html') && f !== base);
    for (const sib of siblings) {
      const sibHtml = fs.readFileSync(path.join(TEMPLATES_DIR, sib), 'utf8');
      const other = extractRootVars(sibHtml);
      if (mine.hex.length && other.hex.length && mine.hex.join(',') === other.hex.join(',')) {
        findings.push({ plik: sib, typ: 'identyczny zestaw hexów w :root' });
      }
      if (mine.head && mine.body && mine.head === other.head && mine.body === other.body) {
        findings.push({ plik: sib, typ: 'identyczna para --head/--body' });
      }
    }
  }

  return {
    id: 'kolizje_palety_fontow',
    sekcja: '0 (różnicowanie palety)',
    opis: 'Identyczny zestaw hexów :root lub identyczna para fontów --head/--body wobec innego pliku w templates/pilot/',
    status: findings.length ? 'warn' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: findings.length > 0,
  };
}
