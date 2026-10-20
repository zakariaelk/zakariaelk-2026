import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

const story = (name) => component(`./src/components/story/${name}.astro`);

export default defineMarkdocConfig({
  tags: {
    carousel: {
      render: component('./src/components/Carousel.astro'),
      attributes: { caption: { type: String } },
    },
    video: {
      render: component('./src/components/Video.astro'),
      selfClosing: true,
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
      },
    },

    // Case study blocks (story template, see docs/case-study-design-brief-for-claude-code.md)
    glance: { render: story('Glance') },
    stats: {
      render: story('Stats'),
      attributes: { variant: { type: String, matches: ['panel', 'strip'] }, label: { type: String } },
    },
    stat: {
      render: story('Stat'),
      selfClosing: true,
      attributes: { value: { type: String, required: true }, label: { type: String, required: true } },
    },
    scope: { render: story('Scope') },
    need: { render: story('Need') },
    friction: { render: story('Friction') },
    move: { render: story('Move'), attributes: { label: { type: String } } },
    result: { render: story('Result'), attributes: { value: { type: String }, label: { type: String }, note: { type: String }, kind: { type: String, matches: ['', 'testing', 'interviews', 'partners'] } } },
    figure: {
      render: story('Figure'),
      selfClosing: true,
      attributes: {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        caption: { type: String },
        frame: { type: String, matches: ['', 'before', 'after', 'compare'] },
        size: { type: String, matches: ['wide', 'text', 'half'] },
        notes: { type: String },
      },
    },
    pair: { render: story('Pair'), attributes: { caption: { type: String } } },
    quote: { render: story('Quote'), attributes: { by: { type: String, required: true } } },
    reflection: { render: story('Reflection') },
    confirm: {
      render: story('Confirm'),
      inline: true,
      selfClosing: true,
      attributes: { note: { type: String, required: true }, label: { type: String } },
    },
    // one sentence in the site's orange marker highlight, drawn in when it reaches the middle of the screen
    mark: { render: story('Mark'), inline: true, selfClosing: true, attributes: { text: { type: String, required: true } } },
    // two or more options weighed against each other: cards side by side on wide screens
    options: { render: story('Options') },
    option: { render: story('Option'), attributes: { title: { type: String, required: true } } },
    // the INSO app's monthly active and returning users since launch (src/data/monthly-active-users.csv)
    usagechart: { render: story('UsageChart'), selfClosing: true, attributes: { caption: { type: String } } },
    missing: {
      render: story('Missing'),
      selfClosing: true,
      attributes: { file: { type: String, required: true }, label: { type: String } },
    },
  },
});
