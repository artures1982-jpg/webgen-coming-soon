import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
export const TEMPLATES_DIR = path.join(REPO_ROOT, 'templates', 'pilot');
export const PREVIEW_DIR = path.join(REPO_ROOT, 'preview');

export function toAbs(p) {
  return path.isAbsolute(p) ? p : path.join(REPO_ROOT, p);
}

export function toRel(p) {
  return path.relative(REPO_ROOT, p);
}

// "hydraulik-2-szybka-interwencja.html" -> "hydraulik"
// "auta-z-ameryki-1-zaufany-importer.html" -> "auta-z-ameryki" (nazwy branż same nie zawierają cyfr)
export function branzaOf(fileName) {
  const base = path.basename(fileName, '.html');
  const m = base.match(/^(.+?)-\d+-/);
  return m ? m[1] : base;
}

export function mirrorPathFor(absPath) {
  const rel = toRel(absPath);
  const base = path.basename(absPath);
  if (base.includes('-preview-wypelniony')) return null;
  const branza = branzaOf(base);
  if (rel.startsWith(path.join('templates', 'pilot'))) {
    return path.join(PREVIEW_DIR, branza, base);
  }
  if (rel.startsWith('preview' + path.sep)) {
    return path.join(TEMPLATES_DIR, base);
  }
  return null;
}
