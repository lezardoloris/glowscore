/**
 * Product recommendation engine from market research rules (reco-rules.json).
 */

import rules from '../data/reco-rules.json';
import { PRODUCTS, GlowProduct, getAffiliateUrl } from './products';
import type { QuizProfile } from '../services/quizProfile';

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
};

/** Derive reco context from onboarding quiz. */
export function contextFromQuiz(quiz: QuizProfile | null, extras?: Partial<RecoContext>): RecoContext {
  const concerns = new Set<string>();
  (quiz?.goals || []).forEach((g) => (GOAL_TO_CONCERNS[g] || []).forEach((c) => concerns.add(c)));

  if ((quiz?.outcomes || []).includes('event')) concerns.add('visage_gonfle');
  if (quiz?.glowUpType === 'makeup') concerns.add('makeup_no_makeup');

  return {
    concerns: [...concerns],
    skinType: extras?.skinType || 'tous',
    experience: extras?.experience || 'beginner',
    persona: extras?.persona || 'all',
    budgetTier: extras?.budgetTier || 'mid',
    market: extras?.market || 'us',
  };
}

function matchesRule(rule: RecoRule, ctx: RecoContext): boolean {
  const cond = rule.if;
  if (cond.concern && !ctx.concerns.includes(cond.concern)) return false;
  if (cond.skin_type && cond.skin_type !== 'tous' && ctx.skinType && cond.skin_type !== ctx.skinType) return false;
  if (cond.experience && ctx.experience && cond.experience !== ctx.experience) return false;
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

  let pool = PRODUCTS.filter((p) => p.category === category);

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

/** Return top N product recommendations for a user context. */
export function recommendProducts(ctx: RecoContext, limit = 5): ProductRecommendation[] {
  const typedRules = rules as RecoRule[];
  const out: ProductRecommendation[] = [];
  const seenProducts = new Set<string>();

  for (const rule of typedRules) {
    if (!matchesRule(rule, ctx)) continue;
    const product = pickProduct(rule, ctx);
    if (product && seenProducts.has(product.id)) continue;
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

/** Map concern string from concerns picker to reco context. */
export const CONCERN_TO_RECO: Record<string, string> = {
  breakouts: 'pores_obstrues',
  dark_circles: 'cernes_bleus',
  puffiness: 'visage_gonfle',
  asymmetry: 'teint_terne',
  redness: 'rougeurs_rosacee',
  fine_lines: 'rides_fines',
  texture: 'pores_visibles',
  dryness: 'deshydratation_severe',
  sagging: 'rides_fermete',
};

export function contextFromConcerns(concernIds: string[], extras?: Partial<RecoContext>): RecoContext {
  return {
    concerns: concernIds.map((id) => CONCERN_TO_RECO[id] || id).filter(Boolean),
    skinType: extras?.skinType || 'tous',
    experience: extras?.experience || 'beginner',
    persona: extras?.persona || 'all',
    budgetTier: extras?.budgetTier || 'mid',
    market: extras?.market || 'us',
  };
}
