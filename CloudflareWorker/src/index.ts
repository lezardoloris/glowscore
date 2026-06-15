export interface Env {
  FAL_API_KEY: string;
  REVENUECAT_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
  IMAGES_BUCKET: R2Bucket;
  // GlowScore vision LLM (OpenAI-compatible chat-completions, e.g. OpenRouter)
  LLM_API_KEY: string;
  LLM_BASE_URL?: string; // default https://openrouter.ai/api/v1
  LLM_MODEL?: string;    // default openai/gpt-4o-mini (vision-capable)
  // Optional: Gemini "Nano Banana" image model for the Maxed-Out Self glow-up
  // (better identity preservation than fal IP-adapter). If unset, falls back to fal.
  GEMINI_API_KEY?: string;
  // Optional: HMAC secret for signed /images/ URLs. If set, unsigned requests are rejected.
  SIGNING_SECRET?: string;
  // Optional: shared app token (anti-abuse). If set, /api/* POSTs must send a matching X-App-Token.
  APP_TOKEN?: string;
  // "production" enforces subscription on premium endpoints. Anything else (e.g.
  // "development" in .dev.vars) bypasses auth so local web testing works.
  ENVIRONMENT?: string;
}

// ─── Style presets for Glow Up transforms ───────────────────────────────────

const STYLE_PRESETS: Record<string, { prompt: string; negative_prompt: string; ip_adapter_scale: number }> = {
  clear_skin: {
    prompt: "beautiful portrait, clear flawless skin, even skin tone, natural glow, soft studio lighting, professional photography",
    negative_prompt: "blemishes, acne, redness, blurry, deformed, low quality",
    ip_adapter_scale: 0.85,
  },
  model_look: {
    prompt: "high fashion editorial portrait, professional model, perfect lighting, vogue magazine cover, glamorous, confident",
    negative_prompt: "amateur, blurry, deformed, low quality, bad lighting",
    ip_adapter_scale: 0.75,
  },
  hair_makeover: {
    prompt: "beautiful portrait with stylish modern haircut, salon quality hair, volumized shiny hair, professional hairstyling",
    negative_prompt: "messy hair, bad haircut, blurry, deformed, low quality",
    ip_adapter_scale: 0.70,
  },
  age_rewind: {
    prompt: "youthful portrait, young looking skin, vibrant, energetic, natural beauty, warm lighting, 20 years old appearance",
    negative_prompt: "wrinkles, aging, tired, blurry, deformed, low quality",
    ip_adapter_scale: 0.80,
  },
  fit_version: {
    prompt: "fit healthy portrait, athletic build, toned, healthy glow, active lifestyle, natural lighting, confident posture",
    negative_prompt: "unhealthy, blurry, deformed, low quality, extreme",
    ip_adapter_scale: 0.70,
  },
  celebrity_glam: {
    prompt: "glamorous celebrity portrait, red carpet ready, perfect makeup, designer styling, paparazzi photography, A-list celebrity, flawless skin, dramatic lighting",
    negative_prompt: "casual, amateur, blurry, deformed, low quality, bad makeup",
    ip_adapter_scale: 0.75,
  },
  vintage_retro: {
    prompt: "classic Hollywood portrait, vintage film star look, 1950s glamour, black and white film aesthetic with warm tones, elegant, timeless beauty, soft focus",
    negative_prompt: "modern, digital, blurry, deformed, low quality, harsh lighting",
    ip_adapter_scale: 0.75,
  },
  cyberpunk: {
    prompt: "futuristic cyberpunk portrait, neon lighting, holographic accents, sci-fi aesthetic, electric blue and pink neon glow, high tech, chrome reflections, blade runner style",
    negative_prompt: "natural, organic, blurry, deformed, low quality, daylight",
    ip_adapter_scale: 0.70,
  },
  // GlowScore payoff — the "maxed-out potential" version of the same person
  glow_max: {
    prompt: "the most attractive maxed-out glow-up version of this exact person, same identity, preserve exact skin tone, ethnic features, face shape, nose shape and eye shape, flawless clear skin texture, well-defined jawline, balanced symmetry, styled hair, bright clear eyes, healthy radiant glow, professional flattering lighting, attractive photorealistic portrait",
    negative_prompt: "different person, different ethnicity, skin lightening, altered face shape, altered nose, blurry, deformed, low quality, exaggerated, unrealistic, plastic, fake, cartoon",
    ip_adapter_scale: 0.82,
  },
  // Stress-Faciometre payoff — same person after lymphatic drainage / lower stress (de-puffed)
  destress: {
    prompt: "the same exact person after one week of lymphatic drainage and reduced stress: less facial puffiness and water retention, de-puffed under-eyes, reduced dark circles, relaxed facial tension, calm refreshed healthy skin, soft natural daylight, photorealistic portrait",
    negative_prompt: "different person, different ethnicity, slimmed bones, altered face shape, altered nose, gaunt, weight loss, blurry, deformed, low quality, plastic, fake, cartoon",
    ip_adapter_scale: 0.85,
  },
};

// Gemini Nano Banana prompts per style (identity-preserving img2img). Keys here
// route through callGeminiGlowup instead of fal.ai when GEMINI_API_KEY is set.
const GEMINI_PROMPTS: Record<string, string> = {
  destress:
    "Show this exact same person after a week of consistent lymphatic drainage and lower stress. " +
    "Reduce facial puffiness and water retention, de-puff the under-eyes and soften dark circles, " +
    "relax facial tension for a calm refreshed look. The natural contour can look slightly more defined " +
    "ONLY from reduced bloating. Keep it strictly photorealistic and fully preserve the core identity, " +
    "ethnicity, gender, bone structure, face shape, nose and eye shape. Do NOT slim the bones, do NOT " +
    "change face shape, do NOT make the face gaunt. Soft flattering daylight, natural healthy skin, 4K raw photo.",
};

// ─── Instant Style presets ──────────────────────────────────────────────────

const INSTANT_STYLE_PRESETS: Record<string, { prompt: string; negative_prompt: string }> = {
  anime: {
    prompt: "anime portrait style, studio ghibli, detailed eyes, cel shading, vibrant colors, Japanese animation aesthetic",
    negative_prompt: "photorealistic, blurry, deformed, low quality, western cartoon",
  },
  oil_painting: {
    prompt: "classical oil painting portrait, rich colors, visible brushstrokes, renaissance style, museum quality, dramatic chiaroscuro lighting",
    negative_prompt: "digital, photorealistic, blurry, deformed, low quality, flat colors",
  },
  "3d_render": {
    prompt: "3D rendered portrait, high quality CGI, subsurface scattering, volumetric lighting, Octane render, Cinema 4D, smooth skin",
    negative_prompt: "2D, flat, blurry, deformed, low quality, pixelated",
  },
  pixar: {
    prompt: "Pixar 3D animation style portrait, Disney character, big expressive eyes, smooth stylized features, colorful, family friendly",
    negative_prompt: "realistic, scary, blurry, deformed, low quality, dark",
  },
  watercolor: {
    prompt: "watercolor painting portrait, soft washes of color, wet-on-wet technique, artistic, delicate brush strokes, paper texture visible",
    negative_prompt: "photorealistic, digital, blurry, deformed, low quality, harsh edges",
  },
  comic: {
    prompt: "comic book style portrait, bold outlines, halftone dots, vibrant pop art colors, Marvel DC style, dynamic, superhero aesthetic",
    negative_prompt: "photorealistic, blurry, deformed, low quality, muted colors",
  },
};

// ─── Headshot background presets ────────────────────────────────────────────

const HEADSHOT_BACKGROUNDS: Record<string, string> = {
  office: "modern office background with blurred bookshelves",
  neutral: "clean neutral gray gradient background",
  outdoor: "natural outdoor background with soft bokeh greenery",
  studio: "professional photography studio backdrop with soft lighting",
};

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface TransformRequest {
  image: string; // base64
  style_id: string;
  width: number;
  height: number;
  quality?: "standard" | "hd";
}

interface FaceSwapRequest {
  source_image_url: string;
  target_image_url: string;
  quality?: "standard" | "hd";
}

interface InstantStyleRequest {
  image_url: string;
  style: string;
  prompt?: string;
  quality?: "standard" | "hd";
}

interface HeadshotRequest {
  image_url: string;
  background: string;
  quality?: "standard" | "hd";
}

interface HairChangeRequest {
  image_url: string;
  prompt: string;
  quality?: "standard" | "hd";
}

interface RelightRequest {
  image_url: string;
  prompt: string;
  direction?: "left" | "right" | "top" | "bottom" | "none";
  quality?: "standard" | "hd";
}

interface AgeTransformRequest {
  image_url: string;
  target_age: number;
  quality?: "standard" | "hd";
}

interface TryOnRequest {
  human_image_url: string;
  garment_image_url: string;
  garment_type?: "upper_body" | "lower_body" | "dresses";
}

interface AnimatePortraitRequest {
  image_url?: string;
  image?: string;
  video_url?: string;
  video?: string; // base64 short clip (<10MB)
}

interface TalkingPhotoRequest {
  source_video_url?: string;
  source_video?: string; // base64
  audio_url?: string;
  audio?: string; // base64
}

interface BackgroundRemovalRequest {
  image_url?: string;
  image?: string;
  model?: "General Use (Light)" | "Portrait" | "General Use (Heavy)";
  output_format?: "png" | "webp";
}

interface CaricatureRequest {
  image_url?: string;
  image?: string;
  scale?: number;
  guidance_scale?: number;
}

interface PhotoRestoreRequest {
  image_url?: string;
  image?: string;
  fix_colors?: boolean;
  remove_scratches?: boolean;
  enhance_resolution?: boolean;
}

interface PetPortraitRequest {
  image_url?: string;
  image?: string;
  style: string;
  prompt?: string;
}

interface FitnessTransformRequest {
  image_url?: string;
  image?: string;
  intensity?: "light" | "moderate" | "dramatic";
}

interface UpscaleRequest {
  image_url?: string;
  image?: string;
}

// ─── Pet Portrait presets ────────────────────────────────────────────────────

const PET_PORTRAIT_PRESETS: Record<string, { prompt: string }> = {
  royal: { prompt: "a majestic royal portrait of this pet wearing a golden crown and royal robes, oil painting style, ornate frame, regal pose" },
  superhero: { prompt: "this pet as a powerful superhero, wearing a cape and mask, dynamic action pose, comic book style, bright colors" },
  astronaut: { prompt: "this pet as an astronaut in a spacesuit, floating in space with Earth in the background, photorealistic, NASA style" },
  renaissance: { prompt: "a Renaissance oil painting portrait of this pet, classical composition, rich colors, museum quality, dramatic lighting" },
  anime: { prompt: "this pet as an anime character, big expressive eyes, kawaii style, colorful, Studio Ghibli inspired" },
  detective: { prompt: "this pet as a detective wearing a trench coat and magnifying glass, noir style, dramatic shadows, mysterious" },
  wizard: { prompt: "this pet as a powerful wizard with a pointed hat and magical staff, fantasy setting, glowing magical effects, enchanted" },
  chef: { prompt: "this pet as a professional chef wearing a tall white chef hat, in a fancy kitchen, gourmet food, warm lighting" },
};

// ─── Fitness transform presets ───────────────────────────────────────────────

const FITNESS_PRESETS: Record<string, { prompt: string; ip_adapter_scale: number }> = {
  light: {
    prompt: "portrait of a fit healthy person, toned body, active lifestyle, natural lighting, same identity, subtle fitness improvement, realistic",
    ip_adapter_scale: 0.85,
  },
  moderate: {
    prompt: "portrait of an athletic fit person, well-defined muscles, healthy glow, gym lifestyle, same identity, moderate fitness transformation, realistic photography",
    ip_adapter_scale: 0.80,
  },
  dramatic: {
    prompt: "portrait of a very fit athletic person, well-defined muscular physique, peak fitness, professional fitness photography, same identity, dramatic body transformation, studio lighting",
    ip_adapter_scale: 0.75,
  },
};

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Parse JSON body with error handling */
async function parseBody<T>(request: Request, headers: Record<string, string>): Promise<T | Response> {
  try {
    return await request.json() as T;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400, headers });
  }
}

/** Magic-byte check on base64 payloads: only pay for AI calls on real images.
 *  JPEG => "/9j/", PNG => "iVBOR", WebP => "UklGR", GIF => "R0lGOD", HEIC-in-base64 covered by ftyp. */
function isValidImageBase64(b64: string): boolean {
  if (!b64 || b64.length < 64) return false;
  const head = b64.slice(0, 24);
  return (
    head.startsWith("/9j/") || head.startsWith("iVBOR") || head.startsWith("UklGR") ||
    head.startsWith("R0lGOD") || head.includes("ZnR5cA")
  );
}

/** Deterministic percentile from the overall score (LLM percentiles were
 *  confabulated). Normal CDF approximation around mean 68, sd 12. */
function percentileFromOverall(overall: number): number {
  const z = (overall - 68) / 12;
  // Abramowitz-Stegun erf approximation
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  const cdf = z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
  return Math.max(1, Math.min(99, Math.round(cdf * 100)));
}

/** HMAC-SHA256 signature (first 16 bytes, hex) for signed /images/ URLs. */
/** Short content hash for idempotent caching of analyses (hashes a prefix for speed). */
async function analysisHash(s: string): Promise<string> {
  // Hash the FULL payload (not a prefix) so similar JPEG/EXIF headers cannot collide.
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signKey(key: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(key));
  return [...new Uint8Array(sig)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Build the public URL for an R2 key, signed when SIGNING_SECRET is set. */
async function publicImageUrl(key: string, request: Request, env: Env): Promise<string> {
  const base = `${new URL(request.url).origin}/images/${key}`;
  if (!env.SIGNING_SECRET) return base;
  return `${base}?sig=${await signKey(key, env.SIGNING_SECRET)}`;
}

/** Enforce POST method */
function requirePost(request: Request, headers: Record<string, string>): Response | null {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers });
  }
  return null;
}

/** Resolve image from body — accepts either a URL string (*_url) or base64 (*) and returns a data URI or URL.
 *  Clients may send base64 as "image" or URL as "image_url" — this helper normalizes both. */
function resolveImageParam(body: any, urlKey: string, base64Key: string): string | null {
  if (body[urlKey]) return body[urlKey];
  if (body[base64Key]) return `data:image/jpeg;base64,${body[base64Key]}`;
  return null;
}

/** Upload base64 media to R2 and return a public URL (for video/audio that fal.ai needs as real URLs) */
async function resolveMediaUrl(
  body: any,
  urlKey: string,
  base64Key: string,
  contentType: string,
  prefix: string,
  request: Request,
  env: Env
): Promise<string | null> {
  if (body[urlKey]) return body[urlKey];
  if (body[base64Key]) {
    const raw = body[base64Key];
    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const ext = contentType.includes("video") ? "mp4" : contentType.includes("audio") ? "wav" : "bin";
    const key = `uploads/${prefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    await env.IMAGES_BUCKET.put(key, bytes, { httpMetadata: { contentType } });
    const workerUrl = new URL(request.url);
    return `${workerUrl.origin}/images/${key}`;
  }
  return null;
}

/** Validate HD subscription and return subscriber token */
async function validateHdAuth(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<{ subscriberToken: string } | Response> {
  const authHeader = request.headers.get("Authorization");
  // Local dev bypass — default-deny: ONLY when explicitly "development".
  if (env.ENVIRONMENT === "development") {
    return { subscriberToken: authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "dev-bypass" };
  }
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized — HD requires a subscription" }, { status: 401, headers });
  }
  const subscriberToken = authHeader.slice(7);
  const isSubscribed = await validateSubscriber(subscriberToken, env);
  if (!isSubscribed) {
    return Response.json({ error: "Active subscription required for HD quality" }, { status: 401, headers });
  }
  return { subscriberToken };
}

/** Validate premium-only subscription (no free tier) */
async function validatePremiumAuth(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<{ subscriberToken: string } | Response> {
  const authHeader = request.headers.get("Authorization");
  // Local dev bypass — default-deny: ONLY when explicitly "development".
  if (env.ENVIRONMENT === "development") {
    return { subscriberToken: authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "dev-bypass" };
  }
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized — this feature requires a subscription" }, { status: 401, headers });
  }
  const subscriberToken = authHeader.slice(7);
  const isSubscribed = await validateSubscriber(subscriberToken, env);
  if (!isSubscribed) {
    return Response.json({ error: "Active subscription required" }, { status: 401, headers });
  }
  return { subscriberToken };
}

/** Check and increment rate limit. Returns remaining count or an error Response. */
async function checkRateLimit(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  prefix: string,
  dailyLimit: number,
  isHd: boolean,
  subscriberToken: string | null
): Promise<{ currentCount: number; rateLimitKey: string } | Response> {
  const dateKey = new Date().toISOString().split("T")[0];
  let rateLimitKey: string;

  if (isHd) {
    rateLimitKey = `${prefix}:hd:${subscriberToken}:${dateKey}`;
  } else {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    rateLimitKey = `${prefix}:free:${ip}:${dateKey}`;
  }

  let currentCount = 0;
  try {
    currentCount = parseInt((await env.RATE_LIMIT_KV.get(rateLimitKey)) || "0");
  } catch (kvError) {
    console.error("KV read error, allowing request:", kvError);
  }

  if (currentCount >= dailyLimit) {
    const tierLabel = isHd ? "HD" : "standard";
    return Response.json(
      { error: `Daily limit reached (${dailyLimit} ${tierLabel}/day). Try again tomorrow.`, remaining_today: 0 },
      { status: 429, headers }
    );
  }

  // Increment BEFORE fal.ai call (prevent TOCTOU race)
  try {
    await env.RATE_LIMIT_KV.put(rateLimitKey, String(currentCount + 1), { expirationTtl: 86400 });
  } catch (kvError) {
    console.error("KV write error:", kvError);
  }

  return { currentCount, rateLimitKey };
}

/** Rollback rate limit on failure */
async function rollbackRateLimit(env: Env, rateLimitKey: string, currentCount: number): Promise<void> {
  try {
    await env.RATE_LIMIT_KV.put(rateLimitKey, String(Math.max(0, currentCount)), { expirationTtl: 86400 });
  } catch {}
}

/** Call fal.ai with timeout, handle errors, rollback rate limit on failure */
async function callFalAi(
  env: Env,
  model: string,
  payload: Record<string, any>,
  headers: Record<string, string>,
  rateLimitKey: string,
  currentCount: number,
  timeoutMs: number = 25000
): Promise<{ result: any } | Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let falResponse: Response;
  try {
    falResponse = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${env.FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e: any) {
    clearTimeout(timeoutId);
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    if (e.name === "AbortError") {
      return Response.json({ error: "AI processing timed out. Please try again." }, { status: 504, headers });
    }
    return Response.json({ error: "AI service unavailable" }, { status: 502, headers });
  }

  if (!falResponse.ok) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "AI processing failed. Please try again." }, { status: 502, headers });
  }

  const result: any = await falResponse.json();
  return { result };
}

/** Maxed-Out Self via Gemini image model (Nano Banana). img→img glow-up that
 *  preserves identity, then caches the result PNG in R2. Returns a stable URL
 *  or an error Response (with rate-limit rollback on failure). */
async function callGeminiGlowup(
  env: Env,
  base64Image: string,
  mime: string,
  request: Request,
  headers: Record<string, string>,
  rateLimitKey: string,
  currentCount: number,
  timeoutMs: number = 30000,
  promptOverride?: string
): Promise<{ url: string } | Response> {
  const prompt = promptOverride ||
    "Perform a clean, high-end, studio-quality photographic glow-up of this person's face. " +
    "Perfect the skin texture (smooth, radiant, even tone, no blemishes), subtly balance facial symmetry, " +
    "elevate cheek contours and gently define the jawline, brighten the eyes. " +
    "Keep it strictly photorealistic and fully preserve the core identity, ethnicity, gender, eye color, " +
    "face shape and unique features of the original person. Flattering professional portrait lighting, 4K raw photo.";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${env.GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ inline_data: { mime_type: mime, data: base64Image } }, { text: prompt }] }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e: any) {
    clearTimeout(timeoutId);
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "AI processing timed out. Please try again." }, { status: 504, headers });
  }

  if (!resp.ok) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "AI processing failed. Please try again." }, { status: 502, headers });
  }

  let json: any;
  try { json = await resp.json(); } catch {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "AI processing failed" }, { status: 502, headers });
  }

  let imgB64: string | null = null;
  const parts = json?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const d = p?.inlineData?.data || p?.inline_data?.data;
    if (d) { imgB64 = d; break; }
  }
  if (!imgB64) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  try {
    const binary = atob(imgB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const key = `transformations/${Date.now()}-${crypto.randomUUID()}.png`;
    await env.IMAGES_BUCKET.put(key, bytes, { httpMetadata: { contentType: "image/png" } });
    return { url: await publicImageUrl(key, request, env) };
  } catch {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Failed to store image" }, { status: 500, headers });
  }
}

/** Extract image URL from fal.ai response (various response shapes) */
function extractImageUrl(result: any): string | null {
  return result.images?.[0]?.url || result.image?.url || result.output?.url || null;
}

/** Extract video URL from fal.ai response */
function extractVideoUrl(result: any): string | null {
  return result.video?.url || null;
}

/** Cache image in R2, return stable URL */
async function cacheImageInR2(
  imageUrl: string,
  request: Request,
  env: Env,
  feature: string
): Promise<string> {
  let finalImageUrl = imageUrl;
  try {
    const imgResponse = await fetch(imageUrl);
    if (imgResponse.ok) {
      const imgBlob = await imgResponse.arrayBuffer();
      const key = `${feature}/${Date.now()}-${crypto.randomUUID()}.jpg`;
      await env.IMAGES_BUCKET.put(key, imgBlob, {
        httpMetadata: { contentType: "image/jpeg" },
      });
      finalImageUrl = await publicImageUrl(key, request, env);
    }
  } catch (r2Error) {
    console.error("R2 upload failed, falling back to fal.ai URL:", r2Error);
  }
  return finalImageUrl;
}

/** Cache video in R2, return stable URL */
async function cacheVideoInR2(
  videoUrl: string,
  request: Request,
  env: Env,
  feature: string
): Promise<string> {
  let finalVideoUrl = videoUrl;
  try {
    const vidResponse = await fetch(videoUrl);
    if (vidResponse.ok) {
      const vidBlob = await vidResponse.arrayBuffer();
      const key = `${feature}/${Date.now()}-${crypto.randomUUID()}.mp4`;
      await env.IMAGES_BUCKET.put(key, vidBlob, {
        httpMetadata: { contentType: "video/mp4" },
      });
      finalVideoUrl = await publicImageUrl(key, request, env);
    }
  } catch (r2Error) {
    console.error("R2 video upload failed, falling back to fal.ai URL:", r2Error);
  }
  return finalVideoUrl;
}

// ─── Features list ──────────────────────────────────────────────────────────

// Focused premium suite (EPIC-PLAN: female clinical-luxury glow-up app,
// hard paywall — every tool is premium). The old 19-feature grab-bag was cut.
const FEATURES_LIST = [
  { id: "glow_up", name: "Glow Up", description: "AI transformation styles", icon: "sparkles", isPremium: true },
  { id: "headshot", name: "AI Headshot", description: "Professional photos from selfie", icon: "briefcase", isPremium: true },
  { id: "hair_change", name: "Hair Makeover", description: "Try any hairstyle", icon: "scissors", isPremium: true },
  { id: "relight", name: "Relight", description: "Studio-quality lighting", icon: "light.max", isPremium: true },
  { id: "age_transform", name: "Age Rewind", description: "See yourself younger", icon: "hourglass", isPremium: true },
  { id: "fitness_transform", name: "Fit Version", description: "Visualize your fit self", icon: "figure.run", isPremium: true },
];

// ─── Main fetch handler ─────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // H7 FIX: Allow localhost for web dev, restrict in production
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = ["https://glowupai.app", "https://glowscore-nine.vercel.app", "http://localhost:8081", "http://localhost:19006"];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : "https://glowupai.app";
    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-App-Token",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Anti-abuse: when APP_TOKEN is configured, only our app (sending the matching
    // X-App-Token) may call /api/* POSTs. Dormant when APP_TOKEN is unset.
    if (env.APP_TOKEN && request.method === "POST" && url.pathname.startsWith("/api/")) {
      if (request.headers.get("X-App-Token") !== env.APP_TOKEN) {
        return Response.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders });
      }
    }

    try {
      switch (url.pathname) {
        case "/api/health":
          return Response.json({ status: "ok", timestamp: new Date().toISOString() }, { headers: corsHeaders });
        case "/api/styles":
          return handleGetStyles(corsHeaders);
        case "/api/features":
          return handleGetFeatures(corsHeaders);
        case "/api/transform":
          return await handleTransform(request, env, corsHeaders);
        case "/api/makeup":
          return await handleMakeup(request, env, corsHeaders);
        case "/api/color-season":
          return await handleColorSeason(request, env, corsHeaders);
        case "/api/visual-weight":
          return await handleVisualWeight(request, env, corsHeaders);
        case "/api/face-scan":
          return await handleFaceScan(request, env, corsHeaders);
        case "/api/face-swap":
          return await handleFaceSwap(request, env, corsHeaders);
        case "/api/instant-style":
          return await handleInstantStyle(request, env, corsHeaders);
        case "/api/headshot":
          return await handleHeadshot(request, env, corsHeaders);
        case "/api/hair-change":
          return await handleHairChange(request, env, corsHeaders);
        case "/api/relight":
          return await handleRelight(request, env, corsHeaders);
        case "/api/age-transform":
          return await handleAgeTransform(request, env, corsHeaders);
        case "/api/try-on":
          return await handleTryOn(request, env, corsHeaders);
        case "/api/animate-portrait":
          return await handleAnimatePortrait(request, env, corsHeaders);
        case "/api/talking-photo":
          return await handleTalkingPhoto(request, env, corsHeaders);
        case "/api/background-removal":
          return await handleBackgroundRemoval(request, env, corsHeaders);
        case "/api/caricature":
          return await handleCaricature(request, env, corsHeaders);
        case "/api/photo-restore":
          return await handlePhotoRestore(request, env, corsHeaders);
        case "/api/pet-portrait":
          return await handlePetPortrait(request, env, corsHeaders);
        case "/api/fitness-transform":
          return await handleFitnessTransform(request, env, corsHeaders);
        case "/api/upscale":
          return await handleUpscale(request, env, corsHeaders);
        default:
          // M3: Serve R2-cached images at /images/...
          if (url.pathname.startsWith("/images/")) {
            return await handleServeImage(url.pathname.slice("/images/".length), env, corsHeaders, url.searchParams.get("sig"));
          }
          return Response.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
      }
    } catch (error: any) {
      console.error("Worker error:", error);
      return Response.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
    }
  },

  // Privacy (BIPA/GDPR): auto-delete cached face images so biometric-derived
  // photos are never retained. Runs on the cron schedule in wrangler.toml.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(cleanupOldImages(env));
  },
};

/** Delete R2 images older than the retention window (default 48h). */
async function cleanupOldImages(env: Env, maxAgeMs = 48 * 60 * 60 * 1000): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  let cursor: string | undefined = undefined;
  try {
    do {
      const listed: R2Objects = await env.IMAGES_BUCKET.list({ limit: 1000, cursor });
      const stale = listed.objects.filter((o) => o.uploaded.getTime() < cutoff).map((o) => o.key);
      if (stale.length) await env.IMAGES_BUCKET.delete(stale);
      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);
  } catch (e) {
    console.error("R2 cleanup failed:", e);
  }
}

// ─── GET /api/styles ────────────────────────────────────────────────────────

function handleGetStyles(headers: Record<string, string>): Response {
  const STYLE_METADATA: Record<string, { name: string; description: string; icon: string; isPremium: boolean; isNew: boolean; order: number }> = {
    clear_skin:    { name: "Clear Skin",     description: "Flawless, even skin tone",  icon: "\u2728", isPremium: false, isNew: false, order: 0 },
    model_look:    { name: "Model Look",     description: "High-fashion editorial",    icon: "\u2B50", isPremium: false, isNew: false, order: 1 },
    hair_makeover: { name: "Hair Makeover",  description: "Try different hairstyles",  icon: "\u2702\uFE0F", isPremium: false, isNew: false, order: 2 },
    age_rewind:    { name: "Age Rewind",     description: "See your younger self",     icon: "\uD83D\uDD04", isPremium: false, isNew: false, order: 3 },
    fit_version:   { name: "Fit Version",    description: "Visualize fitness goals",   icon: "\uD83C\uDFC3", isPremium: false, isNew: false, order: 4 },
    celebrity_glam:{ name: "Celebrity Glam",  description: "Red carpet ready",         icon: "\uD83C\uDF1F", isPremium: false, isNew: true,  order: 5 },
    vintage_retro: { name: "Vintage Retro",  description: "Classic film star look",    icon: "\uD83D\uDCF7", isPremium: false, isNew: true,  order: 6 },
    cyberpunk:     { name: "Cyberpunk",       description: "Neon future aesthetic",    icon: "\uD83D\uDD2E", isPremium: false, isNew: true,  order: 7 },
    glow_max:      { name: "Max Glow-Up",     description: "Your maxed-out potential", icon: "\uD83D\uDE80", isPremium: true,  isNew: true,  order: 8 },
  };

  const styles = Object.entries(STYLE_METADATA).map(([id, meta]) => ({
    id,
    ...meta,
  }));

  styles.sort((a, b) => a.order - b.order);

  return Response.json({ styles }, { headers });
}

// ─── GET /api/features ──────────────────────────────────────────────────────

function handleGetFeatures(headers: Record<string, string>): Response {
  return Response.json({ features: FEATURES_LIST }, { headers });
}

// ─── POST /api/transform (existing Glow Up) ────────────────────────────────

async function handleTransform(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<TransformRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  // H1 FIX: Only accept style_id, look up prompt server-side
  const preset = STYLE_PRESETS[body.style_id];
  if (!preset) {
    return Response.json({ error: "Invalid style_id" }, { status: 400, headers });
  }

  // Validate image size (max 10MB base64)
  if (!body.image || body.image.length > 14_000_000) {
    return Response.json({ error: "Image too large (max 10MB)" }, { status: 400, headers });
  }
  if (!isValidImageBase64(body.image)) {
    return Response.json({ error: "Invalid image format" }, { status: 400, headers });
  }

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const maxSize = isHd ? 1024 : 512;
  const dailyLimit = isHd ? 10 : 5;
  const numInferenceSteps = isHd ? 28 : 20;
  const guidanceScale = isHd ? 7.5 : 6.0;

  const width = Math.min(Math.max(body.width || maxSize, 512), maxSize);
  const height = Math.min(Math.max(body.height || maxSize, 512), maxSize);

  const rlResult = await checkRateLimit(request, env, headers, "transform", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  // All transforms run through Gemini Nano Banana when a key is set (best identity
  // preservation). Per-style prompt if defined, else the preset prompt adapted for
  // img2img. Falls back to fal.ai only when GEMINI_API_KEY is unset.
  if (env.GEMINI_API_KEY) {
    const promptOverride = GEMINI_PROMPTS[body.style_id] ||
      `Apply this glow-up to the SAME person, fully preserving their identity, ethnicity, face shape, nose and eye shape: ${preset.prompt}. Strictly photorealistic, flattering, no deformation, keep it recognizably the same person.`;
    const g = await callGeminiGlowup(env, body.image, "image/jpeg", request, headers, rateLimitKey, currentCount, 30000, promptOverride);
    if (g instanceof Response) return g;
    return Response.json(
      { image_url: g.url, quality, feature: body.style_id === "destress" ? "destress" : "glow_up", style_id: body.style_id, remaining_today: dailyLimit - (currentCount + 1) },
      { headers }
    );
  }

  const falResult = await callFalAi(
    env,
    "fal-ai/flux/dev",
    {
      prompt: preset.prompt,
      negative_prompt: preset.negative_prompt,
      image: `data:image/jpeg;base64,${body.image}`,
      image_size: { width, height },
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
      ip_adapter_scale: preset.ip_adapter_scale,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "transformations");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "glow_up", style_id: body.style_id, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/makeup (EPIC 4.2: real AI makeup, premium) ───────────────────

const MAKEUP_PRESETS: Record<string, string> = {
  natural: "subtle natural 'no-makeup' makeup: even skin tint, groomed brows, soft blush, nude glossy lips",
  soft_glam: "soft glam makeup: luminous base, sculpted soft contour, warm shimmer eyeshadow, fluttery lashes, satin pink lips",
  glam: "full glam evening makeup: flawless matte base, defined winged eyeliner, dramatic lashes, sculpted contour and highlight, bold elegant lips",
  bold_lip: "clean minimal makeup with a bold statement lip: even luminous skin, groomed brows, subtle eyes, vivid classic red lips",
};

async function handleMakeup(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  // Premium only — hard paywall
  const authResult = await validatePremiumAuth(request, env, headers);
  if (authResult instanceof Response) return authResult;
  const subscriberToken = authResult.subscriberToken;

  const bodyOrErr = await parseBody<{ image: string; look?: string }>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  if (!body.image || body.image.length > 14_000_000) {
    return Response.json({ error: "Image too large (max 10MB)" }, { status: 400, headers });
  }
  if (!isValidImageBase64(body.image)) {
    return Response.json({ error: "Invalid image format" }, { status: 400, headers });
  }
  const look = MAKEUP_PRESETS[body.look || "natural"] ? (body.look || "natural") : "natural";

  const rlResult = await checkRateLimit(request, env, headers, "makeup", 10, true, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const makeupPrompt =
    `Apply professional ${MAKEUP_PRESETS[look]} to this person's face. ` +
    "Keep it strictly photorealistic; fully preserve the identity, ethnicity, gender, face shape, hair and background. " +
    "Only the makeup changes. High-end beauty editorial finish.";

  if (env.GEMINI_API_KEY) {
    const g = await callGeminiGlowup(env, body.image, "image/jpeg", request, headers, rateLimitKey, currentCount, 30000, makeupPrompt);
    if (g instanceof Response) return g;
    return Response.json({ image_url: g.url, feature: "makeup", look, remaining_today: 10 - (currentCount + 1) }, { headers });
  }

  // Fallback: fal flux/dev with identity adapter
  const falResult = await callFalAi(
    env,
    "fal-ai/flux/dev",
    {
      prompt: `beautiful portrait with ${MAKEUP_PRESETS[look]}, photorealistic, same person, high quality`,
      negative_prompt: "different person, cartoon, deformed, low quality",
      image: `data:image/jpeg;base64,${body.image}`,
      image_size: { width: 1024, height: 1024 },
      num_inference_steps: 28,
      guidance_scale: 7.5,
      ip_adapter_scale: 0.85,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers, rateLimitKey, currentCount
  );
  if (falResult instanceof Response) return falResult;
  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }
  const finalUrl = await cacheImageInR2(imageUrl, request, env, "makeup");
  return Response.json({ image_url: finalUrl, feature: "makeup", look, remaining_today: 10 - (currentCount + 1) }, { headers });
}

// ─── Color Season + Visual Weight (styling analyzers, premium) ──────────────

/** Generic OpenAI-compatible vision call that returns parsed JSON (or an error Response). */
async function callVisionJSON(
  env: Env, imageDataUrl: string, rubric: string, maxTokens: number,
  headers: Record<string, string>, rateLimitKey: string, currentCount: number, timeoutMs = 25000,
): Promise<{ data: any } | Response> {
  const baseUrl = (env.LLM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = env.LLM_MODEL || "openai/gpt-4o-mini";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.LLM_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, temperature: 0, max_tokens: maxTokens,
        messages: [{ role: "user", content: [{ type: "text", text: rubric }, { type: "image_url", image_url: { url: imageDataUrl } }] }],
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
  } catch {
    clearTimeout(t); await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Analysis timed out. Please try again." }, { status: 504, headers });
  }
  if (!resp.ok) { await rollbackRateLimit(env, rateLimitKey, currentCount); return Response.json({ error: "Analysis service unavailable" }, { status: 502, headers }); }
  let content = "";
  try { const j: any = await resp.json(); content = j.choices?.[0]?.message?.content || ""; }
  catch { await rollbackRateLimit(env, rateLimitKey, currentCount); return Response.json({ error: "Analysis failed" }, { status: 502, headers }); }
  const match = content.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!match) { await rollbackRateLimit(env, rateLimitKey, currentCount); return Response.json({ error: "Could not read result" }, { status: 502, headers }); }
  try { return { data: JSON.parse(match[0]) }; }
  catch { await rollbackRateLimit(env, rateLimitKey, currentCount); return Response.json({ error: "Could not parse result" }, { status: 502, headers }); }
}

function asHexArray(v: any, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && /^#?[0-9a-fA-F]{6}$/.test(x.trim()))
    .map((x) => (x.trim().startsWith("#") ? x.trim() : `#${x.trim()}`)).slice(0, max);
}

// POST /api/color-season — seasonal color analysis (premium styling, Apple-safe)
async function handleColorSeason(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const m = requirePost(request, headers); if (m) return m;
  const bodyOrErr = await parseBody<{ image: string }>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;
  if (!body.image || body.image.length > 14_000_000) return Response.json({ error: "Image too large (max 10MB)" }, { status: 400, headers });
  if (!isValidImageBase64(body.image)) return Response.json({ error: "Invalid image format" }, { status: 400, headers });
  const auth = await validatePremiumAuth(request, env, headers);
  if (auth instanceof Response) return auth;

  // Idempotent cache: same photo returns the cached result, free, no LLM call.
  const cacheKey = `cs:${await analysisHash(body.image)}`;
  try {
    const cached = await env.RATE_LIMIT_KV.get(cacheKey);
    if (cached) return new Response(cached, { headers: { ...headers, "Content-Type": "application/json" } });
  } catch {}

  const rl = await checkRateLimit(request, env, headers, "color", 10, true, auth.subscriberToken);
  if (rl instanceof Response) return rl;
  const { currentCount, rateLimitKey } = rl;

  const rubric = [
    "You are a seasonal color analysis stylist for a positive styling app. Analyze the person's natural coloring (skin undertone, hair, eyes) from the selfie.",
    "This is styling guidance only, never an attractiveness or beauty judgement.",
    "Classify into the 4 seasons and a sub-season, the undertone, and a contrast level 0-10 (luminance difference between skin, hair and eyes).",
    "Give a flattering wearable palette and shades to avoid, best metal, and best lip and blush shades, all as 6-digit hex.",
    "Return ONLY minified JSON, no markdown, EXACT keys:",
    '{"season":string,"sub_season":string,"undertone":string,"contrast":int,"confidence":int,"description":string,"palette":[string,string,string,string,string,string],"avoid":[string,string,string],"metal":string,"lip":string,"blush":string}',
    "description: one upbeat sentence (max 130 chars). If no clear face, set confidence to 0.",
  ].join(" ");

  const res = await callVisionJSON(env, `data:image/jpeg;base64,${body.image}`, rubric, 600, headers, rateLimitKey, currentCount);
  if (res instanceof Response) return res;
  const d = res.data || {};
  const payload = JSON.stringify({
    feature: "color_season",
    season: String(d.season || "").slice(0, 24),
    sub_season: String(d.sub_season || "").slice(0, 32),
    undertone: String(d.undertone || "").slice(0, 24),
    contrast: Math.max(0, Math.min(10, parseInt(d.contrast) || 0)),
    confidence: Math.max(0, Math.min(100, parseInt(d.confidence) || 0)),
    description: String(d.description || "").slice(0, 160),
    palette: asHexArray(d.palette, 6),
    avoid: asHexArray(d.avoid, 3),
    metal: String(d.metal || "").slice(0, 16),
    lip: asHexArray([d.lip], 1)[0] || "",
    blush: asHexArray([d.blush], 1)[0] || "",
    remaining_today: 10 - (currentCount + 1),
  });
  try { await env.RATE_LIMIT_KV.put(cacheKey, payload, { expirationTtl: 7 * 86400 }); } catch {}
  return new Response(payload, { headers: { ...headers, "Content-Type": "application/json" } });
}

// POST /api/visual-weight — high/low visual weight styling typology (premium)
async function handleVisualWeight(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const m = requirePost(request, headers); if (m) return m;
  const bodyOrErr = await parseBody<{ image: string }>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;
  if (!body.image || body.image.length > 14_000_000) return Response.json({ error: "Image too large (max 10MB)" }, { status: 400, headers });
  if (!isValidImageBase64(body.image)) return Response.json({ error: "Invalid image format" }, { status: 400, headers });
  const auth = await validatePremiumAuth(request, env, headers);
  if (auth instanceof Response) return auth;

  const cacheKey = `vw:${await analysisHash(body.image)}`;
  try {
    const cached = await env.RATE_LIMIT_KV.get(cacheKey);
    if (cached) return new Response(cached, { headers: { ...headers, "Content-Type": "application/json" } });
  } catch {}

  const rl = await checkRateLimit(request, env, headers, "vweight", 10, true, auth.subscriberToken);
  if (rl instanceof Response) return rl;
  const { currentCount, rateLimitKey } = rl;

  const rubric = [
    "You are a makeup stylist using the 'visual weight' theory (how soft vs striking someone's features read). This is styling guidance, never an attractiveness judgement.",
    "Assess whether features read as high visual weight (bold, high-contrast, defined) or low visual weight (soft, delicate, blended), with a 0-100 score where 100 is highest weight.",
    "Give a flattering aesthetic label and 3 concrete makeup tips that suit that weight.",
    "Return ONLY minified JSON, no markdown, EXACT keys:",
    '{"weight":string,"score":int,"label":string,"confidence":int,"description":string,"makeup_tips":[string,string,string]}',
    "weight is 'high', 'low' or 'balanced'. label is a flattering 1-3 word aesthetic (e.g. 'Soft Radiance', 'Striking Siren'). description max 130 chars. If no clear face, confidence 0.",
  ].join(" ");

  const res = await callVisionJSON(env, `data:image/jpeg;base64,${body.image}`, rubric, 500, headers, rateLimitKey, currentCount);
  if (res instanceof Response) return res;
  const d = res.data || {};
  const tips = Array.isArray(d.makeup_tips) ? d.makeup_tips.filter((x: any) => typeof x === "string").slice(0, 3) : [];
  const payload = JSON.stringify({
    feature: "visual_weight",
    weight: ["high", "low", "balanced"].includes(d.weight) ? d.weight : "balanced",
    score: Math.max(0, Math.min(100, parseInt(d.score) || 0)),
    label: String(d.label || "").slice(0, 40),
    confidence: Math.max(0, Math.min(100, parseInt(d.confidence) || 0)),
    description: String(d.description || "").slice(0, 160),
    makeup_tips: tips,
    remaining_today: 10 - (currentCount + 1),
  });
  try { await env.RATE_LIMIT_KV.put(cacheKey, payload, { expirationTtl: 7 * 86400 }); } catch {}
  return new Response(payload, { headers: { ...headers, "Content-Type": "application/json" } });
}

// ─── Vision LLM helper (GlowScore) ──────────────────────────────────────────

/** Call an OpenAI-compatible vision chat model to score a face. Returns sanitized JSON or an error Response. */
async function callVisionLLM(
  env: Env,
  imageDataUrl: string,
  headers: Record<string, string>,
  rateLimitKey: string,
  currentCount: number,
  timeoutMs: number = 25000,
  focus?: string
): Promise<{ data: any } | Response> {
  const baseUrl = (env.LLM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const model = env.LLM_MODEL || "openai/gpt-4o-mini";

  // Persona-branching (EPIC 7.2): bias treatments toward the user's declared focus
  const focusLine = focus && typeof focus === "string"
    ? ` The user's primary glow-up focus is: ${focus.slice(0, 120)}. Bias the 3 treatments and tips toward that focus.`
    : "";

  const rubric = [
    "You are a facial aesthetics analyzer for a positive, entertainment 'glow-up' app.",
    "Look at the selfie and rate it 0-100 across each dimension. Be encouraging and constructive, never insulting.",
    "This is for entertainment only, not a medical, factual, or worth judgement.",
    "Estimate a realistic 'potential' score HIGHER than 'overall' — what they could reach with grooming, skincare, hair, and lighting.",
    "Score the 6 glow-up components 0-100, framed positively as optimization opportunities (never flaws), ranked by how much they drive a perceived glow-up: skin (clarity, evenness, texture and glow), symmetry (overall facial balance and harmony), nose_lip_ratio (nose harmony and profile balance), eyes (eye-area brightness, openness and contour), jawline (lower-face definition and contour), lip_harmony (lip shape, fullness and balance).",
    "Also output exactly 3 'treatments': personalized non-invasive glow-up recommendations targeting the 2-3 lowest-scoring components (a skincare active, a makeup or contouring technique, brow/lash or hair framing, gua-sha or lymphatic drainage, lighting or angle tip). Each has name (max 4 words), detail (one sentence, max 90 chars), impact (0-100, expected visual improvement).",
    "Return ONLY minified JSON, no markdown, with EXACTLY these keys:",
    '{"overall":int,"skin":int,"jawline":int,"symmetry":int,"eyes":int,"harmony":int,"nose_lip_ratio":int,"lip_harmony":int,"potential":int,"percentile":int,"rationale":string,"tips":[string,string,string],"treatments":[{"name":string,"detail":string,"impact":int},{"name":string,"detail":string,"impact":int},{"name":string,"detail":string,"impact":int}]}',
    "rationale: one upbeat sentence (max 140 chars). tips: 3 short actionable glow-up tips.",
    "If no clear human face is visible, set every score to 0 and rationale to 'No face detected'.",
  ].join(" ") + focusLine;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: rubric },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e: any) {
    clearTimeout(timeoutId);
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Scan timed out. Please try again." }, { status: 504, headers });
  }

  if (!resp.ok) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Scan service unavailable" }, { status: 502, headers });
  }

  let content = "";
  try {
    const json: any = await resp.json();
    content = json.choices?.[0]?.message?.content || "";
  } catch {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Scan failed" }, { status: 502, headers });
  }

  const match = content.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!match) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Could not read scan result" }, { status: 502, headers });
  }

  let data: any;
  try {
    data = JSON.parse(match[0]);
  } catch {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "Could not parse scan result" }, { status: 502, headers });
  }

  const clamp = (n: any) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const out = {
    // Floor `overall` at 55 (BDD-safety: never show a crushing score; also a retention lever)
    overall: Math.max(55, clamp(data.overall)),
    skin: clamp(data.skin),
    jawline: clamp(data.jawline),
    symmetry: clamp(data.symmetry),
    eyes: clamp(data.eyes),
    harmony: clamp(data.harmony),
    // Diagnostic components (fall back to the closest classic metric)
    nose_lip_ratio: clamp(data.nose_lip_ratio ?? data.harmony),
    lip_harmony: clamp(data.lip_harmony ?? Math.round((clamp(data.harmony) + clamp(data.symmetry)) / 2)),
    eye_spacing: clamp(data.eye_spacing ?? data.eyes),
    jawline_angle: clamp(data.jawline_angle ?? data.jawline),
    forehead_proportion: clamp(data.forehead_proportion ?? data.symmetry),
    // Potential always at least overall+3 so "+X to unlock" is never 0
    potential: Math.min(100, Math.max(clamp(data.potential), Math.max(55, clamp(data.overall)) + 3)),
    percentile: clamp(data.percentile),
    rationale: typeof data.rationale === "string" ? data.rationale.slice(0, 160) : "",
    tips: Array.isArray(data.tips) ? data.tips.slice(0, 3).map((t: any) => String(t).slice(0, 120)) : [],
    // Personalized "treatments" (Aura-style plan items) with expected impact
    treatments: Array.isArray(data.treatments)
      ? data.treatments.slice(0, 3).map((t: any) => ({
          name: String(t?.name || "Glow-up step").slice(0, 48),
          detail: String(t?.detail || "").slice(0, 120),
          impact: clamp(t?.impact),
        }))
      : [],
  };

  return { data: out };
}

// ─── POST /api/face-scan (GlowScore) ────────────────────────────────────────

async function handleFaceScan(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<{ image: string; focus?: string }>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  if (!body.image || body.image.length > 14_000_000) {
    return Response.json({ error: "Image too large (max 10MB)" }, { status: 400, headers });
  }
  if (!isValidImageBase64(body.image)) {
    return Response.json({ error: "Invalid image format" }, { status: 400, headers });
  }

  // Optional auth — subscribers get a higher daily scan limit
  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 30 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "facescan", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const imageDataUrl = `data:image/jpeg;base64,${body.image}`;
  const llm = await callVisionLLM(env, imageDataUrl, headers, rateLimitKey, currentCount, 25000, body.focus);
  if (llm instanceof Response) return llm;

  // Deterministic percentile (the LLM's percentile was confabulated — EPIC 6.1)
  const out = { ...llm.data, percentile: percentileFromOverall(llm.data.overall) };

  return Response.json(
    { ...out, feature: "face_scan", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/face-swap ────────────────────────────────────────────────────

async function handleFaceSwap(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<FaceSwapRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const sourceImage = resolveImageParam(body, "source_image_url", "source_image");
  const targetImage = resolveImageParam(body, "target_image_url", "target_image");
  if (!sourceImage || !targetImage) {
    return Response.json({ error: "source_image_url (or source_image base64) and target_image_url (or target_image base64) are required" }, { status: 400, headers });
  }

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "faceswap", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/face-swap",
    {
      source_image_url: sourceImage,
      target_image_url: targetImage,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "face-swap");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "face_swap", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/instant-style ────────────────────────────────────────────────

async function handleInstantStyle(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<InstantStyleRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const stylePreset = INSTANT_STYLE_PRESETS[body.style];
  if (!stylePreset && !body.prompt) {
    return Response.json(
      { error: `Invalid style. Choose from: ${Object.keys(INSTANT_STYLE_PRESETS).join(", ")} or provide a custom prompt` },
      { status: 400, headers }
    );
  }

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 3;
  const maxSize = isHd ? 1024 : 512;

  const rlResult = await checkRateLimit(request, env, headers, "instantstyle", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const prompt = body.prompt || stylePreset.prompt;
  const negativePrompt = stylePreset?.negative_prompt || "blurry, deformed, low quality";

  const falResult = await callFalAi(
    env,
    "fal-ai/ip-adapter-face-id",
    {
      prompt,
      negative_prompt: negativePrompt,
      face_image_url: imageInput,
      image_size: { width: maxSize, height: maxSize },
      num_inference_steps: isHd ? 28 : 20,
      guidance_scale: isHd ? 7.5 : 6.0,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "instant-style");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "instant_style", style: body.style, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/headshot ─────────────────────────────────────────────────────

async function handleHeadshot(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<HeadshotRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const background = HEADSHOT_BACKGROUNDS[body.background] || HEADSHOT_BACKGROUNDS.neutral;

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 2;
  const maxSize = isHd ? 1024 : 512;

  const rlResult = await checkRateLimit(request, env, headers, "headshot", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const prompt = `Professional corporate headshot portrait, studio lighting, ${background}, business attire, sharp focus, high quality`;

  const falResult = await callFalAi(
    env,
    "fal-ai/flux/dev",
    {
      prompt,
      negative_prompt: "casual, blurry, deformed, low quality, bad lighting, unprofessional, selfie",
      image_url: imageInput,
      image_size: { width: maxSize, height: maxSize },
      num_inference_steps: isHd ? 28 : 20,
      guidance_scale: isHd ? 7.5 : 6.0,
      ip_adapter_scale: 0.85,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "headshot");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "headshot", background: body.background, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/hair-change ──────────────────────────────────────────────────

async function handleHairChange(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<HairChangeRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  if (!body.prompt || body.prompt.trim().length === 0) {
    return Response.json({ error: "prompt is required (e.g., 'blonde bob', 'red curls')" }, { status: 400, headers });
  }

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "hairchange", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/image-editing/hair-change",
    {
      image_url: imageInput,
      prompt: body.prompt,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "hair-change");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "hair_change", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/relight ──────────────────────────────────────────────────────

async function handleRelight(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<RelightRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  if (!body.prompt || body.prompt.trim().length === 0) {
    return Response.json({ error: "prompt is required (lighting description)" }, { status: 400, headers });
  }

  const validDirections = ["left", "right", "top", "bottom", "none"];
  const direction = validDirections.includes(body.direction || "") ? body.direction : "none";

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "relight", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/iclight-v2",
    {
      image_url: imageInput,
      prompt: body.prompt,
      light_source_direction: direction,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "relight");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "relight", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/age-transform ────────────────────────────────────────────────

async function handleAgeTransform(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<AgeTransformRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const validAges = [5, 15, 25, 40, 60, 80];
  const targetAge = validAges.includes(body.target_age) ? body.target_age : null;
  if (!targetAge) {
    return Response.json({ error: `Invalid target_age. Choose from: ${validAges.join(", ")}` }, { status: 400, headers });
  }

  const quality = body.quality === "hd" ? "hd" : "standard";
  const isHd = quality === "hd";

  let subscriberToken: string | null = null;
  if (isHd) {
    const authResult = await validateHdAuth(request, env, headers);
    if (authResult instanceof Response) return authResult;
    subscriberToken = authResult.subscriberToken;
  }

  const dailyLimit = isHd ? 10 : 3;
  const maxSize = isHd ? 1024 : 512;

  const rlResult = await checkRateLimit(request, env, headers, "agetransform", dailyLimit, isHd, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const prompt = `Portrait of a ${targetAge} year old person, same identity, natural aging, photorealistic, detailed skin texture, high quality photography`;

  const falResult = await callFalAi(
    env,
    "fal-ai/flux/dev",
    {
      prompt,
      negative_prompt: "blurry, deformed, low quality, different person, cartoon",
      image_url: imageInput,
      image_size: { width: maxSize, height: maxSize },
      num_inference_steps: isHd ? 28 : 20,
      guidance_scale: isHd ? 7.5 : 6.0,
      ip_adapter_scale: 0.85,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "age-transform");

  return Response.json(
    { image_url: finalImageUrl, quality, feature: "age_transform", target_age: targetAge, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/try-on ───────────────────────────────────────────────────────

async function handleTryOn(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  // Premium only — require subscription
  const authResult = await validatePremiumAuth(request, env, headers);
  if (authResult instanceof Response) return authResult;
  const subscriberToken = authResult.subscriberToken;

  const bodyOrErr = await parseBody<TryOnRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const humanImage = resolveImageParam(body, "human_image_url", "human_image");
  const garmentImage = resolveImageParam(body, "garment_image_url", "garment_image");
  if (!humanImage || !garmentImage) {
    return Response.json({ error: "human_image_url (or human_image base64) and garment_image_url (or garment_image base64) are required" }, { status: 400, headers });
  }

  const validGarmentTypes = ["upper_body", "lower_body", "dresses"];
  const garmentType = validGarmentTypes.includes(body.garment_type || "") ? body.garment_type : "upper_body";

  const dailyLimit = 10;

  const rlResult = await checkRateLimit(request, env, headers, "tryon", dailyLimit, true, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/leffa/virtual-tryon",
    {
      human_image_url: humanImage,
      garment_image_url: garmentImage,
      garment_type: garmentType,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "try-on");

  return Response.json(
    { image_url: finalImageUrl, quality: "hd", feature: "try_on", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/animate-portrait ──────────────────────────────────────────────

async function handleAnimatePortrait(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<AnimatePortraitRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const videoInput = await resolveMediaUrl(body, "video_url", "video", "video/mp4", "driving-videos", request, env);
  if (!videoInput) {
    return Response.json({ error: "video_url or video (base64) is required — provide a short driving video" }, { status: 400, headers });
  }

  // Optional auth for higher limits
  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "animateportrait", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/live-portrait",
    {
      image_url: imageInput,
      video_url: videoInput,
      flag_stitching: true,
      flag_relative: true,
      flag_pasteback: true,
      flag_do_crop: true,
    },
    headers,
    rateLimitKey,
    currentCount,
    60000 // 60s timeout for video generation
  );
  if (falResult instanceof Response) return falResult;

  const resultVideoUrl = extractVideoUrl(falResult.result);
  if (!resultVideoUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No video generated" }, { status: 500, headers });
  }

  const finalVideoUrl = await cacheVideoInR2(resultVideoUrl, request, env, "animate-portrait");

  return Response.json(
    { video_url: finalVideoUrl, feature: "animate_portrait", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/talking-photo ─────────────────────────────────────────────────

async function handleTalkingPhoto(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  // Premium only
  const authResult = await validatePremiumAuth(request, env, headers);
  if (authResult instanceof Response) return authResult;
  const subscriberToken = authResult.subscriberToken;

  const bodyOrErr = await parseBody<TalkingPhotoRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const sourceVideoUrl = await resolveMediaUrl(body, "source_video_url", "source_video", "video/mp4", "talking-source", request, env);
  if (!sourceVideoUrl) {
    return Response.json({ error: "source_video_url or source_video (base64) is required" }, { status: 400, headers });
  }

  const audioUrl = await resolveMediaUrl(body, "audio_url", "audio", "audio/wav", "talking-audio", request, env);
  if (!audioUrl) {
    return Response.json({ error: "audio_url or audio (base64) is required" }, { status: 400, headers });
  }

  const dailyLimit = 10;

  const rlResult = await checkRateLimit(request, env, headers, "talkingphoto", dailyLimit, true, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/musetalk",
    {
      source_video_url: sourceVideoUrl,
      audio_url: audioUrl,
    },
    headers,
    rateLimitKey,
    currentCount,
    90000 // 90s timeout for lip-sync processing
  );
  if (falResult instanceof Response) return falResult;

  const resultVideoUrl = extractVideoUrl(falResult.result);
  if (!resultVideoUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No video generated" }, { status: 500, headers });
  }

  const finalVideoUrl = await cacheVideoInR2(resultVideoUrl, request, env, "talking-photo");

  return Response.json(
    { video_url: finalVideoUrl, feature: "talking_photo", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/background-removal ───────────────────────────────────────────

async function handleBackgroundRemoval(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<BackgroundRemovalRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  // Optional auth for higher limits
  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 50 : 5;

  const rlResult = await checkRateLimit(request, env, headers, "bgremoval", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const model = body.model || "Portrait";
  const outputFormat = body.output_format || "png";

  const falResult = await callFalAi(
    env,
    "fal-ai/birefnet/v2",
    {
      image_url: imageInput,
      model,
      operating_resolution: "1024x1024",
      output_format: outputFormat,
      refine_foreground: true,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  // Cache as PNG (transparent background)
  let finalImageUrl = imageUrl;
  try {
    const imgResponse = await fetch(imageUrl);
    if (imgResponse.ok) {
      const imgBlob = await imgResponse.arrayBuffer();
      const key = `background-removal/${Date.now()}-${crypto.randomUUID()}.${outputFormat}`;
      await env.IMAGES_BUCKET.put(key, imgBlob, {
        httpMetadata: { contentType: outputFormat === "webp" ? "image/webp" : "image/png" },
      });
      const workerUrl = new URL(request.url);
      finalImageUrl = `${workerUrl.origin}/images/${key}`;
    }
  } catch (r2Error) {
    console.error("R2 upload failed, falling back to fal.ai URL:", r2Error);
  }

  return Response.json(
    { image_url: finalImageUrl, feature: "background_removal", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/caricature ────────────────────────────────────────────────────

async function handleCaricature(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<CaricatureRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "caricature", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/cartoonify",
    {
      image_url: imageInput,
      scale: body.scale ?? 1,
      guidance_scale: body.guidance_scale ?? 3.5,
      num_inference_steps: 28,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "caricature");

  return Response.json(
    { image_url: finalImageUrl, feature: "caricature", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/photo-restore ─────────────────────────────────────────────────

async function handlePhotoRestore(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<PhotoRestoreRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "photorestore", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/image-apps-v2/photo-restoration",
    {
      image_url: imageInput,
      fix_colors: body.fix_colors ?? true,
      remove_scratches: body.remove_scratches ?? true,
      enhance_resolution: body.enhance_resolution ?? true,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "photo-restore");

  return Response.json(
    { image_url: finalImageUrl, feature: "photo_restore", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/pet-portrait ──────────────────────────────────────────────────

async function handlePetPortrait(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<PetPortraitRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const preset = PET_PORTRAIT_PRESETS[body.style];
  const prompt = body.prompt || preset?.prompt;
  if (!prompt) {
    return Response.json(
      { error: `Invalid style. Choose from: ${Object.keys(PET_PORTRAIT_PRESETS).join(", ")} or provide a custom prompt` },
      { status: 400, headers }
    );
  }

  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "petportrait", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/instant-character",
    {
      prompt,
      image_url: imageInput,
      image_size: "square_hd",
      guidance_scale: 5.0,
      num_inference_steps: 28,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "pet-portrait");

  return Response.json(
    { image_url: finalImageUrl, feature: "pet_portrait", style: body.style, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/fitness-transform ─────────────────────────────────────────────

async function handleFitnessTransform(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<FitnessTransformRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  const intensity = body.intensity || "moderate";
  const preset = FITNESS_PRESETS[intensity] || FITNESS_PRESETS.moderate;

  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 10 : 3;

  const rlResult = await checkRateLimit(request, env, headers, "fitnesstransform", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/flux/dev",
    {
      prompt: preset.prompt,
      negative_prompt: "unrealistic, extreme, deformed, blurry, low quality, cartoon, anime",
      image_url: imageInput,
      image_size: { width: subscriberToken ? 1024 : 512, height: subscriberToken ? 1024 : 512 },
      num_inference_steps: subscriberToken ? 28 : 24,
      guidance_scale: 7.0,
      ip_adapter_scale: preset.ip_adapter_scale,
      seed: Math.floor(Math.random() * 2147483647),
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  const finalImageUrl = await cacheImageInR2(imageUrl, request, env, "fitness-transform");

  return Response.json(
    { image_url: finalImageUrl, feature: "fitness_transform", intensity, remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── POST /api/upscale ──────────────────────────────────────────────────────

async function handleUpscale(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  const methodErr = requirePost(request, headers);
  if (methodErr) return methodErr;

  const bodyOrErr = await parseBody<UpscaleRequest>(request, headers);
  if (bodyOrErr instanceof Response) return bodyOrErr;
  const body = bodyOrErr;

  const imageInput = resolveImageParam(body, "image_url", "image");
  if (!imageInput) {
    return Response.json({ error: "image_url or image (base64) is required" }, { status: 400, headers });
  }

  let subscriberToken: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    subscriberToken = authHeader.slice(7);
    const isSubscribed = await validateSubscriber(subscriberToken, env);
    if (!isSubscribed) subscriberToken = null;
  }

  const dailyLimit = subscriberToken ? 50 : 5;

  const rlResult = await checkRateLimit(request, env, headers, "upscale", dailyLimit, !!subscriberToken, subscriberToken);
  if (rlResult instanceof Response) return rlResult;
  const { currentCount, rateLimitKey } = rlResult;

  const falResult = await callFalAi(
    env,
    "fal-ai/recraft/upscale/crisp",
    {
      image_url: imageInput,
    },
    headers,
    rateLimitKey,
    currentCount
  );
  if (falResult instanceof Response) return falResult;

  const imageUrl = extractImageUrl(falResult.result);
  if (!imageUrl) {
    await rollbackRateLimit(env, rateLimitKey, currentCount);
    return Response.json({ error: "No image generated" }, { status: 500, headers });
  }

  // Cache as PNG (upscaled images are high-res)
  let finalImageUrl = imageUrl;
  try {
    const imgResponse = await fetch(imageUrl);
    if (imgResponse.ok) {
      const imgBlob = await imgResponse.arrayBuffer();
      const key = `upscale/${Date.now()}-${crypto.randomUUID()}.png`;
      await env.IMAGES_BUCKET.put(key, imgBlob, {
        httpMetadata: { contentType: "image/png" },
      });
      const workerUrl = new URL(request.url);
      finalImageUrl = `${workerUrl.origin}/images/${key}`;
    }
  } catch (r2Error) {
    console.error("R2 upload failed:", r2Error);
  }

  return Response.json(
    { image_url: finalImageUrl, feature: "upscale", remaining_today: dailyLimit - (currentCount + 1) },
    { headers }
  );
}

// ─── Serve images from R2 bucket ────────────────────────────────────────────

async function handleServeImage(key: string, env: Env, headers: Record<string, string>, sig?: string | null): Promise<Response> {
  // Signed URLs (EPIC 6.1): when SIGNING_SECRET is set, only HMAC-signed links are served
  if (env.SIGNING_SECRET) {
    const expected = await signKey(key, env.SIGNING_SECRET);
    if (!sig || sig !== expected) {
      return Response.json({ error: "Forbidden" }, { status: 403, headers });
    }
  }
  const object = await env.IMAGES_BUCKET.get(key);
  if (!object) {
    return Response.json({ error: "Image not found" }, { status: 404, headers });
  }

  const imgHeaders = new Headers();
  imgHeaders.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
  imgHeaders.set("Cache-Control", "public, max-age=86400");
  for (const [k, v] of Object.entries(headers)) {
    imgHeaders.set(k, v);
  }

  return new Response(object.body, { headers: imgHeaders });
}

// ─── RevenueCat subscription validation ─────────────────────────────────────

async function validateSubscriber(token: string, env: Env): Promise<boolean> {
  const cacheKey = `sub:${token}`;
  try {
    const cached = await env.RATE_LIMIT_KV.get(cacheKey);
    if (cached !== null) return cached === "true";
  } catch {}

  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(token)}`,
      { headers: { Authorization: `Bearer ${env.REVENUECAT_API_KEY}`, "Content-Type": "application/json" } }
    );

    if (response.status >= 500) {
      console.error("RevenueCat server error, failing closed");
      return false;
    }

    if (!response.ok) {
      try { await env.RATE_LIMIT_KV.put(cacheKey, "false", { expirationTtl: 300 }); } catch {}
      return false;
    }

    const data: any = await response.json();
    const entitlements = data.subscriber?.entitlements?.glowup_premium;
    const isActive = entitlements ? new Date(entitlements.expires_date) > new Date() : false;

    try { await env.RATE_LIMIT_KV.put(cacheKey, String(isActive), { expirationTtl: 300 }); } catch {}
    return isActive;
  } catch {
    console.error("RevenueCat validation error, failing closed");
    return false;
  }
}
