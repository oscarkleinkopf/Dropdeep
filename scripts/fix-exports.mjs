import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
      continue;
    }
    if (!ent.name.endsWith('.js') || ent.name.endsWith('.raw.js')) continue;

    let c = fs.readFileSync(p, 'utf8');
    const orig = c;
    c = c.replace(/^\uFEFF/gm, '');

    c = c.replace(/^(async )?function /gm, (m, _asyncKw, offset, str) => {
      const before = str.slice(Math.max(0, offset - 10), offset);
      if (/export\s+$/.test(before)) return m;
      return `export ${m}`;
    });

    c = c.replace(/^let promptHubState/m, (m, offset, str) => {
      const before = str.slice(Math.max(0, offset - 10), offset);
      if (/export\s+$/.test(before)) return m;
      return `export ${m}`;
    });

    if (c !== orig) {
      fs.writeFileSync(p, c, 'utf8');
      console.log('fixed', p);
    }
  }
}

walk('src');

let feed = fs.readFileSync('src/ui/feed.js', 'utf8');
if (!feed.includes("from '../state.js'")) {
  feed = `import { state } from '../state.js';\n${feed}`;
  fs.writeFileSync('src/ui/feed.js', feed, 'utf8');
  console.log('added state import to feed.js');
}

console.log('done');
