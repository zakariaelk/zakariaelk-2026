// Slideshows where YoupieMan, the line-drawn character, reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels; none for no highlight), dark overlay or blur, a caption, and
// the character's steps in seconds. Step keys: look (c centre, at the reader; d bottom, on the phone; dd further down;
// l, r), hi (highlight on), lids (share of the eye closed), meh (his disappointed face, -_-', or back to his usual
// one), say (what he thinks, rising into his bubble line by line; stay: it stays up), face (his
// face shows), hands (hands and phone rise into view), bubble (1 small circle, 2 bigger circle, 3 the bubble), move
// (he steps aside and the screen fades in), show / hide (one of the slide's layers), load (the app installing: its
// progress fills in this many seconds), zoom (the rest of the screen blurs and the slide's small print grows, as it is; false: back), tap (his thumb taps the phone), swipe (his thumb
// swipes up), thumb (his thumb held in a pose: rest, up, press, low), jiggle (the app to delete jiggles with its
// minus badge; false: stops), remove (the app shrinks away).
// A slide with intro: true starts with nothing of him shown, alone in the middle with no screen, so its steps bring
// him in. A slide's layers: screens over its own, hidden until shown (on: shown from the start; fade: seconds to fade
// in or out). load: where the installing app's icon is (x, y, size in the screenshot's pixels). zoom: the small
// print to zoom (x1, x2, y1, y2 in the screenshot's pixels). del: an app on a screen to delete (that image, and
// x1, x2, y1, y2 around its icon and name).

export type Look = 'c' | 'd' | 'dd' | 'l' | 'r';
export interface ReactionStep { t: number; look?: Look; hi?: boolean; lids?: number; meh?: boolean; say?: string; stay?: boolean; face?: boolean; hands?: boolean; bubble?: 1 | 2 | 3; move?: boolean; show?: string; hide?: string; load?: number; zoom?: boolean; tap?: boolean; swipe?: boolean; thumb?: 'rest' | 'up' | 'press' | 'low'; jiggle?: boolean; remove?: boolean }
export interface ReactionLayer { src: string; fade?: number; on?: boolean }
export interface ReactionSlide { screen: string; alt: string; mode: 'overlay' | 'blur'; holes: [number, number, number, number][]; caption: string; end: number; intro?: boolean; layers?: Record<string, ReactionLayer>; load?: [number, number, number]; zoom?: [number, number, number, number]; del?: { src: string; at: [number, number, number, number] }; steps: ReactionStep[] }
export interface ReactionSet { label: string; width: number; height: number; slides: ReactionSlide[] }

const DIR = 'projects/mitigating-risk-with-location-based-alerts/login-problems/';

export const REACTIONS: Record<string, ReactionSet> = {
  'inso-login': {
    label: 'What was wrong with the old login',
    width: 750,
    height: 1626,
    slides: [
      {
        screen: DIR + 'home-screen-dark.png',
        alt: 'A phone\'s home screen with the INSO app on it, still downloading.',
        mode: 'overlay',
        holes: [],
        caption: 'A new partner gets the INSO app.',
        end: 7.2,
        intro: true,
        load: [229, 160, 120],
        steps: [
          { t: 0.3, face: true, look: 'c' },
          { t: 0.9, hands: true },
          { t: 1.5, look: 'd' },
          { t: 1.9, bubble: 1 }, { t: 2.15, bubble: 2 }, { t: 2.4, bubble: 3 },
          { t: 2.7, say: "Let's download the INSO App" },
          { t: 5.2, move: true },
        ],
      },
      {
        screen: DIR + 'home-screen-dark.png',
        alt: 'The INSO app installs, then opens on a white screen with the INSO logo in the middle.',
        mode: 'overlay',
        holes: [],
        caption: 'It installs, then opens on its logo.',
        end: 10.2,
        load: [229, 160, 120],
        layers: { open: { src: DIR + 'old-splash-blank.png' }, logo: { src: DIR + 'old-splash.png', fade: 1.2 } },
        steps: [
          { t: 0.4, load: 3.6 },
          { t: 0.8, say: 'Alright, almost done...' },
          { t: 4.1, tap: true }, { t: 4.4, show: 'open' },
          { t: 5, show: 'logo' },
          { t: 6.4, say: "Good, let's see what you got" },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login: the INSO logo, email and password fields, a pale LOGIN button and a tiny note: your account must already be registered with the INSO Partner\'s Portal; to become a partner, contact the country director of your organisation. No intro, no sign-up, no password reset. Then the system asks for his location.',
        mode: 'blur',
        holes: [],
        caption: 'The login: no intro, a tiny note on how to get an account, no password reset.',
        end: 30.4,
        zoom: [22, 714, 842, 922],
        layers: { prompt: { src: DIR + 'old-login-location.png' } },
        steps: [
          { t: 0.3, look: 'l', say: 'Huh? No intro?' },
          { t: 1.5, look: 'r' }, { t: 2.6, look: 'd' },
          { t: 3.8, look: 'dd', say: 'Hmm...' },
          { t: 6, look: 'c', say: 'Which account should I use here?' },
          { t: 9.4, look: 'dd', say: 'Oh wait, maybe this tiny text can help' },
          { t: 12.3, tap: true }, { t: 12.6, hi: true, zoom: true },
          { t: 18.4, hi: false, zoom: false, look: 'd', say: 'I see now' },
          { t: 21.6, lids: 0.3, say: "but I don't remember my password here..." },
          { t: 25, lids: 0, look: 'dd', say: 'Do I have to contact INSO to reset my password?' },
          { t: 26.6, show: 'prompt' }, { t: 28.6, meh: true },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The system prompt over the old login: Allow INSO to use your location? He closes it, closes the app, and deletes it from his home screen.',
        mode: 'overlay',
        holes: [],
        caption: 'Location is asked before he has even logged in.',
        end: 19,
        del: { src: DIR + 'home-screen-dark.png', at: [214, 364, 148, 330] },
        layers: { prompt: { src: DIR + 'old-login-location.png', on: true }, home: { src: DIR + 'home-screen-dark.png', fade: 0.3 } },
        steps: [
          { t: 0, meh: true, look: 'c' },
          { t: 0.5, look: 'r', say: 'What?' }, { t: 1.7, look: 'c' },
          { t: 2.5, look: 'r', say: 'My location?' }, { t: 3.9, look: 'c' },
          { t: 4.7, look: 'r', say: "Why? I haven't even logged in" }, { t: 6.4, look: 'c' },
          { t: 8.2, look: 'd', tap: true }, { t: 8.5, hide: 'prompt', meh: false },
          { t: 9.1, say: "Never mind I'll do this some other time..." },
          { t: 12.6, swipe: true }, { t: 12.9, show: 'home' },
          { t: 13.6, say: 'Or never', stay: true }, { t: 14.1, meh: true },
          { t: 15, thumb: 'press' }, { t: 15.8, jiggle: true }, { t: 16.2, thumb: 'rest' },
          { t: 16.6, tap: true }, { t: 16.9, remove: true },
        ],
      },
    ],
  },
};
