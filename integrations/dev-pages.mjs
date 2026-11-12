// Older design explorations and versions of the site (src/dev-pages/, laid out like src/pages): routes on the dev
// server only, so they're not in the production build and 404 on the live site. src/dev-pages sits next to
// src/pages, so the pages keep their relative imports. To publish one again, move it back into src/pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function devPages() {
  return {
    name: 'dev-pages',
    hooks: {
      'astro:config:setup': ({ command, config, injectRoute }) => {
        if (command !== 'dev') return;
        const dir = path.join(fileURLToPath(config.root), 'src/dev-pages');
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.astro') ? [path.join(d, e.name)] : []));
        for (const file of walk(dir)) {
          const rel = path.relative(dir, file).replace(/\.astro$/, '').split(path.sep).join('/');
          injectRoute({ pattern: `/${rel.replace(/(^|\/)index$/, '')}`, entrypoint: `./src/dev-pages/${path.relative(dir, file).split(path.sep).join('/')}` });
        }
      },
    },
  };
}
