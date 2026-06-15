import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme as C } from '../theme';

/**
 * The single GlowUp brand mark used app-wide: a soft-pink pill badge with a kiss
 * mark + "GlowUp" wordmark. Centered by default. (Preferred over the wordmark image.)
 */
export default function BrandLogo({ width = 150, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  const fs = Math.max(15, Math.round(width * 0.125)); // scale text from the legacy width prop
  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.lips, { fontSize: fs + 3 }]}>💋</Text>
      <Text style={[styles.name, { fontSize: fs }]}>GlowUp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: C.pinkSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  lips: { },
  name: { color: C.pink, fontWeight: '900', letterSpacing: 0.2 },
});
