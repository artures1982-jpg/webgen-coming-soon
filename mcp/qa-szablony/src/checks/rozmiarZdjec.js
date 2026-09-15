// Złapane realnie 2026-09-15: karty usług/sekcji "o nas" masowo kopiowały dokładnie ten sam
// URL Pexels (z tymi samymi parametrami w=/h=) co zdjęcie hero, mimo że renderują się w dużo
// mniejszym kontenerze — 142/151 (94%) nie-hero zdjęć w audycie 53 szablonów miało to dokładne
// 1:1 dopasowanie do rozmiaru hero swojego pliku. Skutek: 50-250 KiB niepotrzebnie ściąganych
// na obrazek (image-delivery-insight w Lighthouse). Ani designer-ux-ui, ani ta kontrola wcześniej
// tego nie łapały — ZASADY.md sekcja 4 mówiła o wyborze/weryfikacji zdjęcia, nie o dopasowaniu
// jego rozmiaru pobierania do rozmiaru wyświetlania. Patrz ZASADY.md sekcja 4a.
function extractPexelsImgs(html) {
  const re = /<img\b[^>]*\bsrc="(https:\/\/images\.pexels\.com\/photos\/(\d+)\/[^"]+)"[^>]*>/g;
  const found = [];
  let m;
  while ((m = re.exec(html))) {
    const [full, url, id] = m;
    const wMatch = url.match(/[?&]w=(\d+)/);
    const hMatch = url.match(/[?&]h=(\d+)/);
    const lineNo = html.slice(0, m.index).split('\n').length;
    found.push({
      linia: lineNo,
      id,
      url,
      w: wMatch ? Number(wMatch[1]) : null,
      h: hMatch ? Number(hMatch[1]) : null,
      tag: full,
    });
  }
  return found;
}

export function checkRozmiarZdjec(html) {
  const imgs = extractPexelsImgs(html);
  if (imgs.length === 0) {
    return {
      id: 'rozmiar_zdjec_vs_hero',
      sekcja: '4a',
      opis: 'Czy nie-hero zdjęcia Pexels kopiują dokładnie te same parametry w=/h= co zdjęcie hero (sygnał kopiuj-wklej bez dopasowania do realnego kontenera)',
      status: 'n-a',
      znaleziska: { uwaga: 'brak zdjęć Pexels wykrytych w pliku' },
      wymaga_oceny_wzrokowej: false,
    };
  }

  // Pierwsze zdjęcie Pexels w dokumencie = hero, niezależnie od użytej klasy CSS — kolejność
  // dokumentu jest jedynym niezawodnym wskaźnikiem (nazwy klas hero są niespójne między
  // szablonami: hero-img/hero-photo/hero-banner/big/tl-photo, sprawdzone audytem 53 plików).
  const [hero, ...reszta] = imgs;

  const podejrzane = reszta.filter((img) => img.w != null && img.h != null && img.w === hero.w && img.h === hero.h);

  return {
    id: 'rozmiar_zdjec_vs_hero',
    sekcja: '4a',
    opis: 'Czy nie-hero zdjęcia Pexels kopiują dokładnie te same parametry w=/h= co zdjęcie hero (sygnał kopiuj-wklej bez dopasowania do realnego kontenera)',
    status: podejrzane.length ? 'fail' : 'ok',
    znaleziska: {
      hero: { linia: hero.linia, id: hero.id, w: hero.w, h: hero.h },
      podejrzane: podejrzane.map((img) => ({ linia: img.linia, id: img.id, w: img.w, h: img.h })),
    },
    wymaga_oceny_wzrokowej: false,
  };
}
