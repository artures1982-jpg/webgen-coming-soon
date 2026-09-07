import { extractStyleBlocks, extractRules, parseDeclarations } from '../lib/cssParse.js';

function selectorsInclude(selector, needle) {
  return selector.split(',').some((s) => s.trim().includes(needle));
}

function hasDecl(ruleList, prop, valuePred) {
  for (const r of ruleList) {
    for (const d of parseDeclarations(r.body)) {
      if (d.prop === prop && (!valuePred || valuePred(d.value))) return true;
    }
  }
  return false;
}

export function checkZabezpieczenieLogo(html) {
  const blocks = extractStyleBlocks(html);
  let rules = [];
  for (const b of blocks) rules = rules.concat(extractRules(b.text));

  const logoRules = rules.filter(
    (r) => selectorsInclude(r.selector, '.logo') && !selectorsInclude(r.selector, '.logo-name')
  );
  const logoNameRules = rules.filter((r) => selectorsInclude(r.selector, '.logo-name'));
  const navActionsRules = rules.filter((r) => selectorsInclude(r.selector, '.nav-actions'));
  // Kontener nav (np. ".nav .wrap") z justify-content:space-between/flex-end dosuwa
  // .nav-actions do prawej równie skutecznie jak margin-left:auto na samym .nav-actions —
  // to alternatywna, równoważna implementacja tego samego wymogu (znalezione realnie w
  // auta-z-ameryki-1: .nav .wrap{justify-content:space-between}, bez margin-left:auto).
  const navContainerRules = rules.filter((r) => /nav/i.test(r.selector) && !selectorsInclude(r.selector, '.nav-actions'));

  const minWidth0 = hasDecl(logoRules, 'min-width', (v) => v.replace(/\s/g, '') === '0' || v.replace(/\s/g, '') === '0px');
  const inlineBlock = hasDecl(logoNameRules, 'display', (v) => v.trim() === 'inline-block');
  const overflowHidden = hasDecl(logoNameRules, 'overflow', (v) => v.trim() === 'hidden');
  const ellipsis = hasDecl(logoNameRules, 'text-overflow', (v) => v.trim() === 'ellipsis');
  const marginLeftAuto = hasDecl(navActionsRules, 'margin-left', (v) => v.trim() === 'auto');
  const parentPushesRight = hasDecl(navContainerRules, 'justify-content', (v) => /space-between|flex-end/.test(v));
  const navActionsRightAligned = marginLeftAuto || parentPushesRight;

  const findings = [];
  if (!minWidth0) findings.push({ brak: '.logo (bez .logo-name) min-width:0' });
  if (!inlineBlock) findings.push({ brak: '.logo-name display:inline-block' });
  if (!overflowHidden) findings.push({ brak: '.logo-name overflow:hidden' });
  if (!ellipsis) findings.push({ brak: '.logo-name text-overflow:ellipsis' });
  if (!navActionsRightAligned) {
    findings.push({ brak: '.nav-actions dosunięte do prawej (margin-left:auto NA .nav-actions LUB justify-content:space-between/flex-end na kontenerze nav)' });
  }

  return {
    id: 'zabezpieczenie_logo',
    sekcja: '6.5 / 6.6',
    opis:
      'Zabezpieczenie logo/navu przed rozjazdem na mobile przy długiej nazwie firmy klienta ' +
      '(SAMPLE_TOKENS jest za krótkie, żeby to złapać ręcznie)',
    status: findings.length ? 'fail' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
