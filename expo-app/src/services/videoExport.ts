import { Platform } from 'react-native';

/**
 * Before/After reveal video export — the viral UA asset (slider-wipe, 9:16).
 *
 * STATUS: scaffold. Real video composition is NOT possible in pure JS / Expo Go.
 * Pick ONE implementation before shipping Phase 4:
 *
 *  A) Server-side (best for scale): add a `/api/before-after-video` endpoint to
 *     the Cloudflare Worker that stitches before+after into a 9:16 mp4 (fal.ai
 *     video/edit model or an ffmpeg service), caches it in R2, returns the URL.
 *     Mirrors cacheVideoInR2() already present in CloudflareWorker/src/index.ts.
 *  B) Higgsfield MCP (best for the mass UGC ad factory, Phase 6): generate the
 *     before/after reveal clip with Seedance from the two stills — same engine
 *     used for the bulk TikTok/UA creatives.
 *  C) On-device (dev build only): react-native-skia frame capture + an mp4
 *     encoder. Does NOT work in Expo Go — requires an EAS dev build.
 *
 * Until one is wired, callers must treat a null return as "video export
 * unavailable" and fall back to the branded image share (shareGenerator.ts).
 */
export interface BeforeAfterVideoParams {
  beforeUri: string;
  afterUri: string;
  /** Optional caption / score overlay text */
  caption?: string;
}

export async function exportBeforeAfterVideo(
  _params: BeforeAfterVideoParams,
  _token?: string,
): Promise<string | null> {
  // TODO(phase-4): wire option A (worker) or B (Higgsfield MCP). See file header.
  if (Platform.OS === 'web') return null;
  return null;
}

/** False until a Phase 4 backend is wired — UI should hide the "Share as video" button while false. */
export const VIDEO_EXPORT_ENABLED = false;
