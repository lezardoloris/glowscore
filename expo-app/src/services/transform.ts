import { Platform } from 'react-native';
import { CONFIG, workerHeaders } from '../config';

const isWeb = Platform.OS === 'web';

// When the worker URL points at a real worker (local `wrangler dev` or a deployed
// worker) instead of the placeholder, the web preview makes REAL API calls so the
// before/after reflects an actual Gemini Nano Banana transformation. Otherwise the
// web preview just simulates (returns the input image) so the UI stays usable.
const REAL_WORKER = !CONFIG.WORKER_BASE_URL.includes('your-domain');

export interface TransformResult {
  imageUrl: string;
  isHD: boolean;
  remainingToday: number;
}

/**
 * Web only: load any image URI (data:, blob:, http) into a canvas, downscale, and
 * return a clean base64 JPEG (no data-URI prefix) so the worker always receives a
 * valid image/jpeg payload — matching the mime the worker declares to Gemini.
 */
async function webImageToJpegBase64(uri: string, maxSize: number): Promise<string | null> {
  try {
    const g: any = globalThis as any;
    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const im = new g.Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = uri;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width || maxSize, img.height || maxSize));
    const w = Math.max(1, Math.round((img.width || maxSize) * scale));
    const h = Math.max(1, Math.round((img.height || maxSize) * scale));
    const canvas = g.document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl: string = canvas.toDataURL('image/jpeg', 0.9);
    const comma = dataUrl.indexOf(',');
    return comma >= 0 ? dataUrl.slice(comma + 1) : null;
  } catch {
    return null;
  }
}

// Cloud HD transformation via Cloudflare Worker → fal.ai / Gemini Nano Banana
export async function transformHD(
  imageUri: string,
  styleId: string,
  subscriberToken: string
): Promise<TransformResult> {
  if (isWeb) {
    if (!REAL_WORKER) {
      // No real worker configured — simulate (before == after).
      await new Promise(r => setTimeout(r, 2000));
      return { imageUrl: imageUri, isHD: true, remainingToday: 9 };
    }
    // Real transform against the configured worker (e.g. local `wrangler dev`).
    const base64 = await webImageToJpegBase64(imageUri, CONFIG.HD_SIZE);
    if (!base64) throw new Error('Could not read the selected image.');

    const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/transform`, {
      method: 'POST',
      headers: workerHeaders({ Authorization: `Bearer ${subscriberToken}` }),
      body: JSON.stringify({
        image: base64,
        style_id: styleId,
        quality: 'hd',
        width: CONFIG.HD_SIZE,
        height: CONFIG.HD_SIZE,
      }),
    });

    if (response.status === 401) throw new Error('Subscribe to unlock HD transformations.');
    if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Transformation failed' }));
      throw new Error(err.error || 'Transformation failed');
    }
    const data = await response.json();
    return { imageUrl: data.image_url, isHD: true, remainingToday: data.remaining_today ?? 9 };
  }

  const ImageManipulator = await import('expo-image-manipulator');
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) throw new Error('Could not encode image');
  if (manipulated.base64.length > 14_000_000) throw new Error('Image too large');

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/transform`, {
    method: 'POST',
    headers: workerHeaders({ Authorization: `Bearer ${subscriberToken}` }),
    body: JSON.stringify({
      image: manipulated.base64,
      style_id: styleId,
      quality: 'hd',
      width: CONFIG.HD_SIZE,
      height: CONFIG.HD_SIZE,
    }),
  });

  if (response.status === 401) throw new Error('Subscribe to unlock HD transformations.');
  if (response.status === 429) throw new Error('Daily limit reached (10 HD/day). Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Transformation failed');
  }

  const data = await response.json();
  return { imageUrl: data.image_url, isHD: true, remainingToday: data.remaining_today };
}

// HARD PAYWALL: the on-device "preview" tier was removed — it only resized the
// original (before == after) and undermined the paywall. Every transformation
// now goes through transformHD with an active subscription.

/**
 * Maxed-Out Self teaser (EPIC 4.4): generates the glow_max at STANDARD quality
 * without auth (worker free standard path, IP rate-limited) so the locked
 * reveal can show the user's blurred potential right before the paywall.
 * Returns null on any failure — the teaser is best-effort, never blocking.
 */
export async function transformTeaser(imageUri: string): Promise<string | null> {
  try {
    if (isWeb) {
      if (!REAL_WORKER) {
        await new Promise(r => setTimeout(r, 1200));
        return imageUri; // web preview: reuse the selfie (blurred by the UI)
      }
      const base64 = await webImageToJpegBase64(imageUri, CONFIG.PREVIEW_SIZE);
      if (!base64) return null;
      const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/transform`, {
        method: 'POST',
        headers: workerHeaders(),
        body: JSON.stringify({
          image: base64,
          style_id: 'glow_max',
          width: CONFIG.PREVIEW_SIZE,
          height: CONFIG.PREVIEW_SIZE,
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.image_url || null;
    }
    const ImageManipulator = await import('expo-image-manipulator');
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: CONFIG.PREVIEW_SIZE, height: CONFIG.PREVIEW_SIZE } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!manipulated.base64) return null;
    const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/transform`, {
      method: 'POST',
      headers: workerHeaders(),
      body: JSON.stringify({
        image: manipulated.base64,
        style_id: 'glow_max',
        width: CONFIG.PREVIEW_SIZE,
        height: CONFIG.PREVIEW_SIZE,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.image_url || null;
  } catch {
    return null;
  }
}
