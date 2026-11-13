import { createElement } from 'react';
import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper, inline, mark } from '@keystatic/core/content-components';

// The CMS (Keystatic, at /keystatic). Every Markdoc tag in markdoc.config.mjs needs a component here with the same
// attributes, or the CMS can't open the cases that use it. After adding one, open /cms-check on the dev server: it
// reads every case the way the CMS does and lists anything that would change on save.
const t = (label: string, description?: string) => fields.text({ label, description });
const tl = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const yes = (label: string) => fields.checkbox({ label, defaultValue: false });
const pick = (label: string, values: [string, string][], defaultValue = values[0][0]) =>
  fields.select({ label, options: values.map(([value, l]) => ({ value, label: l })), defaultValue });
const icon = (text: string) => createElement('span', { style: { fontWeight: 600, fontSize: 12 } }, text);
const frames: [string, string][] = [['', 'None'], ['before', 'Before (grey)'], ['after', 'After (blue)'], ['compare', 'Before and after in one visual']];

const video = block({
  label: 'Video',
  schema: {
    src: t('Video path', 'e.g. /media/projects/my-project/clip.mp4 (files live in public/media)'),
    alt: t('Caption / description'),
    portrait: yes('Portrait (phone) video'),
    webm: t('WebM version (optional)'),
    poster: t('Poster image (optional)'),
    device: pick('Device frame', [['', 'None'], ['desktop', 'Desktop'], ['phone', 'Phone']]),
  },
});

const carousel = wrapper({
  label: 'Carousel',
  schema: { caption: t('Caption') },
});

// Case study blocks (story template). Each one tells the reader something specific:
// see docs/case-study-design-brief-for-claude-code.md
const imagePath = (label: string) =>
  t(label, 'Image: path in src/assets (projects/<slug>/file.jpg). Video: /media/projects/<slug>/file.mp4');
const iconNames = ['eye', 'friction', 'did', 'testing', 'interviews', 'partners', 'pushback', 'bricks', 'face-confused', 'face-bulb', 'face-smiling', 'face-introspect', 'face-happy', 'face-satisfied', 'face-sad', 'face-doubtful'];
const storyBlocks = {
  glance: wrapper({ label: 'At a glance panel', schema: {} }),
  stats: wrapper({
    label: 'Key numbers',
    schema: {
      variant: pick('Layout', [['panel', 'Panel (stacked)'], ['strip', 'Strip (in a row)']]),
      label: t('Accessible name'),
      caption: t('Caption'),
    },
  }),
  stat: block({ label: 'Key number', schema: { value: t('Number'), label: t('Label (include the sample size)') } }),
  scope: wrapper({ label: 'Role and scope list', schema: {} }),
  need: wrapper({ label: 'Need (the user’s pain point)', schema: {} }),
  friction: wrapper({ label: 'Friction (max 3 sentences)', schema: {} }),
  move: wrapper({ label: 'What I did', schema: { label: t('Label') } }),
  result: wrapper({
    label: 'Result (max 3 sentences)',
    schema: {
      value: t('Large number (optional, older drafts)'),
      label: t('Number label, with sample size'),
      note: t('Small line: the numbers, sample size and who answered'),
      kind: pick('Evidence', [['', 'Result'], ['testing', 'What testing showed (prototype tests)'], ['interviews', 'What interviews showed'], ['partners', 'What partners said (survey)']]),
    },
  }),
  figure: block({
    label: 'Figure (image or video with a caption)',
    schema: {
      src: imagePath('Image or video'),
      alt: tl('Alt text (what changed, not “screenshot”)'),
      caption: tl('Caption'),
      frame: pick('Frame', frames),
      size: pick('Width', [['wide', 'Wide'], ['text', 'Text column'], ['half', 'Half (inside a pair)']]),
      notes: tl('Annotations (separate with |)'),
      badges: t('Numbered badges: x,y|x,y in % of the image'),
      spots: t('With badges: the part each one points at, x1,x2,y1,y2|… in %'),
      related: yes('Shows the result above it (kept close to it)'),
    },
  }),
  pair: wrapper({ label: 'Before / after pair', schema: { caption: t('Caption'), side: yes('Side by side') } }),
  quote: wrapper({ label: 'Tester quote', schema: { by: t('Role and country only') } }),
  reflection: wrapper({ label: 'Reflection (two lists)', schema: {} }),
  confirm: inline({ label: 'Confirm flag', schema: { note: t('What to confirm'), label: t('Label') } }),
  tip: inline({ label: 'Term with a note on hover', schema: { text: t('Term'), note: tl('Note') } }),
  problem: wrapper({ label: 'Numbered problem', schema: { n: t('Number'), title: t('Title') } }),
  sourceline: inline({ label: 'Source line (small, grey)', schema: { text: t('Text') } }),
  sequence: block({
    label: 'Sequence (one screen at a time)',
    schema: {
      images: tl('Images in src/assets, comma-separated'),
      alts: tl('Alt text per screen, separated by |'),
      caption: tl('Caption'),
      captions: tl('Caption per screen, separated by |'),
      fulls: tl('Full-size images, comma-separated (optional)'),
      frame: pick('Frame', frames),
      thumbs: yes('Show thumbnails'),
      landscape: yes('Landscape screens'),
    },
  }),
  reactions: block({ label: 'Character reacting to old screens', schema: { set: t('Slides set in src/lib/reactions.ts') } }),
  br: inline({ label: 'Line break', schema: {} }),
  pc: inline({ label: 'Pros / Cons label', schema: { kind: pick('Kind', [['pros', 'Pros'], ['cons', 'Cons']]) } }),
  mark: inline({ label: 'Highlighted sentence', schema: { text: t('Highlighted text'), color: pick('Colour', [['', 'Orange'], ['green', 'Green']]) } }),
  iconblock: wrapper({
    label: 'Icon block (icon + title + text)',
    schema: {
      icon: pick('Icon (each used once)', [['', 'None'], ...iconNames.map((i): [string, string] => [i, i.replace('face-', 'Face: ')])]),
      title: t('Narrative title (optional)'),
      source: t('Source line'),
      result: yes('A finding with no source line'),
      note: yes('Tinted box pointing elsewhere'),
    },
  }),
  options: wrapper({ label: 'Options (cards side by side)', schema: {} }),
  option: wrapper({ label: 'Option card', schema: { title: t('Title') } }),
  verdict: wrapper({ label: 'Verdict (a short conclusion right after results)', schema: {} }),
  tablebox: wrapper({ label: 'Table that can be folded away', schema: { label: t('Toggle label') } }),
  usertable: wrapper({ label: 'User table (who, needs, pains)', schema: { label: t('Label'), photos: t('Photos, comma-separated'), alts: t('Alt text per photo, separated by |') } }),
  attempts: block({ label: 'Usability results (one dot per attempt)', schema: { rows: tl('Rows'), caption: tl('Caption') } }),
  scrollshot: block({ label: 'Long page scrolling in a monitor', schema: { src: imagePath('Image'), alt: tl('Alt text'), caption: tl('Caption') } }),
  n: inline({ label: 'Numbered badge', schema: { v: t('Number') } }),
  imagelink: block({ label: 'Text link to an image', schema: { src: imagePath('Image'), label: t('Link text') } }),
  cta: block({ label: '“Take a look” button', schema: { href: t('Link'), label: t('Label') } }),
  usagechart: block({ label: 'Usage chart (monthly active and returning users)', schema: { caption: t('Caption') } }),
  missing: block({ label: 'Missing image flag', schema: { file: t('What is needed'), label: t('Label') } }),
  partial: block({ label: 'Shared section (edit it under “INSO shared sections”)', schema: { file: t('File') } }),
  // review tools: they show on the dev server only, never on the live site
  ab: wrapper({ label: 'Review: A/B wording', schema: { v: pick('Version', [['a', 'A'], ['b', 'B']]) } }),
  ver: wrapper({
    label: 'Review: Current / Updated version',
    schema: { v: pick('Version', [['current', 'Current'], ['updated', 'Updated']]), tag: t('Label'), gone: yes('Cut in Updated'), goneItems: t('Cut list items (1,2…)'), chgItems: t('Changed list items (1,2…)') },
  }),
  pending: inline({ label: 'Review: pending value', schema: { text: t('Text'), note: t('Note') } }),
  cut: block({ label: 'Review: cut marker', schema: { note: t('Note'), end: yes('End marker') } }),
  chg: mark({ label: 'Review: added text', icon: icon('+'), schema: {}, tag: 'mark' }),
  gone: mark({ label: 'Review: cut text', icon: icon('−'), schema: {}, tag: 's' }),
  del: mark({ label: 'Struck-through text', icon: icon('S'), schema: {}, tag: 'del' }),
};

const body = (dir: string) =>
  fields.markdoc({
    label: 'Content',
    options: {
      image: { directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` },
    },
    components: { video, carousel, ...storyBlocks },
  });

const list = (label: string, item = 'Line', description?: string) =>
  fields.array(t(item), { label, description, itemLabel: (p) => p.value });
const paragraphs = (label: string, description?: string) =>
  fields.array(tl('Paragraph'), { label, description, itemLabel: (p) => p.value.slice(0, 70) });
// cover and preview images are paths, not uploads: an image field renames its file on every save and deletes the old
// one, and the INSO cover is shared by five entries. To use a new image, upload it into the case text with the image
// button first (it lands in src/assets/projects/<case>/), then paste its path here.
const img = (label: string) => t(label, 'e.g. ../../assets/projects/<case>/cover.jpg');

// a case study's fields (the cases, and the INSO case's versions)
const caseSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  headline: t('Headline (big title on the case page)'),
  client: t('Client (short name, above the headline)'),
  org: t('Organisation (featured card and case label; replaces Client when filled)'),
  projectName: t('Project name (browser tab and featured card)'),
  lede: paragraphs('Intro under the title (one or two short paragraphs)'),
  role: t('Role'),
  team: fields.array(
    fields.object({ name: t('Name (or a short line)'), role: t('Role (optional)'), url: t('Link (optional, e.g. LinkedIn)') }),
    { label: 'Team', itemLabel: (p) => p.fields.name.value },
  ),
  duration: t('Timeline'),
  deliverables: list('Deliverables', 'Deliverable'),
  link: t('“Take a look” link (the live site)'),
  cover: img('Cover image'),
  featuredVideo: t('Featured card video (path in public/, e.g. /media/…mp4)'),
  shortTitle: tl('Featured card title (home page)'),
  readTime: t('Reading time on the featured card (e.g. “6 min read”)'),
  listLine: tl('One line in the “Other work” list (home page)'),
  order: fields.integer({ label: 'Order in “Other work” (lower comes first)', defaultValue: 99 }),
  statement: tl('Statement (page description for search engines; featured card fallback)'),
  intro: tl('Short intro (fallback for the card and list lines)'),
  summary: tl('Summary (older designs)'),
  showIntro: fields.checkbox({ label: 'Show the intro under the title (older designs)', defaultValue: true }),
  tagline: t('Tagline (older designs)'),
  projectType: t('Project type (older designs)'),
  sector: t('Sector (older designs)'),
  year: t('Year'),
  featured: fields.checkbox({ label: 'Featured (older designs; the home page uses Home page → Featured cases)', defaultValue: false }),
  tier: pick('Type', [['case', 'Case study'], ['earlier', 'Earlier work (short entry)']]),
  layout: pick('Template (older designs)', [['classic', 'Classic (side menu)'], ['story', 'Story']]),
  problem: tl('In short: the problem (older designs)'),
  did: tl('In short: what I did (older designs)'),
  result: tl('In short: the result (older designs)'),
  hard: tl('In short: what was hard (older designs)'),
  previews: fields.array(img('Preview image'), { label: 'Hover previews (older designs)' }),
  menu: fields.array(
    fields.object({
      group: t('Group title (optional)'),
      items: fields.array(fields.object({ label: t('Menu label'), heading: t('Heading it jumps to (exact text)') }), { label: 'Items', itemLabel: (p) => p.fields.label.value }),
    }),
    { label: 'Side menu (older designs)', itemLabel: (p) => p.fields.group.value || 'Sections' },
  ),
  // review tools, shown on the dev server only
  ledeB: paragraphs('Review: intro, version B'),
  updated: fields.object(
    { lede: paragraphs('Intro'), team: list('Team', 'Name'), deliverables: list('Deliverables', 'Deliverable') },
    { label: 'Review: the Updated version’s intro and facts' },
  ),
  content: body('projects'),
};

export default config({
  // Edits are saved as commits to GitHub (main), and Netlify rebuilds the live site in about two minutes.
  // On the dev server, edits are saved straight to the files here.
  storage: import.meta.env.DEV ? { kind: 'local' } : { kind: 'github', repo: 'zakariaelk/zakariaelk-2026' },
  ui: {
    brand: { name: 'Zakaria El Khachia' },
    navigation: {
      'Case studies': ['projects', 'insoVersions', 'insoShared'],
      Pages: ['home', 'about', 'contact', 'notFound', 'settings'],
    },
  },
  collections: {
    projects: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['client', 'year'],
      schema: caseSchema,
    }),
    // the live INSO case is inso-app-focus (7 minutes) with inso-app-simple as its full version
    insoVersions: collection({
      label: 'INSO case: versions',
      slugField: 'title',
      path: 'src/content/lab/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: caseSchema,
    }),
    insoShared: collection({
      label: 'INSO case: shared sections (shown in both versions)',
      slugField: 'title',
      path: 'src/content/lab/inso-shared/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: { title: fields.slug({ name: { label: 'Name' } }), content: body('projects') },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/site/home',
      format: { data: 'json' },
      schema: {
        title: t('Browser tab title'),
        description: tl('Description for search engines'),
        featured: fields.array(fields.relationship({ label: 'Case', collection: 'projects' }), {
          label: 'Featured cases, in order',
          description: 'The other cases follow in the “Other work” list, by their Order number.',
          itemLabel: (p) => p.value ?? '',
        }),
      },
    }),
    about: singleton({
      label: 'About page',
      path: 'src/content/site/about',
      format: { data: 'json' },
      schema: {
        title: t('Browser tab title'),
        description: tl('Description for search engines'),
        statement: tl('Statement (big text at the top)'),
        based: t('Where I’m based (the availability from Site settings follows)'),
        story: paragraphs('About me'),
        experience: fields.array(
          fields.object({ years: t('Years'), role: t('Role'), org: t('Organisation'), place: t('City'), note: tl('Note (optional)') }),
          { label: 'Experience', itemLabel: (p) => `${p.fields.years.value} · ${p.fields.role.value}, ${p.fields.org.value}` },
        ),
        education: fields.array(
          fields.object({ years: t('Years'), role: t('Study'), org: t('School'), place: t('City') }),
          { label: 'Education', itemLabel: (p) => `${p.fields.years.value} · ${p.fields.role.value}` },
        ),
        expertise: list('Expertise'),
        languages: list('Languages', 'Language'),
        tools: list('Tools'),
        awayTitle: t('Last section title'),
        away: tl('Last section text'),
      },
    }),
    contact: singleton({
      label: 'Contact and footer',
      path: 'src/content/site/contact',
      format: { data: 'json' },
      schema: {
        question: t('First line'),
        invite: t('Second line', 'The word in [brackets] links to your email (Site settings).'),
        status: t('Status line (with the green dot)'),
        cv: fields.file({ label: 'CV (PDF only)', description: 'Saved as cv.pdf; the site links it as /cv/Zakaria-El-Khachia-CV.pdf.', directory: 'public/cv', publicPath: '/cv/' }),
        cvLabel: t('CV link text'),
      },
    }),
    notFound: singleton({
      label: '404 page (address not found)',
      path: 'src/content/site/notfound',
      format: { data: 'json' },
      schema: { statement: t('Statement'), line: t('Line below'), button: t('Button') },
    }),
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/pages/settings',
      format: { data: 'json' },
      schema: {
        name: t('Name'),
        email: t('Email'),
        linkedin: t('LinkedIn link'),
        availability: t('Availability (About page, after where you’re based)'),
        role: t('Role (older designs)'),
        contactTitle: t('Contact title (older designs)'),
        contactText: tl('Contact text (older designs)'),
      },
    }),
  },
});
