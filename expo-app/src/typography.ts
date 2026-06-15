import { TextStyle } from 'react-native';
import { theme } from './theme';

/** Clinical Luxe typography tokens (Fraunces display + Inter UI). */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  h1: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: theme.text,
  } satisfies TextStyle,
  h2: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: theme.text,
  } satisfies TextStyle,
  h3: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: theme.text,
  } satisfies TextStyle,
  body1: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: theme.text,
  } satisfies TextStyle,
  body2: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.text,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: theme.textSoft,
  } satisfies TextStyle,
  cta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  } satisfies TextStyle,
} as const;
