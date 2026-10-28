// Slideshows where the line-drawn character reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels; none for no highlight), dark overlay or blur, a caption, and
// the character's steps in seconds. Step keys: look (c centre, at the reader; d bottom, on the phone; dd further down;
// l, r, u, ur), hi (highlight on), lids (share of the eye closed), wide (surprised), roll (eye roll: right, up, lids
// drop, eyes fall back down), q (question mark), say (what he thinks, rising into his bubble line by line), face (his
// face shows), hands (hands and phone rise into view), bubble (1 small circle, 2 bigger circle, 3 the bubble), move
// (he steps aside and the screen fades in), show / hide (one of the slide's layers), load (the app installing: its
// progress fills in this many seconds), zoom (the slide's small print shown big, in one go; false: gone), tap (his thumb taps the phone), swipe (his thumb
// swipes up).
// A slide with intro: true starts with nothing of him shown, alone in the middle with no screen, so its steps bring
// him in. A slide's layers: screens over its own, hidden until shown (on: shown from the start; fade: seconds to fade
// in or out). load: where the installing app's icon is (x, y, size in the screenshot's pixels). zoom: small print
// on the slide (its middle y in the screenshot's pixels, its words) to show big over the dimmed screen.

export type Look = 'c' | 'd' | 'dd' | 'l' | 'r' | 'u' | 'ur';
export interface ReactionStep { t: number; look?: Look; hi?: boolean; lids?: number; wide?: boolean; roll?: boolean; q?: boolean; say?: string; face?: boolean; hands?: boolean; bubble?: 1 | 2 | 3; move?: boolean; show?: string; hide?: string; load?: number; zoom?: boolean; tap?: boolean; swipe?: boolean }
export interface ReactionLayer { src: string; fade?: number; on?: boolean }
export interface ReactionSlide { screen: string; alt: string; mode: 'overlay' | 'blur'; holes: [number, number, number, number][]; caption: string; end: number; intro?: boolean; layers?: Record<string, ReactionLayer>; load?: [number, number, number]; zoom?: { y: number; text: string }; steps: ReactionStep[] }
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
        mode: 'overlay',
        holes: [],
        caption: 'The login: no intro, a tiny note on how to get an account, no password reset.',
        end: 28.4,
        zoom: { y: 882, text: '* Your account must already be registered with the INSO Partner\'s Portal to login to this app. To become an INSO Partner please contact the country director of your organisation' },
        layers: { prompt: { src: DIR + 'old-login-location.png' } },
        steps: [
          { t: 0.3, look: 'l', say: 'Huh? No intro?' },
          { t: 1.5, look: 'r' }, { t: 2.6, look: 'd' },
          { t: 3.8, look: 'dd', say: 'Hmm...' },
          { t: 6, look: 'c', say: 'Which account should I use here?' },
          { t: 9.4, look: 'dd', say: 'Oh wait, maybe this tiny text can help' },
          { t: 12.3, tap: true }, { t: 12.6, hi: true, zoom: true },
          { t: 16.4, hi: false, zoom: false, look: 'd', say: 'I see now' },
          { t: 19.6, lids: 0.3, say: "but I don't remember my password here..." },
          { t: 23, lids: 0, look: 'dd', say: 'Do I have to contact INSO to reset my password?' },
          { t: 24.6, show: 'prompt' },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login with the system prompt on top: Allow INSO to use your location? Need location when in use.',
        mode: 'blur',
        holes: [[140, 610, 495, 625]],
        caption: 'Location is asked first, with one thin line of explanation.',
        end: 11.8,
        layers: { prompt: { src: DIR + 'old-login-location.png' } },
        steps: [
          { t: 0, look: 'd' },
          { t: 2, show: 'prompt', look: 'c', wide: true, say: 'Whoaaa, my location?' },
          { t: 3.6, wide: false, look: 'd', lids: 0.4, hi: true },
          { t: 5, say: 'Why, though?' },
          { t: 7, roll: true },
          { t: 8.1, say: "I haven't even logged in" },
          { t: 9.1, q: true },
        ],
      },
    ],
  },
};
