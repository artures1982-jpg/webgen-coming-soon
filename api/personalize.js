// api/personalize.js — Faza 4: platna personalizacja na bazie WYBRANEGO w galerii szablonu.
// Node runtime.
//
// PRZEPISANE 2026-09-13: poprzednia wersja ignorowala templateId i generowala cala strone od
// zera przez Claude (stary system STYLES/promptBuilder.js) — klient placacy za Pro dostawal
// zupelnie inna strone niz ta, ktora wybral i widzial w /galeria/. Teraz bierze REALNY plik
// wybranego szablonu (dokladnie ta sama sciezka co darmowy klient w generator/index.html) i
// mechanicznie podstawia dane firmy + wybrana palete kolorow.
//
// KOREKTA 2026-09-14: warstwa Groq/Pexels (AI-dobor zdjec) usunieta — ryzyko podmiany starannie
// dobranego, branzowo trafnego zdjecia na losowy wynik wyszukiwania bylo wieksze niz realna
// wartosc, a koszt/zlozonosc/punkt awarii realne. Personalizacja tresci kart uslug pozostaje
// odlozona z tego samego powodu (53 pliki pilota maja niespojna, bespoke strukture karty uslugi —
// patrz [[project_personalize_groq_deferred]] i historia tego pliku).
//
// UWAGA PRODUKTOWA: po usunieciu zdjec stad ORAZ po przeniesieniu wyboru palety kolorow do
// wszystkich planow (nie tylko Pro), ten endpoint dziala DZIS identycznie jak darmowa sciezka
// kliencka (fillTemplate+applyPalette w generator/index.html) — jedyna roznica to bramka
// isProEmail. "Personalizacja AI" jako platny wyroznik Pro/Pro Max nie ma juz zadnej realnej
// tresci — zostaje zaflagowane do decyzji: albo tu wraca realna wartosc (tresc kart uslug, gdy
// znaczniki szablonow zostana ujednolicone), albo endpoint i jego bramka znikaja, a Pro/Pro Max
// przechodzi na te sama sciezke kliencka co Start.

const fs = require('fs');
const path = require('path');
const { isProEmail } = require('../lib/entitlement');
const { verifyRequest } = require('../lib/clerk-verify');

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
  var palettes = loadJson('templates/palettes.json') || {};
  var all = [].concat.apply([], Object.keys(palettes).map(function (k) { return palettes[k]; }));
  var p = all.filter(function (x) { return x.id === paletteId; })[0];
  if (!p) return html;
  var css = '<style>:root{--accent:' + p.accent + ';--accent-dark:' + p.accentDark
    + ';--bg:' + p.bg + ';--surface:' + p.surface + ';--text:' + p.text
    + ';--muted:' + p.muted + '}</style>';
  if (html.indexOf('</head>') !== -1) return html.replace('</head>', css + '</head>');
  return css + html;
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

  var html = applyPalette(fillTemplate(rawHtml, firma), firma.paletteId);

  return res.status(200).json({
    success: true,
    html: html,
    slug: slugify(firma.nazwa_strony || firma.nazwa),
    templateId: templateId,
    chars: html.length,
  });
};
