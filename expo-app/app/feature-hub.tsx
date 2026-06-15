import { View, Text, Pressable, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { impactMedium } from '../src/services/haptics';

/**
 * Glow-Up Studio: the focused premium tool suite (female clinical-luxury
 * positioning). The old 19-feature grab-bag was pruned per EPIC-PLAN — every
 * tool here serves the face glow-up loop and is premium (hard paywall
 * enforced downstream at processing / feature submit).
 */
const TOOLS = [
  {
    id: 'glow_up', title: 'Glow Up Styles', subtitle: 'Clear skin, model look & more',
    img: require('../assets/components/options/symmetry_1.png'),
    route: (uri?: string) => router.push({ pathname: '/styles', params: { imageUri: uri } }),
  },
  {
    id: 'glow_max', title: 'Maxed-Out Self', subtitle: 'Your full glow-up potential',
    img: require('../assets/components/options/skin_2.png'),
    route: (uri?: string) => router.push({ pathname: '/processing', params: { imageUri: uri, styleId: 'glow_max' } }),
  },
  {
    id: 'destress', title: 'De-Bloat Scan', subtitle: 'Your cortisol face, de-puffed',
    img: require('../assets/components/skin.png'),
    route: (uri?: string) => router.push({ pathname: '/stress-scan', params: { imageUri: uri } }),
  },
  {
    id: 'color', title: 'Color Season', subtitle: 'Your most flattering palette',
    img: require('../assets/components/lips.png'),
    route: (uri?: string) => router.push({ pathname: '/color-season', params: { imageUri: uri } }),
  },
  {
    id: 'visual_weight', title: 'Visual Weight', subtitle: 'Soft or striking? Makeup to match',
    img: require('../assets/components/eyes.png'),
    route: (uri?: string) => router.push({ pathname: '/visual-weight', params: { imageUri: uri } }),
  },
  {
    id: 'chrono', title: 'Chrono-Skincare', subtitle: 'Sync your routine to your skin clock',
    img: require('../assets/components/options/skin_3.png'),
    route: (uri?: string) => router.push({ pathname: '/chrono-skincare', params: { imageUri: uri } }),
  },
  {
    id: 'makeup', title: 'Makeup', subtitle: 'Virtual makeup looks',
    img: require('../assets/components/features/makeup.png'),
    route: (uri?: string) => router.push({ pathname: '/virtual-makeup', params: { imageUri: uri } }),
  },
  {
    id: 'hair', title: 'Hair Makeover', subtitle: 'Try any hairstyle or color',
    img: require('../assets/components/features/hair.png'),
    route: (uri?: string) => router.push({ pathname: '/hair-change', params: { imageUri: uri } }),
  },
  {
    id: 'relight', title: 'Relight', subtitle: 'Flattering studio lighting',
    img: require('../assets/components/features/relight.png'),
    route: (uri?: string) => router.push({ pathname: '/relight', params: { imageUri: uri } }),
  },
  {
    id: 'headshot', title: 'AI Headshot', subtitle: 'Polished professional photos',
    img: require('../assets/components/features/headshot.png'),
    route: (uri?: string) => router.push({ pathname: '/headshot', params: { imageUri: uri } }),
  },
  {
    id: 'age', title: 'Age Rewind', subtitle: 'See yourself younger',
    img: require('../assets/components/eyes.png'),
    route: (uri?: string) => router.push({ pathname: '/age-transform', params: { imageUri: uri } }),
  },
  {
    id: 'fit', title: 'Fit Version', subtitle: 'Visualize your fit self',
    img: require('../assets/components/jawline.png'),
    route: (uri?: string) => router.push({ pathname: '/fitness-transform', params: { imageUri: uri } }),
  },
] as const;

export default function FeatureHubScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [photo, setPhoto] = useState<string | undefined>(typeof params.imageUri === 'string' ? params.imageUri : undefined);

  useEffect(() => { trackScreen('feature_hub'); }, []);

  // Single-capture: one selfie powers every tool. Pick once, reuse everywhere.
  async function pickPhoto(): Promise<string | undefined> {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.9, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) { setPhoto(r.assets[0].uri); return r.assets[0].uri; }
    return undefined;
  }

  async function openTool(t: typeof TOOLS[number]) {
    impactMedium();
    trackEvent('studio_tool_tapped', { tool: t.id });
    const uri = photo || (await pickPhoto());
    if (!uri) return; // user cancelled the picker
    t.route(uri);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>Glow-Up Studio</Text>
      <Text style={styles.subtitle}>Premium tools for your transformation</Text>

      {/* Single photo for the whole studio */}
      <Pressable style={styles.photoBar} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoThumb} />
        ) : (
          <View style={[styles.photoThumb, styles.photoThumbEmpty]}><Ionicons name="camera" size={20} color={C.pink} /></View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.photoTitle}>{photo ? 'Your photo' : 'Add your photo'}</Text>
          <Text style={styles.photoSub}>{photo ? 'Used for every tool. Tap to change.' : 'Pick one selfie to use across all tools.'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
      </Pressable>

      <View style={styles.grid}>
        {TOOLS.map((t) => (
          <Pressable key={t.id} style={styles.card} onPress={() => openTool(t)}>
            <Image source={t.img} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <Text style={styles.cardSubtitle}>{t.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.disclaimer}>AI-generated artistic visualization for entertainment only.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingHorizontal: 18, paddingBottom: 50 },
  back: { alignSelf: 'flex-start', marginBottom: 6 },
  title: { ...typography.h2 },
  subtitle: { ...typography.body2, color: C.textSoft, marginTop: 2, marginBottom: 14 },
  photoBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 16, padding: 12, marginBottom: 16, ...shadow(1) },
  photoThumb: { width: 44, height: 44, borderRadius: 22 },
  photoThumbEmpty: { backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontSize: 14.5, fontWeight: '800', color: C.text },
  photoSub: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47.5%',
    backgroundColor: C.card,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadow(1),
  },
  cardImg: { width: '100%', height: 120 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  cardSubtitle: { fontSize: 11.5, color: C.textSoft, marginTop: 2, lineHeight: 15 },
  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 22, opacity: 0.8 },
});
