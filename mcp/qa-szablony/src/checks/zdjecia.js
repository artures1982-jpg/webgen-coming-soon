import path from 'node:path';
import fs from 'node:fs';
import { TEMPLATES_DIR, branzaOf } from '../lib/paths.js';

function extractPexelsUrls(html) {
  const re = /https:\/\/images\.pexels\.com\/photos\/(\d+)\/[^\s"')]+/g;
  const found = [];
  let m;
  while ((m = re.exec(html))) found.push({ id: m[1], url: m[0] });
  return found;
}

export async function checkZdjeciaPexels(html, absPath) {
  const urls = extractPexelsUrls(html);
  const uniqueById = new Map();
  for (const u of urls) if (!uniqueById.has(u.id)) uniqueById.set(u.id, u.url);

  const httpResults = [];
  for (const [id, url] of uniqueById) {
    let status = null;
    try {
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) });
      status = res.status;
    } catch (e) {
      status = 'ERROR: ' + e.message;
    }
    httpResults.push({ id, url, http: status });
  }

  const base = path.basename(absPath);
  const branza = branzaOf(base);
  const duplikaty = [];
  if (fs.existsSync(TEMPLATES_DIR)) {
    const siblings = fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith('.html') && branzaOf(f) === branza && f !== base);
    for (const sib of siblings) {
      const sibHtml = fs.readFileSync(path.join(TEMPLATES_DIR, sib), 'utf8');
      const sibIds = new Set(extractPexelsUrls(sibHtml).map((u) => u.id));
      for (const id of uniqueById.keys()) {
        if (sibIds.has(id)) duplikaty.push({ id, powtorzone_w: sib });
      }
    }
  }

  const nonOk = httpResults.filter((r) => r.http !== 200);
  const status = nonOk.length || duplikaty.length ? 'fail' : uniqueById.size ? 'ok' : 'warn';

  return {
    id: 'zdjecia_pexels',
    sekcja: '4',
    opis: 'ID zdjęć Pexels wyciągnięte z pliku, status HTTP finalnego URL-a CDN, duplikaty w obrębie tej samej branży',
    status,
    znaleziska: {
      http: httpResults,
      duplikaty,
      uwaga: uniqueById.size === 0 ? 'brak zdjęć Pexels wykrytych w pliku' : undefined,
    },
    wymaga_oceny_wzrokowej: false,
  };
}
