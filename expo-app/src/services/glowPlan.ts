import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizProfile } from './quizProfile';

/**
 * Glow-up plan: turns the scan + the onboarding quiz into a persistent, persona-
 * and score-aware daily checklist with a streak. This is the core week-2+
 * retention loop — a reason to open the app every day that costs no AI call.
 */

const PLAN_KEY = 'glow_plan';

export type PlanCategory =
  | 'Skincare' | 'Face Fitness' | 'Lifestyle' | 'Style & Color'
  | 'Makeup' | 'Hair' | 'Eyes' | 'Glow Habits' | 'Body Care';

export interface GlowTask {
  id: string;
  text: string;
  category?: PlanCategory;
  completedDates: string[]; // 'YYYY-MM-DD'
}

export interface GlowPlan {
  createdAt: string; // ISO
  tasks: GlowTask[];
  persona?: string;       // focus key (skin, jawline, ...)
  personaLabel?: string;  // human label shown in the UI
  intro?: string;         // score-tailored one-liner
  score?: number;         // overall at plan creation
}

function dayKey(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export async function getPlan(): Promise<GlowPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as GlowPlan) : null;
  } catch {
    return null;
  }
}

// ─── Persona + score plan library ───────────────────────────────────────────

type Item = { text: string; category: PlanCategory };

const PERSONA_LABEL: Record<string, string> = {
  skin: 'Glass-Skin Glow',
  jawline: 'Sculpt & Define',
  eyes: 'Bright, Awake Eyes',
  harmony: 'Facial Harmony',
  lips: 'Lip Harmony',
  hair: 'Hair & Framing',
  makeup: 'Makeup Artistry',
  color: 'Color Harmony',
  corporate: 'Polished & Professional',
  cortisol: 'De-Bloat Ritual',
  event: 'Event Countdown',
  bodycare: 'Body Glow Care',
};

// Universal daily foundation (every plan)
const FOUNDATION: Item[] = [
  { text: 'Broad-spectrum SPF 50 every morning (the #1 glow + anti-aging habit)', category: 'Skincare' },
  { text: 'Sleep 7-8 hours to recover skin and de-puff the face', category: 'Lifestyle' },
  { text: 'Take your front-lit progress selfie to track your glow-up', category: 'Glow Habits' },
];

const FOCUS_TASKS: Record<string, Item[]> = {
  skin: [
    { text: 'Double cleanse PM: oil cleanser then a gentle gel (e.g. Beauty of Joseon, COSRX)', category: 'Skincare' },
    { text: 'Vitamin C serum every AM for brightness and even tone (e.g. Anua, Skinceuticals)', category: 'Skincare' },
    { text: 'Niacinamide 5% at night to refine pores and calm redness (e.g. The Ordinary, Anua)', category: 'Skincare' },
    { text: 'Never layer vitamin C and retinol the same night: C in the AM, retinol in the PM', category: 'Skincare' },
    { text: 'Retinol 2-3 nights/week for renewal, buffer with moisturizer (e.g. CeraVe, La Roche-Posay)', category: 'Skincare' },
    { text: 'Hydrating + barrier moisturizer AM/PM for that glass-skin bounce', category: 'Skincare' },
    { text: 'Drink 2L of water and aim for 7-8h sleep to plump skin from within', category: 'Lifestyle' },
  ],
  jawline: [
    { text: '5 min of mewing (tongue flat on the palate) while you work', category: 'Face Fitness' },
    { text: 'Gua sha along the jaw and neck to de-bloat (3 min upward strokes)', category: 'Face Fitness' },
    { text: 'Cut added salt today to reduce facial water retention', category: 'Lifestyle' },
    { text: 'Chin tucks: 3 sets of 10 for jaw and neck posture', category: 'Face Fitness' },
    { text: 'Sleep on your back to avoid morning facial puffiness', category: 'Lifestyle' },
  ],
  eyes: [
    { text: 'Ice roller or cold spoon under the eyes for 2 min each morning', category: 'Face Fitness' },
    { text: 'Caffeine eye cream tapped in morning and night', category: 'Skincare' },
    { text: 'Screens off 30 min before bed to reduce dark circles', category: 'Lifestyle' },
    { text: 'Brush brows up and check shape to open the eye area', category: 'Makeup' },
  ],
  harmony: [
    { text: 'Face yoga: cheek lifts and forehead smoother, 3 sets', category: 'Face Fitness' },
    { text: 'Posture reset hourly: ears over shoulders, chin level', category: 'Lifestyle' },
    { text: 'Lymphatic face massage 3 min to de-puff evenly', category: 'Face Fitness' },
    { text: 'Find your best angle: chin slightly down and forward in photos', category: 'Glow Habits' },
  ],
  lips: [
    { text: 'Lip scrub then balm AM/PM for smooth, fuller-looking lips', category: 'Skincare' },
    { text: 'Subtly overline with a liner one shade deeper than your lips', category: 'Makeup' },
    { text: 'Stay hydrated and stop licking lips (it dries them out)', category: 'Lifestyle' },
  ],
  hair: [
    { text: 'Style face-framing pieces that flatter your face shape', category: 'Hair' },
    { text: 'Silk pillowcase + 2 min nightly scalp massage for shine and growth', category: 'Hair' },
    { text: 'Always use heat protectant before any hot tool', category: 'Hair' },
    { text: 'Plan a cut/color that suits your face shape and season', category: 'Hair' },
  ],
  makeup: [
    { text: 'Practice soft contour to enhance (not change) your bone structure', category: 'Makeup' },
    { text: 'Map brows and liner to balance your features symmetrically', category: 'Makeup' },
    { text: 'Cream blush high on the cheek for a lifted, healthy glow', category: 'Makeup' },
    { text: 'Lock in a 5-minute everyday "your face but polished" routine', category: 'Makeup' },
  ],
  color: [
    { text: 'Drape a white vs a cream top in daylight, notice which brightens your face', category: 'Style & Color' },
    { text: 'Hold silver then gold near your jaw, keep the one that makes skin look clearer', category: 'Style & Color' },
    { text: 'Photograph yourself in your 3 most-worn colors, rank by how awake you look', category: 'Style & Color' },
    { text: 'Wear one color from your best palette today and notice the glow', category: 'Style & Color' },
    { text: 'Try a lip or blush shade in your season family', category: 'Makeup' },
    { text: 'Build a 6-color capsule from your most flattering shades', category: 'Style & Color' },
  ],
  corporate: [
    { text: 'Set a 5-minute "office face" routine you can repeat half-asleep', category: 'Makeup' },
    { text: 'Pick a polished, low-maintenance hairstyle for the week', category: 'Hair' },
    { text: 'Build 3 quiet-luxury outfits in your best colors for meetings', category: 'Style & Color' },
    { text: 'Under-eye care AM to look rested through long workdays', category: 'Skincare' },
  ],
  cortisol: [
    { text: 'Warm lemon water on waking, then 3 min of gua sha (upward strokes)', category: 'Face Fitness' },
    { text: 'Keep added salt low today to reduce facial water retention', category: 'Lifestyle' },
    { text: 'Sleep on your back, head slightly raised, to wake less puffy', category: 'Lifestyle' },
    { text: 'Re-check your Stress & Bloat Index and log how your face feels', category: 'Glow Habits' },
  ],
  event: [
    { text: 'De-bloat AM ritual: warm lemon water, gua sha, low salt', category: 'Lifestyle' },
    { text: 'Lock in a consistent skincare routine (best results need 8-12 weeks)', category: 'Skincare' },
    { text: 'Trial your hair + makeup look and photograph it in daylight', category: 'Glow Habits' },
  ],
  bodycare: [
    { text: 'Anti-chafe balm on thighs/underarms before dressing (e.g. Body Glide)', category: 'Body Care' },
    { text: 'Keep skin folds dry after shower: pat dry, cool air if needed', category: 'Body Care' },
    { text: 'Layer body care: wash, body oil, then rich butter on dry zones (e.g. Palmer\'s)', category: 'Body Care' },
    { text: 'Soft V-shape contour under chin, blend downward (cool tone, e.g. Makeup by Mario)', category: 'Makeup' },
    { text: 'Peptides + SPF daily if your skin is changing (firmness support, not medical)', category: 'Skincare' },
  ],
};

const GOAL_TO_FOCUS: Record<string, string> = {
  clear_skin: 'skin', harmony: 'harmony', eyes: 'eyes',
  jawline: 'jawline', lips: 'lips', hair: 'hair', color: 'color',
  body_glow: 'bodycare',
};

// Map a scan sub-score key to a focus area (to target the weakest trait)
const SUBSCORE_TO_FOCUS: Record<string, string> = {
  skin: 'skin', eyes: 'eyes', jawline: 'jawline',
  symmetry: 'harmony', harmony: 'harmony',
  nose_lip_ratio: 'lips', lip_harmony: 'lips',
};

export interface PlanScoreInput {
  overall?: number;
  skin?: number; jawline?: number; symmetry?: number; eyes?: number;
  harmony?: number; nose_lip_ratio?: number; lip_harmony?: number;
}

function weakestFocus(score?: PlanScoreInput): string | null {
  if (!score) return null;
  const entries = Object.entries(SUBSCORE_TO_FOCUS)
    .map(([k, focus]) => ({ focus, val: (score as any)[k] as number | undefined }))
    .filter((e) => typeof e.val === 'number') as { focus: string; val: number }[];
  if (!entries.length) return null;
  entries.sort((a, b) => a.val - b.val);
  return entries[0].focus;
}

function capstone(overall?: number): Item {
  if (typeof overall !== 'number') return { text: 'Re-scan weekly to watch your GlowScore climb', category: 'Glow Habits' };
  if (overall < 60) return { text: 'Master the basics: do every step for 7 straight days before adding more', category: 'Glow Habits' };
  if (overall < 75) return { text: 'Add one targeted active and track how your skin responds', category: 'Skincare' };
  return { text: 'Maintain and refine: protect your streak and re-scan weekly', category: 'Glow Habits' };
}

function introFor(label: string, overall?: number): string {
  const band = typeof overall !== 'number' ? '' :
    overall < 60 ? 'You have the most upside here — foundations first, and the gains compound fast. '
    : overall < 75 ? 'Solid base. These targeted habits are what move the needle. '
    : 'Great starting point. This plan is about refinement and consistency. ';
  return `${band}Built around ${label.toLowerCase()}. Best results show after 8-12 weeks of consistency.`;
}

/** Build a complete, persona + score aware task list. */
export function buildPersonaTasks(quiz: QuizProfile | null, score?: PlanScoreInput): {
  items: Item[]; persona: string; personaLabel: string; intro: string;
} {
  // Primary focus: first selected goal, else makeup type, else weakest sub-score, else skin (P1)
  let primary =
    (quiz?.goals || []).map((g) => GOAL_TO_FOCUS[g]).find(Boolean) ||
    (quiz?.glowUpType === 'makeup' ? 'makeup' : undefined) ||
    weakestFocus(score) ||
    'skin';

  // Secondary focus: weakest sub-score (if different), else a second goal, else harmony
  const weak = weakestFocus(score);
  let secondary =
    (weak && weak !== primary ? weak : undefined) ||
    (quiz?.goals || []).map((g) => GOAL_TO_FOCUS[g]).filter((f) => f && f !== primary)[0] ||
    (primary !== 'harmony' ? 'harmony' : 'skin');

  const items: Item[] = [...FOUNDATION];
  items.push(...(FOCUS_TASKS[primary] || []));
  items.push(...(FOCUS_TASKS[secondary] || []).slice(0, 3));

  // Outcome / type add-ons
  if ((quiz?.outcomes || []).includes('event')) items.push(...FOCUS_TASKS.event.slice(0, 2));
  if ((quiz?.outcomes || []).includes('work') && primary !== 'corporate') items.push(...FOCUS_TASKS.corporate.slice(0, 2));
  if (quiz?.glowUpType === 'makeup' && primary !== 'makeup') items.push(...FOCUS_TASKS.makeup.slice(0, 2));
  // US plus-size persona: body fold + chafing tasks (market research P1)
  if ((quiz?.goals || []).includes('body_glow') || primary === 'jawline' || primary === 'cortisol') {
    items.push(...FOCUS_TASKS.bodycare.slice(0, 2));
  }

  items.push(capstone(score?.overall));

  // Dedup by text, keep first occurrence
  const seen = new Set<string>();
  const deduped = items.filter((it) => (seen.has(it.text) ? false : (seen.add(it.text), true)));

  const personaLabel = PERSONA_LABEL[primary] || 'Your Glow-Up';
  // Cap the daily list so it stays actionable (foundation + 2 focuses + capstone).
  return { items: deduped.slice(0, 12), persona: primary, personaLabel, intro: introFor(personaLabel, score?.overall) };
}

// ─── Persistence ────────────────────────────────────────────────────────────

/** Persist a list of items, preserving completion history for unchanged text. */
async function persistTasks(items: Item[], meta?: Partial<GlowPlan>): Promise<void> {
  try {
    const existing = await getPlan();
    const byText: Record<string, GlowTask> = {};
    existing?.tasks.forEach((t) => { byText[t.text] = t; });
    const tasks: GlowTask[] = items.map((it, i) => {
      const prev = byText[it.text];
      return prev
        ? { ...prev, category: it.category }
        : { id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`, text: it.text, category: it.category, completedDates: [] };
    });
    const plan: GlowPlan = {
      createdAt: existing?.createdAt || new Date().toISOString(),
      tasks,
      ...meta,
    };
    await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (e) {
    console.warn('[GlowPlan] save failed:', e);
  }
}

/** Build + save a complete persona/score-aware plan (preferred path). */
export async function savePlanForProfile(quiz: QuizProfile | null, score?: PlanScoreInput): Promise<void> {
  const { items, persona, personaLabel, intro } = buildPersonaTasks(quiz, score);
  await persistTasks(items, { persona, personaLabel, intro, score: score?.overall });
}

/** Build + save a plan from the concern picker (concerns.tsx -> focus keys). */
export async function savePlanFromConcerns(focuses: string[]): Promise<void> {
  const uniq = [...new Set(focuses)].filter((f) => FOCUS_TASKS[f]);
  if (!uniq.length) return;
  const items: Item[] = [...FOUNDATION];
  uniq.forEach((f) => items.push(...(FOCUS_TASKS[f] || []).slice(0, 3)));
  items.push(capstone(undefined));
  const seen = new Set<string>();
  const deduped = items.filter((it) => (seen.has(it.text) ? false : (seen.add(it.text), true)));
  const primary = uniq[0];
  await persistTasks(deduped.slice(0, 12), {
    persona: primary,
    personaLabel: PERSONA_LABEL[primary] || 'Your Glow-Up',
    intro: 'Built around the concerns you picked. Consistency over 8-12 weeks is where the magic happens.',
  });
}

/**
 * Stress-Faciometre: merge the de-bloat ritual into the existing plan (without
 * dropping the persona plan), so the hero feature feeds the daily retention loop.
 */
export async function saveDestressPlan(): Promise<void> {
  const existing = await getPlan();
  const base: Item[] = existing
    ? existing.tasks.map((t) => ({ text: t.text, category: (t.category || 'Glow Habits') as PlanCategory }))
    : [...FOUNDATION];
  const merged = [...base, ...FOCUS_TASKS.cortisol];
  const seen = new Set<string>();
  const deduped = merged.filter((it) => (seen.has(it.text) ? false : (seen.add(it.text), true)));
  await persistTasks(deduped, {
    persona: existing?.persona || 'cortisol',
    personaLabel: existing?.personaLabel || PERSONA_LABEL.cortisol,
    intro: existing?.intro || 'Your daily de-bloat ritual to lower the Stress & Bloat Index. Consistency beats intensity.',
    score: existing?.score,
  });
}

/**
 * Legacy fallback: create/refresh the plan from raw scan tips. Kept so a scan
 * without a quiz profile still produces a checklist.
 */
export async function savePlanFromTips(tips: string[]): Promise<void> {
  if (!tips || tips.length === 0) return;
  await persistTasks(tips.map((text) => ({ text, category: 'Glow Habits' as PlanCategory })));
}

export function isDoneToday(task: GlowTask): boolean {
  return task.completedDates.includes(dayKey());
}

/** Toggle a task's completion for today. Returns the updated plan. */
export async function toggleTaskToday(taskId: string): Promise<GlowPlan | null> {
  const plan = await getPlan();
  if (!plan) return null;
  const today = dayKey();
  for (const t of plan.tasks) {
    if (t.id === taskId) {
      t.completedDates = isDoneToday(t)
        ? t.completedDates.filter((d) => d !== today)
        : [...t.completedDates, today];
      break;
    }
  }
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  return plan;
}

/** 12-week blueprint (EPIC 5.1): which program week the plan is in (1..12). */
export function getPlanWeek(plan: GlowPlan): number {
  const days = Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}

/** Weekly focus rotation across the 6 diagnostic components. */
const WEEK_FOCUS = [
  'Skin Clarity', 'Eye Area', 'Jawline Definition', 'Facial Symmetry', 'Lips & Smile', 'Nose & Profile',
];
export function getWeekFocus(week: number): string {
  return WEEK_FOCUS[(week - 1) % WEEK_FOCUS.length];
}

/** Consecutive days (ending today or yesterday) with at least one task done. */
export async function getStreak(): Promise<number> {
  const plan = await getPlan();
  if (!plan) return 0;
  const done = new Set<string>();
  plan.tasks.forEach((t) => t.completedDates.forEach((d) => done.add(d)));
  if (done.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count if today isn't done yet but yesterday is
  if (!done.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (done.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
