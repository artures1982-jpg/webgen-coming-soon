export function checkPrefersReducedMotion(html) {
  const hasMotionSource = /@keyframes/i.test(html) || /\btransition\s*:/i.test(html);
  if (!hasMotionSource) {
    return {
      id: 'prefers_reduced_motion',
      sekcja: 'Motion baseline (feedback_motion_baseline_pro_variants)',
      opis: 'Plik nie ma @keyframes/transition — reguła nie dotyczy',
      status: 'n-a',
      znaleziska: [],
      wymaga_oceny_wzrokowej: false,
    };
  }

  const re = /@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/gi;
  const m = re.exec(html);
  if (!m) {
    return {
      id: 'prefers_reduced_motion',
      sekcja: 'Motion baseline (feedback_motion_baseline_pro_variants)',
      opis: 'Plik ma animacje (@keyframes/transition), ale brak bloku @media (prefers-reduced-motion: reduce)',
      status: 'fail',
      znaleziska: [],
      wymaga_oceny_wzrokowej: false,
    };
  }

  let d = 1;
  let k = m.index + m[0].length;
  while (k < html.length && d > 0) {
    if (html[k] === '{') d++;
    else if (html[k] === '}') d--;
    k++;
  }
  const body = html.slice(m.index + m[0].length, k - 1);
  const disables =
    /animation\s*:\s*none/i.test(body) ||
    /animation-duration\s*:\s*0/i.test(body) ||
    /transition\s*:\s*none/i.test(body) ||
    /transition-duration\s*:\s*0/i.test(body) ||
    /scroll-behavior\s*:\s*auto/i.test(body);

  return {
    id: 'prefers_reduced_motion',
    sekcja:
      'Motion baseline (feedback_motion_baseline_pro_variants) — uzupełnienie 2026-09-04: sprawdza TREŚĆ ' +
      'bloku, nie tylko jego obecność (pusty/dekoracyjny blok przechodziłby sam warunek "istnieje")',
    opis:
      'Blok prefers-reduced-motion:reduce musi realnie wyłączać animacje/transitiony ' +
      '(animation:none / *-duration:0 / transition:none), nie być pusty',
    status: disables ? 'ok' : 'fail',
    znaleziska: disables
      ? []
      : [{ info: 'blok istnieje, ale nie znaleziono deklaracji realnie wyłączającej animację/transition', tresc_bloku: body.trim().slice(0, 400) }],
    wymaga_oceny_wzrokowej: false,
  };
}
