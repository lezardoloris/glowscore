import { Platform, Image } from 'react-native';

export interface PhotoCheck { ok: boolean; reason?: string }

/**
 * Best-effort client-side quality gate before sending a selfie to the scan
 * (review 2026-06: stop garbage-in scores and wasted scans). Never hard-fails
 * on its own error: a checker problem must not block a real user.
 */
export async function assessPhoto(uri: string): Promise<PhotoCheck> {
  try {
    if (Platform.OS === 'web') return await assessWeb(uri);
    // Native: resolution guard only (pixel sampling needs extra native libs).
    const size = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      Image.getSize(uri, (w, h) => resolve({ w, h }), reject);
    });
    if (Math.min(size.w, size.h) < 256) return { ok: false, reason: 'This photo is low resolution. Use a clearer, closer selfie.' };
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

function assessWeb(uri: string): Promise<PhotoCheck> {
  const G = globalThis as any;
  return new Promise((resolve) => {
    if (!G.document || !G.Image) { resolve({ ok: true }); return; }
    const img = new G.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (Math.min(img.width, img.height) < 256) {
        resolve({ ok: false, reason: 'This photo is low resolution. Use a clearer, closer selfie.' });
        return;
      }
      try {
        const s = 64;
        const c = G.document.createElement('canvas');
        c.width = s; c.height = s;
        const ctx = c.getContext('2d');
        if (!ctx) { resolve({ ok: true }); return; }
        ctx.drawImage(img, 0, 0, s, s);
        const data = ctx.getImageData(0, 0, s, s).data as Uint8ClampedArray;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const avg = sum / (data.length / 4);
        if (avg < 45) { resolve({ ok: false, reason: 'This photo looks dark. Face a window or a soft light and try again.' }); return; }
        if (avg > 242) { resolve({ ok: false, reason: 'This photo looks overexposed. Move away from harsh direct light.' }); return; }
        resolve({ ok: true });
      } catch {
        resolve({ ok: true });
      }
    };
    img.onerror = () => resolve({ ok: true });
    img.src = uri;
  });
}
