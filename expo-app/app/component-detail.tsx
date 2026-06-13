import { View, Text, Pressable, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen } from '../src/services/analytics';

/**
 * Component glow-up gallery (EPIC 7.1): for each of the 6 diagnostic
 * components, show 3 generated projections so she can see what's possible,
 * plus the non-invasive route to get there. Premium-only surface (reached
 * from the unlocked reveal).
 */
const GALLERY: Record<string, {
  title: string; subtitle: string; tip: string;
  options: { img: any; label: string }[];
}> = {
  skin: {
    title: 'Skin Clarity',
    subtitle: 'Three finishes your skin can reach',
    tip: 'Gentle exfoliation 2x/week, niacinamide + SPF every morning, and a hydrating serum at night build this glow in 2-4 weeks.',
    options: [
      { img: require('../assets/components/options/skin_1.png'), label: 'Soft Glow' },
      { img: require('../assets/components/options/skin_2.png'), label: 'Glass Skin' },
      { img: require('../assets/components/options/skin_3.png'), label: 'Radiant Dewy' },
    ],
  },
  symmetry: {
    title: 'Facial Symmetry',
    subtitle: 'Balanced looks built with contouring',
    tip: 'Light corrective contouring, brow shaping and a face-framing parting visually rebalance your features.',
    options: [
      { img: require('../assets/components/options/symmetry_1.png'), label: 'Soft Balance' },
      { img: require('../assets/components/options/symmetry_2.png'), label: 'Defined Harmony' },
      { img: require('../assets/components/options/symmetry_3.png'), label: 'Editorial' },
    ],
  },
  nose_lip_ratio: {
    title: 'Nose & Profile',
    subtitle: 'Profile harmonies, no surgery needed',
    tip: 'Nose contouring with a precise highlight line plus your most flattering 3/4 angle transform your profile photos.',
    options: [
      { img: require('../assets/components/options/nose_1.png'), label: 'Soft Profile' },
      { img: require('../assets/components/options/nose_2.png'), label: 'Refined Line' },
      { img: require('../assets/components/options/nose_3.png'), label: 'Sculpted' },
    ],
  },
  eyes: {
    title: 'Eye Area',
    subtitle: 'Brighter, more open looks',
    tip: 'Caffeine eye serum, brow lift shaping and an eye-opening mascara technique brighten the whole area.',
    options: [
      { img: require('../assets/components/options/eyes_1.png'), label: 'Bright & Awake' },
      { img: require('../assets/components/options/eyes_2.png'), label: 'Lifted' },
      { img: require('../assets/components/options/eyes_3.png'), label: 'Doe Eyes' },
    ],
  },
  jawline: {
    title: 'Jawline Definition',
    subtitle: 'Sculpted lower-face looks',
    tip: 'Daily gua sha drainage, posture work and a soft jaw contour bring out definition within weeks.',
    options: [
      { img: require('../assets/components/options/jawline_1.png'), label: 'Soft Sculpt' },
      { img: require('../assets/components/options/jawline_2.png'), label: 'Snatched' },
      { img: require('../assets/components/options/jawline_3.png'), label: 'Defined' },
    ],
  },
  lip_harmony: {
    title: 'Lips & Smile',
    subtitle: 'Balanced, fuller-looking lips',
    tip: 'Lip care + subtle overlining and the right tone create fullness without filler.',
    options: [
      { img: require('../assets/components/options/lips_1.png'), label: 'Natural Gloss' },
      { img: require('../assets/components/options/lips_2.png'), label: 'Full & Soft' },
      { img: require('../assets/components/options/lips_3.png'), label: 'Statement' },
    ],
  },
};

export default function ComponentDetailScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const data = GALLERY[typeof key === 'string' ? key : 'skin'] || GALLERY.skin;

  useEffect(() => { trackScreen('component_detail'); }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.subtitle}>{data.subtitle}</Text>

      {data.options.map((o, i) => (
        <View key={i} style={styles.card}>
          <Image source={o.img} style={styles.img} />
          <View style={styles.labelChip}><Text style={styles.labelText}>{o.label}</Text></View>
        </View>
      ))}

      <View style={styles.tipCard}>
        <Ionicons name="sparkles" size={18} color={C.pink} />
        <Text style={styles.tipText}>{data.tip}</Text>
      </View>

      <Text style={styles.disclaimer}>AI-generated artistic visualization for entertainment only.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingHorizontal: 18, paddingBottom: 50 },
  back: { alignSelf: 'flex-start', marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '900', color: C.text },
  subtitle: { fontSize: 15, color: C.textSoft, marginTop: 2, marginBottom: 16 },
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 14, backgroundColor: C.card },
  img: { width: '100%', height: 260 },
  labelChip: {
    position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6,
  },
  labelText: { fontSize: 13, fontWeight: '800', color: C.text },
  tipCard: {
    flexDirection: 'row', gap: 10, backgroundColor: C.card, borderRadius: 16,
    padding: 16, alignItems: 'flex-start', marginTop: 4,
  },
  tipText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 20, fontWeight: '500' },
  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 18, opacity: 0.8 },
});
