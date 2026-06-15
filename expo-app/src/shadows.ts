import { Platform, ViewStyle } from 'react-native';

type Elevation = 1 | 2 | 3 | 'glass';

const ELEVATION: Record<Exclude<Elevation, 'glass'>, ViewStyle> = {
  1: Platform.OS === 'web'
    ? ({ boxShadow: '0 2px 8px rgba(45,35,48,0.06)' } as ViewStyle)
    : { shadowColor: '#2D2330', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  2: Platform.OS === 'web'
    ? ({ boxShadow: '0 8px 24px rgba(45,35,48,0.08)' } as ViewStyle)
    : { shadowColor: '#2D2330', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  3: Platform.OS === 'web'
    ? ({ boxShadow: '0 16px 40px rgba(45,35,48,0.10)' } as ViewStyle)
    : { shadowColor: '#2D2330', shadowOpacity: 0.10, shadowRadius: 40, shadowOffset: { width: 0, height: 16 }, elevation: 6 },
};

/** Cross-platform elevation helpers (Clinical Luxe design system). */
export function shadow(level: Elevation): ViewStyle {
  if (level === 'glass') {
    return Platform.OS === 'web'
      ? ({ boxShadow: '0 8px 30px rgba(255,255,255,0.4)' } as ViewStyle)
      : { shadowColor: '#FFFFFF', shadowOpacity: 0.4, shadowRadius: 30, shadowOffset: { width: 0, height: 8 }, elevation: 2 };
  }
  return ELEVATION[level];
}

/** Pink CTA glow used on primary buttons. */
export function ctaShadow(): ViewStyle {
  return Platform.OS === 'web'
    ? ({ boxShadow: '0 6px 18px rgba(224,83,122,0.4)' } as ViewStyle)
    : { shadowColor: '#E0537A', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 5 };
}
