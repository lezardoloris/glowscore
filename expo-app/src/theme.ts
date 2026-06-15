/**
 * Shared Aura clinical-luxury palette. Import `theme` instead of redeclaring
 * the `C` block per screen (prevents the pink/dark drift the review flagged).
 */
export const theme = {
  bg: '#F9E0E8',
  panel: '#FBEAF0',
  card: '#FFFFFF',
  border: '#F2C4D2',
  pink: '#E0537A',
  pinkSoft: '#F8D4DF',
  text: '#2D2330',
  textSoft: '#8A7B85',
  track: '#F4E6EB',
  trackLocked: '#D9CCD2',
  good: '#2E9E5B',
  // Clinical-luxe design system (ChatGPT direction, 2026-06)
  blush: '#FDEAF1',
  cream: '#FFF7F9',
  roseGold: '#FFC1CC',
  pinkGrad: ['#E0537A', '#EC7FA0'] as const, // primary CTA gradient
};

/** Radii scale (8/12/16/24/32/full). */
export const radii = { sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 999 };
