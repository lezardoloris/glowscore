import { Platform } from 'react-native';
import { CONFIG } from '../config';

const isWeb = Platform.OS === 'web';

async function uploadAndProcess(
  endpoint: string,
  imageUri: string,
  params: Record<string, any>,
  token?: string
): Promise<string> {
  if (isWeb) {
    // Web preview — simulate with delay, return same image
    await new Promise(r => setTimeout(r, 2000));
    return imageUri;
  }

  const ImageManipulator = await import('expo-image-manipulator');
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) throw new Error('Could not encode image');
  if (manipulated.base64.length > 14_000_000) throw new Error('Image too large');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      image: manipulated.base64,
      ...params,
    }),
  });

  if (response.status === 401) throw new Error('Subscribe to unlock this feature.');
  if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Processing failed');
  }

  const data = await response.json();
  return data.image_url;
}

async function uploadTwoImages(
  endpoint: string,
  imageUri1: string,
  imageUri2: string,
  paramName1: string,
  paramName2: string,
  params: Record<string, any>,
  token?: string
): Promise<string> {
  if (isWeb) {
    await new Promise(r => setTimeout(r, 2000));
    return imageUri1;
  }

  const ImageManipulator = await import('expo-image-manipulator');

  const [m1, m2] = await Promise.all([
    ImageManipulator.manipulateAsync(
      imageUri1,
      [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    ),
    ImageManipulator.manipulateAsync(
      imageUri2,
      [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    ),
  ]);

  if (!m1.base64 || !m2.base64) throw new Error('Could not encode images');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      [paramName1]: m1.base64,
      [paramName2]: m2.base64,
      ...params,
    }),
  });

  if (response.status === 401) throw new Error('Subscribe to unlock this feature.');
  if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Processing failed');
  }

  const data = await response.json();
  return data.image_url;
}

export async function faceSwap(
  sourceUri: string,
  targetUri: string,
  quality: string
): Promise<string> {
  return uploadTwoImages(
    '/api/face-swap',
    sourceUri,
    targetUri,
    'source_image',
    'target_image',
    { quality }
  );
}

export async function instantStyle(
  imageUri: string,
  style: string,
  quality: string
): Promise<string> {
  return uploadAndProcess('/api/instant-style', imageUri, { style, quality });
}

export async function headshot(
  imageUri: string,
  background: string,
  quality: string
): Promise<string> {
  return uploadAndProcess('/api/headshot', imageUri, { background, quality });
}

export async function hairChange(
  imageUri: string,
  prompt: string,
  quality: string
): Promise<string> {
  return uploadAndProcess('/api/hair-change', imageUri, { prompt, quality });
}

export async function relight(
  imageUri: string,
  prompt: string,
  direction: string,
  quality: string
): Promise<string> {
  return uploadAndProcess('/api/relight', imageUri, { prompt, direction, quality });
}

export async function ageTransform(
  imageUri: string,
  targetAge: number,
  quality: string
): Promise<string> {
  return uploadAndProcess('/api/age-transform', imageUri, { target_age: targetAge, quality });
}

export async function tryOn(
  humanUri: string,
  garmentUri: string,
  garmentType: string
): Promise<string> {
  return uploadTwoImages(
    '/api/try-on',
    humanUri,
    garmentUri,
    'human_image',
    'garment_image',
    { garment_type: garmentType }
  );
}

/** Apply an AI makeup look. Premium only. Returns image URL. */
export async function applyMakeup(
  imageUri: string,
  look: string,
  token: string
): Promise<string> {
  if (isWeb) {
    await new Promise(r => setTimeout(r, 1500));
    return imageUri;
  }

  const ImageManipulator = await import('expo-image-manipulator');
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024, height: 1024 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error('Could not encode image');

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/makeup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ image: manipulated.base64, look }),
  });

  if (response.status === 401) throw new Error('Subscribe to unlock');
  if (response.status === 429) throw new Error('Daily limit reached');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Makeup failed');
  }

  const data = await response.json();
  return data.image_url;
}

// ─── Video Features ──────────────────────────────────────────────────────────

/** Upload image + video for animate portrait. Returns video URL. */
export async function animatePortrait(
  imageUri: string,
  videoUri: string
): Promise<string> {
  if (isWeb) {
    await new Promise(r => setTimeout(r, 2000));
    return imageUri;
  }

  const ImageManipulator = await import('expo-image-manipulator');
  const FileSystem = await import('expo-file-system');

  // Encode image
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!manipulated.base64) throw new Error('Could not encode image');

  // Encode video as base64 (max ~20MB raw → ~27MB base64)
  const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (videoBase64.length > 30_000_000) throw new Error('Video too large. Use a shorter clip (under 10 seconds).');

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/animate-portrait`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: manipulated.base64,
      video: videoBase64,
    }),
  });

  if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Animation failed');
  }

  const data = await response.json();
  return data.video_url;
}

/** Upload source video + audio for talking photo. Returns video URL. Premium only. */
export async function talkingPhoto(
  videoUri: string,
  audioUri: string,
  token: string
): Promise<string> {
  if (isWeb) {
    await new Promise(r => setTimeout(r, 2000));
    return videoUri;
  }

  const FileSystem = await import('expo-file-system');

  const [videoBase64, audioBase64] = await Promise.all([
    FileSystem.readAsStringAsync(videoUri, { encoding: FileSystem.EncodingType.Base64 }),
    FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 }),
  ]);
  if (videoBase64.length > 30_000_000) throw new Error('Video too large. Use a shorter clip (under 10 seconds).');
  if (audioBase64.length > 15_000_000) throw new Error('Audio too large. Keep recordings under 30 seconds.');

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/talking-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      source_video: videoBase64,
      audio: audioBase64,
    }),
  });

  if (response.status === 401) throw new Error('Subscribe to unlock Talking Photo.');
  if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Lip-sync failed');
  }

  const data = await response.json();
  return data.video_url;
}

/** Remove background from image. Returns image URL (PNG with transparency). */
export async function backgroundRemoval(
  imageUri: string
): Promise<string> {
  return uploadAndProcess('/api/background-removal', imageUri, {
    model: 'Portrait',
    output_format: 'png',
  });
}

/** Create a 3D cartoon caricature. Returns image URL. */
export async function caricature(imageUri: string): Promise<string> {
  return uploadAndProcess('/api/caricature', imageUri, {});
}

/** Restore old or damaged photos. Returns image URL. */
export async function photoRestore(
  imageUri: string,
  fixColors: boolean = true,
  removeScratches: boolean = true,
  enhanceResolution: boolean = true
): Promise<string> {
  return uploadAndProcess('/api/photo-restore', imageUri, {
    fix_colors: fixColors,
    remove_scratches: removeScratches,
    enhance_resolution: enhanceResolution,
  });
}

/** Generate styled pet portrait. Returns image URL. */
export async function petPortrait(imageUri: string, style: string): Promise<string> {
  return uploadAndProcess('/api/pet-portrait', imageUri, { style });
}

/** Generate fitness body transformation. Returns image URL. */
export async function fitnessTransform(imageUri: string, intensity: string = 'moderate'): Promise<string> {
  return uploadAndProcess('/api/fitness-transform', imageUri, { intensity });
}

/** Upscale image to 4K. Returns image URL. */
export async function upscale(imageUri: string): Promise<string> {
  return uploadAndProcess('/api/upscale', imageUri, {});
}
