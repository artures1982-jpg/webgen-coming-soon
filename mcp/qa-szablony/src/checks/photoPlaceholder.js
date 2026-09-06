export function checkPhotoPlaceholder(html) {
  const findings = [];
  const re = /<!--\s*PHOTO NEEDED[^>]*-->/gi;
  let m;
  while ((m = re.exec(html))) {
    const lineNo = html.slice(0, m.index).split('\n').length;
    findings.push({ linia: lineNo, fragment: m[0] });
  }

  return {
    id: 'photo_placeholder',
    sekcja: 'Checklista weryfikacji (zdjęcia faktycznie widoczne)',
    opis: 'Pozostawione znaczniki <!-- PHOTO NEEDED --> zamiast realnego zdjęcia',
    status: findings.length ? 'fail' : 'ok',
    znaleziska: findings,
    wymaga_oceny_wzrokowej: false,
  };
}
