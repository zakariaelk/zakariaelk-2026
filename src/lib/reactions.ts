// Slideshows where the line-drawn character reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels), dark overlay or blur, a caption, and the character's
// steps in seconds. Step keys: look (c, d, dd, l, r: centre, bottom, further down, left, right), hi (highlight on),
// lids (share of the eye closed), wide (surprised), roll (eye roll, then lids half closed), q (the question mark).

export interface ReactionStep { t: number; look?: 'c' | 'd' | 'dd' | 'l' | 'r'; hi?: boolean; lids?: number; wide?: boolean; roll?: boolean; q?: boolean }
export interface ReactionSlide { screen: string; alt: string; mode: 'overlay' | 'blur'; holes: [number, number, number, number][]; caption: string; end: number; steps: ReactionStep[] }
export interface ReactionSet { label: string; width: number; height: number; slides: ReactionSlide[] }

const DIR = 'projects/mitigating-risk-with-location-based-alerts/login-problems/';
// the scan: bottom centre, left, lower, right, centre
const scan = (from: number): ReactionStep[] => (['l', 'dd', 'r', 'c', 'd'] as const).map((look, k) => ({ t: from + k, look }));

export const REACTIONS: Record<string, ReactionSet> = {
  'inso-login': {
    label: 'What was wrong with the old login',
    width: 750,
    height: 1626,
    slides: [
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login: the INSO logo, email and password fields, a pale LOGIN button and a small note, and nothing else.',
        mode: 'overlay',
        holes: [[205, 545, 135, 320], [28, 722, 940, 1560]],
        caption: 'A login form, and nothing saying what the app is for.',
        end: 11,
        steps: [{ t: 0, look: 'd', hi: true }, ...scan(1), ...scan(6)],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login. Under the LOGIN button, a small note: your account must already be registered with the INSO Partner\'s Portal; to become a partner, contact the country director of your organisation.',
        mode: 'overlay',
        holes: [[28, 708, 845, 918]],
        caption: 'How to get an account is a tiny note. No link, no contact.',
        end: 8,
        steps: [{ t: 0, look: 'd' }, { t: 1, look: 'c' }, { t: 2, look: 'd' }, { t: 4, hi: true, lids: 0.4 }, { t: 6, roll: true }],
      },
      {
        screen: DIR + 'old-login-location.png',
        alt: 'The old login with the system prompt on top: Allow INSO to use your location? Need location when in use.',
        mode: 'blur',
        holes: [[140, 610, 495, 625]],
        caption: 'Location is asked first, with one thin line of explanation.',
        end: 7,
        steps: [{ t: 0, look: 'c', wide: true }, { t: 1, wide: false, lids: 0.4, hi: true }, { t: 3, roll: true }, { t: 4, q: true }],
      },
    ],
  },
};
