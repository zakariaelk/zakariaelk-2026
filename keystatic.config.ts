import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper, inline } from '@keystatic/core/content-components';

const video = block({
  label: 'Video',
  schema: {
    src: fields.text({ label: 'Video path', description: 'e.g. /media/projects/my-project/clip.mp4 (files live in public/media)' }),
    alt: fields.text({ label: 'Caption / description' }),
  },
});

const carousel = wrapper({
  label: 'Carousel',
  schema: { caption: fields.text({ label: 'Caption' }) },
});

// Case study blocks (story template). Each one tells the reader something specific:
// see docs/case-study-design-brief-for-claude-code.md
const imagePath = (label: string) =>
  fields.text({ label, description: 'Image: path in src/assets (projects/<slug>/file.jpg). Video: /media/projects/<slug>/file.mp4' });
const storyBlocks = {
  glance: wrapper({ label: 'At a glance panel', schema: {} }),
  stats: wrapper({
    label: 'Key numbers',
    schema: {
      variant: fields.select({ label: 'Layout', options: [{ label: 'Panel (stacked)', value: 'panel' }, { label: 'Strip (in a row)', value: 'strip' }], defaultValue: 'panel' }),
      label: fields.text({ label: 'Accessible name', defaultValue: 'Key numbers' }),
    },
  }),
  stat: block({ label: 'Key number', schema: { value: fields.text({ label: 'Number' }), label: fields.text({ label: 'Label (include the sample size)' }) } }),
  scope: wrapper({ label: 'Role and scope list', schema: {} }),
  need: wrapper({ label: 'Need (the user’s pain point)', schema: {} }),
  friction: wrapper({ label: 'Friction (max 3 sentences)', schema: {} }),
  move: wrapper({ label: 'What I did', schema: { label: fields.text({ label: 'Label', defaultValue: 'What I did' }) } }),
  result: wrapper({
    label: 'Result (max 3 sentences)',
    schema: { value: fields.text({ label: 'Large number (optional, older drafts)' }), label: fields.text({ label: 'Number label, with sample size' }), note: fields.text({ label: 'Small line: the numbers, sample size and who answered' }), kind: fields.select({ label: 'Evidence', options: [{ label: 'Result', value: '' }, { label: 'What testing showed (prototype tests)', value: 'testing' }, { label: 'What interviews showed', value: 'interviews' }, { label: 'What partners said (survey)', value: 'partners' }], defaultValue: '' }) },
  }),
  figure: block({
    label: 'Figure',
    schema: {
      src: imagePath('Image or video'),
      alt: fields.text({ label: 'Alt text (what changed, not “screenshot”)', multiline: true }),
      caption: fields.text({ label: 'Caption', multiline: true }),
      frame: fields.select({
        label: 'Frame',
        options: [{ label: 'None', value: '' }, { label: 'Before (grey)', value: 'before' }, { label: 'After (blue)', value: 'after' }, { label: 'Before and after in one visual', value: 'compare' }],
        defaultValue: '',
      }),
      size: fields.select({ label: 'Width', options: [{ label: 'Wide', value: 'wide' }, { label: 'Text column', value: 'text' }, { label: 'Half (inside a pair)', value: 'half' }], defaultValue: 'wide' }),
      notes: fields.text({ label: 'Annotations (separate with |)', multiline: true }),
    },
  }),
  pair: wrapper({ label: 'Before / after pair', schema: { caption: fields.text({ label: 'Caption' }) } }),
  quote: wrapper({ label: 'Tester quote', schema: { by: fields.text({ label: 'Role and country only' }) } }),
  reflection: wrapper({ label: 'Reflection (two lists)', schema: {} }),
  confirm: inline({ label: 'Confirm flag', schema: { note: fields.text({ label: 'What to confirm' }), label: fields.text({ label: 'Label', defaultValue: 'Confirm' }) } }),
  mark: inline({ label: 'Orange highlight (one sentence)', schema: { text: fields.text({ label: 'Highlighted text' }) } }),
  options: wrapper({ label: 'Options (cards side by side)', schema: {} }),
  option: wrapper({ label: 'Option card', schema: { title: fields.text({ label: 'Title' }) } }),
  usagechart: block({ label: 'Usage chart (monthly active and returning users)', schema: { caption: fields.text({ label: 'Caption' }) } }),
  missing: block({ label: 'Missing image flag', schema: { file: fields.text({ label: 'What is needed' }), label: fields.text({ label: 'Label', defaultValue: 'Missing image' }) } }),
};

const body = (dir: string) =>
  fields.markdoc({
    label: 'Content',
    options: {
      image: { directory: `src/assets/${dir}`, publicPath: `../../assets/${dir}/` },
    },
    components: { video, carousel, ...storyBlocks },
  });

const timeline = (label: string) =>
  fields.array(
    fields.object({
      name: fields.text({ label: 'Name' }),
      role: fields.text({ label: 'Description' }),
      years: fields.text({ label: 'Years' }),
    }),
    { label, itemLabel: (p) => p.fields.name.value },
  );

export default config({
  // Edits are saved as commits to GitHub; Netlify rebuilds the site on every commit.
  storage: { kind: 'github', repo: 'zakariaelk/Leiby' },
  ui: {
    brand: { name: 'Zakaria El Khachia' },
    navigation: {
      Work: ['projects'],
      Pages: ['home', 'about', 'settings'],
    },
  },
  collections: {
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['client', 'year'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        client: fields.text({ label: 'Client (short name for cards)' }),
        headline: fields.text({ label: 'Headline (case study page)' }),
        lede: fields.array(fields.text({ label: 'Paragraph', multiline: true }), { label: 'Intro under the hero (one or two short paragraphs)', itemLabel: (p) => p.value.slice(0, 60) }),
        deliverables: fields.text({ label: 'Deliverables (case study facts)' }),
        summary: fields.text({ label: 'Card summary', multiline: true }),
        intro: fields.text({ label: 'Intro (case study page)', multiline: true }),
        showIntro: fields.checkbox({ label: 'Show the intro under the title on the case study page', defaultValue: true }),
        tagline: fields.text({ label: 'Tagline (after the project name, e.g. “a safety alert app for humanitarian workers”)' }),
        projectType: fields.text({ label: 'Project type' }),
        statement: fields.text({ label: 'Featured card statement (what I did, one line)', multiline: true }),
        org: fields.text({ label: 'Organisation / client (featured card, bold)' }),
        projectName: fields.text({ label: 'Project name (featured card, after the organisation)' }),
        sector: fields.text({ label: 'Sector' }),
        role: fields.text({ label: 'Role' }),
        duration: fields.text({ label: 'Duration' }),
        team: fields.text({ label: 'Team', multiline: true }),
        year: fields.text({ label: 'Year' }),
        link: fields.url({ label: 'Live link' }),
        cover: fields.image({ label: 'Cover image', directory: 'src/assets/projects', publicPath: '../../assets/projects/' }),
        order: fields.integer({ label: 'Order', defaultValue: 99 }),
        featured: fields.checkbox({ label: 'Featured (large card at the top)', defaultValue: false }),
        layout: fields.select({
          label: 'Page template',
          options: [
            { label: 'Classic (side menu)', value: 'classic' },
            { label: 'Story (rail, at a glance, callouts)', value: 'story' },
          ],
          defaultValue: 'classic',
        }),
        tier: fields.select({
          label: 'Type',
          options: [
            { label: 'Case study', value: 'case' },
            { label: 'Earlier work (short entry)', value: 'earlier' },
          ],
          defaultValue: 'case',
        }),
        problem: fields.text({ label: 'In short: the problem (why)', multiline: true }),
        did: fields.text({ label: 'In short: what I did', multiline: true }),
        result: fields.text({ label: 'In short: the result', multiline: true }),
        hard: fields.text({ label: 'In short: what was hard / what I would do differently', multiline: true }),
        featuredVideo: fields.text({ label: 'Featured card video (path in public/, e.g. /media/…mp4)' }),
        previews: fields.array(
          fields.image({ label: 'Preview image', directory: 'src/assets/projects', publicPath: '../../assets/projects/' }),
          { label: 'Hover previews (home list, 2 images)' },
        ),
        menu: fields.array(
          fields.object({
            group: fields.text({ label: 'Group title (optional)' }),
            items: fields.array(
              fields.object({
                label: fields.text({ label: 'Menu label' }),
                heading: fields.text({ label: 'Heading it jumps to (exact text)' }),
              }),
              { label: 'Items', itemLabel: (p) => p.fields.label.value },
            ),
          }),
          { label: 'Side menu / section rail (short labels)', itemLabel: (p) => p.fields.group.value || 'Sections' },
        ),
        content: body('projects'),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'src/content/pages/home',
      format: { data: 'json' },
      schema: {
        heroText: fields.text({
          label: 'Intro',
          multiline: true,
          description: 'Wrap words in *single stars* to highlight them, and **double stars** to make them bold.',
        }),
        shortIntro: fields.text({ label: 'Short intro (simple version)', multiline: true }),
        cities: fields.array(fields.text({ label: 'City' }), { label: 'Cities', itemLabel: (p) => p.value }),
        cityYears: fields.array(fields.text({ label: 'Year' }), {
          label: 'City years',
          description: 'One per city, same order (shown under the cities on the home page)',
          itemLabel: (p) => p.value,
        }),
        workTitle: fields.text({ label: 'Work section title' }),
      },
    }),
    about: singleton({
      label: 'About page',
      path: 'src/content/pages/about/',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Title' }),
        intro: fields.text({ label: 'Intro', multiline: true }),
        experience: timeline('Experience'),
        education: timeline('Education'),
        languages: fields.array(fields.text({ label: 'Language' }), { label: 'Languages', itemLabel: (p) => p.value }),
        content: body('pages'),
      },
    }),
    settings: singleton({
      label: 'Site settings',
      path: 'src/content/pages/settings',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Name' }),
        role: fields.text({ label: 'Role' }),
        email: fields.text({ label: 'Email' }),
        linkedin: fields.url({ label: 'LinkedIn URL' }),
        availability: fields.text({ label: 'Availability note' }),
        contactTitle: fields.text({ label: 'Contact section title' }),
        contactText: fields.text({ label: 'Contact section text', multiline: true }),
      },
    }),
  },
});
