import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

/**
 * Capture an off-screen view (e.g. <ShareCard/>) to a PNG and open the native
 * share sheet. Falls back to `fallback()` (usually a plain text share) on web
 * or if capture/sharing is unavailable. This is the in-app viral share asset —
 * a branded image, not a text string.
 */
export async function captureAndShare(ref: any, fallback: () => Promise<void>): Promise<void> {
  if (Platform.OS === 'web' || !ref?.current) {
    await fallback();
    return;
  }
  try {
    // Native module declared in package.json; types resolve after `npm install`.
    // @ts-ignore
    const { captureRef } = await import('react-native-view-shot');
    const uri = await captureRef(ref, { format: 'png', quality: 1 });
    if (uri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
      return;
    }
    await fallback();
  } catch (e) {
    console.warn('[ShareCapture] capture failed, falling back:', e);
    await fallback();
  }
}
