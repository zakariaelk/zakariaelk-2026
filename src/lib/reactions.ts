// Slideshows where YoupieMan, the line-drawn character, reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels; none for no highlight), dark overlay or blur, a caption, and
// the character's steps in seconds. Step keys: look (c centre, at the reader; d bottom, on the phone; dd further down;
// l, r), hi (highlight on), lids (share of the eye closed), meh (his disappointed face, -_-', or back to his usual
// one), say (what he thinks, rising into his bubble line by line; stay: it stays up), show / hide (one of the slide's
// layers), load (the app installing: its progress fills in this many seconds), zoom (the rest of the screen blurs and
// the slide's small print grows, as it is; false: back), tap (his thumb taps the phone), swipe (his thumb swipes up),
// thumb (his thumb held in a pose: rest, up, press, low), del (the app to delete: jiggle, with its minus badge; gone,
// shrunk away; off, no longer shown), again (the button to play the slideshow again).
// A slide's layers: screens over its own, hidden until shown (on: shown from the start; fade: seconds to fade in or
// out). load: where the installing app's icon is (x, y, size in the screenshot's pixels). zoom: the small print to
// zoom (x1, x2, y1, y2 in the screenshot's pixels). del: an app on a screen to delete (that image, and x1, x2, y1, y2
// around its icon and name).

export type Look = 'c' | 'd' | 'dd' | 'l' | 'r';
export interface ReactionStep { t: number; look?: Look; hi?: boolean; lids?: number; meh?: boolean; say?: string; stay?: boolean; show?: string; hide?: string; load?: number; zoom?: boolean; tap?: boolean; swipe?: boolean; thumb?: 'rest' | 'up' | 'press' | 'low'; del?: 'jiggle' | 'gone' | 'off'; again?: boolean }
export interface ReactionLayer { src: string; fade?: number; on?: boolean }
export interface ReactionSlide { screen: string; alt: string; mode: 'overlay' | 'blur'; holes: [number, number, number, number][]; caption: string; end: number; layers?: Record<string, ReactionLayer>; load?: [number, number, number]; zoom?: [number, number, number, number]; del?: { src: string; at: [number, number, number, number] }; steps: ReactionStep[] }
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
        alt: 'A phone\'s home screen with the INSO app on it, about to download.',
        mode: 'overlay',
        holes: [],
        caption: 'A new partner gets the INSO app.',
        end: 3.2,
        load: [229, 160, 120],
        steps: [
          { t: 0.25, say: "Let's download the INSO App" },
          { t: 2.4, tap: true },
        ],
      },
      {
        screen: DIR + 'home-screen-dark.png',
        alt: 'The INSO app installs, then opens on a white screen with the INSO logo in the middle.',
        mode: 'overlay',
        holes: [],
        caption: 'It installs, then opens on its logo.',
        end: 8,
        load: [229, 160, 120],
        layers: { open: { src: DIR + 'old-splash-blank.png' }, logo: { src: DIR + 'old-splash.png', fade: 1.2 } },
        steps: [
          { t: 0.2, load: 2 },
          { t: 1.2, say: 'Alright, almost done...' }, // halfway
          { t: 2.8, tap: true }, { t: 3.05, show: 'open' },
          { t: 3.55, show: 'logo' },
          { t: 4.75, say: "Good, let's see what you got" },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login: the INSO logo, email and password fields, a pale LOGIN button and a tiny note: your account must already be registered with the INSO Partner\'s Portal; to become a partner, contact the country director of your organisation. No intro, no sign-up, no password reset. Then the system asks for his location.',
        mode: 'blur',
        holes: [],
        caption: 'The login: no intro, a tiny note on how to get an account, no password reset.',
        end: 26.7,
        zoom: [22, 714, 842, 922],
        layers: { prompt: { src: DIR + 'old-login-location.png' } },
        steps: [
          { t: 0.25, look: 'l', say: 'Huh? No intro?' },
          { t: 1.3, look: 'r' }, { t: 2.2, look: 'd' },
          { t: 3.25, look: 'dd', say: 'Hmm...' },
          { t: 5.1, look: 'c', say: 'Which account should I use here?' },
          { t: 8, look: 'dd', say: 'Oh wait, maybe this tiny text can help' },
          { t: 10.45, tap: true }, { t: 10.7, hi: true, zoom: true },
          { t: 16.5, hi: false, zoom: false, look: 'd', say: 'I see now' }, // the zoom held 5.8 s
          { t: 19.2, lids: 0.3, say: "but I don't remember my password here..." },
          { t: 22.1, lids: 0, look: 'dd', say: 'Do I have to contact INSO to reset my password?' },
          { t: 23.45, show: 'prompt' }, { t: 25.15, meh: true },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The system prompt over the old login: Allow INSO to use your location? He closes it, closes the app, and deletes it from his home screen.',
        mode: 'overlay',
        holes: [],
        caption: 'Location is asked before he has even logged in.',
        end: 17,
        del: { src: DIR + 'home-screen-dark.png', at: [214, 364, 148, 330] },
        layers: {
          prompt: { src: DIR + 'old-login-location.png', on: true },
          home: { src: DIR + 'home-screen-dark.png', fade: 0.3 },
          deleted: { src: DIR + 'home-screen-deleted.png' }, // the apps after it move up a place
        },
        steps: [
          { t: 0, meh: true, look: 'c' },
          { t: 0.45, look: 'r', say: 'What?' }, { t: 1.45, look: 'c' },
          { t: 2.15, look: 'r', say: 'My location?' }, { t: 3.3, look: 'c' },
          { t: 4, look: 'r', say: "Why? I haven't even logged in" }, { t: 5.45, look: 'c' },
          { t: 6.95, look: 'd', tap: true }, { t: 7.2, hide: 'prompt', meh: false },
          { t: 7.75, say: "Never mind I'll do this some other time..." },
          { t: 10.7, swipe: true }, { t: 10.95, show: 'home' },
          { t: 11.55, say: 'Or never', stay: true }, { t: 12, meh: true },
          { t: 12.75, thumb: 'press' }, { t: 13.45, del: 'jiggle' }, { t: 13.75, thumb: 'rest' },
          { t: 14.1, tap: true }, { t: 14.35, del: 'gone' },
          { t: 14.8, show: 'deleted', del: 'off' },
          { t: 15.9, meh: false, look: 'c', say: 'Shall I show you again?', stay: true }, { t: 16.5, again: true },
        ],
      },
    ],
  },
};
