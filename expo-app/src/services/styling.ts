import { Platform } from 'react-native';
import { CONFIG, workerHeaders } from '../config';
import { analyzeColorSeasonLocal } from './colorScience';

const isWeb = Platform.OS === 'web';
const REAL_WORKER = !CONFIG.WORKER_BASE_URL.includes('your-domain');

export interface ColorSeasonResult {
  season: string;
  sub_season: string;
  undertone: string;
  contrast: number;       // 0-10
  confidence: number;     // 0-100
  description: string;
  palette: string[];      // hex
  avoid: string[];        // hex
  metal: string;
  lip: string;
  blush: string;
}

export interface VisualWeightResult {
  weight: 'high' | 'low' | 'balanced';
  score: number;          // 0-100
  label: string;
  confidence: number;
  description: string;
  makeup_tips: string[];
}

/** Web-only: decode any image URI to a downscaled base64 JPEG (no data prefix). */
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
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const dataUrl: string = canvas.toDataURL('image/jpeg', 0.9);
    const comma = dataUrl.indexOf(',');
    return comma >= 0 ? dataUrl.slice(comma + 1) : null;
  } catch {
    return null;
  }
}

async function imageToBase64(imageUri: string): Promise<string> {
  if (isWeb) {
    const b64 = await webImageToJpegBase64(imageUri, CONFIG.HD_SIZE);
    if (!b64) throw new Error('Could not read the selected image.');
    return b64;
  }
  const ImageManipulator = await import('expo-image-manipulator');
  const m = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: CONFIG.HD_SIZE, height: CONFIG.HD_SIZE } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  if (!m.base64) throw new Error('Could not encode image');
  return m.base64;
}

async function postJson<T>(endpoint: string, imageUri: string, token: string): Promise<T> {
  const base64 = await imageToBase64(imageUri);
  const response = await fetch(`${CONFIG.WORKER_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: workerHeaders({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify({ image: base64 }),
  });
  if (response.status === 401) throw new Error('Subscribe to unlock this feature.');
  if (response.status === 429) throw new Error('Daily limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Analysis failed');
  }
  return (await response.json()) as T;
}

const MOCK_COLOR: ColorSeasonResult = {
  season: 'Summer', sub_season: 'Soft Summer', undertone: 'Cool', contrast: 4, confidence: 88,
  description: 'Soft, cool and muted: your face glows in gentle, dusty tones.',
  palette: ['#8FA9C0', '#C9A0B4', '#A7B6A0', '#D8C7D0', '#6E8290', '#B5A28A'],
  avoid: ['#FF6A00', '#000000', '#FFE600'], metal: 'silver', lip: '#B56576', blush: '#D99BA8',
};
const MOCK_VWEIGHT: VisualWeightResult = {
  weight: 'low', score: 38, label: 'Soft Radiance', confidence: 86,
  description: 'Your features read soft and blended, suited to luminous, diffused makeup.',
  makeup_tips: ['Cream blush over powder for a lit-from-within glow', 'Soft smudged liner, skip harsh wings', 'Tinted brows, avoid heavy blocky shapes'],
};

export async function analyzeColorSeason(imageUri: string, token: string): Promise<ColorSeasonResult> {
  // Web: deterministic color science (pixel sampling) — reliable + offline, no LLM.
  if (isWeb) {
    const local = await analyzeColorSeasonLocal(imageUri);
    if (local) return local;
    if (!REAL_WORKER) return MOCK_COLOR;
  }
  try {
    return await postJson<ColorSeasonResult>('/api/color-season', imageUri, token);
  } catch (e) {
    if (isWeb) return MOCK_COLOR;
    throw e;
  }
}

export async function analyzeVisualWeight(imageUri: string, token: string): Promise<VisualWeightResult> {
  if (isWeb && !REAL_WORKER) { await new Promise(r => setTimeout(r, 1600)); return MOCK_VWEIGHT; }
  try {
    return await postJson<VisualWeightResult>('/api/visual-weight', imageUri, token);
  } catch (e) {
    if (isWeb) return MOCK_VWEIGHT;
    throw e;
  }
}
