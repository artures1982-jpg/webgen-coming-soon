#!/usr/bin/env node
// scripts/generate-templates.js — Faza 1: jednorazowe generowanie zamrożonych szablonów.
// Uruchamiać RĘCZNIE lokalnie (nie jest to endpoint Vercel). Wynik commitować do repo.
//
// Użycie:
//   node scripts/generate-templates.js                 → wszystkie 16 branż (32 szablony)
//   node scripts/generate-templates.js "Hydraulik,Elektryk"  → tylko wskazane branże (test/smoke)
//
// Wymaga ANTHROPIC_API_KEY (czyta z .env w katalogu repo, jeśli nie jest już w env).

const fs = require('fs');
const path = require('path');
const { STYLES, buildTemplatePrompt } = require('../lib/promptBuilder');

const ROOT = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const HTML_DIR = path.join(TEMPLATES_DIR, 'html');
const MANIFEST_PATH = path.join(TEMPLATES_DIR, 'manifest.json');

function loadDotEnv() {
  if (process.env.ANTHROPIC_API_KEY) return;
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadDotEnv();

// Musi być zgodne 1:1 z wartościami ustawianymi przez selectBranzaTile() w panel-1
// (test/generator/index.html) — inaczej filtr Galerii Startowej po branży nie dopasuje szablonu.
// styleFree/stylePro: styl wizualny każdego z dwóch szablonów na branżę (Faza 1: 1 free + 1 pro).
const INDUSTRIES = [
  { industry: 'Hydraulik', icon: '🚧', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Elektryk', icon: '⚡', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Remonty & budowa', icon: '🏗️', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Wykończenia wnętrz', icon: '🪟', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Mechanik', icon: '🔧', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Sprzątanie', icon: '🧹', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Ogrodnik', icon: '🌿', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Stomatolog', icon: '🦷', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Salon kosmetyczny', icon: '💎', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Fryzjer / Barber', icon: '✂️', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Fizjoterapia', icon: '🦴', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Restauracja', icon: '🍽️', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Kawiarnia', icon: '☕', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Trener / Siłownia', icon: '💪', styleFree: 'classic', stylePro: 'modern' },
  { industry: 'Fotograf', icon: '📷', styleFree: 'classic', stylePro: 'elegant' },
  { industry: 'Nieruchomości', icon: '🏠', styleFree: 'classic', stylePro: 'modern' },
];

function slugifyId(industry, tier) {
  const base = industry.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();
  return base + '-' + tier;
}

// Firma z tokenami placeholder zamiast prawdziwych danych klienta — patrz
// TEMPLATE_TOKEN_INSTRUCTION w lib/promptBuilder.js, która instruuje Claude żeby wstawił je
// dosłownie. Pola NIE-identyfikujące (usp/faq/obszar) zostają puste celowo, żeby Claude
// wygenerował dobrą, generyczną treść marketingową dla danej branży (to część szablonu).
function buildTokenFirma(industry) {
  return {
    nazwa: '{{NAZWA_STRONY}}',
    nazwa_strony: '{{NAZWA_STRONY}}',
    branza: industry,
    miasto: '{{MIASTO}}',
    dzielnica: '',
    telefon: '{{TELEFON}}',
    email: '{{EMAIL}}',
    adres: '{{ADRES}}',
    godz_pon_pt: '{{GODZINY_PON_PT}}',
    godz_sob: '{{GODZINY_SOB}}',
    lata: '',
    realizacje: '',
    opis: '',
    nazwa_firma: '',
    nip: '',
    adres_firma: '',
    galeria: [],
    heroUrl: '',
    logo_base64: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    google_ocena: '',
    google_opinie: '',
    usp: [],
    faq: [],
    obszar: '',
    certyfikaty: '',
    platnosci: '',
    keywords: '',
    uslugi_lista: [],
  };
}

async function callClaude(styleConfig, firmaTokens) {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) throw new Error('Brak ANTHROPIC_API_KEY (ustaw w .env lub środowisku)');

  const userPrompt = buildTemplatePrompt(styleConfig, firmaTokens);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: styleConfig.system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const rawText = await r.text();
  if (!r.ok) {
    let errMsg = rawText;
    try { errMsg = JSON.parse(rawText)?.error?.message || rawText; } catch (e) {}
    throw new Error('Claude API ' + r.status + ': ' + String(errMsg).slice(0, 300));
  }

  const data = JSON.parse(rawText);
  let html = (data.content?.[0]?.text || '').trim();
  if (html.startsWith('```html')) html = html.slice(7);
  else if (html.startsWith('```')) html = html.slice(3);
  if (html.endsWith('```')) html = html.slice(0, -3);
  html = html.trim();
  if (!html.includes('</body>')) html += '\n</body>';
  if (!html.includes('</html>')) html += '\n</html>';

  if (html.length < 500) throw new Error('Za krótka odpowiedź (' + html.length + ' znaków)');
  return html;
}

async function main() {
  const filterArg = process.argv[2];
  const filterList = filterArg ? filterArg.split(',').map(s => s.trim().toLowerCase()) : null;
  const industriesToRun = filterList
    ? INDUSTRIES.filter(i => filterList.includes(i.industry.toLowerCase()))
    : INDUSTRIES;

  if (filterList && industriesToRun.length === 0) {
    console.error('Brak dopasowania dla: ' + filterArg);
    console.error('Dostępne branże: ' + INDUSTRIES.map(i => i.industry).join(', '));
    process.exit(1);
  }

  fs.mkdirSync(HTML_DIR, { recursive: true });

  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  console.log('Generuję ' + industriesToRun.length + ' branż x 2 (free+pro) = ' + (industriesToRun.length * 2) + ' szablonów...\n');

  for (const item of industriesToRun) {
    for (const tier of ['free', 'pro']) {
      const style = tier === 'free' ? item.styleFree : item.stylePro;
      const styleConfig = STYLES[style];
      const id = slugifyId(item.industry, tier);
      const file = 'html/' + id + '.html';

      process.stdout.write('→ ' + item.industry + ' [' + tier + '/' + style + ']... ');
      try {
        const firmaTokens = buildTokenFirma(item.industry);
        const html = await callClaude(styleConfig, firmaTokens);
        fs.writeFileSync(path.join(TEMPLATES_DIR, file), html, 'utf8');

        manifest = manifest.filter(m => m.id !== id);
        manifest.push({
          id,
          industry: item.industry,
          icon: item.icon,
          style,
          styleName: styleConfig.name,
          tier,
          file,
          previewImage: '',
        });
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
        console.log('OK (' + html.length + ' znaków)');
      } catch (err) {
        console.log('BŁĄD: ' + err.message);
      }
    }
  }

  console.log('\nGotowe. Manifest: ' + MANIFEST_PATH + ' (' + manifest.length + ' szablonów).');
}

main();
