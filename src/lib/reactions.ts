// Slideshows where the line-drawn character reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels; none for no highlight), dark overlay or blur, a caption, and
// the character's steps in seconds. Step keys: look (c centre, at the reader; d bottom, on the phone; dd further down;
// l, r, u, ur), hi (highlight on), lids (share of the eye closed), wide (surprised), roll (eye roll: right, up, lids
// drop, eyes fall back down), q (question mark), say (what he thinks, written in his bubble word by word), face (his
// face shows), hands (hands and phone rise into view), bubble (1 small circle, 2 bigger circle, 3 the bubble).
// A slide with intro: true starts with nothing of him shown, so its steps bring him in.

export type Look = 'c' | 'd' | 'dd' | 'l' | 'r' | 'u' | 'ur';
export interface ReactionStep { t: number; look?: Look; hi?: boolean; lids?: number; wide?: boolean; roll?: boolean; q?: boolean; say?: string; face?: boolean; hands?: boolean; bubble?: 1 | 2 | 3 }
export interface ReactionSlide { screen: string; alt: string; mode: 'overlay' | 'blur'; holes: [number, number, number, number][]; caption: string; end: number; intro?: boolean; steps: ReactionStep[] }
export interface ReactionSet { label: string; width: number; height: number; slides: ReactionSlide[] }

const DIR = 'projects/mitigating-risk-with-location-based-alerts/login-problems/';

export const REACTIONS: Record<string, ReactionSet> = {
  'inso-login': {
    label: 'What was wrong with the old login',
    width: 750,
    height: 1626,
    slides: [
      {
        screen: DIR + 'old-splash.png',
        alt: 'The old splash screen: a blank white screen with the INSO logo in the middle.',
        mode: 'overlay',
        holes: [],
        caption: 'The app opens on its logo.',
        end: 5.5,
        intro: true,
        steps: [
          { t: 0.3, face: true, look: 'c' },
          { t: 0.9, hands: true },
          { t: 1.5, look: 'd' },
          { t: 1.9, bubble: 1 }, { t: 2.15, bubble: 2 }, { t: 2.4, bubble: 3 },
          { t: 2.7, say: "Let's see what this app actually does" },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login: the INSO logo, email and password fields, a pale LOGIN button and a small note, and nothing else.',
        mode: 'overlay',
        holes: [],
        caption: 'A login form, and nothing saying what the app is for.',
        end: 8,
        steps: [
          { t: 0.3, look: 'l', say: 'Huh?' },
          { t: 1.3, look: 'r' }, { t: 2.3, look: 'dd' }, { t: 3.3, look: 'l' }, { t: 4.3, look: 'r' },
          { t: 5.3, look: 'c', say: 'What is this?' },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login. Under the LOGIN button, a small note: your account must already be registered with the INSO Partner\'s Portal; to become a partner, contact the country director of your organisation.',
        mode: 'overlay',
        holes: [[28, 708, 845, 918]],
        caption: 'How to get an account is a tiny note. No link, no contact.',
        end: 9.5,
        steps: [
          { t: 0, look: 'd', say: 'OK. How do I sign up?' },
          { t: 2.2, look: 'dd' }, { t: 3.2, look: 'd' },
          { t: 4.2, hi: true, lids: 0.4, say: 'This tiny note?' },
          { t: 6.4, roll: true, say: 'Contact who, exactly?' },
        ],
      },
      {
        screen: DIR + 'old-login-location.png',
        alt: 'The old login with the system prompt on top: Allow INSO to use your location? Need location when in use.',
        mode: 'blur',
        holes: [[140, 610, 495, 625]],
        caption: 'Location is asked first, with one thin line of explanation.',
        end: 9,
        steps: [
          { t: 0, look: 'c', wide: true, say: 'Whoa. My location?' },
          { t: 1.6, wide: false, look: 'd', lids: 0.4, hi: true, say: 'Why, though?' },
          { t: 3.8, roll: true, say: "I haven't even logged in" },
          { t: 5.8, q: true },
        ],
      },
    ],
  },
};
