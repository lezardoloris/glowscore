import { View, Text, StyleSheet, Animated, Easing, Image, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../theme';
import FaceMeshOverlay from './FaceMeshOverlay';

/**
 * Premium multi-step analysis loader. Runs a deliberate staged sequence (face
 * detection -> landmarks -> skin -> symmetry -> harmony -> plan) so the depth of
 * the analysis is visible and the result feels earned (perceived-value engine).
 */
const DEFAULT_STEPS = [
  'Detecting your face',
  'Mapping facial landmarks',
  'Analyzing skin clarity & texture',
  'Measuring facial symmetry',
  'Evaluating eye area & jawline',
  'Computing your Facial Harmony',
  'Building your personalized plan',
];

const RING = 188;
const PHOTO = 138;

export default function AnalysisLoader({
  photo, steps = DEFAULT_STEPS, durationMs = 8200, onComplete,
}: { photo?: string; steps?: string[]; durationMs?: number; onComplete?: () => void }) {
  const [done, setDone] = useState(0);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const completed = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    const per = Math.max(600, durationMs / steps.length);
    const id = setInterval(() => {
      setDone((d) => {
        const next = d + 1;
        if (next >= steps.length) {
          clearInterval(id);
          if (!completed.current) { completed.current = true; setTimeout(() => onComplete?.(), 600); }
          return steps.length;
        }
        return next;
      });
    }, per);
    return () => clearInterval(id);
  }, []);

  const travel = PHOTO / 2 - 8;
  const scanY = scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-travel, travel, -travel] });
  const meshOpacity = scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.75, 0.3] });
  const pct = Math.round((done / steps.length) * 100);
  const current = Math.min(done, steps.length - 1);

  return (
    <View style={styles.container}>
      <View style={styles.ringWrap}>
        <AnimatedCircularProgress
          size={RING} width={7} fill={pct} tintColor={C.pink} backgroundColor={C.track}
          rotation={0} lineCap="round" duration={500}
        >
          {() => (
            <View style={styles.photoWrap}>
              {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={[styles.photo, { backgroundColor: C.pinkSoft }]} />}
              <Animated.View style={[StyleSheet.absoluteFill, { opacity: meshOpacity }]} pointerEvents="none">
                <FaceMeshOverlay size={PHOTO} />
              </Animated.View>
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}>
                <LinearGradient colors={['rgba(224,83,122,0)', 'rgba(224,83,122,0.85)', 'rgba(224,83,122,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scanGrad} />
              </Animated.View>
            </View>
          )}
        </AnimatedCircularProgress>
        <View style={styles.pctBadge}><Text style={styles.pctText}>{pct}%</Text></View>
      </View>

      <Text style={styles.title}>Analyzing your facial harmony</Text>

      <View style={styles.steps}>
        {steps.map((label, i) => {
          const isDone = i < done;
          const isActive = i === current && !isDone && done < steps.length;
          return (
            <View key={label} style={styles.stepRow}>
              <View style={[styles.bullet, isDone && styles.bulletDone]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                ) : isActive ? (
                  <ActivityIndicator size="small" color={C.pink} />
                ) : (
                  <View style={styles.dot} />
                )}
              </View>
              <Text style={[styles.stepText, isDone && styles.stepTextDone, isActive && styles.stepTextActive]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  photoWrap: { width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: C.pinkSoft },
  photo: { width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2 },
  scanLine: { position: 'absolute', width: PHOTO, height: 3 },
  scanGrad: { width: PHOTO, height: 3 },
  pctBadge: { position: 'absolute', bottom: -2, backgroundColor: C.pink, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20, borderWidth: 3, borderColor: C.bg },
  pctText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  title: { fontSize: 19, fontWeight: '900', color: C.text, marginBottom: 22, textAlign: 'center' },
  steps: { alignSelf: 'stretch', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bullet: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  bulletDone: { backgroundColor: C.pink },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.trackLocked },
  stepText: { fontSize: 14, color: C.textSoft, fontWeight: '600', flex: 1 },
  stepTextActive: { color: C.text, fontWeight: '800' },
  stepTextDone: { color: C.text },
});
