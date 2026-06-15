import { Platform } from 'react-native';
import { CONFIG, workerHeaders } from '../config';

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

  const headers = workerHeaders(token ? { Authorization: `Bearer ${token}` } : {});

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
    headers: workerHeaders({ Authorization: `Bearer ${token}` }),
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
