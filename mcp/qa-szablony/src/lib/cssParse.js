export function extractStyleBlocks(html) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) {
    blocks.push({ text: m[1], index: m.index + m[0].indexOf(m[1]) });
  }
  return blocks;
}

// Parser CSS świadomy nawiasów klamrowych — schodzi w głąb @media/@supports,
// pomija @keyframes/@font-face jako nieistotne dla naszych checków.
export function extractRules(cssText) {
  const rules = [];

  function parseBlock(text) {
    let depth = 0;
    let selectorStart = 0;
    for (let j = 0; j < text.length; j++) {
      const ch = text[j];
      if (ch === '{' && depth === 0) {
        const selector = text.slice(selectorStart, j).trim();
        let d = 1;
        let k = j + 1;
        while (k < text.length && d > 0) {
          if (text[k] === '{') d++;
          else if (text[k] === '}') d--;
          k++;
        }
        const body = text.slice(j + 1, k - 1);
        const atLower = selector.toLowerCase();
        if (atLower.startsWith('@media') || atLower.startsWith('@supports')) {
          parseBlock(body);
        } else if (!atLower.startsWith('@')) {
          rules.push({ selector, body });
        }
        selectorStart = k;
        j = k - 1;
      }
    }
  }

  parseBlock(cssText);
  return rules;
}

export function parseDeclarations(body) {
  return body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const idx = d.indexOf(':');
      if (idx === -1) return null;
      return { prop: d.slice(0, idx).trim().toLowerCase(), value: d.slice(idx + 1).trim() };
    })
    .filter(Boolean);
}
