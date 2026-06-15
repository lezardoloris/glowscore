/**
 * Launch product catalog from market research (US affiliate targets).
 * Sources: cartographie-glow-up-us-fr-uk.md + persona-us-plus-size-research.md
 */

export type BudgetTier = 'budget' | 'mid' | 'premium' | 'luxe';
export type ProductCategory =
  | 'serum' | 'essence' | 'moisturizer' | 'cleanser' | 'spf'
  | 'eye_cream' | 'contour_stick' | 'color_corrector' | 'foundation'
  | 'blurring_powder' | 'scalp_scrub' | 'shampoo' | 'hair_oil'
  | 'anti_chafe' | 'body_care' | 'device';

export interface GlowProduct {
  id: string;
  brand: string;
  name: string;
  category: ProductCategory;
  concernTags: string[];
  priceUsd: number;
  budgetTier: BudgetTier;
  skinTypes: string[];
  affiliateSearch: string; // Amazon/Sephora search slug until real affiliate URLs
  markets: ('us' | 'uk' | 'fr')[];
}

export const PRODUCTS: GlowProduct[] = [
  { id: 'cosrx_snail', brand: 'COSRX', name: 'Advanced Snail 96 Mucin Power Essence', category: 'essence', concernTags: ['deshydratation', 'teint_terne', 'texture'], priceUsd: 20, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'COSRX Advanced Snail 96 Mucin', markets: ['us', 'uk', 'fr'] },
  { id: 'cerave_moist', brand: 'CeraVe', name: 'Moisturizing Cream', category: 'moisturizer', concernTags: ['barriere_compromise', 'secheresse'], priceUsd: 18, budgetTier: 'budget', skinTypes: ['seche', 'sensible'], affiliateSearch: 'CeraVe Moisturizing Cream', markets: ['us', 'uk', 'fr'] },
  { id: 'ordinary_nia', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%', category: 'serum', concernTags: ['pores_visibles', 'rougeurs'], priceUsd: 6, budgetTier: 'budget', skinTypes: ['grasse', 'mixte'], affiliateSearch: 'The Ordinary Niacinamide 10', markets: ['us', 'uk', 'fr'] },
  { id: 'lrp_cicaplast', brand: 'La Roche-Posay', name: 'Cicaplast Baume B5+', category: 'moisturizer', concernTags: ['barriere_compromise', 'rougeurs'], priceUsd: 19, budgetTier: 'budget', skinTypes: ['sensible', 'tous'], affiliateSearch: 'La Roche-Posay Cicaplast B5', markets: ['us', 'uk', 'fr'] },
  { id: 'lrp_anthelios', brand: 'La Roche-Posay', name: 'Anthelios SPF 50', category: 'spf', concernTags: ['antiage', 'barriere'], priceUsd: 35, budgetTier: 'mid', skinTypes: ['tous'], affiliateSearch: 'La Roche-Posay Anthelios SPF 50', markets: ['us', 'uk', 'fr'] },
  { id: 'medicube_pdrn', brand: 'Medicube', name: 'PDRN Pink Peptide Serum', category: 'serum', concernTags: ['teint_terne', 'texture', 'elasticite'], priceUsd: 25, budgetTier: 'mid', skinTypes: ['tous'], affiliateSearch: 'Medicube PDRN Pink Peptide Serum', markets: ['us'] },
  { id: 'aestura_barrier', brand: 'Aestura', name: 'Atobarrier 365 Cream', category: 'moisturizer', concernTags: ['barriere_compromise', 'secheresse'], priceUsd: 30, budgetTier: 'mid', skinTypes: ['seche', 'sensible'], affiliateSearch: 'Aestura Atobarrier 365 Cream', markets: ['us'] },
  { id: 'paula_bha', brand: "Paula's Choice", name: '2% BHA Liquid Exfoliant', category: 'serum', concernTags: ['pores_obstrues', 'points_noirs'], priceUsd: 35, budgetTier: 'mid', skinTypes: ['grasse', 'mixte'], affiliateSearch: "Paula's Choice 2% BHA", markets: ['us', 'uk', 'fr'] },
  { id: 'boj_retinal_eye', brand: 'Beauty of Joseon', name: 'Revive Eye Serum Ginseng + Retinal', category: 'eye_cream', concernTags: ['cernes_creux', 'ridules_yeux'], priceUsd: 17, budgetTier: 'budget', skinTypes: ['mature', 'tous'], affiliateSearch: 'Beauty of Joseon Revive Eye Serum', markets: ['us', 'uk', 'fr'] },
  { id: 'marymay_tranexamic', brand: 'Mary & May', name: 'Tranexamic Acid + Glutathione Eye Cream', category: 'eye_cream', concernTags: ['cernes_bruns', 'hyperpigmentation'], priceUsd: 20, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'Mary and May Tranexamic Eye Cream', markets: ['us'] },
  { id: 'bobbi_corrector', brand: 'Bobbi Brown', name: 'Under Eye Color Corrector', category: 'color_corrector', concernTags: ['cernes_bleus', 'cernes_colores'], priceUsd: 33, budgetTier: 'premium', skinTypes: ['tous'], affiliateSearch: 'Bobbi Brown Under Eye Corrector', markets: ['us', 'uk', 'fr'] },
  { id: 'mario_contour', brand: 'Makeup by Mario', name: 'Soft Sculpt Shaping Stick', category: 'contour_stick', concernTags: ['double_menton_maquillage', 'visage_rond'], priceUsd: 28, budgetTier: 'mid', skinTypes: ['tous'], affiliateSearch: 'Makeup by Mario Soft Sculpt Stick', markets: ['us', 'uk', 'fr'] },
  { id: 'merit_minimalist', brand: 'Merit', name: 'The Minimalist Foundation Stick', category: 'foundation', concernTags: ['makeup_no_makeup', 'teint_irregulier'], priceUsd: 38, budgetTier: 'premium', skinTypes: ['seche', 'normale'], affiliateSearch: 'Merit Minimalist Foundation Stick', markets: ['us'] },
  { id: 'danessa_blur', brand: 'Danessa Myricks', name: 'Yummy Skin Blurring Balm Powder', category: 'blurring_powder', concernTags: ['teint_matiere', 'brillance'], priceUsd: 36, budgetTier: 'premium', skinTypes: ['grasse', 'mixte'], affiliateSearch: 'Danessa Myricks Blurring Balm', markets: ['us'] },
  { id: 'canmake_powder', brand: 'Canmake', name: 'Marshmallow Finish Powder', category: 'blurring_powder', concernTags: ['pores_visibles', 'brillance'], priceUsd: 16, budgetTier: 'budget', skinTypes: ['grasse', 'mixte'], affiliateSearch: 'Canmake Marshmallow Finish Powder', markets: ['us'] },
  { id: 'body_glide', brand: 'Body Glide', name: 'Anti-Chafe Balm', category: 'anti_chafe', concernTags: ['chafing_cuisses', 'body_fold'], priceUsd: 10, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'Body Glide Anti Chafe', markets: ['us', 'uk'] },
  { id: 'palmers_cocoa', brand: "Palmer's", name: 'Cocoa Butter Formula', category: 'body_care', concernTags: ['vergetures_inconfort', 'body_hydration'], priceUsd: 8, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'Palmer Cocoa Butter Formula', markets: ['us', 'uk', 'fr'] },
  { id: 'bio_oil', brand: 'Bio-Oil', name: 'Skincare Oil', category: 'body_care', concernTags: ['vergetures_inconfort', 'secheresse_locale'], priceUsd: 12, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'Bio-Oil Skincare Oil', markets: ['us', 'uk', 'fr'] },
  { id: 'christophe_salt', brand: 'Christophe Robin', name: 'Cleansing Purifying Scrub with Sea Salt', category: 'scalp_scrub', concernTags: ['cheveux_plats', 'cuir_chevelu_gras'], priceUsd: 53, budgetTier: 'premium', skinTypes: ['cheveux_fins'], affiliateSearch: 'Christophe Robin Sea Salt Scrub', markets: ['us', 'uk', 'fr'] },
  { id: 'growus_shampoo', brand: 'Growus', name: 'Sea Salt Therapy Shampoo', category: 'shampoo', concernTags: ['cheveux_plats', 'volume'], priceUsd: 28, budgetTier: 'mid', skinTypes: ['cheveux_fins'], affiliateSearch: 'Growus Sea Salt Therapy Shampoo', markets: ['us'] },
  { id: 'tirtir_milk', brand: 'Tirtir', name: 'Milk Skin Toner', category: 'essence', concernTags: ['glass_skin', 'teint_terne'], priceUsd: 22, budgetTier: 'budget', skinTypes: ['tous'], affiliateSearch: 'Tirtir Milk Skin Toner', markets: ['us'] },
  { id: 'prequel_gleanser', brand: 'Prequel', name: 'Gleanser Non-Stripping Cleanser', category: 'cleanser', concernTags: ['barriere_compromise', 'sensibilite'], priceUsd: 18, budgetTier: 'budget', skinTypes: ['sensible'], affiliateSearch: 'Prequel Gleanser', markets: ['us'] },
];

export function getProductsByCategory(category: ProductCategory): GlowProduct[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductsByConcern(concern: string): GlowProduct[] {
  return PRODUCTS.filter((p) => p.concernTags.includes(concern));
}

export function getAffiliateUrl(product: GlowProduct, market: 'us' | 'uk' | 'fr' = 'us'): string {
  const q = encodeURIComponent(product.affiliateSearch);
  if (market === 'uk') return `https://www.amazon.co.uk/s?k=${q}`;
  if (market === 'fr') return `https://www.amazon.fr/s?k=${q}`;
  return `https://www.amazon.com/s?k=${q}`;
}
