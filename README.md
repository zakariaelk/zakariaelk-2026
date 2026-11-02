# Zakaria El Khachia — portfolio

Portfolio site built with [Astro](https://astro.build), content managed with [Keystatic](https://keystatic.com), hosted on Netlify.

## Run it locally

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- Content editor: https://zakariaelkhachia.com/keystatic (log in with GitHub; saves are commits to this repo)

## The site

The root (`/` and `/work/<project>/`) is **zakariaelk.com**, ported from the WordPress theme:
same markup and SCSS (`src/styles/classic/`), same URLs, without jQuery/Bootstrap/three.js.
Layout: `src/layouts/Classic.astro`; pages: `src/pages/index.astro`, `src/pages/work/[slug].astro`.

## Design versions

Explorations of the same content, side by side (hidden from search engines):

| URL | Version |
| --- | --- |
| `/yellow/` | Yellow, hand-drawn portrait |
| `/mono/` | Black & white, cartoon face with changing expressions |
| `/bridge/` | Black & white, line bridge + a tiny walker crossing the cities on scroll |
| `/simple/` | Content first, built to be skimmed: problem → what I did → result, plus “what was hard” on each case study |
| `/retro/` | 70s hi-fi: Zakaria's sketched hero (walk from Casablanca to Rotterdam), projects as record sleeves, record player on About |
| `/ux/` | For recruiters: clean career map, one expandable work index, record player on About |
| `/editorial/` | Long-form feature: serif headline, contents, case studies as chapters, one colour-field quote |

The versions are set by URL prefix (`src/lib/variant.ts`), colours by `[data-theme]` in `src/styles/global.css`.


## Where things live

| What | Where |
| --- | --- |
| Projects (case studies) | `src/content/projects/*.mdoc` |
| Home page text, site settings | `src/content/pages/home.json`, `settings.json` |
| About page | `src/content/pages/about/index.mdoc` |
| Images | `src/assets/…` (optimised at build time) |
| Videos | `public/media/…` (MP4) |
| Design tokens (colours, type, spacing) | `src/styles/global.css` |
| Hero portrait + greeting bubble | `src/components/HeroPortrait.astro` (line drawing), `CartoonFace.astro` (cartoon, preview at /cartoon) |
| Get in touch button (mailto + shows the email) | `src/components/GetInTouch.astro` |
| Footer bridge animation | `src/components/BridgeBuild.astro` |
| City monuments | `src/components/Monument.astro` |
| Animated intro concept | `src/pages/concept.astro` (not linked, not indexed) |

## Deploy

Every push to `main` deploys on Netlify (build command and Node version are in `netlify.toml`).
