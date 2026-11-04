import { palette, roles } from './colors';

const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const alpha = (hex, a) => `rgba(${toRgb(hex).join(',')},${a})`;

// Writes the palette onto :root so CSS only ever references variables.
export function applyTheme(root = document.documentElement) {
  const set = (k, v) => root.style.setProperty(k, v);

  Object.entries(palette).forEach(([family, steps]) =>
    Object.entries(steps).forEach(([step, hex]) => set(`--${family}-${step}`, hex))
  );

  Object.entries(roles).forEach(([name, hex]) =>
    set(`--${name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`, hex)
  );

  set('--line', alpha(palette.caramel[500], 0.26));
  set('--line-strong', alpha(palette.caramel[500], 0.5));
  set('--gold-line', alpha(palette.gold[500], 0.55));
  set('--scrim', alpha(palette.caramel[800], 0.6));
  set('--shadow-soft', `0 1px 2px ${alpha(palette.cocoa[900], 0.06)}, 0 14px 34px -18px ${alpha(palette.cocoa[900], 0.28)}`);
  set('--shadow-lift', `0 2px 4px ${alpha(palette.cocoa[900], 0.08)}, 0 26px 50px -24px ${alpha(palette.cocoa[900], 0.38)}`);
  set('--focus', palette.gold[600]);
}
