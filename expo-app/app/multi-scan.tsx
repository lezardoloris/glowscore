import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow, ctaShadow } from '../src/shadows';
import ScreenHeader from '../src/components/ScreenHeader';
import { impactMedium } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

/**
 * Guided multi-angle capture (review 2026-06): front + 3/4 left + 3/4 right stills.
 * Cross-platform (camera on native, picker fallback on web), no heavy live 3D mesh.
 * More angles raise scan reliability; degrades gracefully to a single front photo.
 */
const ANGLES = [
  { id: 'front', label: 'Look straight ahead', hint: 'Face centered, neutral expression, soft front light' },
  { id: 'left', label: 'Turn slightly to your left', hint: 'A gentle three-quarter angle, eyes to the camera' },
  { id: 'right', label: 'Turn slightly to your right', hint: 'A gentle three-quarter angle, eyes to the camera' },
] as const;

export default function MultiScanScreen() {
  const [shots, setShots] = useState<(string | undefined)[]>([undefined, undefined, undefined]);
  const [step, setStep] = useState(0);

  useEffect(() => { trackScreen('multi_scan'); }, []);

  async function capture(index: number) {
    impactMedium();
    let r: ImagePicker.ImagePickerResult;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.granted) {
      r = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [1, 1], cameraType: ImagePicker.CameraType.front });
    } else {
      r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    }
    if (r.canceled || !r.assets?.[0]) return;
    const next = [...shots];
    next[index] = r.assets[0].uri;
    setShots(next);
    trackEvent('multi_scan_shot', { angle: ANGLES[index].id });
    if (index < ANGLES.length - 1 && index === step) setStep(index + 1);
  }

  const front = shots[0];
  const extras = shots.slice(1).filter(Boolean) as string[];
  const capturedCount = shots.filter(Boolean).length;

  function analyze() {
    if (!front) return;
    impactMedium();
    router.push({ pathname: '/scan-result', params: { imageUri: front, extraUris: JSON.stringify(extras) } });
  }

  async function quickSingle() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets?.[0]) {
      router.push({ pathname: '/scan-result', params: { imageUri: r.assets[0].uri } });
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Face scan" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Capture 3 angles</Text>
        <Text style={styles.sub}>More angles give a more accurate read. You can also use one photo.</Text>

        {/* Progress dots */}
        <View style={styles.dots}>
          {ANGLES.map((a, i) => (
            <View key={a.id} style={[styles.dot, shots[i] ? styles.dotDone : i === step ? styles.dotActive : null]} />
          ))}
        </View>

        {ANGLES.map((a, i) => {
          const done = !!shots[i];
          const active = i === step;
          return (
            <Pressable key={a.id} style={[styles.card, active && styles.cardActive, shadow(1)]} onPress={() => capture(i)}>
              {done ? (
                <Image source={{ uri: shots[i] }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Ionicons name={active ? 'camera' : 'ellipse-outline'} size={22} color={C.pink} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{a.label}</Text>
                <Text style={styles.cardHint}>{a.hint}</Text>
              </View>
              {done
                ? <Ionicons name="checkmark-circle" size={22} color={C.good} />
                : <Ionicons name="chevron-forward" size={18} color={C.textSoft} />}
            </Pressable>
          );
        })}

        {capturedCount >= 3 && (
          <View style={styles.confidence}>
            <Ionicons name="shield-checkmark" size={15} color={C.good} />
            <Text style={styles.confidenceText}>3 angles captured: high-confidence read</Text>
          </View>
        )}

        <Pressable onPress={analyze} disabled={!front} style={{ opacity: front ? 1 : 0.5 }}>
          <View style={[styles.cta, ctaShadow()]}>
            <Ionicons name="scan" size={20} color="#fff" />
            <Text style={styles.ctaText}>{front ? 'Analyze my face' : 'Capture the front angle first'}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.secondary} onPress={quickSingle}>
          <Text style={styles.secondaryText}>Use a single photo instead</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 6, marginBottom: 16 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 18 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.track },
  dotActive: { backgroundColor: C.pink, transform: [{ scale: 1.2 }] },
  dotDone: { backgroundColor: C.good },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: radii.lg, padding: 12, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  cardActive: { borderColor: C.pink },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  thumbEmpty: { backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text },
  cardHint: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft, marginTop: 2, lineHeight: 16 },
  confidence: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginVertical: 12 },
  confidenceText: { fontFamily: fonts.bodySemi, fontSize: 13, color: C.good },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 17, marginTop: 14 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16.5 },
  secondary: { alignItems: 'center', paddingVertical: 14 },
  secondaryText: { color: C.pink, fontSize: 15, fontWeight: '700' },
});
