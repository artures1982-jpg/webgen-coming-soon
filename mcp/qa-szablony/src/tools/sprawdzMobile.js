import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { toAbs, toRel, REPO_ROOT } from '../lib/paths.js';

const WIDTHS = [320, 340, 360, 375, 390, 414, 480, 600, 700, 720, 768, 820, 900, 960, 1000, 1024, 1100, 1200, 1280];
const SCREENSHOT_DIR = path.join(REPO_ROOT, 'mcp', 'qa-szablony', 'screenshots');

export async function sprawdzMobile(sciezka) {
  const absPath = toAbs(sciezka);
  if (!fs.existsSync(absPath)) throw new Error('Plik nie istnieje: ' + toRel(absPath));
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('file://' + absPath, { waitUntil: 'load' });

    const overflowFindings = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(120);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth + 1) {
        overflowFindings.push({ szerokosc_viewportu: w, scrollWidth, clientWidth, nadmiar_px: scrollWidth - clientWidth });
      }
    }

    // Hamburger — realny klik, nie tylko odczyt CSS (sekcja 6.4: klik technicznie działa,
    // ale overflow-y na ancestrze przycina menu do zera wysokości).
    await page.setViewportSize({ width: 375, height: 900 });
    await page.waitForTimeout(100);
    const hamburgerResult = { obecny: false };
    const toggle = page.locator('.nav-toggle, [class*="hamburger"], [aria-label*="menu" i]').first();
    if ((await toggle.count()) > 0) {
      hamburgerResult.obecny = true;
      await toggle.click();
      await page.waitForTimeout(250);
      const menu = page.locator('#navLinks, .nav-links-mobile, .nav-links.open, .mobile-menu').first();
      if ((await menu.count()) > 0) {
        const box = await menu.boundingBox();
        hamburgerResult.menu_widoczne_po_kliknieciu = !!(box && box.width > 0 && box.height > 0);
        hamburgerResult.bounding_box = box;
      } else {
        hamburgerResult.menu_widoczne_po_kliknieciu = false;
        hamburgerResult.uwaga =
          'nie znaleziono elementu menu po selektorach #navLinks/.nav-links-mobile/.nav-links.open/.mobile-menu — sprawdź ręcznie';
      }
    }

    // Realny scroll przez wheel — NIE scrollIntoView/scrollBy. Przy scroll-behavior:smooth
    // te metody dają fałszywy obraz (pusta/czarna strona); elementy z IntersectionObserver
    // potrzebują chwili po scrollu, żeby się odsłonić.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.mouse.move(195, 400);
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(150);
    }

    const stamp = Date.now();
    const baseName = path.basename(absPath, '.html');
    const shot360Path = path.join(SCREENSHOT_DIR, baseName + '-360-' + stamp + '.png');
    const shot390Path = path.join(SCREENSHOT_DIR, baseName + '-390-' + stamp + '.png');

    await page.setViewportSize({ width: 360, height: 800 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    await page.screenshot({ path: shot360Path, fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    await page.screenshot({ path: shot390Path, fullPage: true });

    return {
      plik: toRel(absPath),
      zasady_zrodlo: 'docs/produkcja-szablonow/ZASADY.md',
      wygenerowano: new Date().toISOString(),
      checks: [
        {
          id: 'overflow_poziomy',
          sekcja: '6.6 / 6.7',
          opis: 'scrollWidth vs clientWidth na zakresie ' + WIDTHS[0] + '-' + WIDTHS[WIDTHS.length - 1] + 'px',
          status: overflowFindings.length ? 'fail' : 'ok',
          znaleziska: overflowFindings,
          wymaga_oceny_wzrokowej: false,
        },
        {
          id: 'hamburger_realny_klik',
          sekcja: '6.4 / 6.3',
          opis: 'Realne kliknięcie w toggle nawigacji + boundingBox menu (nie tylko odczyt CSS na papierze)',
          status: !hamburgerResult.obecny ? 'n-a' : hamburgerResult.menu_widoczne_po_kliknieciu ? 'ok' : 'fail',
          znaleziska: [hamburgerResult],
          wymaga_oceny_wzrokowej: false,
        },
        {
          id: 'karta_na_zdjeciu_hero',
          sekcja: '6.8',
          opis:
            'position:absolute nie generuje overflow, więc to narzędzie NIE ocenia zasłonięcia zdjęcia — ' +
            'dostarcza wyłącznie zrzuty ekranu do oceny wzrokowej',
          status: 'n-a',
          znaleziska: [],
          wymaga_oceny_wzrokowej: true,
        },
      ],
      artefakty: [
        { typ: 'zrzut_ekranu', szerokosc: 360, sciezka: toRel(shot360Path) },
        { typ: 'zrzut_ekranu', szerokosc: 390, sciezka: toRel(shot390Path) },
      ],
    };
  } finally {
    await browser.close();
  }
}
