export function rng(seed){ let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => cl((t - a) / (b - a));
export const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const eo = k => 1 - Math.pow(1 - k, 3);
export const ei = k => k * k * k;
export const sm = k => k * k * (3 - 2 * k);
export const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
export const elastic = k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI) / 3) + 1;
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// smooth 1D value noise (deterministic) for camera shake / handheld
export function noise1(x, seed = 0){ const i = Math.floor(x), f = x - i, a = hash(i + seed * 57.3), b = hash(i + 1 + seed * 57.3); return lerp(a, b, sm(f)) * 2 - 1; }
export const deg = d => d * Math.PI / 180;
