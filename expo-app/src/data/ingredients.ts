/**
 * 30 key actives from market research (cartographie glow-up 2026-06).
 * Educational only — not medical advice.
 */

export interface Ingredient {
  id: string;
  name: string;
  nameFr: string;
  role: string;
  concerns: string[];
  frequency: string;
  incompatibilities: string[];
  beginner: boolean;
  evidence: 'strong' | 'emerging' | 'debated';
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'pdrn', name: 'PDRN', nameFr: 'PDRN', role: 'Repair, collagen support', concerns: ['texture', 'redness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'emerging' },
  { id: 'tretinoin', name: 'Tretinoin', nameFr: 'Trétinoïne', role: 'Cell turnover (Rx only)', concerns: ['fine_lines', 'breakouts'], frequency: 'PM 2-4x/wk', incompatibilities: ['aha_same_night', 'vit_c_low_ph'], beginner: false, evidence: 'strong' },
  { id: 'retinal', name: 'Retinaldehyde', nameFr: 'Rétinal', role: 'Gentle retinoid precursor', concerns: ['fine_lines', 'texture'], frequency: 'PM', incompatibilities: ['benzoyl_peroxide'], beginner: true, evidence: 'strong' },
  { id: 'azelaic', name: 'Azelaic acid', nameFr: 'Acide azélaïque', role: 'Keratinization, melanin', concerns: ['redness', 'breakouts'], frequency: 'AM/PM', incompatibilities: ['harsh_scrubs'], beginner: true, evidence: 'strong' },
  { id: 'txa', name: 'Tranexamic acid', nameFr: 'Acide tranexamique', role: 'Melanocytes', concerns: ['dark_circles', 'redness'], frequency: 'AM/PM', incompatibilities: ['strong_aha_same_formula'], beginner: true, evidence: 'strong' },
  { id: 'ceramides', name: 'Ceramides', nameFr: 'Céramides', role: 'Barrier lipids', concerns: ['dryness', 'redness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'ectoin', name: 'Ectoin', nameFr: 'Ectoïne', role: 'Hydration shield', concerns: ['puffiness', 'dryness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'emerging' },
  { id: 'hypochlorous', name: 'Hypochlorous acid', nameFr: 'Acide hypochloreux', role: 'Gentle antimicrobial', concerns: ['breakouts', 'redness'], frequency: 'AM/PM', incompatibilities: ['vit_c_direct'], beginner: true, evidence: 'strong' },
  { id: 'copper_peptides', name: 'Copper peptides', nameFr: 'Peptides cuivre', role: 'Elasticity', concerns: ['sagging', 'fine_lines'], frequency: 'AM/PM', incompatibilities: ['pure_vit_c', 'aha_bha'], beginner: true, evidence: 'debated' },
  { id: 'exosomes', name: 'Exosomes', nameFr: 'Exosomes', role: 'Growth factors', concerns: ['sagging'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'emerging' },
  { id: 'centella', name: 'Centella', nameFr: 'Centella', role: 'Anti-inflammatory', concerns: ['redness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'beta_glucan', name: 'Beta-glucan', nameFr: 'Beta-glucan', role: 'Hydration', concerns: ['dryness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'caffeine', name: 'Caffeine', nameFr: 'Caféine', role: 'Vasoconstriction', concerns: ['puffiness', 'dark_circles'], frequency: 'AM', incompatibilities: ['sensitive_eye_area'], beginner: true, evidence: 'strong' },
  { id: 'niacinamide', name: 'Niacinamide', nameFr: 'Niacinamide', role: 'Pores, barrier', concerns: ['texture', 'breakouts'], frequency: 'AM/PM', incompatibilities: ['vit_c_acid_same_layer'], beginner: true, evidence: 'strong' },
  { id: 'snail', name: 'Snail mucin', nameFr: 'Snail mucin', role: 'Hydration, repair', concerns: ['texture', 'dryness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'pha', name: 'PHA', nameFr: 'PHA', role: 'Gentle exfoliation', concerns: ['texture'], frequency: 'PM 2-4x/wk', incompatibilities: ['tretinoin_same_night'], beginner: true, evidence: 'strong' },
  { id: 'mugwort', name: 'Mugwort', nameFr: 'Mugwort', role: 'Soothing', concerns: ['redness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'glutathione', name: 'Glutathione', nameFr: 'Glutathione', role: 'Antioxidant', concerns: ['dark_circles'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'squalane', name: 'Squalane', nameFr: 'Squalane', role: 'Emollient', concerns: ['dryness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'bha', name: 'Salicylic acid', nameFr: 'Acide salicylique', role: 'BHA', concerns: ['breakouts', 'texture'], frequency: 'PM 2-3x/wk', incompatibilities: ['mechanical_scrubs'], beginner: true, evidence: 'strong' },
  { id: 'aha_glycolic', name: 'Glycolic acid', nameFr: 'Acide glycolique', role: 'AHA', concerns: ['fine_lines'], frequency: 'PM 1-2x/wk', incompatibilities: ['tretinoin_same_night'], beginner: false, evidence: 'strong' },
  { id: 'rosehip', name: 'Rosehip oil', nameFr: 'Huile rosehip', role: 'Fatty acids', concerns: ['texture'], frequency: 'PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'tea_tree', name: 'Tea tree', nameFr: 'Tea tree', role: 'Antifungal', concerns: ['breakouts'], frequency: 'PM 2-3x/wk', incompatibilities: ['dry_skin_pure'], beginner: true, evidence: 'strong' },
  { id: 'sea_salt', name: 'Sea salt', nameFr: 'Sel marin', role: 'Scalp scrub', concerns: ['hair'], frequency: 'Weekly PM', incompatibilities: ['irritated_scalp'], beginner: true, evidence: 'strong' },
  { id: 'acv', name: 'Apple cider vinegar', nameFr: 'Vinaigre cidre', role: 'Hair pH', concerns: ['hair'], frequency: 'Weekly PM', incompatibilities: ['fresh_color'], beginner: true, evidence: 'strong' },
  { id: 'l_theanine', name: 'L-Theanine', nameFr: 'L-Théanine', role: 'Stress (oral)', concerns: ['puffiness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'emerging' },
  { id: 'resveratrol', name: 'Resveratrol', nameFr: 'Resvératrol', role: 'Antioxidant', concerns: ['sagging'], frequency: 'PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'proxylane', name: 'Proxylane', nameFr: 'Proxylane', role: 'Firmness', concerns: ['sagging'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'strong' },
  { id: 'holy_basil', name: 'Holy basil', nameFr: 'Holy basil', role: 'Topical adaptogen', concerns: ['redness'], frequency: 'AM/PM', incompatibilities: [], beginner: true, evidence: 'emerging' },
  { id: 'spf', name: 'SPF 50', nameFr: 'SPF 50', role: 'UV protection', concerns: ['all'], frequency: 'AM daily', incompatibilities: [], beginner: true, evidence: 'strong' },
];

/** Check if two ingredient ids conflict in the same routine slot. */
export function ingredientsConflict(a: string, b: string): boolean {
  const ia = INGREDIENTS.find((x) => x.id === a);
  const ib = INGREDIENTS.find((x) => x.id === b);
  if (!ia || !ib) return false;
  return ia.incompatibilities.some((inc) => ib.id.includes(inc) || inc.includes(ib.id));
}
