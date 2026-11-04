// Generates the replaceable sample artwork in public/images/sample.
// These are illustrations, not photographs of the studio's work. Swap the
// image URLs in src/data/* (or the admin screens) for real photography.
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/images/sample/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const C = {
  cream50: '#FBF7F0', cream100: '#F7F1E8', cream200: '#EEE4D5', cream300: '#E2D3BE',
  caramel300: '#C2A28B', caramel400: '#AB866B', caramel500: '#96745A', caramel600: '#86654C',
  rose100: '#F0DFDA', rose200: '#E3C8C1', rose300: '#D3AEA5', rose400: '#C69C92', rose500: '#B88C82', rose600: '#A07268',
  gold200: '#E4D2A8', gold300: '#D3B97E', gold400: '#C4A05A', gold500: '#B58A3A', gold600: '#9C7430',
  cocoa: '#49352F',
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

function shapePath(shape, w, h) {
  const hw = w / 2;
  const cuticle = `Q 0 ${f(h * 0.14)} ${f(-hw)} 0 Z`;
  switch (shape) {
    case 'coffin':
      return `M ${f(-hw)} 0 L ${f(-hw)} ${f(-h * 0.45)} L ${f(-w * 0.34)} ${f(-h + 6)} Q ${f(-w * 0.33)} ${f(-h)} ${f(-w * 0.28)} ${f(-h)} L ${f(w * 0.28)} ${f(-h)} Q ${f(w * 0.33)} ${f(-h)} ${f(w * 0.34)} ${f(-h + 6)} L ${f(hw)} ${f(-h * 0.45)} L ${f(hw)} 0 ${cuticle}`;
    case 'square':
      return `M ${f(-hw)} 0 L ${f(-hw)} ${f(-h + 10)} Q ${f(-hw)} ${f(-h)} ${f(-hw + 10)} ${f(-h)} L ${f(hw - 10)} ${f(-h)} Q ${f(hw)} ${f(-h)} ${f(hw)} ${f(-h + 10)} L ${f(hw)} 0 ${cuticle}`;
    case 'oval':
      return `M ${f(-hw)} 0 L ${f(-hw)} ${f(-h * 0.55)} C ${f(-hw)} ${f(-h * 0.9)} ${f(-w * 0.3)} ${f(-h)} 0 ${f(-h)} C ${f(w * 0.3)} ${f(-h)} ${f(hw)} ${f(-h * 0.9)} ${f(hw)} ${f(-h * 0.55)} L ${f(hw)} 0 ${cuticle}`;
    default: // almond
      return `M ${f(-hw)} 0 C ${f(-hw)} ${f(-h * 0.5)} ${f(-w * 0.22)} ${f(-h * 0.92)} 0 ${f(-h)} C ${f(w * 0.22)} ${f(-h * 0.92)} ${f(hw)} ${f(-h * 0.5)} ${f(hw)} 0 ${cuticle}`;
  }
}

function nail({ id, shape, finish, w, h, x, y, rot, r, tint }) {
  const d = shapePath(shape, w, h);
  let stops;
  let body = '';
  switch (finish) {
    case 'french':
      stops = [C.rose100, C.rose200];
      body = `<path d="M ${-w} ${f(-h * 0.76)} Q 0 ${f(-h * 0.62)} ${w} ${f(-h * 0.76)} L ${w} ${-h * 1.3} L ${-w} ${-h * 1.3} Z" fill="${C.cream50}"/>`;
      break;
    case 'chrome':
      stops = [C.cream200, C.gold300, C.caramel400, C.gold200, C.cream100];
      body = `<path d="M ${-w} ${f(-h * 0.3)} L ${w} ${f(-h * 0.62)} L ${w} ${f(-h * 0.46)} L ${-w} ${f(-h * 0.14)} Z" fill="${C.cream50}" opacity=".38"/>`;
      break;
    case 'floral': {
      stops = [C.cream100, C.cream200];
      for (let i = 0; i < 3; i++) {
        const cx = (r() - 0.5) * w * 0.5;
        const cy = -h * (0.25 + r() * 0.5);
        const s = w * (0.1 + r() * 0.05);
        const petal = i % 2 ? C.rose400 : C.rose500;
        body += `<ellipse cx="${f(cx + s * 1.4)}" cy="${f(cy + s * 1.2)}" rx="${f(s * 0.9)}" ry="${f(s * 0.32)}" transform="rotate(${f(30 + r() * 40)} ${f(cx + s * 1.4)} ${f(cy + s * 1.2)})" fill="${C.caramel400}" opacity=".6"/>`;
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2 + r();
          body += `<circle cx="${f(cx + Math.cos(a) * s * 0.85)}" cy="${f(cy + Math.sin(a) * s * 0.85)}" r="${f(s * 0.62)}" fill="${petal}" opacity=".92"/>`;
        }
        body += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.42)}" fill="${C.gold500}"/>`;
      }
      break;
    }
    case 'glam': {
      stops = [C.rose400, C.rose600];
      for (let i = 0; i < 54; i++) {
        const rr = 0.9 + r() * 2.4;
        body += `<circle cx="${f((r() - 0.5) * w)}" cy="${f(-r() * h)}" r="${f(rr)}" fill="${r() > 0.35 ? C.gold300 : C.cream50}" opacity="${f(0.45 + r() * 0.5)}"/>`;
      }
      const rs = w * 0.1;
      body += `<circle cx="0" cy="${f(-h * 0.2)}" r="${f(rs)}" fill="${C.gold400}" stroke="${C.gold200}" stroke-width="3"/><circle cx="${f(-rs * 0.3)}" cy="${f(-h * 0.2 - rs * 0.3)}" r="${f(rs * 0.34)}" fill="${C.cream50}" opacity=".85"/>`;
      body += `<circle cx="${f(w * 0.17)}" cy="${f(-h * 0.36)}" r="${f(rs * 0.5)}" fill="${C.gold400}" stroke="${C.gold200}" stroke-width="2"/>`;
      break;
    }
    case 'mocha':
      stops = [C.caramel400, C.caramel600];
      break;
    case 'ivory':
      stops = [C.cream50, C.cream200];
      break;
    default:
      stops = tint || [C.rose200, C.rose300];
  }
  const grad = `<linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">${stops
    .map((s, i) => `<stop offset="${f((i / (stops.length - 1)) * 100)}%" stop-color="${s}"/>`)
    .join('')}</linearGradient>`;
  const gloss = `<path d="M ${f(-w * 0.27)} ${f(-h * 0.1)} Q ${f(-w * 0.34)} ${f(-h * 0.46)} ${f(-w * 0.17)} ${f(-h * 0.78)}" fill="none" stroke="${C.cream50}" stroke-opacity=".6" stroke-width="${f(w * 0.07)}" stroke-linecap="round"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
  <defs><clipPath id="c${id}"><path d="${d}"/></clipPath>${grad}</defs>
  <g filter="url(#soft)" opacity=".3"><path d="${d}" transform="translate(${f(w * 0.12)} ${f(h * 0.05)})" fill="${C.cocoa}"/></g>
  <path d="${d}" fill="url(#g${id})"/>
  <g clip-path="url(#c${id})">${body}${gloss}</g>
  <path d="${d}" fill="none" stroke="${C.cocoa}" stroke-opacity=".16" stroke-width="1.5"/>
</g>`;
}

const HF = { 1: [1], 2: [1, 0.94], 3: [0.93, 1, 0.95], 4: [0.9, 1, 0.97, 0.88], 5: [0.8, 0.93, 1, 0.95, 0.86] };
const WF = { 1: [1], 2: [1, 0.96], 3: [0.94, 1, 0.97], 4: [0.92, 1, 0.98, 0.9], 5: [0.84, 0.94, 1, 0.96, 1.06] };

function scene(spec) {
  const {
    W = 1000, H = 1250, bg = [C.rose200, C.rose100], glow = C.gold200, shape = 'almond', finish = 'nude',
    count = 3, scale = 1, seed = 1, tint, rot = 1, yBase = 0.76, arch = false, ratio = 2.35,
  } = spec;
  const r = rng(seed);
  const nw = (W / (count * 1.28 + 0.9)) * scale;
  const nh = nw * ratio;
  const spacing = nw * 1.28;
  const mid = (count - 1) / 2;
  let nails = '';
  for (let i = 0; i < count; i++) {
    const k = mid === 0 ? 0 : (i - mid) / mid;
    const fin = Array.isArray(finish) ? finish[i % finish.length] : finish;
    nails += nail({
      id: `${seed}${i}`, shape, finish: fin, w: nw * WF[count][i], h: nh * HF[count][i],
      x: W / 2 + (i - mid) * spacing, y: H * yBase + Math.abs(k) ** 1.6 * nw * 0.22,
      rot: k * 7 * rot, r, tint,
    });
  }
  const y0 = H * yBase;
  const archW = W * 0.64;
  const archPath = arch
    ? `<path d="M ${f(W / 2 - archW / 2)} ${f(H * 0.96)} L ${f(W / 2 - archW / 2)} ${f(H * 0.2 + archW / 2)} A ${f(archW / 2)} ${f(archW / 2)} 0 0 1 ${f(W / 2 + archW / 2)} ${f(H * 0.2 + archW / 2)} L ${f(W / 2 + archW / 2)} ${f(H * 0.96)}" fill="none" stroke="${C.gold500}" stroke-opacity=".55" stroke-width="2.5"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<title>Sample nail illustration</title>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
  <radialGradient id="glow" cx="50%" cy="38%" r="55%"><stop offset="0" stop-color="${glow}" stop-opacity=".7"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${f(nw * 0.09)}"/></filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 .29  0 0 0 0 .21  0 0 0 0 .18  0 0 0 .55 0"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
${archPath}
<ellipse cx="${W / 2}" cy="${f(y0 + nw * 0.35)}" rx="${f(W * 0.4)}" ry="${f(nw * 0.42)}" fill="${C.cocoa}" opacity=".1" filter="url(#soft)"/>
${nails}
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".12"/>
</svg>
`;
}

const T = { w: 1000, h: 1250 };
const SQ = { W: 1000, H: 1000 };
const WIDE = { W: 1250, H: 1000 };

const specs = {
  // hero & about
  hero: { W: 1200, H: 1450, bg: [C.rose200, C.cream200], finish: ['french', 'chrome', 'glam', 'nude'], count: 4, scale: 1.12, yBase: 0.8, arch: true, seed: 7, shape: 'almond' },
  about: { W: 1000, H: 1250, bg: [C.caramel300, C.rose200], finish: 'chrome', count: 2, scale: 1.05, yBase: 0.82, seed: 11, shape: 'almond' },
  // gallery
  'g01-soft-french': { ...T, finish: 'french', shape: 'almond', count: 3, bg: [C.rose100, C.cream300], seed: 21 },
  'g02-quiet-nude': { ...SQ, finish: 'nude', tint: [C.rose300, C.rose400], shape: 'coffin', count: 4, scale: 1.1, yBase: 0.82, bg: [C.cream200, C.rose100], seed: 22 },
  'g03-garden': { ...T, finish: 'floral', shape: 'almond', count: 3, bg: [C.rose200, C.cream200], seed: 23 },
  'g04-liquid-gold': { ...T, finish: 'chrome', shape: 'almond', count: 3, bg: [C.caramel300, C.rose300], glow: C.gold300, seed: 24 },
  'g05-rosette': { ...SQ, finish: 'glam', shape: 'coffin', count: 4, scale: 1.1, yBase: 0.82, bg: [C.cream200, C.rose200], seed: 25 },
  'g06-flatlay': { ...WIDE, finish: 'mocha', shape: 'square', count: 5, scale: 1.1, yBase: 0.76, ratio: 1.9, bg: [C.cream300, C.cream200], seed: 26 },
  'g07-coffin-french': { ...T, finish: 'french', shape: 'coffin', count: 3, bg: [C.rose200, C.cream100], seed: 27 },
  'g08-mirror': { ...SQ, finish: 'chrome', shape: 'coffin', count: 4, scale: 1.1, yBase: 0.82, bg: [C.cream300, C.gold200], seed: 28 },
  'g09-short-bloom': { ...SQ, finish: 'floral', shape: 'square', count: 5, scale: 1.1, yBase: 0.74, ratio: 1.8, bg: [C.rose100, C.rose200], seed: 29 },
  'g10-milk': { ...T, finish: 'ivory', shape: 'oval', count: 3, bg: [C.cream200, C.rose100], seed: 30 },
  'g11-candlelight': { ...WIDE, finish: 'glam', shape: 'almond', count: 5, scale: 1.12, yBase: 0.82, bg: [C.caramel300, C.rose200], glow: C.gold300, seed: 31 },
  'g12-pressons': { ...T, finish: 'mocha', shape: 'almond', count: 3, bg: [C.rose300, C.cream200], seed: 32 },
  // products (a = set, b = close crop)
  'p01-a': { ...T, finish: 'french', shape: 'almond', count: 5, scale: 1.2, yBase: 0.66, bg: [C.rose100, C.cream300], seed: 41 },
  'p01-b': { ...T, finish: 'french', shape: 'coffin', count: 2, scale: 1, yBase: 0.86, bg: [C.cream200, C.rose200], seed: 42 },
  'p02-a': { ...T, finish: 'nude', tint: [C.rose200, C.rose300], shape: 'oval', count: 5, scale: 1.2, yBase: 0.66, bg: [C.cream200, C.rose100], seed: 43 },
  'p02-b': { ...T, finish: 'nude', tint: [C.rose200, C.rose300], shape: 'square', count: 2, scale: 1, yBase: 0.86, bg: [C.rose100, C.cream300], seed: 44 },
  'p03-a': { ...T, finish: 'floral', shape: 'almond', count: 5, scale: 1.2, yBase: 0.66, bg: [C.rose200, C.cream200], seed: 45 },
  'p03-b': { ...T, finish: 'floral', shape: 'almond', count: 2, scale: 1, yBase: 0.86, bg: [C.cream300, C.rose100], seed: 46 },
  'p04-a': { ...T, finish: 'chrome', shape: 'almond', count: 5, scale: 1.2, yBase: 0.66, bg: [C.caramel300, C.rose300], glow: C.gold300, seed: 47 },
  'p04-b': { ...T, finish: 'chrome', shape: 'coffin', count: 2, scale: 1, yBase: 0.86, bg: [C.cream300, C.gold200], seed: 48 },
  'p05-a': { ...T, finish: 'mocha', shape: 'almond', count: 5, scale: 1.2, yBase: 0.66, bg: [C.rose200, C.cream200], seed: 49 },
  'p05-b': { ...T, finish: 'mocha', shape: 'square', count: 2, scale: 1, yBase: 0.86, bg: [C.cream200, C.rose100], seed: 50 },
  'p06-a': { ...T, finish: 'glam', shape: 'coffin', count: 5, scale: 1.2, yBase: 0.66, bg: [C.cream200, C.rose200], seed: 51 },
  'p06-b': { ...T, finish: 'glam', shape: 'almond', count: 2, scale: 1, yBase: 0.86, bg: [C.caramel300, C.rose200], glow: C.gold300, seed: 52 },
  'p07-a': { ...T, finish: ['french', 'floral'], shape: 'oval', count: 5, scale: 1.2, yBase: 0.66, bg: [C.rose100, C.rose200], seed: 53 },
  'p07-b': { ...T, finish: 'floral', shape: 'oval', count: 2, scale: 1, yBase: 0.86, bg: [C.cream200, C.rose100], seed: 54 },
  'p08-a': { ...T, finish: 'chrome', shape: 'almond', count: 5, scale: 1.2, yBase: 0.66, bg: [C.cream300, C.gold200], seed: 55 },
  'p08-b': { ...T, finish: 'chrome', shape: 'almond', count: 2, scale: 1, yBase: 0.86, bg: [C.rose200, C.cream200], seed: 56 },
  // services
  's-gel': { ...SQ, finish: 'nude', tint: [C.rose200, C.rose400], shape: 'oval', count: 3, bg: [C.cream200, C.rose100], seed: 61 },
  's-extensions': { ...SQ, finish: 'ivory', shape: 'coffin', count: 3, ratio: 2.8, scale: 0.95, bg: [C.rose100, C.cream300], seed: 62 },
  's-french': { ...SQ, finish: 'french', shape: 'almond', count: 3, bg: [C.rose200, C.cream100], seed: 63 },
  's-art': { ...SQ, finish: ['floral', 'glam', 'chrome'], shape: 'almond', count: 3, bg: [C.cream300, C.rose200], seed: 64 },
  's-removal': { ...SQ, finish: 'nude', tint: [C.cream200, C.rose100], shape: 'square', count: 3, ratio: 1.8, bg: [C.cream200, C.cream300], seed: 65 },
};

for (const [name, spec] of Object.entries(specs)) {
  writeFileSync(new URL(`${name}.svg`, OUT), scene(spec));
}
console.log(`Wrote ${Object.keys(specs).length} sample images to public/images/sample`);
