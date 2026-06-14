import { Platform } from 'react-native';
import { CONFIG, workerHeaders } from '../config';

const isWeb = Platform.OS === 'web';

export interface TransformResult {
  imageUrl: string;
  isHD: boolean;
  remainingToday: number;
}

// Cloud HD transformation via Cloudflare Worker → fal.ai
export async function transformHD(
  imageUri: string,
  styleId: string,
  subscriberToken: string
): Promise<TransformResult> {
  if (isWeb) {
    // Web preview — simulate transform (no real API call)
    await new Promise(r => setTimeout(r, 2000));
    return { imageUrl: imageUri, isHD: true, remainingToday: 9 };
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
      await new Promise(r => setTimeout(r, 1200));
      return imageUri; // web preview: reuse the selfie (blurred by the UI)
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
