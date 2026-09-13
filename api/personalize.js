// api/personalize.js — Faza 4: platna personalizacja AI na bazie WYBRANEGO w galerii szablonu.
// Node runtime (dluzszy limit czasu niz Edge Hobby — potrzebne na wywolania AI Gateway + Pexels).
//
// PRZEPISANE 2026-09-13: poprzednia wersja ignorowala templateId i generowala cala strone od
// zera przez Claude (stary system STYLES/promptBuilder.js) — klient placacy za Pro dostawal
// zupelnie inna strone niz ta, ktora wybral i widzial w /galeria/. Teraz: bierzemy REALNY plik
// wybranego szablonu (dokladnie ta sama sciezka co darmowy klient w generator/index.html),
// mechanicznie podstawiamy dane firmy + wybrana palete kolorow, a Groq (przez Vercel AI Gateway,
// bez SDK) dostosowuje WYLACZNIE dobor zdjec z Pexels do konkretnej branzy/uslug klienta — nigdy
// nie generuje ani nie dotyka surowego HTML/CSS szablonu, wiec nie moze go zepsuc.
//
// Uwaga o zakresie: personalizacja tresci kart uslug (tytuly/opisy dopasowane do realnej listy
// uslug/lat doswiadczenia klienta z formularza) byla w pierwotnym zamysle tego przepisania, ale
// kazdy z 53 plikow pilota ma inna, bespoke strukture karty uslugi (rozne klasy, <ul> vs <p>,
// rozna liczba elementow) — bezpieczny, generyczny regex na "tytul karty uslugi" bez ryzyka
// zepsucia HTML nie istnieje przy takiej roznorodnosci. Odlozone do czasu ujednolicenia znacznikow
// (np. wspolny data-atrybut na karcie uslugi dodawany przy produkcji szablonu).

const fs = require('fs');
const path = require('path');
const { isProEmail } = require('../lib/entitlement');
const { verifyRequest } = require('../lib/clerk-verify');

const AI_GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const AI_MODEL = 'openai/gpt-oss-120b';
const ALLOWED_ORIGINS = ['https://webgen.pl', 'https://www.webgen.pl'];

function loadJson(relPath) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8')); }
  catch (err) { return null; }
}

function slugify(name) {
  return (name || 'firma')
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim().slice(0, 30) || 'firma';
}

function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Serwerowy bliźniak fillTemplate() z generator/index.html — lista tokenów musi zostać
// zsynchronizowana ręcznie przy zmianie (ten sam wzorzec co komentarz przy oryginale).
function fillTemplate(html, firma) {
  var map = {
    '{{NAZWA_STRONY}}': firma.nazwa_strony || firma.nazwa || firma.branza || 'Firma',
    '{{MIASTO}}': firma.miasto || '',
    '{{TELEFON}}': firma.telefon || '',
    '{{EMAIL}}': firma.email || '',
    '{{ADRES}}': firma.adres || '',
    '{{GODZINY_PON_PT}}': firma.godz_pon_pt || '8:00–18:00',
    '{{GODZINY_SOB}}': firma.godz_sob || '9:00–14:00',
    '{{SLUG}}': slugify(firma.nazwa_strony || firma.nazwa),
  };
  var result = html;
  Object.keys(map).forEach(function (token) { result = result.split(token).join(map[token]); });
  return result;
}

// Bliźniak applyPalette() z generator/index.html — wstrzykuje nadpisanie :root tuż przed
// </head>, więc oryginalny blok :root szablonu zostaje nietknięty (późniejsza reguła wygrywa).
function applyPalette(html, paletteId) {
  if (!paletteId) return html;
  var palettes = loadJson('templates/palettes.json') || [];
  var p = palettes.filter(function (x) { return x.id === paletteId; })[0];
  if (!p) return html;
  var css = '<style>:root{--accent:' + p.accent + ';--accent-dark:' + p.accentDark
    + ';--bg:' + p.bg + ';--surface:' + p.surface + ';--text:' + p.text
    + ';--muted:' + p.muted + '}</style>';
  if (html.indexOf('</head>') !== -1) return html.replace('</head>', css + '</head>');
  return css + html;
}

// Wszystkie <img> ze zdefiniowanym class+alt — niezależnie od konkretnej nazwy klasy (każdy
// z 53 plików pilota nazywa slot zdjęcia inaczej: hero-photo, safety-photo, banner-img...).
function findPhotoSlots(html) {
  var slots = [];
  var re = /<img\b[^>]*>/g;
  var m;
  while ((m = re.exec(html))) {
    var tag = m[0];
    var classMatch = tag.match(/\bclass="([^"]*)"/);
    var altMatch = tag.match(/\balt="([^"]*)"/);
    if (classMatch && altMatch) slots.push({ tag: tag, cls: classMatch[1], alt: altMatch[1] });
  }
  return slots;
}

function buildImgTag(oldTag, newSrc, newAlt) {
  var t = oldTag.replace(/\bsrc="[^"]*"/, 'src="' + newSrc + '"');
  if (/\balt="/.test(t)) t = t.replace(/\balt="[^"]*"/, 'alt="' + escapeAttr(newAlt) + '"');
  return t;
}

async function searchPexels(query) {
  if (!PEXELS_KEY || !query) return null;
  try {
    var r = await fetch('https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=1', {
      headers: { Authorization: PEXELS_KEY },
    });
    if (!r.ok) return null;
    var data = await r.json();
    var photo = data.photos && data.photos[0];
    return photo ? { src: (photo.src && (photo.src.large || photo.src.medium)) || '', alt: query } : null;
  } catch (err) {
    return null;
  }
}

// Pyta Groq (przez Vercel AI Gateway, zwykly fetch — bez SDK) o zapytania Pexels dopasowane do
// konkretnej branzy/miasta/uslug klienta. Model NIGDY nie widzi ani nie zwraca HTML — tylko
// liste zapytan tekstowych w JSON, co eliminuje ryzyko zepsucia znacznikow strony.
async function askAiForPhotoQueries(slots, firma) {
  if (!AI_GATEWAY_KEY || slots.length === 0) return null;
  var slotsDesc = slots.map(function (s, i) {
    return (i + 1) + '. obecny opis zdjęcia: "' + s.alt + '"';
  }).join('\n');
  var prompt = 'Firma: branża ' + (firma.branza || '?') + ', miasto ' + (firma.miasto || '?')
    + (firma.uslugi_lista && firma.uslugi_lista.length ? ', usługi: ' + firma.uslugi_lista.join(', ') : '')
    + '.\n\nStrona ma ' + slots.length + ' zdjęć wymagających dopasowania. Dla każdego, na bazie'
    + ' obecnego opisu, zaproponuj zapytanie wyszukiwania w serwisie Pexels (PO ANGIELSKU, 3-6 słów,'
    + ' konkretne, bez nazwy firmy) które znajdzie zdjęcie lepiej pasujące do TEJ konkretnej firmy'
    + ' i jej usług niż zdjęcie generyczne.\n\n' + slotsDesc
    + '\n\nOdpowiedz WYŁĄCZNIE surowym JSON, bez markdown, bez komentarzy: '
    + '{"queries": ["...", "..."]} — dokładnie ' + slots.length + ' elementów, w tej samej kolejności.';

  try {
    var r = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + AI_GATEWAY_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: AI_MODEL, messages: [{ role: 'user', content: prompt }], stream: false }),
    });
    if (!r.ok) return null;
    var data = await r.json();
    var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) return null;
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    var parsed = JSON.parse(jsonMatch[0]);
    if (!parsed || !Array.isArray(parsed.queries)) return null;
    return parsed.queries;
  } catch (err) {
    return null;
  }
}

module.exports = async function (req, res) {
  var reqOrigin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.indexOf(reqOrigin) !== -1 ? reqOrigin : ALLOWED_ORIGINS[1]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var authSession = await verifyRequest(req);
  if (!authSession) return res.status(401).json({ error: 'Brak autoryzacji' });
  var email = authSession.email;

  var body = req.body || {};
  var templateId = body.templateId;
  var firma = body.firma;

  if (!templateId || !firma) {
    return res.status(400).json({ error: 'Brak templateId lub firma' });
  }

  var isPro = await isProEmail(email);
  if (!isPro) {
    return res.status(402).json({ error: 'Personalizacja AI wymaga aktywnego planu Pro', code: 'PRO_REQUIRED' });
  }

  var manifest = loadJson('templates/manifest.json') || [];
  var tpl = manifest.filter(function (t) { return t.id === templateId; })[0];
  if (!tpl) {
    return res.status(404).json({ error: 'Nie znaleziono szablonu: ' + templateId });
  }

  var rawHtml;
  try {
    rawHtml = fs.readFileSync(path.join(__dirname, '..', 'templates', 'pilot', tpl.id + '.html'), 'utf8');
  } catch (err) {
    return res.status(500).json({ error: 'Nie udało się wczytać pliku szablonu' });
  }

  // Krok 1: to samo co dostaje darmowy klient — mechaniczne podstawienie danych + wybrana paleta.
  var html = applyPalette(fillTemplate(rawHtml, firma), firma.paletteId);
  var usedAi = false;

  // Krok 2: AI-dobór zdjęć — opcjonalna nakładka. Jeśli cokolwiek zawiedzie (brak klucza, błąd
  // sieci, zły JSON, brak wyników Pexels), klient i tak dostaje w pełni działającą, poprawnie
  // zabrandowaną stronę z kroku 1 — nigdy twardy błąd z tego powodu (to nie jedyna droga
  // dostarczenia usługi, w przeciwieństwie do np. api/contact-form.js).
  try {
    var slots = findPhotoSlots(html);
    var queries = await askAiForPhotoQueries(slots, firma);
    if (queries) {
      var results = await Promise.all(queries.map(function (q) { return searchPexels(q); }));
      slots.forEach(function (slot, i) {
        var found = results[i];
        if (!found || !found.src) return;
        html = html.split(slot.tag).join(buildImgTag(slot.tag, found.src, slot.alt));
        usedAi = true;
      });
    }
  } catch (err) {
    // celowo cicho — patrz komentarz wyżej
  }

  return res.status(200).json({
    success: true,
    html: html,
    slug: slugify(firma.nazwa_strony || firma.nazwa),
    templateId: templateId,
    model: usedAi ? AI_MODEL : null,
    chars: html.length,
  });
};
