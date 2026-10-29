// Slideshows where YoupieMan, the line-drawn character, reacts to old screens (components/story/Reactions.astro,
// scripts/reactions.ts; docs/claude-code-brief-login-problems-slideshow.md). Each slide: a screen, the parts to
// highlight (x1, x2, y1, y2 in the screenshot's pixels; none for no highlight), dark overlay or blur, a caption, and
// the character's steps in seconds. Step keys: look (c centre, at the reader; d bottom, on the phone; dd further down;
// l, r), hi (highlight on), lids (share of the eye closed), wide (eyes wide open), drop (a sweat drop on his
// usual face), meh (his disappointed face, -_-', or back to his usual one), say (what he thinks, rising into his bubble line by line; stay: it stays up), show / hide (one of the slide's
// layers), load (the app installing: its progress fills in this many seconds), zoom (one of the slide's zooms: that part of
// the screen grows, as it is; false: back), tap (his thumb taps the phone), swipe (his thumb swipes up),
// thumb (his thumb held in a pose: rest, up, press, low), del (the app to delete: jiggle, with its minus badge; gone,
// shrunk away; off, no longer shown), again (the button to play the slideshow again), smile (a slight smile, or back),
// pan (a tall screen zooms in, panScale, and moves to show this share of its height: 0 its top, 0.5 its middle, in
// panFor seconds). Looks ul / ur: up and
// aside, thinking. A thought's \n starts a new line.
// A slide's layers: screens over its own, hidden until shown (on: shown from the start; fade: seconds to fade in or
// out). load: where the installing app's icon is (x, y, size in the screenshot's pixels). zooms: parts of the screen
// to zoom (x1, x2, y1, y2 in the screenshot's pixels; size: the share of the full zoom, for a smaller one). del: an app on a screen to delete (that image, and x1, x2, y1, y2
// around its icon and name). tall: a long screen, shown whole in a phone-shaped window, that pan steps zoom into.
// A set's solo: YoupieMan and his bubble on their own, centred, no screen (a short scene above a result); once: it
// plays once when it comes into view and stops, with a replay button instead of the slideshow's controls.

export type Look = 'c' | 'd' | 'dd' | 'l' | 'r' | 'ul' | 'ur';
export interface ReactionStep { t: number; look?: Look; hi?: boolean; lids?: number; wide?: boolean; drop?: boolean; meh?: boolean; say?: string; stay?: boolean; show?: string; hide?: string; load?: number; zoom?: string | false; tap?: boolean; swipe?: boolean; thumb?: 'rest' | 'up' | 'press' | 'low'; del?: 'jiggle' | 'gone' | 'off'; again?: boolean; smile?: boolean; pan?: number; panScale?: number; panFor?: number }
export interface ReactionLayer { src: string; fade?: number; on?: boolean }
export interface ReactionSlide { screen?: string; alt?: string; mode?: 'overlay' | 'blur'; holes?: [number, number, number, number][]; tall?: boolean; caption?: string; end: number; layers?: Record<string, ReactionLayer>; load?: [number, number, number]; zooms?: Record<string, { at: [number, number, number, number]; size?: number }>; del?: { src: string; at: [number, number, number, number] }; steps: ReactionStep[] }
export interface ReactionSet { label: string; width?: number; height?: number; solo?: boolean; once?: boolean; slides: ReactionSlide[] }

const DIR = 'projects/mitigating-risk-with-location-based-alerts/login-problems/';
const SIMPLE = 'projects/mitigating-risk-with-location-based-alerts/simple/';

export const REACTIONS: Record<string, ReactionSet> = {
  'inso-login': {
    label: 'What was wrong with the old login',
    width: 750,
    height: 1626,
    slides: [
      {
        screen: DIR + 'home-screen-dark.png',
        alt: 'A phone\'s home screen: the INSO app downloads, then opens on a white screen with the INSO logo in the middle.',
        mode: 'overlay',
        holes: [],
        caption: 'A new partner gets the INSO app. It opens on its logo.',
        end: 7.6,
        load: [229, 160, 120],
        layers: { open: { src: DIR + 'old-splash-blank.png' }, logo: { src: DIR + 'old-splash.png', fade: 1.2 } },
        steps: [
          { t: 0.25, say: "Let's download the INSO App" },
          { t: 1.2, tap: true }, { t: 1.4, load: 2 },
          { t: 3.6, tap: true }, { t: 3.85, show: 'open' },
          { t: 4.3, show: 'logo' },
          { t: 5.1, say: "Good, let's see what you got" },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The old login: the INSO logo, email and password fields, a pale LOGIN button and a tiny note: your account must already be registered with the INSO Partner\'s Portal; to become a partner, contact the country director of your organisation. No intro, no sign-up, no password reset. Then the system asks for his location.',
        mode: 'blur',
        holes: [],
        caption: 'The login: no intro, a tiny note on how to get an account, no password reset.',
        end: 22.6,
        zooms: { note: { at: [22, 714, 842, 922] }, password: { at: [26, 724, 546, 664], size: 0.4 } },
        layers: { prompt: { src: DIR + 'old-login-location.png' } },
        steps: [
          { t: 0.25, look: 'l', say: 'Huh? No intro?' },
          { t: 1.3, look: 'r' }, { t: 2.2, look: 'd' },
          { t: 3.25, look: 'dd', say: 'Hmm...' },
          { t: 5.1, look: 'c', say: 'Which account should I use here?' },
          { t: 8, look: 'dd', say: 'Oh wait, maybe here', tap: true }, { t: 8.25, hi: true, zoom: 'note' },
          { t: 13.05, say: 'Okay, I see now' }, { t: 14.05, hi: false, zoom: false, look: 'd' }, // the zoom held 5.8 s
          { t: 15.75, lids: 0.3, say: "but I don't remember my password here..." }, { t: 15.95, zoom: 'password' },
          { t: 18.65, lids: 0, look: 'dd', zoom: false, say: 'And there is no way to reset it!' }, { t: 19.25, meh: true },
          { t: 20.25, show: 'prompt' }, { t: 20.45, meh: false, wide: true, look: 'c' },
          { t: 21.4, wide: false, lids: 0.5, drop: true },
        ],
      },
      {
        screen: DIR + 'old-login.png',
        alt: 'The system prompt over the old login: Allow INSO to use your location? He closes it, closes the app, and deletes it from his home screen.',
        mode: 'overlay',
        holes: [],
        caption: 'Location is asked before he has even logged in.',
        end: 15.7,
        del: { src: DIR + 'home-screen-dark.png', at: [214, 364, 148, 330] },
        layers: {
          prompt: { src: DIR + 'old-login-location.png', on: true },
          home: { src: DIR + 'home-screen-dark.png', fade: 0.3 },
          deleted: { src: DIR + 'home-screen-deleted.png' }, // the apps after it move up a place
        },
        steps: [
          { t: 0, lids: 0.5, drop: true, look: 'c' },
          { t: 0.4, say: "I haven't even logged in" },
          { t: 2, lids: 1 }, { t: 2.15, lids: 0.5 }, // a blink
          { t: 2.5, say: "and you're asking about location?" },
          { t: 5.6, look: 'd', tap: true }, { t: 5.85, hide: 'prompt', lids: 0, drop: false },
          { t: 6.4, say: "Never mind I'll do this some other time..." },
          { t: 9.35, swipe: true }, { t: 9.6, show: 'home' },
          { t: 10.2, say: 'Or never', stay: true }, { t: 10.65, meh: true },
          { t: 11.4, thumb: 'press' }, { t: 12.1, del: 'jiggle' }, { t: 12.4, thumb: 'rest' },
          { t: 12.75, tap: true }, { t: 13, del: 'gone' },
          { t: 13.45, show: 'deleted', del: 'off' },
          { t: 14.55, meh: false, look: 'c', say: 'Want to see this again?', stay: true }, { t: 15.15, again: true },
        ],
      },
    ],
  },
  // Alert detail: the former screen, read from the top down to about halfway
  'inso-alert-detail': {
    label: 'What was wrong with the old alert detail',
    width: 2048,
    height: 4438,
    once: true,
    slides: [
      {
        screen: SIMPLE + 'alert-details/single-alert-old.jpg',
        alt: 'The old alert detail: a dark title bar, a big map with two pins and no legend, a teal ALERT_UPDATE banner with an email address, then short fields in large type (an empty Update, the date again) and justified text under headings that look like body text.',
        tall: true,
        end: 19.6,
        steps: [
          { t: 0.3, look: 'd', say: "Okay, let's see." }, { t: 0.9, look: 'dd', pan: 0, panScale: 1.5, panFor: 0.8 }, { t: 1.8, pan: 0.5, panScale: 1.5, panFor: 2.4 },
          { t: 4.3, wide: true, look: 'c', say: 'Ay, ay, ay, where should I start?' },
          { t: 6.9, wide: false, meh: true, say: 'Ah, any designer can do better than this.' },
          { t: 9.8, meh: false, look: 'c' }, { t: 10.4, look: 'ul', say: 'But you know what? This was made by an engineer at first, who focused on…' },
          { t: 13.9, say: 'many\nmany\nmany' },
          { t: 16, look: 'ur', say: "things a designer can't even begin to comprehend.", stay: true },
          { t: 18.4, look: 'c', smile: true },
        ],
      },
    ],
  },
  // short scenes above a result: YoupieMan on his own, thinking one thing
  'inso-login-result': { label: 'How did the new onboarding and login perform?', solo: true, once: true, slides: [{ end: 2.6, steps: [{ t: 0.2, look: 'ul' }, { t: 0.5, say: 'How did this perform?', stay: true }, { t: 1.6, look: 'c' }] }] },
  'inso-alerts-result': { label: 'Test, test, test', solo: true, once: true, slides: [{ end: 2.4, steps: [{ t: 0.2, look: 'd' }, { t: 0.4, say: 'Test\nTest\nTest', stay: true }, { t: 1.6, look: 'c' }] }] },
  'inso-proximity-unsure': { label: "I'm not sure about this one", solo: true, once: true, slides: [{ end: 2.6, steps: [{ t: 0.2, look: 'ul', lids: 0.3 }, { t: 0.5, say: "I'm not sure about this one", stay: true }] }] },
  'inso-proximity-maybe': { label: 'This could be it', solo: true, once: true, slides: [{ end: 3.4, steps: [{ t: 0.2, look: 'c' }, { t: 0.8, look: 'r' }, { t: 1.6, look: 'c', smile: true }, { t: 1.9, say: 'This could be it', stay: true }] }] },
};
