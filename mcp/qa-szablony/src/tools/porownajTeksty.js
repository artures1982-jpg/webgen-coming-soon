import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { toAbs, toRel } from '../lib/paths.js';

function normalizeWords(text) {
  return text
    .toLowerCase()
    .replace(/\{\{[A-Z_]+\}\}/g, ' TOKEN ')
    .replace(/[^a-ząćęłńóśźż0-9 ]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function nGramOverlap(a, b, n = 4) {
  function grams(words) {
    const s = new Set();
    for (let i = 0; i + n <= words.length; i++) s.add(words.slice(i, i + n).join(' '));
    return s;
  }
  const wa = normalizeWords(a || '');
  const wb = normalizeWords(b || '');
  if (wa.length < n || wb.length < n) {
    const common = wa.filter((w, i) => wb[i] === w).length;
    return wa.length ? common / wa.length : 0;
  }
  const ga = grams(wa);
  const gb = grams(wb);
  let shared = 0;
  for (const g of ga) if (gb.has(g)) shared++;
  const denom = Math.min(ga.size, gb.size) || 1;
  return shared / denom;
}

function firstSentence(text) {
  const m = /^(.*?[.!?])\s/.exec(text);
  return m ? m[1] : text.slice(0, 200);
}

function extractMiejsca(html) {
  const $ = cheerio.load(html);
  const textOf = (el) => $(el).text().replace(/\s+/g, ' ').trim();

  // 1. Karta/akapit kontaktowy — sekcja 5.1 (1): blok zawierający tel: lub {{TELEFON}}
  let kontakt = '';
  $('a[href^="tel:"]').each((_, el) => {
    if (kontakt) return;
    const block = $(el).closest('p, div, li, section').first();
    const t = textOf(block.length ? block : el);
    if (t.length > 20) kontakt = t;
  });
  if (!kontakt) {
    $('*').each((_, el) => {
      if (kontakt) return;
      const t = textOf(el);
      if (t.includes('{{TELEFON}}') && t.length > 20 && t.length < 400 && $(el).children().length <= 2) {
        kontakt = t;
      }
    });
  }

  // 2. Pierwsze zdanie stopki — sekcja 5.1 (2)
  let stopka = '';
  const footer = $('footer').first();
  if (footer.length) stopka = firstSentence(textOf(footer));

  // 3. Otwarcie pierwszej odpowiedzi FAQ — sekcja 5.1 (3). Preferuj .faq-a/.answer/.odpowiedz
  // (rzeczywista treść odpowiedzi); jeśli brak, weź pierwszy <p> spoza nagłówka sekcji
  // (.section-head/.eyebrow) — bez tego wyjątku pierwszy dopasowany <p> to często sam
  // nagłówek sekcji ("Pytania, które i tak padną"), nie treść odpowiedzi.
  let faq = '';
  const faqBlock = $('[class*="faq"], [id*="faq"]').first();
  if (faqBlock.length) {
    let answer = faqBlock.find('[class*="faq-a"], [class*="answer"], [class*="odpowiedz"]').first();
    if (!answer.length) {
      answer = faqBlock
        .find('p')
        .filter((_, el) => !$(el).closest('.section-head, .eyebrow, [class*="eyebrow"]').length)
        .first();
    }
    if (answer.length) faq = firstSentence(textOf(answer));
  }

  return { kontakt, stopka, faq };
}

function porownajMiejsce(nazwa, a, b, sekcja) {
  const overlap = a && b ? nGramOverlap(a, b) : 0;
  return {
    id: 'kalka_' + nazwa,
    sekcja,
    opis: 'Podobieństwo tekstu (' + nazwa + ') między dwoma plikami — n-gram overlap (n=4)',
    status: !a || !b ? 'n-a' : overlap > 0.75 ? 'fail' : overlap > 0.5 ? 'warn' : 'ok',
    znaleziska: [{ plik_a_tekst: a || null, plik_b_tekst: b || null, procent_pokrycia: Math.round(overlap * 100) }],
    wymaga_oceny_wzrokowej: false,
  };
}

function wewnetrznaDuplikacja(html, relSciezka) {
  const $ = cheerio.load(html);
  const timelineTexts = [];
  $('[class*="timeline"], [class*="oswork"], [class*="os-czasu"]')
    .find('p, li, [class*="desc"]')
    .each((_, el) => {
      const t = $(el).text().replace(/\s+/g, ' ').trim();
      if (t.length > 15) timelineTexts.push(t);
    });
  const faqTexts = [];
  $('[class*="faq"], [id*="faq"]')
    .find('p, [class*="answer"], [class*="odpowiedz"]')
    .each((_, el) => {
      const t = $(el).text().replace(/\s+/g, ' ').trim();
      if (t.length > 15) faqTexts.push(t);
    });

  const findings = [];
  for (const t1 of timelineTexts) {
    for (const t2 of faqTexts) {
      const overlap = nGramOverlap(t1, t2);
      if (overlap > 0.6) findings.push({ os_czasu: t1, faq: t2, procent_pokrycia: Math.round(overlap * 100) });
    }
  }

  return {
    id: 'kalka_wewnatrz_pliku_oswork_vs_faq',
    sekcja: '5.1 (duplikacja wewnątrz jednego pliku)',
    opis: 'Ten sam opis kroku procesu powtórzony w osi czasu i w FAQ, plik: ' + relSciezka,
    status: findings.length ? 'warn' : timelineTexts.length && faqTexts.length ? 'ok' : 'n-a',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}

export function porownajTeksty(plikA, plikB) {
  const absA = toAbs(plikA);
  const absB = toAbs(plikB);
  const htmlA = fs.readFileSync(absA, 'utf8');
  const htmlB = fs.readFileSync(absB, 'utf8');
  const ma = extractMiejsca(htmlA);
  const mb = extractMiejsca(htmlB);

  const checks = [
    porownajMiejsce('kontakt', ma.kontakt, mb.kontakt, '5.1 (1) — karta/akapit kontaktowy'),
    porownajMiejsce('stopka', ma.stopka, mb.stopka, '5.1 (2) — pierwsze zdanie stopki'),
    porownajMiejsce('faq', ma.faq, mb.faq, '5.1 (3) — otwarcie pierwszej odpowiedzi FAQ'),
    wewnetrznaDuplikacja(htmlA, toRel(absA)),
    wewnetrznaDuplikacja(htmlB, toRel(absB)),
  ];

  return {
    pliki: [toRel(absA), toRel(absB)],
    zasady_zrodlo: 'docs/produkcja-szablonow/ZASADY.md',
    wygenerowano: new Date().toISOString(),
    checks,
  };
}
