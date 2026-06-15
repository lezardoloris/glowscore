/** Generate lip/blush swatch variations from a base hex (color season UI). */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
}

function mix(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (target[0] - r) * amount, g + (target[1] - g) * amount, b + (target[2] - b) * amount);
}

export function generateLipSwatches(base?: string, count = 12): string[] {
  if (!base) return Array(count).fill('#C45C6A');
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push(mix(base, t < 0.5 ? [255, 200, 200] : [80, 20, 40], Math.abs(t - 0.5) * 0.6));
  }
  return out;
}

export function generateBlushSwatches(base?: string, count = 8): string[] {
  if (!base) return Array(count).fill('#E8A0A8');
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(mix(base, [255, 230, 220], (i / (count - 1)) * 0.45));
  }
  return out;
}

export function splitSeasonPalette(palette: string[]): { neutrals: string[]; accents: string[]; makeup: string[] } {
  const p = palette.length ? palette : ['#F5E6D8', '#D4A574', '#8B5E3C', '#3D2914'];
  return {
    neutrals: p.slice(0, 4),
    accents: p.slice(4, 8).length ? p.slice(4, 8) : p.slice(0, 4),
    makeup: p.slice(8, 12).length ? p.slice(8, 12) : p.slice(0, 4),
  };
}
