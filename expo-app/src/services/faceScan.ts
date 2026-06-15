import { Platform } from 'react-native';
import { CONFIG, workerHeaders } from '../config';

const isWeb = Platform.OS === 'web';

export interface Treatment {
  name: string;
  detail: string;
  impact: number; // 0-100 expected visual improvement
}

export interface GlowScore {
  overall: number;
  skin: number;
  jawline: number;
  symmetry: number;
  eyes: number;
  harmony: number;
  // Diagnostic components (the 6 displayed + internal proportions)
  nose_lip_ratio: number;
  lip_harmony: number;
  eye_spacing: number;
  jawline_angle: number;
  forehead_proportion: number;
  potential: number;
  percentile: number;
  rationale: string;
  tips: string[];
  treatments: Treatment[];
  remaining_today?: number;
}

const clamp = (n: any) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/**
 * Fill the Aura-style fields when the deployed Worker predates them, so the
 * app renders correctly against both old and new backends. Derivations are
 * deterministic (same input, same output).
 */
function normalizeScore(data: any): GlowScore {
  const skin = clamp(data.skin);
  const jawline = clamp(data.jawline);
  const symmetry = clamp(data.symmetry);
  const eyes = clamp(data.eyes);
  const harmony = clamp(data.harmony);
  const tips: string[] = Array.isArray(data.tips) ? data.tips.map((t: any) => String(t)) : [];

  let treatments: Treatment[] = Array.isArray(data.treatments)
    ? data.treatments
        .slice(0, 3)
        .map((t: any) => ({
          name: String(t?.name || 'Glow-up step'),
          detail: String(t?.detail || ''),
          impact: clamp(t?.impact),
        }))
    : [];
  if (treatments.length === 0 && tips.length > 0) {
    // Old worker: derive treatments from tips, impact anchored on the weakest metrics
    const weakest = Math.min(skin, jawline, symmetry, eyes, harmony) || 60;
    treatments = tips.slice(0, 3).map((text, i) => ({
      name: `Treatment ${i + 1}`,
      detail: text,
      impact: clamp(100 - weakest - i * 7),
    }));
  }

  return {
    overall: clamp(data.overall),
    skin, jawline, symmetry, eyes, harmony,
    nose_lip_ratio: clamp(data.nose_lip_ratio ?? Math.round(harmony * 0.6 + skin * 0.4)),
    lip_harmony: clamp(data.lip_harmony ?? Math.round(harmony * 0.5 + symmetry * 0.5)),
    eye_spacing: clamp(data.eye_spacing ?? eyes),
    jawline_angle: clamp(data.jawline_angle ?? jawline),
    forehead_proportion: clamp(data.forehead_proportion ?? symmetry),
    potential: clamp(data.potential),
    percentile: clamp(data.percentile),
    rationale: typeof data.rationale === 'string' ? data.rationale : '',
    tips,
    treatments,
    remaining_today: data.remaining_today,
  };
}

/**
 * Scan a selfie and return a GlowScore. Passing a subscriber token raises the
 * daily scan limit. Mirrors the upload pattern in featureService.ts.
 */
export async function faceScan(imageUri: string, token?: string, focus?: string, extraImages?: string[]): Promise<GlowScore> {
  if (isWeb) {
    // Web preview — believable mock so the reveal UI is demo-able without a backend
    await new Promise((r) => setTimeout(r, 1800));
    return normalizeScore({
      overall: 72, skin: 70, jawline: 67, symmetry: 76, eyes: 80, harmony: 73,
      nose_lip_ratio: 71, lip_harmony: 74, eye_spacing: 78, jawline_angle: 68, forehead_proportion: 75,
      potential: 89, percentile: 74,
      rationale: 'Great bone structure and bright eyes — small tweaks unlock a big jump.',
      tips: [
        'Tighten your skincare routine for clearer skin',
        'A structured haircut will sharpen your jawline',
        'Shoot photos in soft, natural light',
      ],
      treatments: [
        { name: 'Glass Skin Routine', detail: 'A gentle exfoliant + hydrating serum evens tone in 2 weeks', impact: 84 },
        { name: 'Face Framing Layers', detail: 'Soft layers around the cheekbones balance face shape', impact: 76 },
        { name: 'Golden Hour Lighting', detail: 'Soft warm light from 45° flatters your features most', impact: 69 },
      ],
    });
  }

  const ImageManipulator = await import('expo-image-manipulator');
  const encode = async (uri: string): Promise<string> => {
    const m = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: CONFIG.PREVIEW_SIZE, height: CONFIG.PREVIEW_SIZE } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!m.base64) throw new Error('Could not encode image');
    if (m.base64.length > 14_000_000) throw new Error('Image too large');
    return m.base64;
  };

  const front = await encode(imageUri);
  // Multi-angle: front + any extra angles (3/4 left, 3/4 right) for a fuller read.
  const extras = extraImages?.length ? await Promise.all(extraImages.map(encode)) : [];
  const images = [front, ...extras];

  const headers = workerHeaders(token ? { Authorization: `Bearer ${token}` } : {});

  const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/face-scan`, {
    method: 'POST',
    headers,
    // `image` kept for backward compat; `images` carries every captured angle.
    body: JSON.stringify({ image: front, images, ...(focus ? { focus } : {}) }),
  });

  if (response.status === 429) throw new Error('Daily scan limit reached. Try again tomorrow!');
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Scan failed');
  }

  const data = await response.json();
  if (!data || typeof data.overall !== 'number') {
    throw new Error('No face detected. Try a clear, front-facing selfie.');
  }
  return normalizeScore(data);
}
