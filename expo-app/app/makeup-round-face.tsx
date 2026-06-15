import { View, Text, Pressable, ScrollView, StyleSheet, Image, Linking } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Path } from 'react-native-svg';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import { recommendProducts, contextFromQuiz } from '../src/services/recoEngine';
import { getQuizProfile } from '../src/services/quizProfile';
import { ProductRecoList } from '../src/components/ProductRecoCard';
import { trackScreen } from '../src/services/analytics';
import { impactMedium } from '../src/services/haptics';

const STEPS = [
  { title: 'Cool V contour', detail: 'Apply cool tone under temples, hollow of cheeks (high ear to mid-mouth), jawline. Blend upward, never down.' },
  { title: 'Diagonal blush', detail: 'Place blush from apple of cheek toward temple. Lifts the face without widening.' },
  { title: 'Vertical highlight', detail: 'Highlighter down center: forehead, nose bridge, chin. Creates length.' },
  { title: 'Winged liner', detail: 'Small upward flick at outer corner opens the eye area.' },
  { title: 'Defined brow arch', detail: 'Clean arch with tail slightly lifted. Frames without heaviness.' },
];

const ANTI_CAKE = [
  'Hydrating primer or light moisturizer first',
  'Thin layers; build coverage in passes',
  'Setting spray or translucent veil on T-zone',
  'Cloud skin finish: cream products, minimal powder',
];

export default function MakeupRoundFaceScreen() {
  const [photo, setPhoto] = useState<string | undefined>();
  const [recos, setRecos] = useState<ReturnType<typeof recommendProducts>>([]);
  const [showGuides, setShowGuides] = useState(false);

  useEffect(() => { trackScreen('makeup_round_face'); }, []);

  useEffect(() => {
    (async () => {
      const quiz = await getQuizProfile();
      const ctx = contextFromQuiz(quiz, { persona: 'us_plus_size' });
      ctx.concerns = [...new Set([...ctx.concerns, 'double_menton_maquillage'])];
      setRecos(recommendProducts(ctx, 3));
    })();
  }, []);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.9, allowsEditing: true, aspect: [3, 4] });
    if (!r.canceled && r.assets[0]) setPhoto(r.assets[0].uri);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.eyebrow}>MAKEUP GUIDE</Text>
      <Text style={styles.title}>Makeup for round face</Text>
      <Text style={styles.sub}>Structure with soft cool contour and upward blending. Enhance your features, never hide them.</Text>

      <Pressable style={[styles.photoBox, shadow(1)]} onPress={pick}>
        {photo ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photo }} style={styles.photo} />
            {showGuides && (
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
                <Line x1="20" y1="35" x2="50" y2="70" stroke={C.pink} strokeWidth="1.5" opacity={0.8} />
                <Line x1="80" y1="35" x2="50" y2="70" stroke={C.pink} strokeWidth="1.5" opacity={0.8} />
                <Path d="M 35 55 Q 50 45 65 55" stroke={C.roseGold} strokeWidth="1.2" fill="none" />
                <Line x1="50" y1="15" x2="50" y2="85" stroke="#fff" strokeWidth="0.8" opacity={0.6} strokeDasharray="3,3" />
              </Svg>
            )}
          </View>
        ) : (
          <View style={styles.photoEmpty}>
            <Ionicons name="camera" size={32} color={C.pink} />
            <Text style={styles.photoHint}>Add a selfie to see guide overlays</Text>
          </View>
        )}
      </Pressable>

      {photo && (
        <Pressable style={styles.toggle} onPress={() => { impactMedium(); setShowGuides((v) => !v); }}>
          <Text style={styles.toggleText}>{showGuides ? 'Hide' : 'Show'} contour & blush guides</Text>
        </Pressable>
      )}

      {STEPS.map((s, i) => (
        <View key={s.title} style={[styles.stepCard, shadow(1)]}>
          <Text style={styles.stepNum}>Step {i + 1}</Text>
          <Text style={styles.stepTitle}>{s.title}</Text>
          <Text style={styles.stepDetail}>{s.detail}</Text>
        </View>
      ))}

      <Text style={styles.section}>Anti-cake tips</Text>
      {ANTI_CAKE.map((t) => <Text key={t} style={styles.bullet}>· {t}</Text>)}

      <ProductRecoList recos={recos} />

      <Pressable style={styles.cta} onPress={() => router.push({ pathname: '/processing', params: { imageUri: photo || '', styleId: 'contour_round' } })}>
        <Ionicons name="sparkles" size={18} color="#fff" />
        <Text style={styles.ctaText}>Try AI subtle contour</Text>
      </Pressable>

      <Text style={styles.disclaimer}>Styling guidance for entertainment. Results vary by lighting and technique.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 48 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 8, marginBottom: 16 },
  photoBox: { borderRadius: radii.xl, overflow: 'hidden', marginBottom: 10, backgroundColor: C.card },
  photoWrap: { width: '100%', aspectRatio: 3 / 4, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  photoEmpty: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoHint: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft },
  toggle: { alignSelf: 'center', marginBottom: 16 },
  toggleText: { fontFamily: fonts.bodyBold, fontSize: 13, color: C.pink },
  stepCard: { backgroundColor: C.card, borderRadius: radii.lg, padding: 14, marginBottom: 10 },
  stepNum: { fontFamily: fonts.bodyBold, fontSize: 11, color: C.pink },
  stepTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text, marginTop: 4 },
  stepDetail: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginTop: 4, lineHeight: 18 },
  section: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text, marginTop: 12, marginBottom: 8 },
  bullet: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginBottom: 4 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 16, marginTop: 20, ...shadow(2) },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16 },
  disclaimer: { ...typography.caption, textAlign: 'center', marginTop: 16 },
});
