import { View, Text, Pressable, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
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
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

  useEffect(() => { trackScreen('feature_hub'); }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>Glow-Up Studio</Text>
      <Text style={styles.subtitle}>Premium tools for your transformation</Text>

      <View style={styles.grid}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.id}
            style={styles.card}
            onPress={() => {
              impactMedium();
              trackEvent('studio_tool_tapped', { tool: t.id });
              t.route(typeof imageUri === 'string' ? imageUri : undefined);
            }}
          >
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
  title: { fontSize: 30, fontWeight: '900', color: C.text },
  subtitle: { fontSize: 15, color: C.textSoft, marginTop: 2, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47.5%',
    backgroundColor: C.card,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImg: { width: '100%', height: 120 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  cardSubtitle: { fontSize: 11.5, color: C.textSoft, marginTop: 2, lineHeight: 15 },
  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 22, opacity: 0.8 },
});
