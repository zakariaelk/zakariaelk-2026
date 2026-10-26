// Shared content for the two full versions of the next design (/next/a/ and /next/b/): the work
// list, the About facts (from the 2026 CV), contact details and the case study's headline results.
import { getImage } from 'astro:assets';
import settings from '../content/pages/settings.json';
import { getProjects } from './data';
import { posterFor } from './media';

export { settings };

/** The CV (PDF to be added by Zakaria at public/cv/Zakaria-El-Khachia-CV.pdf). */
export const CV = '/cv/Zakaria-El-Khachia-CV.pdf';

export const CASE = 'mitigating-risk-with-location-based-alerts'; // the case built in both versions
export const FEATURED = [CASE, 'ngosafety-website-redesign', '3e-international'];

/** Short card titles for the featured work in version A (approved 2026-10-08); the CMS statement
 *  stays as it is for /next/ and version B. */
export const SHORT_TITLES: Record<string, string> = {
  [CASE]: 'Helping humanitarian workers stay informed on the move through safety alerts.',
  'ngosafety-website-redesign': 'Making NGO safety products and services visible and accessible.',
  '3e-international': "Bringing learning through play to a bilingual school's website.",
};

/** Output-focused one-liners for the Selected Work list in version A (proposed 2026-10-10, facts
 *  from each case only); the CMS intros stay as they are for the other pages. */
export const LIST_LINES: Record<string, string> = {
  'conflict-and-humanitarian-data-centre': 'Improving how humanitarians analyse conflict data, across 22 countries.',
  'daga-architects': "A website that carries an architecture firm's bold identity into its international expansion.",
  triotech: 'A lighter, faster website bringing an immersive-attractions company to Chinese audiences.',
  canlife: 'A modern, mobile-ready website helping a winter sports agency reach clients across China.',
  'alwin-capital': "A corporate website that makes a life-science investor's portfolio easy to explore by sector.",
  grace: "An experimental portfolio where web animation becomes part of an artist's storytelling.",
};

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

export const EXPERIENCE = [
  { years: '2023–2026', role: 'UX Designer', org: 'INSO', place: 'The Hague', note: 'A safety alerts app used in 20+ countries, a chat-based learning game for NGO workers and the CHDC redesign across 22 countries.' },
  { years: '2021–2023', role: 'Web Designer & Frontend Developer', org: 'INSO', place: 'The Hague', note: 'Redesigned and built ngosafety.org, plus the INSO brand guide.' },
  { years: '2016–2021', role: 'Web Designer, Frontend Developer & Team Lead', org: 'PBB Creative', place: 'Beijing', note: '20+ web projects, from design to build, and leading the web team.' },
  { years: '2014–2016', role: 'Web Designer & Developer', org: 'Pinyin Studio', place: 'Beijing', note: 'E-commerce sites and interfaces for mobile campaigns.' },
  { years: '2013–2014', role: 'UI Designer (internship)', org: 'Akryl Digital', place: 'Beijing', note: '' },
];

export const EDUCATION = [
  { years: '2011–2012', role: 'Mandarin studies, HSK 4', org: 'Nankai University', place: 'Tianjin' },
  { years: '2008–2013', role: 'Bachelor in Computer Science', org: 'SUPINFO', place: 'Casablanca' },
];

export const EXPERTISE = [
  'Product and UX design',
  'Research and synthesis',
  'Usability testing',
  'Rapid prototyping',
  'Interface design, end to end',
  'Frontend development',
  'Experience strategy',
  'AI-assisted workflows',
];

export const LANGUAGES = ['English', 'Arabic', 'French', 'Dutch (B2)', 'Mandarin (HSK 4)'];

export const TOOLS = ['Figma', 'Maze', 'GA4, Hotjar, Clarity', 'HTML, SCSS, JavaScript, React', 'Photoshop, Illustrator', 'Azure DevOps, Git'];
