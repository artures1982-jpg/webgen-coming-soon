import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { sprawdzSzablon } from './tools/sprawdzSzablon.js';
import { sprawdzMobile } from './tools/sprawdzMobile.js';
import { porownajTeksty } from './tools/porownajTeksty.js';

const server = new McpServer({ name: 'qa-szablony', version: '0.1.0' });

server.registerTool(
  'sprawdz_szablon',
  {
    title: 'Sprawdź szablon',
    description:
      'Deterministyczne kontrole jakości pliku szablonu webgen.pl wg docs/produkcja-szablonow/ZASADY.md: ' +
      'hex poza :root (1), gramatyka {{MIASTO}} (2), embed mapy (3), zdjęcia Pexels (4), zabezpieczenie ' +
      'logo (6.5/6.6), prefers-reduced-motion, balans tagów, PHOTO NEEDED, kolizje palety/fontów i diff CSS ' +
      'rodzeństwa (0), spójność mirrora templates/pilot<->preview. Zwraca ustrukturyzowany raport JSON, każdy ' +
      'check z numerem sekcji ZASADY.md i statusem ok/fail/warn/n-a.',
    inputSchema: {
      sciezka: z
        .string()
        .describe('Ścieżka do pliku .html względem repo (np. templates/pilot/hydraulik-1-zaufany-fachowiec.html)'),
    },
  },
  async ({ sciezka }) => {
    const raport = await sprawdzSzablon(sciezka);
    return { content: [{ type: 'text', text: JSON.stringify(raport, null, 2) }] };
  }
);

server.registerTool(
  'sprawdz_mobile',
  {
    title: 'Sprawdź mobile (Playwright)',
    description:
      'Realny render Playwright: skan poziomego overflow 320-1280px (sekcja 6.6/6.7), realny klik hamburgera ' +
      'z odczytem boundingBox po kliknięciu (6.4), realny scroll przez mouse.wheel (nie scrollIntoView — ' +
      'scroll-behavior:smooth daje fałszywy pusty render), zrzuty ekranu 360/390px jako artefakty. Reguła 6.8 ' +
      '(karta na zdjęciu hero) NIE jest oceniana automatycznie — position:absolute nie generuje overflow, więc ' +
      'zwraca wyłącznie zrzuty do oceny wzrokowej.',
    inputSchema: {
      sciezka: z.string().describe('Ścieżka do pliku .html względem repo'),
    },
  },
  async ({ sciezka }) => {
    const raport = await sprawdzMobile(sciezka);
    return { content: [{ type: 'text', text: JSON.stringify(raport, null, 2) }] };
  }
);

server.registerTool(
  'porownaj_teksty',
  {
    title: 'Porównaj teksty dwóch wariantów',
    description:
      'Sekcja 5.1 ZASADY.md: wykrywa kalki tekstowe między dwoma wariantami tej samej branży w trzech stałych ' +
      'miejscach (akapit kontaktowy, pierwsze zdanie stopki, otwarcie odpowiedzi FAQ) + duplikację wewnątrz ' +
      'jednego pliku (opis kroku w osi czasu vs w FAQ).',
    inputSchema: {
      plik_a: z.string().describe('Ścieżka do pierwszego pliku .html względem repo'),
      plik_b: z.string().describe('Ścieżka do drugiego pliku .html względem repo'),
    },
  },
  async ({ plik_a, plik_b }) => {
    const raport = porownajTeksty(plik_a, plik_b);
    return { content: [{ type: 'text', text: JSON.stringify(raport, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
