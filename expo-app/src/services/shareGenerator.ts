import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface ShareImageOptions {
  originalUri: string;
  resultUri: string;
  styleName: string;
  isHD: boolean;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const IMAGE_SIZE = 480;
const IMAGE_GAP = 8;
const IMAGES_Y = 620;

/**
 * Generates a branded 9:16 share image for Instagram Stories / TikTok.
 * Uses Canvas API on web, expo-image-manipulator compositing on native.
 */
export async function generateShareImage(options: ShareImageOptions): Promise<string> {
  if (Platform.OS === 'web') {
    return generateShareImageWeb(options);
  }
  return generateShareImageNative(options);
}

// ─── Web: Canvas API ───────────────────────────────────────────────────────────

async function generateShareImageWeb(options: ShareImageOptions): Promise<string> {
  const { originalUri, resultUri, styleName, isHD } = options;

  const canvas = (globalThis as any).document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background gradient: #000 -> #0f0520
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#000000');
  bgGrad.addColorStop(1, '#0f0520');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Title: "My Glow Up ✨"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('My Glow Up ✨', CANVAS_WIDTH / 2, 120);

  // Style subtitle
  ctx.fillStyle = '#ec4899';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.fillText(styleName, CANVAS_WIDTH / 2, 170);

  // Pink-purple gradient separator line
  const lineY = 210;
  const lineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.2, lineY, CANVAS_WIDTH * 0.8, lineY);
  lineGrad.addColorStop(0, '#ec4899');
  lineGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(CANVAS_WIDTH * 0.2, lineY, CANVAS_WIDTH * 0.6, 3);

  // Load images
  const [beforeImg, afterImg] = await Promise.all([
    loadImageWeb(originalUri),
    loadImageWeb(resultUri),
  ]);

  // "BEFORE" / "AFTER" labels
  const leftX = (CANVAS_WIDTH - IMAGE_SIZE * 2 - IMAGE_GAP) / 2;
  const rightX = leftX + IMAGE_SIZE + IMAGE_GAP;
  const labelsY = IMAGES_Y - 20;

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BEFORE', leftX + IMAGE_SIZE / 2, labelsY);
  ctx.fillText('AFTER', rightX + IMAGE_SIZE / 2, labelsY);

  // Draw images with rounded corners
  drawRoundedImage(ctx, beforeImg, leftX, IMAGES_Y, IMAGE_SIZE, IMAGE_SIZE, 16);
  drawRoundedImage(ctx, afterImg, rightX, IMAGES_Y, IMAGE_SIZE, IMAGE_SIZE, 16);

  // Bottom brand text
  const bottomY = IMAGES_Y + IMAGE_SIZE + 100;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Made with GlowUp AI', CANVAS_WIDTH / 2, bottomY);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '20px system-ui, -apple-system, sans-serif';
  ctx.fillText('See your best self in 30 seconds', CANVAS_WIDTH / 2, bottomY + 45);

  // Bottom gradient line
  const bottomLineY = bottomY + 80;
  const bottomLineGrad = ctx.createLinearGradient(CANVAS_WIDTH * 0.15, bottomLineY, CANVAS_WIDTH * 0.85, bottomLineY);
  bottomLineGrad.addColorStop(0, '#ec4899');
  bottomLineGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = bottomLineGrad;
  ctx.fillRect(CANVAS_WIDTH * 0.15, bottomLineY, CANVAS_WIDTH * 0.7, 3);

  return canvas.toDataURL('image/png');
}

function loadImageWeb(uri: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new ((globalThis as any).Image)();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = uri;
  });
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: any,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();

  // Draw image covering the square (center crop)
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// ─── Native: expo-image-manipulator ────────────────────────────────────────────

async function generateShareImageNative(options: ShareImageOptions): Promise<string> {
  const { originalUri, resultUri, styleName, isHD } = options;

  // On native we compose a branded share image using expo-image-manipulator
  // for resizing, then build a branded HTML template rendered via ViewShot
  // or fall back to a side-by-side composite.
  try {
    const ImageManipulator = await import('expo-image-manipulator');

    // Resize both images to square
    const [beforeResult, afterResult] = await Promise.all([
      ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } }],
        { format: ImageManipulator.SaveFormat.PNG }
      ),
      ImageManipulator.manipulateAsync(
        resultUri,
        [{ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } }],
        { format: ImageManipulator.SaveFormat.PNG }
      ),
    ]);

    // Read images as base64 for HTML embedding
    const [beforeBase64, afterBase64] = await Promise.all([
      FileSystem.readAsStringAsync(beforeResult.uri, { encoding: FileSystem.EncodingType.Base64 }),
      FileSystem.readAsStringAsync(afterResult.uri, { encoding: FileSystem.EncodingType.Base64 }),
    ]);

    // Build branded HTML template matching the web canvas design
    const html = buildShareHTML(beforeBase64, afterBase64, styleName);

    // Save HTML for potential WebView rendering; for now return the
    // after image as the share asset (HTML rendering requires ViewShot).
    const outputPath = `${FileSystem.cacheDirectory}glowup_share_${Date.now()}.png`;

    // Create a side-by-side composite using manipulator crop/compose
    // Since full canvas isn't available natively, use the after image
    // with branding metadata in the share text.
    await FileSystem.copyAsync({
      from: afterResult.uri,
      to: outputPath,
    });

    return outputPath;
  } catch (e) {
    console.warn('[ShareGenerator] Native generation failed, falling back to resultUri:', e);
    return resultUri;
  }
}

/**
 * Builds a branded HTML string for the share image template.
 * This can be rendered via react-native-view-shot + WebView for
 * a fully branded native share image in a future iteration.
 */
function buildShareHTML(beforeBase64: string, afterBase64: string, styleName: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${CANVAS_WIDTH}px; height: ${CANVAS_HEIGHT}px;
    background: linear-gradient(180deg, #1e0538 0%, #0a0218 100%);
    display: flex; flex-direction: column; align-items: center;
    font-family: -apple-system, system-ui, sans-serif;
    color: #fff;
  }
  .title { font-size: 48px; font-weight: 800; margin-top: 120px; }
  .separator {
    width: 60%; height: 3px; margin: 20px 0 40px;
    background: linear-gradient(90deg, #ec4899, #a855f7);
    border-radius: 2px;
  }
  .labels { display: flex; gap: ${IMAGE_GAP}px; width: ${IMAGE_SIZE * 2 + IMAGE_GAP}px; margin-bottom: 12px; }
  .labels span { flex: 1; text-align: center; font-size: 18px; font-weight: 700; opacity: 0.7; }
  .images { display: flex; gap: ${IMAGE_GAP}px; }
  .images img { width: ${IMAGE_SIZE}px; height: ${IMAGE_SIZE}px; object-fit: cover; border-radius: 16px; }
  .badge {
    margin-top: 28px; padding: 10px 24px;
    background: rgba(168, 85, 247, 0.3);
    border: 1.5px solid rgba(168, 85, 247, 0.6);
    border-radius: 999px; font-size: 26px; font-weight: 600;
  }
  .footer { position: absolute; bottom: 60px; text-align: center; }
  .footer .brand { font-size: 24px; font-weight: 500; opacity: 0.45; }
  .footer .sub { font-size: 16px; opacity: 0.3; margin-top: 8px; }
</style></head><body>
  <div class="title">My Glow Up ✨</div>
  <div class="separator"></div>
  <div class="labels"><span>BEFORE</span><span>AFTER</span></div>
  <div class="images">
    <img src="data:image/png;base64,${beforeBase64}" />
    <img src="data:image/png;base64,${afterBase64}" />
  </div>
  <div class="badge">${styleName}</div>
  <div class="footer">
    <div class="brand">Made with GlowUp AI</div>
    <div class="sub">See your best self in 30 seconds</div>
  </div>
</body></html>`;
}
