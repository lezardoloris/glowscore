import { Platform, ViewStyle } from 'react-native';

/** Cross-platform elevation helpers (Clinical Luxe). */
export const shadows = {
  elevation1: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2D2330',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: { boxShadow: '0 2px 8px rgba(45,35,48,0.06)' } as ViewStyle,
  }),
  elevation2: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2D2330',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
    default: { boxShadow: '0 8px 24px rgba(45,35,48,0.08)' } as ViewStyle,
  }),
  elevation3: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2D2330',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.1,
      shadowRadius: 40,
    },
    android: { elevation: 12 },
    default: { boxShadow: '0 16px 40px rgba(45,35,48,0.10)' } as ViewStyle,
  }),
  glass: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
    },
    android: { elevation: 4 },
    default: { boxShadow: '0 8px 30px rgba(255,255,255,0.4)' } as ViewStyle,
  }),
} as const;
