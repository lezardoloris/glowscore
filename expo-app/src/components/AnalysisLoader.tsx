import { View, Text, StyleSheet, Animated, Easing, Image, ActivityIndicator } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../theme';
import { typography, fonts } from '../typography';
import FaceMeshOverlay from './FaceMeshOverlay';
import BreathingBackground from './BreathingBackground';

const MOCKUP_STEPS = [
  'Symmetry',
  'Skin texture',
  'Proportions',
  'Overall harmony',
];

const RING = 220;
const PHOTO = 168;

export default function AnalysisLoader({
  photo, steps = MOCKUP_STEPS, durationMs = 7200, onComplete,
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
    const per = Math.max(700, durationMs / steps.length);
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
  const meshOpacity = scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.45, 0.95, 0.45] });
  const pct = Math.round((done / steps.length) * 100);
  const current = Math.min(done, steps.length - 1);

  return (
    <View style={styles.container}>
      <BreathingBackground />
      <View style={styles.ringWrap}>
        <AnimatedCircularProgress
          size={RING} width={8} fill={pct} tintColor={C.pink} backgroundColor={C.track}
          rotation={0} lineCap="round" duration={500}
        >
          {() => (
            <View style={styles.photoWrap}>
              {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={[styles.photo, { backgroundColor: C.pinkSoft }]} />}
              <Animated.View style={[StyleSheet.absoluteFill, { opacity: meshOpacity }]} pointerEvents="none">
                <FaceMeshOverlay size={PHOTO} />
              </Animated.View>
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}>
                <LinearGradient colors={['rgba(224,83,122,0)', 'rgba(224,83,122,0.9)', 'rgba(224,83,122,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.scanGrad} />
              </Animated.View>
            </View>
          )}
        </AnimatedCircularProgress>
        <View style={styles.pctBadge}><Text style={styles.pctText}>{pct}%</Text></View>
      </View>

      <Text style={styles.title}>Analyzing your facial harmony</Text>
      <Text style={styles.subtitle}>We analyze 120+ points on your face</Text>

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

      <Text style={styles.hint}>Stay natural, no filter.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  photoWrap: {
    width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.pinkSoft,
    borderWidth: 2, borderColor: C.pinkSoft,
  },
  photo: { width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2 },
  scanLine: { position: 'absolute', width: PHOTO, height: 4 },
  scanGrad: { width: PHOTO, height: 4 },
  pctBadge: {
    position: 'absolute', bottom: -2, backgroundColor: C.pink, paddingHorizontal: 16, paddingVertical: 5,
    borderRadius: radii.full, borderWidth: 3, borderColor: C.bg,
  },
  pctText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16 },
  title: { ...typography.h3, fontFamily: fonts.displayBold, marginBottom: 6, textAlign: 'center' },
  subtitle: { ...typography.body2, color: C.textSoft, marginBottom: 20, textAlign: 'center' },
  steps: { alignSelf: 'stretch', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bullet: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  bulletDone: { backgroundColor: C.pink },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.trackLocked },
  stepText: { fontFamily: fonts.bodySemi, fontSize: 14, color: C.textSoft, flex: 1 },
  stepTextActive: { color: C.text, fontFamily: fonts.bodyBold },
  stepTextDone: { color: C.text },
  hint: { ...typography.caption, marginTop: 22, textAlign: 'center' },
});
