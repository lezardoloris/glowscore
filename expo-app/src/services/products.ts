/**
 * Affiliate-ready product catalog for the recommendation engine (recoEngine.ts).
 * concernTags use internal research ids so reco-rules.json can match rules.
 *
 * **Affiliate URLs:** phased rollout — see `docs/AFFILIATE-ROADMAP.md`.
 * Until each wave ships, taps use `glowupai.app/go/{id}` redirects.
 */

export type Market = 'us' | 'uk' | 'fr';
export type BudgetTier = 'budget' | 'mid' | 'premium' | 'luxe';

export interface GlowProduct {
  id: string;
  brand: string;
  name: string;
  category: 'serum' | 'moisturizer' | 'spf' | 'cleanser' | 'eye' | 'treatment' | 'exfoliant' | 'mask' | 'tool' | 'makeup' | 'hair' | 'body' | 'anti_chafe';
  concernTags: string[];
  ingredient?: string;
  budgetTier: BudgetTier;
  markets: Market[];
  affiliate?: Partial<Record<Market, string>>;
}

/** Affiliate URL for a market, falling back to a redirect we control. */
export function getAffiliateUrl(p: GlowProduct, market: Market = 'us'): string {
  return p.affiliate?.[market] || p.affiliate?.us || `https://glowupai.app/go/${p.id}?m=${market}`;
}

export const PRODUCTS: GlowProduct[] = [
  // Skin - serums
  { id: 'boj_glow_serum', brand: 'Beauty of Joseon', name: 'Glow Serum Propolis + Niacinamide', category: 'serum', ingredient: 'niacinamide', concernTags: ['pores_visibles', 'pores_obstrues', 'teint_terne'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'ordinary_niacinamide', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc', category: 'serum', ingredient: 'niacinamide', concernTags: ['pores_visibles', 'pores_obstrues'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'skinceuticals_ceferulic', brand: 'SkinCeuticals', name: 'C E Ferulic', category: 'serum', ingredient: 'vitc', concernTags: ['teint_terne', 'teint_irregulier', 'rides_fines'], budgetTier: 'luxe', markets: ['us', 'uk', 'fr'] },
  { id: 'maelove_glowmaker', brand: 'Maelove', name: 'Glow Maker Vitamin C', category: 'serum', ingredient: 'vitc', concernTags: ['teint_terne', 'teint_irregulier'], budgetTier: 'budget', markets: ['us'] },
  { id: 'glowrecipe_plum', brand: 'Glow Recipe', name: 'Plum Plump Hyaluronic Serum', category: 'serum', ingredient: 'hyaluronic', concernTags: ['deshydratation_severe', 'teint_terne'], budgetTier: 'mid', markets: ['us', 'uk'] },
  { id: 'numbuzin_no5', brand: 'Numbuzin', name: 'No.5 Vitamin-Niacinamide Serum', category: 'serum', ingredient: 'pdrn', concernTags: ['barriere_compromise', 'deshydratation_severe'], budgetTier: 'mid', markets: ['us', 'uk', 'fr'] },
  { id: 'medik8_retinal', brand: 'Medik8', name: 'Crystal Retinal', category: 'serum', ingredient: 'retinol', concernTags: ['rides_fines', 'rides_fermete', 'pores_visibles'], budgetTier: 'premium', markets: ['us', 'uk', 'fr'] },
  { id: 'medik8_liquid_peptides', brand: 'Medik8', name: 'Liquid Peptides', category: 'serum', ingredient: 'peptides', concernTags: ['rides_fermete', 'rides_fines', 'peau_relachee_post_weight_loss'], budgetTier: 'premium', markets: ['us', 'uk', 'fr'] },
  // Treatments / soothing
  { id: 'anua_heartleaf', brand: 'Anua', name: 'Heartleaf 77% Soothing Toner', category: 'treatment', ingredient: 'azelaic', concernTags: ['rougeurs_rosacee', 'pores_obstrues'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'paulaschoice_bha', brand: "Paula's Choice", name: 'Skin Perfecting 2% BHA Liquid', category: 'exfoliant', ingredient: 'aha', concernTags: ['pores_obstrues', 'pores_visibles', 'teint_terne'], budgetTier: 'mid', markets: ['us', 'uk', 'fr'] },
  // Cleanser / moisturizer / spf
  { id: 'cosrx_lowph', brand: 'COSRX', name: 'Low pH Good Morning Gel Cleanser', category: 'cleanser', concernTags: ['pores_obstrues', 'rougeurs_rosacee'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'cerave_pm', brand: 'CeraVe', name: 'PM Facial Moisturizing Lotion', category: 'moisturizer', ingredient: 'ceramides', concernTags: ['barriere_compromise', 'deshydratation_severe'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'lrp_anthelios', brand: 'La Roche-Posay', name: 'Anthelios UV Mune 400 SPF50+', category: 'spf', ingredient: 'spf', concernTags: ['rides_fines', 'teint_irregulier', 'rides_fermete'], budgetTier: 'mid', markets: ['us', 'uk', 'fr'] },
  // Eyes
  { id: 'inkey_caffeine', brand: 'The INKEY List', name: 'Caffeine Eye Serum', category: 'eye', ingredient: 'caffeine', concernTags: ['cernes_bleus', 'visage_gonfle'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'theordinary_caffeine', brand: 'The Ordinary', name: 'Caffeine Solution 5% + EGCG', category: 'eye', ingredient: 'caffeine', concernTags: ['cernes_bleus', 'cernes_bruns', 'visage_gonfle'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  // Tools
  { id: 'mountlai_guasha', brand: 'Mount Lai', name: 'Jade Gua Sha Tool', category: 'tool', ingredient: 'guasha', concernTags: ['visage_gonfle', 'double_menton_maquillage'], budgetTier: 'mid', markets: ['us', 'uk', 'fr'] },
  // Makeup (no-makeup / corrective)
  { id: 'ilia_skintint', brand: 'ILIA', name: 'Super Serum Skin Tint SPF 40', category: 'makeup', concernTags: ['makeup_no_makeup', 'teint_irregulier'], budgetTier: 'premium', markets: ['us', 'uk'] },
  { id: 'saie_glowy', brand: 'Saie', name: 'Glowy Super Gel', category: 'makeup', concernTags: ['makeup_no_makeup', 'teint_terne'], budgetTier: 'mid', markets: ['us'] },
  // Hair
  { id: 'kerastase_glass', brand: 'Kerastase', name: 'Resistance Glass Hair Serum', category: 'hair', concernTags: ['cheveux_ternes', 'cheveux_plats'], budgetTier: 'premium', markets: ['us', 'uk', 'fr'] },
  { id: 'theordinary_multipeptide_hair', brand: 'The Ordinary', name: 'Multi-Peptide Serum for Hair Density', category: 'hair', concernTags: ['cheveux_plats', 'cheveux_ternes'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  // Body care (persona US plus size, market research 2026-06). Cosmetic only: no OTC drug brands (compliance).
  { id: 'body_glide', brand: 'Body Glide', name: 'Anti-Chafe Balm', category: 'anti_chafe', concernTags: ['chafing_cuisses'], budgetTier: 'budget', markets: ['us', 'uk'] },
  { id: 'megababe_thigh', brand: 'Megababe', name: 'Thigh Rescue Anti-Chafe Stick', category: 'anti_chafe', concernTags: ['chafing_cuisses'], budgetTier: 'budget', markets: ['us'] },
  { id: 'gold_bond_friction', brand: 'Gold Bond', name: 'Friction Defense Stick', category: 'anti_chafe', concernTags: ['chafing_cuisses'], budgetTier: 'budget', markets: ['us'] },
  { id: 'cerave_healing', brand: 'CeraVe', name: 'Healing Ointment', category: 'body', ingredient: 'petrolatum + ceramides', concernTags: ['intertrigo_plis', 'body_hydration', 'secheresse_locale'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'palmers_cocoa', brand: "Palmer's", name: 'Cocoa Butter Formula', category: 'body', concernTags: ['vergetures_inconfort', 'body_hydration'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'bio_oil', brand: 'Bio-Oil', name: 'Skincare Oil', category: 'body', concernTags: ['vergetures_inconfort', 'body_hydration'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  // No named OTC antifungal drug products (e.g. Zeasorb AF / miconazole) for compliance: keep cosmetic barriers only.
  { id: 'theordinary_azelaic', brand: 'The Ordinary', name: 'Azelaic Acid Suspension 10%', category: 'treatment', ingredient: 'azelaic', concernTags: ['hyperpigmentation_friction', 'rougeurs_rosacee'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'mario_contour', brand: 'Makeup by Mario', name: 'Soft Sculpt Shaping Stick', category: 'makeup', concernTags: ['double_menton_maquillage', 'visage_gonfle'], budgetTier: 'mid', markets: ['us', 'uk', 'fr'] },
  { id: 'cosrx_snail', brand: 'COSRX', name: 'Advanced Snail 96 Mucin Essence', category: 'serum', ingredient: 'snail mucin', concernTags: ['deshydratation_passagere', 'teint_terne', 'glass_skin'], budgetTier: 'budget', markets: ['us', 'uk', 'fr'] },
  { id: 'medicube_pdrn', brand: 'Medicube', name: 'PDRN Pink Peptide Serum', category: 'serum', ingredient: 'pdrn', concernTags: ['teint_terne', 'texture'], budgetTier: 'mid', markets: ['us'] },
  { id: 'bobbi_corrector', brand: 'Bobbi Brown', name: 'Under Eye Color Corrector', category: 'makeup', concernTags: ['cernes_bleus', 'cernes_colores'], budgetTier: 'premium', markets: ['us', 'uk', 'fr'] },
];
