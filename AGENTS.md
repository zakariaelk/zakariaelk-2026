# zakariaelk.com portfolio
Design rules for case study pages (read before changing any layout):
@docs/case-study-design-brief-for-claude-code.md

Rules:
- Don't rewrite or shorten the wording. Content lives in docs/inso-app-case-study-content.md.
- Show every [CONFIRM] marker as a visibly flagged placeholder so I don't miss it.
- Ask before changing the stack or adding dependencies.

Case study conventions:
- Ideas or options weighed against each other: number them, give each its own title (a full phrase, e.g. "Support documentation or an FAQ section, available from the Settings screen"), then "Pros:" in green and "Cons:" in red, each on its own line, the text after them in the normal text colour (Markdoc: `{% pc kind="pros" /%}` / `{% pc kind="cons" /%}`).

Case study conventions:
- Ideas or options weighed against each other: number them, give each its own title (a full phrase, e.g. "Support documentation or an FAQ section, available from the Settings screen"), then "Pros:" in green and "Cons:" in red, each on its own line, the text after them in the normal text colour (Markdoc: `{% pc kind="pros" /%}` / `{% pc kind="cons" /%}`).

## CMS and content (Keystatic, /keystatic)

The site's text is edited in the CMS at https://zakariaelkhachia.com/keystatic (GitHub sign-in; each save is a commit to
main, and Netlify rebuilds in about two minutes). Claude edits the same files directly. Pull before you start.

- Cases: src/content/projects/*.mdoc. INSO is special: the live case is src/content/lab/inso-app-focus.mdoc (7 min) and
  /full/ is inso-app-simple.mdoc, with shared parts in src/content/lab/inso-shared/ (Markdoc partials).
- Page text: src/content/site/home.json (featured cases, in order), about.json, contact.json (CV), notfound.json; name,
  email and LinkedIn in src/content/pages/settings.json. Per case: shortTitle, readTime, listLine for the home page.
- Every Markdoc tag in markdoc.config.mjs needs a matching component in keystatic.config.ts, with the same attributes.
  Without it, the CMS can't open the cases that use that tag. After adding or changing a tag, open /cms-check on the dev
  server. It must say "All … files open and save unchanged".
- Don't name a tag "block" (it clashes with the editor), don't put a `---` rule at the very start of a case, and don't
  use class annotations like `{% .name %}` (the CMS drops them; use a tag, see `verdict`).
- Image paths (cover, previews, figure src) are text, so the CMS never renames or deletes image files. The CV is
  public/cv/cv.pdf (the name the CMS gives an upload), served at /cv/Zakaria-El-Khachia-CV.pdf (netlify.toml).
- scripts/patch-markdoc.mjs fixes a Markdoc bug before each dev and build run. The CMS writes tables as
  `{% table %}` lists, which trigger that bug.
- Private notes (docs/, gitignored, never pushed here): the private repo zakariaelk/zakariaelkhachia-docs. Clone it into
  docs/ when you need them.

## CMS and content (Keystatic, /keystatic)

The site's text is edited in the CMS at https://zakariaelkhachia.com/keystatic (GitHub sign-in; each save is a commit to
main, and Netlify rebuilds in about two minutes). Claude edits the same files directly. Pull before you start.

- Cases: src/content/projects/*.mdoc. INSO is special: the live case is src/content/lab/inso-app-focus.mdoc (7 min) and
  /full/ is inso-app-simple.mdoc, with shared parts in src/content/lab/inso-shared/ (Markdoc partials).
- Page text: src/content/site/home.json (featured cases, in order), about.json, contact.json (CV), notfound.json; name,
  email and LinkedIn in src/content/pages/settings.json. Per case: shortTitle, readTime, listLine for the home page.
- Every Markdoc tag in markdoc.config.mjs needs a matching component in keystatic.config.ts, with the same attributes.
  Without it, the CMS can't open the cases that use that tag. After adding or changing a tag, open /cms-check on the dev
  server. It must say "All … files open and save unchanged".
- Don't name a tag "block" (it clashes with the editor), don't put a `---` rule at the very start of a case, and don't
  use class annotations like `{% .name %}` (the CMS drops them; use a tag, see `verdict`).
- Image paths (cover, previews, figure src) are text, so the CMS never renames or deletes image files. The CV is
  public/cv/cv.pdf (the name the CMS gives an upload), served at /cv/Zakaria-El-Khachia-CV.pdf (netlify.toml).
- scripts/patch-markdoc.mjs fixes a Markdoc bug before each dev and build run. The CMS writes tables as
  `{% table %}` lists, which trigger that bug.
- Private notes (docs/, gitignored, never pushed here): the private repo zakariaelk/zakariaelkhachia-docs. Clone it into
  docs/ when you need them.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)


