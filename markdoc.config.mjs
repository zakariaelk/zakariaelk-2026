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
        badges: { type: String }, // numbered badges over the image: "x,y|x,y" in % of its width and height (1, 2…)
        src: { type: String, required: true },
        alt: { type: String, required: true },
        caption: { type: String },
        frame: { type: String, matches: ['', 'before', 'after', 'compare'] },
        size: { type: String, matches: ['wide', 'text', 'half'] },
        notes: { type: String },
        related: { type: Boolean }, // shows a result's own data: kept close to it
      },
    },
    pair: { render: story('Pair'), attributes: { caption: { type: String }, side: { type: Boolean } } },
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
    // Simple INSO case: icon + narrative title + paragraph (results: + a source line)
    block: {
      render: story('Block'),
      attributes: {
        icon: { type: String, matches: ['eye', 'friction', 'did', 'testing', 'interviews', 'partners', 'pushback', 'bricks', 'face-confused', 'face-bulb', 'face-smiling', 'face-introspect', 'face-happy', 'face-satisfied', 'face-sad', 'face-doubtful'] }, // optional: each icon is used once
        title: { type: String }, // optional: an icon can sit beside a plain paragraph
        source: { type: String },
        result: { type: Boolean }, // a finding with no source line
      },
    },
    // a flow shown one screen at a time, like a short video (images: src/assets paths, comma-separated; alts: |)
    // a table that can be folded away (open by default); label: what the toggle names
    tablebox: { render: story('TableBox'), attributes: { label: { type: String } } },
    // a numbered badge in the text, matching one on a visual
    n: { render: story('Num'), inline: true, selfClosing: true, attributes: { v: { type: String, required: true } } },
    sequence: { render: story('Sequence'), selfClosing: true, attributes: { thumbs: { type: Boolean }, fulls: { type: String }, images: { type: String, required: true }, alts: { type: String }, caption: { type: String }, captions: { type: String }, frame: { type: String, matches: ['', 'before', 'after', 'compare'] }, landscape: { type: Boolean } } },
    // the character reacting to old screens, one problem highlighted per slide (slides in lib/reactions.ts)
    reactions: { render: story('Reactions'), selfClosing: true, attributes: { set: { type: String, required: true } } },
    // text kept for review, struck through
    del: { render: 'del', inline: true },
    // the "Take a look" button, wherever the case places it
    cta: { render: story('CaseCta'), selfClosing: true, attributes: { href: { type: String, required: true }, label: { type: String } } },
    // a line break inside a heading or title
    br: { render: 'br', inline: true, selfClosing: true },
    // "Pros:" (green) / "Cons:" (red) at the start of a line about an idea
    pc: { render: story('ProsCons'), inline: true, selfClosing: true, attributes: { kind: { type: String, required: true, matches: ['pros', 'cons'] } } },
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
