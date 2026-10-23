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


