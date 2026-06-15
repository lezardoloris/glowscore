/**
 * Product recommendation engine from market research rules (reco-rules.json).
 */

import rules from '../data/reco-rules.json';
import { PRODUCTS, GlowProduct, getAffiliateUrl } from './products';
import type { QuizProfile } from '../services/quizProfile';
import { hasAvoidedIngredient } from '../data/bodyCareSafety';

export interface RecoRule {
  id: string;
  if: {
    concern?: string;
    skin_type?: string;
    experience?: string;
    persona?: string;
    note?: string;
  };
  then: {
    focus_task: string;
    ingredient?: string;
    product_category?: string;
    routine_slot?: string;
    budget_tier?: string;
  };
  because: string;
  sources: string[];
}

export interface ProductRecommendation {
  ruleId: string;
  product: GlowProduct | null;
  ingredient?: string;
  focusTask: string;
  because: string;
  affiliateUrl?: string;
}

export interface RecoContext {
  concerns: string[];
  skinType?: string;
  experience?: 'beginner' | 'intermediate';
  persona?: 'us_plus_size' | 'all';
  budgetTier?: 'budget' | 'mid' | 'premium';
  market?: 'us' | 'uk' | 'fr';
}

const GOAL_TO_CONCERNS: Record<string, string[]> = {
  clear_skin: ['pores_visibles', 'teint_terne', 'barriere_compromise'],
  harmony: ['teint_terne'],
  eyes: ['cernes_bleus', 'cernes_bruns', 'cernes_creux'],
  jawline: ['visage_gonfle', 'double_menton_maquillage'],
  lips: ['teint_irregulier'],
  hair: ['cheveux_plats', 'cheveux_ternes'],
  color: ['color_analysis_cool', 'color_analysis_warm'],
  // Must match the concern ids used by reco_031-035/048 in reco-rules.json (canonical taxonomy, EPIC PS-0).
  body_glow: ['chafing_cuisses', 'intertrigo_plis', 'hyperpigmentation_friction', 'double_menton_maquillage', 'peau_relachee_post_weight_loss', 'vergetures_inconfort'],
};

/** Concern ids that belong to the US plus-size persona, used to auto-gate reco_031-035/048. */
export const PLUS_SIZE_CONCERNS = new Set<string>([
  'chafing_cuisses', 'intertrigo_plis', 'hyperpigmentation_friction', 'double_menton_maquillage',
  'peau_relachee_post_weight_loss', 'vergetures_inconfort',
]);

/** Derive reco context from onboarding quiz. */
export function contextFromQuiz(quiz: QuizProfile | null, extras?: Partial<RecoContext>): RecoContext {
  const concerns = new Set<string>();
  (quiz?.goals || []).forEach((g) => (GOAL_TO_CONCERNS[g] || []).forEach((c) => concerns.add(c)));

  if ((quiz?.outcomes || []).includes('event')) concerns.add('visage_gonfle');
  if (quiz?.glowUpType === 'makeup') concerns.add('makeup_no_makeup');

  // US plus-size persona gates reco_031-035; derive it from the body_glow goal or any plus-size concern.
  const isPlusSize = (quiz?.goals || []).includes('body_glow') ||
    [...concerns].some((c) => PLUS_SIZE_CONCERNS.has(c));

  const experience = extras?.experience ||
    ((quiz?.goals || []).includes('body_glow') ? 'intermediate' : 'beginner');

  return {
    concerns: [...concerns],
    skinType: extras?.skinType || 'tous',
    experience,
    persona: extras?.persona || (isPlusSize ? 'us_plus_size' : 'all'),
    budgetTier: extras?.budgetTier || 'mid',
    market: extras?.market || 'us',
  };
}

const EXPERIENCE_RANK: Record<string, number> = { beginner: 0, intermediate: 1 };

function matchesRule(rule: RecoRule, ctx: RecoContext): boolean {
  const cond = rule.if;
  if (cond.concern && !ctx.concerns.includes(cond.concern)) return false;
  // skin_type: 'tous' (or an unknown ctx skin type) is a wildcard on either side, so generic rules
  // are not dropped when the user's skin type is unknown (fixes 5 of 9 face concerns).
  if (cond.skin_type && cond.skin_type !== 'tous' && ctx.skinType && ctx.skinType !== 'tous' && cond.skin_type !== ctx.skinType) return false;
  // experience is a floor, not an exact match: an intermediate context still gets beginner rules
  // (critical now that body_glow users default to 'intermediate' while reco_031-035/048 are 'beginner').
  if (cond.experience && ctx.experience && (EXPERIENCE_RANK[cond.experience] ?? 0) > (EXPERIENCE_RANK[ctx.experience] ?? 0)) return false;
  if (cond.persona && cond.persona !== ctx.persona && ctx.persona !== 'all') return false;
  if (cond.persona === 'us_plus_size' && ctx.persona !== 'us_plus_size') return false;
  return true;
}

function pickProduct(rule: RecoRule, ctx: RecoContext): GlowProduct | null {
  const rawCategory = rule.then.product_category;
  if (!rawCategory || rawCategory === 'routine_template' || rawCategory === 'program' || rawCategory === 'device' || rawCategory === 'supplements') {
    return null;
  }

  const categoryMap: Record<string, GlowProduct['category']> = {
    serum: 'serum',
    essence: 'serum',
    moisturizer: 'moisturizer',
    spf: 'spf',
    sunscreen: 'spf',
    cleanser: 'cleanser',
    eye_cream: 'eye',
    eye_cream_or_serum: 'eye',
    eye_serum: 'eye',
    color_corrector: 'makeup',
    contour_stick: 'makeup',
    foundation: 'makeup',
    blurring_powder: 'makeup',
    scalp_scrub: 'hair',
    shampoo: 'hair',
    hair_oil: 'hair',
    anti_chafe: 'anti_chafe',
    body_care: 'body',
    body_oil: 'body',
    face_spray: 'treatment',
    sheet_mask: 'mask',
    toner: 'treatment',
    facial_oil: 'treatment',
    leave_in_spray: 'hair',
    rinse: 'hair',
    device: 'tool',
  };

  const category = categoryMap[rawCategory];
  if (!category) return null;

  // Hard compliance filter: never recommend an actor that is unsafe on rubbed/eroded skin (GUARD-1).
  let pool = PRODUCTS.filter((p) => p.category === category && !hasAvoidedIngredient(p.ingredient));

  if (rule.if.concern) {
    const tagged = pool.filter((p) => p.concernTags.includes(rule.if.concern!));
    if (tagged.length) pool = tagged;
  }

  if (ctx.budgetTier) {
    const tierOrder: Record<string, number> = { budget: 0, mid: 1, premium: 2, luxe: 3 };
    const max = tierOrder[ctx.budgetTier] ?? 2;
    const affordable = pool.filter((p) => (tierOrder[p.budgetTier] ?? 1) <= max);
    if (affordable.length) pool = affordable;
  }

  if (ctx.market) {
    const local = pool.filter((p) => p.markets.includes(ctx.market!));
    if (local.length) pool = local;
  }

  return pool[0] || null;
}

export function recommendProducts(ctx: RecoContext, limit = 5): ProductRecommendation[] {
  const typedRules = rules as RecoRule[];
  const out: ProductRecommendation[] = [];
  const seenProducts = new Set<string>();

  for (const rule of typedRules) {
    if (!matchesRule(rule, ctx)) continue;
    let product = pickProduct(rule, ctx);
    // If the picked product was already recommended by an earlier rule, keep the rule's
    // distinct ingredient/advice with no duplicate product card (do not drop the rule entirely).
    if (product && seenProducts.has(product.id)) product = null;
    if (product) seenProducts.add(product.id);

    out.push({
      ruleId: rule.id,
      product,
      ingredient: rule.then.ingredient,
      focusTask: rule.then.focus_task,
      because: rule.because,
      affiliateUrl: product ? getAffiliateUrl(product, ctx.market || 'us') : undefined,
    });

    if (out.length >= limit) break;
  }

  return out;
}

/** Convenience: recos from onboarding quiz (used by screens). */
export function recommendForQuiz(quiz: QuizProfile | null, limit = 5): ProductRecommendation[] {
  return recommendProducts(contextFromQuiz(quiz), limit);
}
