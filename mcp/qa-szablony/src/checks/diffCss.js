import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATES_DIR, branzaOf } from '../lib/paths.js';
import { extractStyleBlocks, extractRules, parseDeclarations } from '../lib/cssParse.js';

const GENERIC_SELECTORS = new Set([
  '*', 'body', 'html', 'a', 'ul', 'li', 'img', '.btn', '.wrap', 'p', 'h1', 'h2', 'h3', 'h4',
  '::before', '::after', '*,*::before,*::after', ':root',
]);

function styleLines(html) {
  const blocks = extractStyleBlocks(html);
  const text = blocks.map((b) => b.text).join('\n');
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Metryka jednoznacznie zdefiniowana (peer feedback 2026-09-04: stare raporty QA mieszały
// jednostki, np. "414 linii różnych / 226 linii stylu" — licznik > mianownik, bo `diff`
// liczy obie strony osobno). Współczynnik Dice'a: 2×|wspólne linie| / (|A|+|B|),
// symetryczny, zawsze 0-100, bez tej niejednoznaczności.
function diceCoefficient(linesA, linesB) {
  const countA = new Map();
  for (const l of linesA) countA.set(l, (countA.get(l) || 0) + 1);
  const countB = new Map();
  for (const l of linesB) countB.set(l, (countB.get(l) || 0) + 1);
  let shared = 0;
  for (const [l, cA] of countA) {
    shared += Math.min(cA, countB.get(l) || 0);
  }
  const total = linesA.length + linesB.length;
  return total === 0 ? 0 : (2 * shared / total) * 100;
}

function similarSelectorBlocks(html, otherHtml, limit = 5) {
  const rulesA = extractStyleBlocks(html).flatMap((b) => extractRules(b.text));
  const rulesB = extractStyleBlocks(otherHtml).flatMap((b) => extractRules(b.text));
  const byBSelector = new Map();
  for (const r of rulesB) {
    const key = r.selector.trim();
    if (!byBSelector.has(key)) byBSelector.set(key, []);
    byBSelector.get(key).push(r);
  }

  const results = [];
  for (const rA of rulesA) {
    const key = rA.selector.trim();
    if (GENERIC_SELECTORS.has(key)) continue;
    const candidates = byBSelector.get(key);
    if (!candidates) continue;
    const declsA = new Set(parseDeclarations(rA.body).map((d) => d.prop + ':' + d.value.trim()));
    for (const rB of candidates) {
      const declsB = new Set(parseDeclarations(rB.body).map((d) => d.prop + ':' + d.value.trim()));
      const common = [...declsA].filter((d) => declsB.has(d));
      if (common.length === 0) continue;
      const union = new Set([...declsA, ...declsB]).size;
      const overlap = (common.length / union) * 100;
      results.push({ selektor: key, wspolne_wlasciwosci: common, procent_pokrycia: Math.round(overlap) });
    }
  }
  results.sort((a, b) => b.procent_pokrycia - a.procent_pokrycia);
  return results.slice(0, limit);
}

export function checkDiffCssRodzenstwo(html, absPath) {
  const base = path.basename(absPath);
  const branza = branzaOf(base);
  const wyniki = [];

  if (fs.existsSync(TEMPLATES_DIR)) {
    const siblings = fs
      .readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith('.html') && branzaOf(f) === branza && f !== base);
    const linesA = styleLines(html);
    for (const sib of siblings) {
      const sibHtml = fs.readFileSync(path.join(TEMPLATES_DIR, sib), 'utf8');
      const linesB = styleLines(sibHtml);
      const percent = diceCoefficient(linesA, linesB);
      wyniki.push({
        plik: sib,
        procent_wspolnych_linii_css: Math.round(percent * 10) / 10,
        najbardziej_podobne_bloki_selektorow: similarSelectorBlocks(html, sibHtml),
      });
    }
  }

  const maxPercent = wyniki.reduce((m, w) => Math.max(m, w.procent_wspolnych_linii_css), 0);

  return {
    id: 'diff_css_rodzenstwo',
    sekcja: '0 (bespoke wykonanie, zero reużycia layoutu)',
    opis:
      'Podobieństwo CSS wobec rodzeństwa tej samej branży — WYŁĄCZNIE przesłanka do oceny, NIGDY werdykt. ' +
      'Wszystkie szablony dzielą boilerplate (reset/flex/media queries), więc wysoki % nie musi znaczyć ' +
      'kopiowania, a realne reużycie mechanizmu sekcji może siedzieć w mniejszości linii. ' +
      'Metryka: współczynnik Dice\'a = 2×|wspólne linie CSS, po odfiltrowaniu generycznych selektorów| / ' +
      '(|linie A|+|linie B|) × 100 — symetryczny, zawsze 0-100 (zastępuje niejednoznaczny stary `diff | wc -l`). ' +
      'Orientacyjny próg z ZASADY.md sekcja 0: >40-50% współdzielonych linii to sygnał do sprawdzenia ręcznego.',
    status: wyniki.length === 0 ? 'n-a' : maxPercent > 40 ? 'warn' : 'ok',
    znaleziska: wyniki,
    wymaga_oceny_wzrokowej: true,
  };
}
