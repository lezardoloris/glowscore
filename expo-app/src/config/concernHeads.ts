import { ImageSourcePropType } from 'react-native';

/** Generated 3D feminine concern heads (rose-pink glow on the concern zone). */
export const CONCERN_HEADS: Record<string, ImageSourcePropType> = {
  breakouts: require('../../assets/concerns/breakouts.png'),
  dark_circles: require('../../assets/concerns/dark_circles.png'),
  puffiness: require('../../assets/concerns/puffiness.png'),
  asymmetry: require('../../assets/concerns/asymmetry.png'),
  redness: require('../../assets/concerns/redness.png'),
  fine_lines: require('../../assets/concerns/fine_lines.png'),
};

export interface Concern { id: string; title: string; subtitle: string; focus: string; }

/** Female-framed concerns (vs Mogged's male jawline/hunter-eyes). focus maps to glowPlan. */
export const CONCERNS: Concern[] = [
  { id: 'breakouts', title: 'Breakouts', subtitle: 'Acne & congestion', focus: 'skin' },
  { id: 'dark_circles', title: 'Dark circles', subtitle: 'Tired, shadowed eyes', focus: 'eyes' },
  { id: 'puffiness', title: 'Puffiness', subtitle: 'De-bloat & sculpt', focus: 'cortisol' },
  { id: 'asymmetry', title: 'Asymmetry', subtitle: 'Balance your features', focus: 'harmony' },
  { id: 'redness', title: 'Redness', subtitle: 'Uneven, reactive tone', focus: 'skin' },
  { id: 'fine_lines', title: 'Fine lines', subtitle: 'Smooth & prevent', focus: 'skin' },
];
