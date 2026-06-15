/**
 * In-app copy from market research verbatims (EN source + FR for UI).
 */

export interface RoutineCopyLine {
  id: string;
  titleEn: string;
  titleFr: string;
  microTipEn?: string;
  microTipFr?: string;
  theme: string;
}

export const ROUTINE_TITLES: RoutineCopyLine[] = [
  { id: 'debloat_7d', titleEn: '7-Day De-Bloat Face Reset', titleFr: 'Détox anti-cortisol : 7 jours pour dégonfler au réveil', theme: 'debloat', microTipEn: 'Puffy face? Less salt + Gua Sha on waking.', microTipFr: 'Visage gonflé ? Moins de sel + Gua Sha au réveil.' },
  { id: 'glass_minimal', titleEn: 'Minimal Glass Skin Routine', titleFr: 'Routine Glass Skin minimaliste', theme: 'skin', microTipEn: 'Dull skin? Try snail mucin or PDRN for bounce.', microTipFr: 'Teint terne ? Snail mucin ou PDRN pour le rebond.' },
  { id: 'retinol_intro', titleEn: 'Gentle Retinoid Intro', titleFr: 'Transition rétinoïde pas à pas', theme: 'antiage', microTipEn: 'Retinol stings? Sandwich with moisturizer before and after.', microTipFr: 'Rétinol irritant ? Crème avant ET après.' },
  { id: 'color_12', titleEn: 'Discover Your 12-Season Palette', titleFr: 'Analyse 12 saisons : ta palette colorimétrique', theme: 'color' },
  { id: 'hair_volume', titleEn: 'Fine Hair Root Volume', titleFr: 'Volume racine cheveux fins', theme: 'hair', microTipEn: 'Flat hair? Sea salt scalp scrub once a week.', microTipFr: 'Cheveux plats ? Gommage sel marin 1x/semaine.' },
  { id: 'no_makeup', titleEn: 'No-Makeup Makeup Glow', titleFr: 'No-Makeup Makeup : teint lumineux', theme: 'makeup' },
  { id: 'eyes_correct', titleEn: 'Hollow Under-Eye Correction', titleFr: 'Correcteur anti-cernes creux', theme: 'eyes', microTipEn: 'Purple circles? Peach corrector before concealer.', microTipFr: 'Cernes violets ? Correcteur pêche avant anti-cernes.' },
  { id: 'barrier_sos', titleEn: 'S.O.S. Barrier Repair', titleFr: 'Protocole S.O.S. barrière cutanée', theme: 'barrier', microTipEn: 'Peeling? Ceramides, skip grain scrubs.', microTipFr: 'Desquamation ? Céramides, pas de gommage grains.' },
  { id: 'latte_makeup', titleEn: 'Latte Makeup Warm Glow', titleFr: 'Éclat Latte Makeup', theme: 'makeup' },
  { id: 'body_glow', titleEn: 'Body Glow Care', titleFr: 'Glow corps : plis et confort', theme: 'body', microTipEn: 'Chafing? Barrier balm before you dress.', microTipFr: 'Frottements ? Baume barrière avant de t\'habiller.' },
];

export const OBJECTION_HANDLERS: { id: string; fearEn: string; responseEn: string; fearFr: string; responseFr: string }[] = [
  {
    id: 'burnout_10_steps',
    fearEn: 'I am so tired of 10-step routines',
    responseEn: 'Your plan caps at 5 steps. Skinimalism that actually sticks.',
    fearFr: 'Assez des routines à 10 étapes',
    responseFr: 'Ton plan est plafonné à 5 étapes. Du skinimalism qui tient.',
  },
  {
    id: 'tret_peel',
    fearEn: 'Tretinoin shreds my face',
    responseEn: 'We start with retinal and the sandwich method, not prescription strength.',
    fearFr: 'La trétinoïne me fait peler',
    responseFr: 'On commence par le rétinal et la méthode sandwich, pas la prescription.',
  },
  {
    id: 'color_analysis_cost',
    fearEn: 'I paid $300 for color analysis',
    responseEn: 'Get your 12-season palette from your selfie, included in Premium.',
    fearFr: 'J\'ai payé une analyse couleur chère',
    responseFr: 'Ta palette 12 saisons depuis ton selfie, incluse dans Premium.',
  },
  {
    id: 'product_scam',
    fearEn: 'Are expensive LED masks a scam?',
    responseEn: 'We recommend drugstore wins first. Devices are optional, never required.',
    fearFr: 'Les masques LED chers sont-ils une arnaque ?',
    responseFr: 'On recommande d\'abord l\'accessible. Les devices restent optionnels.',
  },
  {
    id: 'body_shame',
    fearEn: 'No one talks about under-boob rash',
    responseEn: 'Body fold care is in your plan. Glow at any size.',
    fearFr: 'Personne ne parle des irritations sous la poitrine',
    responseFr: 'Les soins zones plis sont dans ton plan. Glow à toute taille.',
  },
];

export const PAYWALL_BENEFITS = [
  'Detailed Facial Harmony score & insights',
  'Unlimited personalized glow-up plan',
  'All AI Studio tools (makeup, hair, relight)',
  'Advanced progress tracking & streaks',
  'Weekly plan updates from your scans',
  'Color season analysis & product picks',
];

export const PAYWALL_BENEFITS_FR = [
  'Score Facial Harmony détaillé et insights',
  'Plan glow-up personnalisé illimité',
  'Tous les outils IA Studio',
  'Suivi de progression et séries',
  'Mises à jour hebdo selon tes scans',
  'Analyse colorimétrique et produits',
];

export function getRoutineTitle(id: string, locale: 'en' | 'fr' = 'en'): string {
  const line = ROUTINE_TITLES.find((r) => r.id === id);
  if (!line) return locale === 'fr' ? 'Ton plan Glow-Up' : 'Your Glow-Up Plan';
  return locale === 'fr' ? line.titleFr : line.titleEn;
}
