import fs from 'node:fs';
import { mirrorPathFor, toRel } from '../lib/paths.js';

export function checkMirrorSpojnosc(absPath) {
  const mirror = mirrorPathFor(absPath);

  if (!mirror) {
    return {
      id: 'mirror_spojnosc',
      sekcja: 'Pipeline krok 8 (README.md) — uzupełnienie 2026-09-04',
      opis: 'Plik -preview-wypelniony jest pochodną (generowaną podstawieniem), nie ma odpowiednika mirror',
      status: 'n-a',
      znaleziska: [],
      wymaga_oceny_wzrokowej: false,
    };
  }

  if (!fs.existsSync(mirror)) {
    return {
      id: 'mirror_spojnosc',
      sekcja: 'Pipeline krok 8 (README.md) — uzupełnienie 2026-09-04',
      opis: 'Brak pliku mirror pod oczekiwaną ścieżką',
      status: 'fail',
      znaleziska: [{ oczekiwana_sciezka: toRel(mirror) }],
      wymaga_oceny_wzrokowej: false,
    };
  }

  const a = fs.readFileSync(absPath, 'utf8');
  const b = fs.readFileSync(mirror, 'utf8');
  const identical = a === b;
  let pierwszaRozbieznaLinia = null;
  if (!identical) {
    const linesA = a.split('\n');
    const linesB = b.split('\n');
    for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
      if (linesA[i] !== linesB[i]) {
        pierwszaRozbieznaLinia = i + 1;
        break;
      }
    }
  }

  return {
    id: 'mirror_spojnosc',
    sekcja:
      'Pipeline krok 8 (README.md) — uzupełnienie 2026-09-04: templates/pilot/ i preview/<branża>/ muszą być ' +
      'bajt-w-bajt identyczne (realny przypadek: mirror w preview/ miał treść sprzed poprawek copywritera)',
    opis: 'Zgodność pliku z jego mirror-em (templates/pilot/ <-> preview/<branża>/)',
    status: identical ? 'ok' : 'fail',
    znaleziska: identical ? [] : [{ mirror: toRel(mirror), pierwsza_rozbiezna_linia: pierwszaRozbieznaLinia }],
    wymaga_oceny_wzrokowej: false,
  };
}
