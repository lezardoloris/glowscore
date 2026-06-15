import { Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

/**
 * The single GlowScore brand mark used app-wide (rose-gold wordmark, transparent).
 * Centered by default. Replaces the old mixed "GlowUp" text + variants.
 */
const LOGO = require('../../assets/logo/logo_wordmark_t.png');
const RATIO = 216 / 778; // native wordmark aspect ratio

export default function BrandLogo({ width = 150, style }: { width?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={LOGO} style={[styles.logo, { width, height: Math.round(width * RATIO) }, style]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  logo: { alignSelf: 'center' },
});
