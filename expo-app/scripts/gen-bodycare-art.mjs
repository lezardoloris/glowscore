#!/usr/bin/env node
/**
 * Generate inclusive Body Care imagery (EPIC PS-5.3) with Gemini "Nano Banana"
 * (gemini-2.5-flash-image), the same model the Worker uses for transforms.
 *
 * Usage:  GEMINI_API_KEY=xxx node scripts/gen-bodycare-art.mjs
 * Output: assets/components/_candidates/*.png  (review, then promote the winner)
 *
 * Brand: clinical-luxury rose/blush (#F9E0E8 bg, #E0537A pink). Apple-safe:
 * tasteful, modest, body-positive, wellness-framed. No weight/shame framing.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }

const MODEL = 'gemini-2.5-flash-image';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'assets', 'components', '_candidates');
mkdirSync(OUT, { recursive: true });

const BRAND =
  'Soft diffused studio lighting, warm blush-pink seamless background (#F9E0E8), rose and cream palette. ' +
  'Clean premium clinical-luxury skincare editorial aesthetic, subtle film grain, high resolution. ' +
  'Tasteful, modest, body-positive and confident. No text, no logos, no watermark.';

const JOBS = [
  {
    file: 'bodycare_woman_deep.png',
    prompt:
      'Editorial wellness photograph for a body-care app. A confident plus-size woman with rich deep-brown skin, ' +
      'wearing comfortable cream-colored athleisure (a supportive sports top and high-waist leggings), relaxed natural pose with one hand softly on her hip, ' +
      'calm genuine expression, mid-body crop from collarbone to hips. ' + BRAND,
  },
  {
    file: 'bodycare_woman_medium.png',
    prompt:
      'Editorial wellness photograph for a body-care app. A confident plus-size woman with warm medium-tan skin, ' +
      'wearing soft dusty-pink loungewear, relaxed natural pose, gently touching her arm, serene expression, mid-body crop from collarbone to hips. ' + BRAND,
  },
  {
    file: 'bodycare_woman_fair.png',
    prompt:
      'Editorial wellness photograph for a body-care app. A confident plus-size woman with fair skin and freckles, ' +
      'wearing neutral oatmeal-toned comfortable knitwear, relaxed natural pose, soft self-assured smile, mid-body crop from collarbone to hips. ' + BRAND,
  },
  {
    file: 'bodycare_stilllife.png',
    prompt:
      'Premium clinical-luxury still life for a body-care app. A few minimalist unbranded body-care items, ' +
      'a tube of barrier cream, a frosted-glass bottle of body oil, and a folded soft cotton cloth, arranged on a blush-pink surface with a single fresh eucalyptus sprig, ' +
      'airy composition with generous negative space. ' + BRAND,
  },
  // Home first-run hero (PS-5.3): representative beauty portraits, face visible for a cover-crop hero.
  {
    file: 'home_hero_warm.png',
    prompt:
      'Editorial beauty portrait for a face & body wellness app. A radiant confident plus-size woman with warm medium-tan skin, ' +
      'head and shoulders, soft naturally glowing dewy skin, gentle genuine smile, looking softly at the camera, hair styled naturally, ' +
      'face centered in the upper third of the frame. Soft diffused beauty lighting. ' + BRAND,
  },
  {
    file: 'home_hero_light.png',
    prompt:
      'Editorial beauty portrait for a face & body wellness app. A radiant confident plus-size woman with fair skin and soft freckles, ' +
      'head and shoulders, soft naturally glowing dewy skin, calm self-assured expression, looking softly at the camera, hair styled naturally, ' +
      'face centered in the upper third of the frame. Soft diffused beauty lighting. ' + BRAND,
  },
];

async function gen(job) {
  const body = { contents: [{ parts: [{ text: job.prompt }] }] };
  const resp = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) { console.error(`  ${job.file}: HTTP ${resp.status} ${(await resp.text()).slice(0, 200)}`); return false; }
  const json = await resp.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const data = parts.map((p) => p?.inlineData?.data || p?.inline_data?.data).find(Boolean);
  if (!data) { console.error(`  ${job.file}: no image in response ${JSON.stringify(json).slice(0, 200)}`); return false; }
  writeFileSync(join(OUT, job.file), Buffer.from(data, 'base64'));
  console.log(`  ok  ${job.file}`);
  return true;
}

const only = process.argv[2]; // optional: generate a single file by name
for (const job of JOBS) {
  if (only && job.file !== only) continue;
  try { await gen(job); } catch (e) { console.error(`  ${job.file}: ${e.message}`); }
}
console.log(`Done -> ${OUT}`);
