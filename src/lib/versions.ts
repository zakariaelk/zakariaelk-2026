// Shared content for the two full versions of the next design (/next/a/ and /next/b/): the work
// list, the About facts (from the 2026 CV), contact details and the case study's headline results.
import { getImage } from 'astro:assets';
import settings from '../content/pages/settings.json';
// the page texts, edited in the CMS (keystatic.config.ts: Home page, About page, Contact and footer)
import home from '../content/site/home.json';
import about from '../content/site/about.json';
import contact from '../content/site/contact.json';
import { getProjects } from './data';
import { posterFor } from './media';

export { settings, home, about, contact };

/** The CV: public/cv/cv.pdf, uploaded in the CMS (Contact and footer), which always saves it under that name. The live
 *  site serves it at this address too (netlify.toml), the one already shared; the dev server links the file itself. */
export const CV = import.meta.env.DEV ? contact.cv : '/cv/Zakaria-El-Khachia-CV.pdf';

export const CASE = 'mitigating-risk-with-location-based-alerts'; // the case built in both versions
/** The featured cases, in order (CMS: Home page); the rest of the work follows by each project's order. */
export const FEATURED: string[] = home.featured;

/** Where a project's case study lives from inside a version: the INSO case has its own page in
 *  each version, the others use the shared /next/work/ template. */
// the site (base "/") has every case at /work/<slug>/; the versions under /next/ and /tests/ only the INSO one
export const caseHref = (base: string, id: string) => (base === '/' || id === CASE ? `${base}work/${id}/` : `/next/work/${id}/`);

/** The case study pages of a version: the INSO case, with NGOSafety as the next project. */
export async function caseStaticPaths() {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === CASE)!;
  const next = projects.find((p) => p.id === 'ngosafety-website-redesign')!;
  return [{ params: { slug: CASE }, props: { project, next } }];
}

export async function workList() {
  const projects = await getProjects();
  const featured = await Promise.all(FEATURED.map(async (id) => {
    const p = projects.find((x) => x.id === id)!;
    const video = p.data.featuredVideo;
    const poster = video ? posterFor(video) : undefined;
    const posterSrc = poster ? (await getImage({ src: poster, format: 'webp', width: 1600 })).src : undefined;
    return { p, video, poster, posterSrc };
  }));
  const more = projects.filter((p) => !FEATURED.includes(p.id));
  return { projects, featured, more };
}

/** The INSO case's headline results, as written in the case (numbers and their context). */
export const RESULTS = [
  { value: '4.1/5', label: 'onboarding satisfaction after the redesign', note: '31 responses; before, only ~30% understood the app' },
  { value: '100%', label: 'task success filtering alerts by location', note: 'task-based usability test on Maze' },
  { value: '~13s', label: 'faster to understand an alert', note: 'after reordering the alert detail screen' },
];

// the About page's lists (CMS: About page)
export const { experience: EXPERIENCE, education: EDUCATION, expertise: EXPERTISE, languages: LANGUAGES, tools: TOOLS } = about;
