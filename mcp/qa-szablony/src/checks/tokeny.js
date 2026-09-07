export function checkTokeny(html, relPath) {
  const count = (html.match(/\{\{[A-Z_]+\}\}/g) || []).length;
  const isWypelniony = relPath.includes('-preview-wypelniony');

  if (isWypelniony) {
    return {
      id: 'tokeny_liczba',
      sekcja: 'Checklista weryfikacji — uzupełnienie 2026-09-04 (wersja wypełniona)',
      opis: 'Wersja wypełniona (dane przykładowe) nie może zawierać niepodstawionych tokenów {{...}}',
      status: count > 0 ? 'fail' : 'ok',
      znaleziska: count > 0 ? [{ liczba_pozostalych_tokenow: count }] : [],
      wymaga_oceny_wzrokowej: false,
    };
  }

  return {
    id: 'tokeny_liczba',
    sekcja: 'Checklista weryfikacji (grep -c "{{")',
    opis: 'Wersja z literalnymi tokenami {{...}} — sprawdza, że tokeny nie zostały przypadkiem podstawione',
    status: count === 0 && relPath.includes('templates/pilot') ? 'warn' : 'ok',
    znaleziska: [{ liczba_tokenow: count }],
    wymaga_oceny_wzrokowej: false,
  };
}
