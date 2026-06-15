/** Body-care safety guardrails (EPIC PS-1.2, PS-5.7). Not medical advice. */

export const AVOID_INGREDIENTS = [
  'cornstarch', 'amidon de maïs', 'witch hazel', 'hamamélis',
  'alcohol', 'denatured alcohol', 'baking soda', 'lemon juice', 'talc',
];

/**
 * Human-friendly skip-list for the UI (English only, deduped). The matcher above keeps
 * the French INCI variants for product filtering; this is what we show the user as calm
 * "better to skip" chips, not a wall of warnings.
 */
export const AVOID_DISPLAY = [
  'cornstarch', 'witch hazel', 'rubbing alcohol', 'baking soda', 'lemon juice', 'talc powder',
];

export const TIMELINE = {
  body_visible_weeks: '8-12',
  body_stable_months: '3-6',
} as const;

export const DISCLAIMER =
  'For information only. For medical advice or diagnosis, consult a professional.';

/** Flag risky INCI strings on irritated body zones. */
export function flagsBodyIngredient(inci: string): string[] {
  const lower = inci.toLowerCase();
  return AVOID_INGREDIENTS.filter((a) => lower.includes(a.toLowerCase()));
}

/** True if a product ingredient/INCI hits the avoid list (hard filter for recoEngine). */
export function hasAvoidedIngredient(ingredient?: string): boolean {
  return !!ingredient && flagsBodyIngredient(ingredient).length > 0;
}

// ── Copy compliance (review-5-agents-plus-size-2026-06.md: FTC-1, DRUG-1, CLAIM-1) ──

/** FTC affiliate disclosure: render next to EVERY product reco / buy link, before the click. */
export const AFFILIATE_DISCLOSURE =
  'Some links are affiliate links. We may earn a commission at no extra cost to you.';

/** Calm medical off-ramp shown at the bottom of fold/intertrigo protocols (not a wall of warnings). */
export const SEE_A_PRO =
  'Spreading, weeping, or smells off? That is a sign to see a clinician, not a beauty fix.';

/**
 * Terms that must never appear in shipped, user-facing copy (Apple medical-claim + anti-shame +
 * no weight framing). Enforced by scripts/check-banned-terms.mjs.
 */
export const BANNED_TERMS: string[] = [
  'weight loss', 'weight-loss', 'lose weight', 'bmi', 'calorie', 'calories',
  'ozempic', 'glp-1', 'glp1', 'semaglutide', 'wegovy',
  'obese', 'obesity', 'slim down', 'slimming',
  'eliminate', 'flaw', 'flaws', 'problem area', 'problem areas', 'double chin',
  'antifungal', 'anti-fungal', 'clotrimazole', 'miconazole', 'pyrithione',
];
