// Paper-cut shapes, in the spirit of ensemblelapalatine.com: shapes that look cut with scissors
// (a few straight-ish strokes, slightly off), never torn or jagged. Seeded, so every build
// draws the same shapes.

export const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** An irregular "circle" cut in 10–13 strokes, as an SVG path around (cx, cy). */
export function blob(seed: number, cx: number, cy: number, r: number) {
  const rand = rng(seed);
  const n = 10 + Math.floor(rand() * 4);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((i + (rand() - 0.5) * 0.5) / n) * Math.PI * 2;
    const rr = r * (0.93 + rand() * 0.11);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  // each stroke bows out a touch, like a scissor cut that isn't perfectly straight
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i % n];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const k = 1.02 + rand() * 0.03;
    d += ` Q${(cx + (mx - cx) * k).toFixed(1)} ${(cy + (my - cy) * k).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d + 'Z';
}

/** The top edge of a paper band (viewBox 0 0 1000 24): long, gently uneven cuts. */
export function cutEdge(seed: number) {
  const rand = rng(seed);
  let x = 0, d = `M0 24 L0 ${(8 + rand() * 10).toFixed(1)}`;
  while (x < 1000) {
    x = Math.min(1000, x + 60 + rand() * 120);
    d += ` L${x.toFixed(1)} ${(3 + rand() * 15).toFixed(1)}`;
  }
  return d + ' L1000 24 Z';
}

/** The same gently uneven cut as an open line (viewBox 0 0 1000 24), for a hairline divider. */
export function cutLine(seed: number) {
  return cutEdge(seed).replace(/^M0 24 L/, 'M').replace(/ L1000 24 Z$/, '');
}

/** The cut edge as a CSS custom property (--cut) holding an SVG mask, for .n-cut elements: the
 *  band's own paper (colour + texture) masked by a gently uneven cut. */
export function cutMask(seed: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 24' preserveAspectRatio='none'><path d='${cutEdge(seed)}'/></svg>`;
  return `--cut:url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** A tab of paper (CSS clip-path polygon, %): left, top and right edges with a fine, brush-like
 *  wobble (about a pixel or two, like the painted frames); the bottom stays straight, where the tab
 *  meets its sheet or line. */
export function tabCut(seed: number) {
  const rand = rng(seed);
  const p = (x: number, y: number) => `${x.toFixed(2)}% ${y.toFixed(2)}%`;
  let j = 0;
  const wob = (amp: number) => (j = j * 0.6 + (rand() - 0.5) * amp);
  const pts = [p(0, 100)];
  for (let k = 1; k <= 6; k++) pts.push(p(0.5 + wob(0.9), 100 - k * 15));     // left, up
  const ph = rand() * 6.28;
  for (let k = 0; k <= 32; k++) pts.push(p(1 + (k * 98) / 32, 3 + 1.4 * Math.sin(ph + k * 0.3) + wob(2.6))); // top
  for (let k = 1; k <= 6; k++) pts.push(p(99.5 + wob(0.9), 5 + k * 15.8));    // right, down
  pts.push(p(100, 100));
  return `polygon(${pts.join(', ')})`;
}

/** A slightly uneven rectangle as a CSS clip-path polygon (for frames and images). */
export function unevenRect(seed: number, wobble = 1.2) {
  const rand = rng(seed);
  const j = () => (rand() * wobble).toFixed(2);
  const pts: string[] = [];
  for (let i = 0; i <= 10; i++) pts.push(`${i * 10}% ${j()}%`);
  for (let i = 1; i < 6; i++) pts.push(`${(100 - +j()).toFixed(2)}% ${i * 100 / 6}%`);
  for (let i = 10; i >= 0; i--) pts.push(`${i * 10}% ${(100 - +j()).toFixed(2)}%`);
  for (let i = 5; i > 0; i--) pts.push(`${j()}% ${i * 100 / 6}%`);
  return `polygon(${pts.join(', ')})`;
}

/** A thick painted frame like La Palatine's (frame cd.webp), for a w × h visual drawn on top of
 *  it: an SVG ring (fill-rule evenodd) whose outer edge wanders 6–13 units outside the visual
 *  (each side its own thickness, a slow drift, a slight slant and fine brush jitter) and whose
 *  inner edge hides under the visual. Rounded only where the brush turns the corner. thick scales the
 *  thickness (wide visuals take a thinner stroke so it shows about as much as on the cards). */
export function brushFrame(seed: number, w = 1000, h = 600, thick = 1) {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  // one side: from corner a to corner b, pushed outwards along (nx, ny)
  const side = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number, o0: number, o1: number) => {
    const len = Math.hypot(bx - ax, by - ay), n = Math.round(len / 10), k = thick;
    const f1 = 0.5 + rand() * 0.8, p1 = rand() * 6.3, f2 = 2 + rand() * 2.5, p2 = rand() * 6.3;
    let j = 0;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      j = j * 0.55 + (rand() - 0.5) * 1.6; // smoothed jitter, like bristles
      const bump = rand() < 0.04 ? 1.5 + rand() * 1.5 : 0;
      const env = Math.min(1, 6 * t, 6 * (1 - t)); // calm near the corners so they join up
      const o = o0 + (o1 - o0) * t + env * (2 * Math.sin(6.28 * f1 * t + p1) + 0.8 * Math.sin(6.28 * f2 * t + p2) + j + bump) * k;
      pts.push([ax + (bx - ax) * t + nx * o, ay + (by - ay) * t + ny * o]);
    }
  };
  // the corner: a quarter turn around the visual's corner (cx, cy), from angle a0
  const corner = (cx: number, cy: number, a0: number, o0: number, o1: number) => {
    for (let k = 0; k <= 4; k++) {
      const a = a0 + (k / 4) * Math.PI / 2, o = o0 + (o1 - o0) * (k / 4);
      pts.push([cx + Math.cos(a) * o, cy + Math.sin(a) * o]);
    }
  };
  const o = Array.from({ length: 4 }, () => (7 + rand() * 4) * thick); // thickness at each corner
  const pi = Math.PI;
  corner(0, 0, pi, o[0], o[0]);         side(0, 0, w, 0, 0, -1, o[0], o[1]);  // top
  corner(w, 0, -pi / 2, o[1], o[1]);    side(w, 0, w, h, 1, 0, o[1], o[2]);   // right
  corner(w, h, 0, o[2], o[2]);          side(w, h, 0, h, 0, 1, o[2], o[3]);   // bottom
  corner(0, h, pi / 2, o[3], o[3]);     side(0, h, 0, 0, -1, 0, o[3], o[0]);  // left
  const ring = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + 'Z';
  const i = 24; // inner edge, hidden under the visual
  return `${ring} M${i} ${i} L${i} ${h - i} L${w - i} ${h - i} L${w - i} ${i}Z`;
}

/** A rectangle with a ragged, marker-like edge: many small wobbles per side (CSS clip-path). */
export function raggedRect(seed: number, wobble = 0.6, steps = 24) {
  const rand = rng(seed);
  const j = () => (rand() * wobble).toFixed(2);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) pts.push(`${(i * 100 / steps).toFixed(2)}% ${j()}%`);
  for (let i = 1; i < steps / 2; i++) pts.push(`${(100 - +j()).toFixed(2)}% ${(i * 200 / steps).toFixed(2)}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i * 100 / steps).toFixed(2)}% ${(100 - +j()).toFixed(2)}%`);
  for (let i = steps / 2 - 1; i > 0; i--) pts.push(`${j()}% ${(i * 200 / steps).toFixed(2)}%`);
  return `polygon(${pts.join(', ')})`;
}

// Seeded random number for a given point, so every cut stays where it is while the paper grows
const hash = (seed: number, i: number) => {
  let t = (seed * 9973 + i * 7919) >>> 0;
  t = Math.imul(t ^ (t >>> 15), 2246822507) >>> 0;
  t = Math.imul(t ^ (t >>> 13), 3266489909) >>> 0;
  return ((t ^ (t >>> 16)) >>> 0) / 4294967295;
};

/** A paper cut-out of width w and height h (CSS path, px): two round ends cut in short straight
 *  strokes, with the long edges cut at a fixed spacing counted from the side the paper grows from,
 *  so the paper grows and shrinks instead of stretching. Round when w = h. */
export function paperPill(w: number, h: number, seed: number, anchor: string) {
  const r = h / 2;
  w = Math.max(w, h);
  const pts: [number, number][] = [];
  const cap = (cx: number, from: number, id: number) => {
    for (let k = 0; k <= 5; k++) {
      const a = from + (k / 5) * Math.PI;
      const rr = r * (0.94 + hash(seed, id + k) * 0.1);
      pts.push([cx + Math.cos(a) * rr, r + Math.sin(a) * rr]);
    }
  };
  const step = h * 0.6;
  const n = Math.floor((w - 2 * r) / step);
  const edge = (y: number, dir: 1 | -1, id: number) => {
    const xs = Array.from({ length: n }, (_, k) => (anchor === 'left' ? r + (k + 1) * step : w - r - (k + 1) * step));
    xs.sort((a, b) => (a - b) * dir);
    xs.forEach((x) => {
      const k = Math.round(Math.abs(x - (anchor === 'left' ? r : w - r)) / step);
      pts.push([x, y + (hash(seed, id + k) - 0.5) * h * 0.07]);
    });
  };
  cap(r, Math.PI / 2, 0);              // left end: bottom → left → top
  edge(h * 0.02, 1, 100);              // top edge, left to right
  cap(w - r, -Math.PI / 2, 50);        // right end: top → right → bottom
  edge(h * 0.98, -1, 200);             // bottom edge, right to left
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') + 'Z';
}

/** A pill-shaped paper cut-out of width w and height h (CSS path, px) whose small nicks sit at even
 *  spacing along the outline. phase shifts the pattern of nicks by that many places around the
 *  outline, so stepping it makes the edge travel round while the shape stays put. */
export function paperRing(w: number, h: number, seed: number, phase = 0) {
  const r = h / 2;
  w = Math.max(w, h);
  const straight = w - 2 * r;
  const perimeter = 2 * straight + 2 * Math.PI * r;
  const n = Math.max(16, Math.round(perimeter / (h * 0.2))); // more, smaller cuts: neatly cut, not jagged
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * perimeter;
    let x: number, y: number, nx: number, ny: number;
    if (d < straight) { x = r + d; y = 0; nx = 0; ny = -1; } // top, left to right
    else if ((d -= straight) < Math.PI * r) { const a = -Math.PI / 2 + d / r; x = w - r + Math.cos(a) * r; y = r + Math.sin(a) * r; nx = Math.cos(a); ny = Math.sin(a); } // right end
    else if ((d -= Math.PI * r) < straight) { x = w - r - d; y = h; nx = 0; ny = 1; } // bottom, right to left
    else { d -= straight; const a = Math.PI / 2 + d / r; x = r + Math.cos(a) * r; y = r + Math.sin(a) * r; nx = Math.cos(a); ny = Math.sin(a); } // left end
    const nick = -h * 0.04 + hash(seed, (((i - phase) % n) + n) % n) * h * 0.045; // mostly inward, so it stays in the box
    pts.push(`${(x + nx * nick).toFixed(1)} ${(y + ny * nick).toFixed(1)}`);
  }
  return 'M' + pts.join(' L') + 'Z';
}

