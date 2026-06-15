/**
 * GlowScore recommendation engine. Pure logic (no AI call) that turns a user's
 * concerns / focus + skin type into prioritized ingredients, real products
 * (affiliate-ready) and routine steps. Seeded from the beauty-research mapping
 * (see market-research/contenu-beaute-prompts.md); extend the data tables as the
 * scrape lands. Drives the glow-up plan depth + the "Recommended for you" surface.
 */

export type Focus =
  | 'skin' | 'eyes' | 'jawline' | 'harmony' | 'lips' | 'hair'
  | 'color' | 'corporate' | 'cortisol';
export type SkinType = 'dry' | 'oily' | 'combo' | 'sensitive' | 'normal' | 'any';
export type Experience = 'beginner' | 'intermediate' | 'any';
export type Slot = 'am' | 'pm' | 'weekly';
export type BudgetTier = 'budget' | 'mid' | 'premium';

export interface Ingredient {
  id: string;
  name: string;
  does: string;                 // one-line benefit
  concerns: Focus[];
  slot: Slot;
  beginnerSafe: boolean;
  incompatibleWith: string[];   // ingredient ids
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: 'cleanser' | 'serum' | 'moisturizer' | 'spf' | 'eye' | 'treatment' | 'tool' | 'makeup';
  concerns: Focus[];
  ingredient?: string;          // ingredient id it delivers
  budget: BudgetTier;
  skinTypes: SkinType[];
  affiliateUrl: string;         // placeholder; swap for real affiliate slug
}

// ─── Ingredients ────────────────────────────────────────────────────────────
export const INGREDIENTS: Ingredient[] = [
  { id: 'vitc', name: 'Vitamin C', does: 'Brightens and evens tone, antioxidant defense', concerns: ['skin', 'color'], slot: 'am', beginnerSafe: true, incompatibleWith: ['retinol'] },
  { id: 'niacinamide', name: 'Niacinamide', does: 'Refines pores, calms redness, balances oil', concerns: ['skin'], slot: 'pm', beginnerSafe: true, incompatibleWith: [] },
  { id: 'retinol', name: 'Retinol', does: 'Cell turnover, texture and fine lines', concerns: ['skin'], slot: 'pm', beginnerSafe: false, incompatibleWith: ['vitc', 'aha'] },
  { id: 'spf', name: 'SPF 50', does: 'The #1 anti-aging and glow protector', concerns: ['skin', 'harmony'], slot: 'am', beginnerSafe: true, incompatibleWith: [] },
  { id: 'hyaluronic', name: 'Hyaluronic acid', does: 'Plumps and hydrates for glass-skin bounce', concerns: ['skin'], slot: 'am', beginnerSafe: true, incompatibleWith: [] },
  { id: 'azelaic', name: 'Azelaic acid', does: 'Targets redness, breakouts and uneven tone', concerns: ['skin'], slot: 'pm', beginnerSafe: true, incompatibleWith: [] },
  { id: 'aha', name: 'AHA/BHA exfoliant', does: 'Smooths texture, unclogs pores', concerns: ['skin'], slot: 'weekly', beginnerSafe: false, incompatibleWith: ['retinol'] },
  { id: 'pdrn', name: 'PDRN (salmon DNA)', does: 'Repairs barrier, restores skin thickness', concerns: ['skin'], slot: 'pm', beginnerSafe: true, incompatibleWith: [] },
  { id: 'peptides', name: 'Peptides', does: 'Firms and supports collagen', concerns: ['skin', 'harmony'], slot: 'pm', beginnerSafe: true, incompatibleWith: [] },
  { id: 'caffeine', name: 'Caffeine eye serum', does: 'De-puffs and brightens the under-eye', concerns: ['eyes', 'cortisol'], slot: 'am', beginnerSafe: true, incompatibleWith: [] },
  { id: 'guasha', name: 'Gua sha / lymphatic massage', does: 'Drains fluid, de-bloats and sculpts', concerns: ['cortisol', 'jawline'], slot: 'am', beginnerSafe: true, incompatibleWith: [] },
  { id: 'ceramides', name: 'Ceramides', does: 'Seals the moisture barrier overnight', concerns: ['skin'], slot: 'pm', beginnerSafe: true, incompatibleWith: [] },
];

// ─── Products (real, affiliate-ready; URLs are placeholders) ─────────────────
const A = (slug: string) => `https://glowupai.app/go/${slug}`; // swap for real affiliate redirect
export const PRODUCTS: Product[] = [
  { id: 'p_boj_serum', brand: 'Beauty of Joseon', name: 'Glow Serum Propolis + Niacinamide', category: 'serum', concerns: ['skin'], ingredient: 'niacinamide', budget: 'budget', skinTypes: ['combo', 'oily', 'normal'], affiliateUrl: A('boj-glow-serum') },
  { id: 'p_anua_toner', brand: 'Anua', name: 'Heartleaf 77% Soothing Toner', category: 'treatment', concerns: ['skin'], ingredient: 'azelaic', budget: 'budget', skinTypes: ['sensitive', 'combo'], affiliateUrl: A('anua-heartleaf') },
  { id: 'p_cosrx_cleanser', brand: 'COSRX', name: 'Low pH Good Morning Gel Cleanser', category: 'cleanser', concerns: ['skin'], budget: 'budget', skinTypes: ['any'], affiliateUrl: A('cosrx-lowph') },
  { id: 'p_lrp_spf', brand: 'La Roche-Posay', name: 'Anthelios UV Mune 400 SPF50+', category: 'spf', concerns: ['skin', 'harmony'], ingredient: 'spf', budget: 'mid', skinTypes: ['any'], affiliateUrl: A('lrp-anthelios') },
  { id: 'p_skinceuticals_ce', brand: 'SkinCeuticals', name: 'C E Ferulic Vitamin C', category: 'serum', concerns: ['skin', 'color'], ingredient: 'vitc', budget: 'premium', skinTypes: ['normal', 'dry'], affiliateUrl: A('sc-ceferulic') },
  { id: 'p_ordinary_niac', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc', category: 'serum', concerns: ['skin'], ingredient: 'niacinamide', budget: 'budget', skinTypes: ['oily', 'combo'], affiliateUrl: A('ordinary-niac') },
  { id: 'p_cerave_pm', brand: 'CeraVe', name: 'PM Facial Moisturizing Lotion', category: 'moisturizer', concerns: ['skin'], ingredient: 'ceramides', budget: 'budget', skinTypes: ['any'], affiliateUrl: A('cerave-pm') },
  { id: 'p_medik8_retinol', brand: 'Medik8', name: 'Crystal Retinal Serum', category: 'serum', concerns: ['skin'], ingredient: 'retinol', budget: 'premium', skinTypes: ['normal', 'combo'], affiliateUrl: A('medik8-retinal') },
  { id: 'p_inkey_caffeine', brand: 'The INKEY List', name: 'Caffeine Eye Serum', category: 'eye', concerns: ['eyes', 'cortisol'], ingredient: 'caffeine', budget: 'budget', skinTypes: ['any'], affiliateUrl: A('inkey-caffeine') },
  { id: 'p_mount_lai_guasha', brand: 'Mount Lai', name: 'Jade Gua Sha Tool', category: 'tool', concerns: ['cortisol', 'jawline'], ingredient: 'guasha', budget: 'mid', skinTypes: ['any'], affiliateUrl: A('mountlai-guasha') },
  { id: 'p_numbuzin_pdrn', brand: 'Numbuzin', name: 'No.5 Vitamin-Niacinamide Serum', category: 'serum', concerns: ['skin'], ingredient: 'pdrn', budget: 'mid', skinTypes: ['dry', 'normal'], affiliateUrl: A('numbuzin-no5') },
  { id: 'p_glow_recipe_dew', brand: 'Glow Recipe', name: 'Plum Plump Hyaluronic Serum', category: 'serum', concerns: ['skin'], ingredient: 'hyaluronic', budget: 'mid', skinTypes: ['dry', 'normal', 'combo'], affiliateUrl: A('glowrecipe-plum') },
];

// ─── Concern -> ingredient priority rules ───────────────────────────────────
const FOCUS_INGREDIENTS: Record<Focus, string[]> = {
  skin: ['spf', 'vitc', 'niacinamide', 'retinol', 'hyaluronic', 'ceramides'],
  eyes: ['caffeine', 'peptides'],
  jawline: ['guasha'],
  harmony: ['spf', 'peptides'],
  lips: [],
  hair: [],
  color: ['vitc'],
  corporate: ['caffeine', 'spf'],
  cortisol: ['guasha', 'caffeine'],
};

function uniq<T>(a: T[]): T[] { return [...new Set(a)]; }

/** Top ingredients for the chosen focuses, beginner-aware, conflict-trimmed. */
export function recommendIngredients(focuses: Focus[], experience: Experience = 'any'): Ingredient[] {
  const ids = uniq(focuses.flatMap((f) => FOCUS_INGREDIENTS[f] || []));
  let chosen = ids.map((id) => INGREDIENTS.find((i) => i.id === id)).filter(Boolean) as Ingredient[];
  if (experience === 'beginner') chosen = chosen.filter((i) => i.beginnerSafe);
  // Drop ingredients that conflict with an earlier, higher-priority pick.
  const kept: Ingredient[] = [];
  for (const ing of chosen) {
    if (kept.some((k) => k.incompatibleWith.includes(ing.id) || ing.incompatibleWith.includes(k.id))) continue;
    kept.push(ing);
  }
  return kept.slice(0, 6);
}

/** Real products matching the focuses, optionally filtered by budget/skin type. */
export function recommendProducts(focuses: Focus[], opts: { budget?: BudgetTier; skinType?: SkinType; limit?: number } = {}): Product[] {
  const set = new Set(focuses);
  let list = PRODUCTS.filter((p) => p.concerns.some((c) => set.has(c)));
  if (opts.budget) list = list.filter((p) => p.budget === opts.budget);
  if (opts.skinType && opts.skinType !== 'any') list = list.filter((p) => p.skinTypes.includes(opts.skinType!) || p.skinTypes.includes('any'));
  // Rank: prefer products whose ingredient is a top recommendation.
  const topIng = new Set(recommendIngredients(focuses).map((i) => i.id));
  list.sort((a, b) => Number(topIng.has(b.ingredient || '')) - Number(topIng.has(a.ingredient || '')));
  return list.slice(0, opts.limit ?? 5);
}

/** Ordered AM/PM/weekly routine derived from focuses (ingredient slots). */
export function buildRoutine(focuses: Focus[], experience: Experience = 'any'): Record<Slot, Ingredient[]> {
  const ings = recommendIngredients(focuses, experience);
  return {
    am: ings.filter((i) => i.slot === 'am'),
    pm: ings.filter((i) => i.slot === 'pm'),
    weekly: ings.filter((i) => i.slot === 'weekly'),
  };
}
