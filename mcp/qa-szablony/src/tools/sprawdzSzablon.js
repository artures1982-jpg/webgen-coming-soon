import fs from 'node:fs';
import { toAbs, toRel } from '../lib/paths.js';
import { checkHexPozaRoot } from '../checks/hex.js';
import { checkTokeny } from '../checks/tokeny.js';
import { checkGramatykaMiasto } from '../checks/miasto.js';
import { checkBalansTagow } from '../checks/tagi.js';
import { checkPhotoPlaceholder } from '../checks/photoPlaceholder.js';
import { checkZabezpieczenieLogo } from '../checks/logo.js';
import { checkMapaEmbed } from '../checks/mapa.js';
import { checkPrefersReducedMotion } from '../checks/motion.js';
import { checkZdjeciaPexels } from '../checks/zdjecia.js';
import { checkKolizjePaletyFontow } from '../checks/kolizje.js';
import { checkDiffCssRodzenstwo } from '../checks/diffCss.js';
import { checkMirrorSpojnosc } from '../checks/mirror.js';

export async function sprawdzSzablon(sciezka) {
  const absPath = toAbs(sciezka);
  const relPath = toRel(absPath);
  if (!fs.existsSync(absPath)) {
    throw new Error('Plik nie istnieje: ' + relPath);
  }
  const html = fs.readFileSync(absPath, 'utf8');

  const checks = [
    checkHexPozaRoot(html),
    checkTokeny(html, relPath),
    checkGramatykaMiasto(html),
    checkBalansTagow(html),
    checkPhotoPlaceholder(html),
    checkZabezpieczenieLogo(html),
    checkMapaEmbed(html, relPath),
    checkPrefersReducedMotion(html),
    await checkZdjeciaPexels(html, absPath),
    checkKolizjePaletyFontow(html, absPath),
    checkDiffCssRodzenstwo(html, absPath),
    checkMirrorSpojnosc(absPath),
  ];

  const podsumowanie = { ok: 0, fail: 0, warn: 0, 'n-a': 0, wymaga_oceny_wzrokowej: 0 };
  for (const c of checks) {
    podsumowanie[c.status] = (podsumowanie[c.status] || 0) + 1;
    if (c.wymaga_oceny_wzrokowej) podsumowanie.wymaga_oceny_wzrokowej++;
  }

  return {
    plik: relPath,
    zasady_zrodlo: 'docs/produkcja-szablonow/ZASADY.md',
    wygenerowano: new Date().toISOString(),
    checks,
    podsumowanie,
  };
}
