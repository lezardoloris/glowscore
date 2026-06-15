/**
 * Deterministic color analysis. Pure color-science (no AI call): from sampled
 * skin / hair / eye colors it derives undertone, depth, chroma, contrast and the
 * 4-season + sub-season classification, then generates a flattering palette.
 * Replaces the unreliable LLM path for Color Season on web (and is reusable in
 * the Worker). See styling.ts ColorSeasonResult for the output shape.
 */

export interface RGB { r: number; g: number; b: number }
export interface ColorSeasonResult {
  season: string; sub_season: string; undertone: string; contrast: number;
  confidence: number; description: string; palette: string[]; avoid: string[];
  metal: string; lip: string; blush: string;
}

// ─── color math ─────────────────────────────────────────────────────────────
function clamp(n: number, lo = 0, hi = 255) { return Math.max(lo, Math.min(hi, n)); }
function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('');
}
export function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const l = (max + min) / 2; const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s, l };
}
export function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return toHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// ─── season generation ──────────────────────────────────────────────────────
// Per-season flattering hue families + the saturation/lightness they wear best.
const SEASON_DEF: Record<string, { hues: number[]; s: number; l: number; metal: string }> = {
  Spring: { hues: [15, 35, 55, 150, 180, 330], s: 0.7, l: 0.62, metal: 'gold' },   // warm, light, bright
  Summer: { hues: [210, 240, 300, 340, 160, 190], s: 0.32, l: 0.66, metal: 'silver' }, // cool, light, soft
  Autumn: { hues: [25, 40, 70, 130, 15, 190], s: 0.55, l: 0.42, metal: 'gold' },   // warm, deep, soft
  Winter: { hues: [350, 220, 280, 160, 200, 320], s: 0.8, l: 0.45, metal: 'silver' }, // cool, deep, bright
};

function paletteFor(season: string): string[] {
  const d = SEASON_DEF[season];
  return d.hues.map((h) => hslToHex(h, d.s, d.l));
}
function avoidFor(season: string): string[] {
  // the opposite season's signature is the least flattering
  const opp: Record<string, string> = { Spring: 'Winter', Summer: 'Autumn', Autumn: 'Summer', Winter: 'Spring' };
  return paletteFor(opp[season]).slice(0, 3);
}
function lipBlush(season: string, warm: boolean, deep: boolean): { lip: string; blush: string } {
  // warm -> coral/terracotta, cool -> rose/berry; deep -> richer
  const lipH = warm ? (deep ? 12 : 6) : (deep ? 345 : 350);
  const blushH = warm ? 14 : 348;
  return {
    lip: hslToHex(lipH, deep ? 0.6 : 0.5, deep ? 0.42 : 0.55),
    blush: hslToHex(blushH, 0.45, 0.7),
  };
}

/** Classify from sampled colors. The heart of the deterministic analyzer. */
export function classifyFromColors(skin: RGB, hair: RGB, eyes: RGB): ColorSeasonResult {
  const skinHsl = rgbToHsl(skin);
  const hairHsl = rgbToHsl(hair);
  const eyeHsl = rgbToHsl(eyes);

  // Undertone: skin hue toward yellow/orange (20-60) = warm; toward red/pink/blue = cool.
  const warm = skinHsl.h >= 20 && skinHsl.h <= 60;
  // Depth: combined lightness of skin + hair.
  const deep = (skinHsl.l + hairHsl.l) / 2 < 0.5;
  // Chroma / clarity: average saturation of features.
  const bright = (skinHsl.s + hairHsl.s + eyeHsl.s) / 3 > 0.42;
  // Contrast 0-10: luminance gap between skin and hair (and eyes).
  const contrastRaw = Math.abs(skinHsl.l - hairHsl.l) * 0.7 + Math.abs(skinHsl.l - eyeHsl.l) * 0.3;
  const contrast = Math.max(0, Math.min(10, Math.round(contrastRaw * 14)));

  const season = warm ? (deep ? 'Autumn' : 'Spring') : (deep ? 'Winter' : 'Summer');
  // Sub-season from the secondary axis (clarity).
  const subBy: Record<string, string> = {
    Spring: bright ? 'Bright Spring' : 'Light Spring',
    Summer: bright ? 'True Summer' : 'Soft Summer',
    Autumn: bright ? 'True Autumn' : 'Soft Autumn',
    Winter: bright ? 'Bright Winter' : 'Deep Winter',
  };
  const { lip, blush } = lipBlush(season, warm, deep);
  const undertone = warm ? 'Warm' : 'Cool';
  const desc = `${warm ? 'Warm' : 'Cool'}, ${deep ? 'deep' : 'light'} and ${bright ? 'bright' : 'soft'}: you glow in ${season.toLowerCase()} tones.`;

  return {
    season, sub_season: subBy[season], undertone,
    contrast,
    confidence: 82,
    description: desc,
    palette: paletteFor(season),
    avoid: avoidFor(season),
    metal: SEASON_DEF[season].metal,
    lip, blush,
  };
}

// ─── web sampler (canvas) ────────────────────────────────────────────────────
/** Web only: sample average skin / hair / eye colors from a face selfie. */
export async function sampleFaceColors(uri: string): Promise<{ skin: RGB; hair: RGB; eyes: RGB } | null> {
  try {
    const g: any = globalThis as any;
    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const im = new g.Image(); im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im); im.onerror = reject; im.src = uri;
    });
    const S = 200;
    const canvas = g.document.createElement('canvas'); canvas.width = S; canvas.height = S;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, S, S);
    const avg = (x0: number, y0: number, w: number, h: number): RGB => {
      const data = ctx.getImageData(x0, y0, w, h).data;
      let r = 0, gg = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue; // skip transparent
        r += data[i]; gg += data[i + 1]; b += data[i + 2]; n++;
      }
      return n ? { r: r / n, g: gg / n, b: b / n } : { r: 200, g: 170, b: 160 };
    };
    // Heuristic regions (no landmarks): cheeks center, hair top band, eye band.
    const skin = avg(Math.round(S * 0.40), Math.round(S * 0.55), Math.round(S * 0.20), Math.round(S * 0.12));
    const hair = avg(Math.round(S * 0.30), Math.round(S * 0.04), Math.round(S * 0.40), Math.round(S * 0.08));
    const eyes = avg(Math.round(S * 0.34), Math.round(S * 0.40), Math.round(S * 0.10), Math.round(S * 0.05));
    return { skin, hair, eyes };
  } catch {
    return null;
  }
}

/** Convenience: full deterministic analysis from a web image uri. */
export async function analyzeColorSeasonLocal(uri: string): Promise<ColorSeasonResult | null> {
  const c = await sampleFaceColors(uri);
  if (!c) return null;
  return classifyFromColors(c.skin, c.hair, c.eyes);
}
