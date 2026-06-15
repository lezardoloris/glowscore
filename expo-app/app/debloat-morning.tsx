import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import { impactMedium, notificationSuccess, impactLight } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

const STEPS = [
  { title: 'Cryo refresh', secs: 60, detail: 'Cold roller or ice wrapped in cloth on cheeks and jaw.' },
  { title: 'Lymphatic pump', secs: 60, detail: 'Gentle taps from inner eye to ear; pump behind ears downward.' },
  { title: 'Gua sha sweep', secs: 120, detail: 'Center of face to ears; neck to collarbones, upward strokes.' },
  { title: 'Periorbital care', secs: 60, detail: 'Light circles under eyes, never tug. Finish with SPF if heading out.' },
];

const STRUCTURAL_TIPS = [
  'Sleep with head slightly elevated to reduce morning puffiness',
  'Aim for sodium under ~2000 mg today (wellness framing, not dieting)',
  'Sip water steadily; dehydration can show in the face',
];

export default function DebloatMorningScreen() {
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(STEPS[0].secs);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const stepRef = useRef(0);

  useEffect(() => { trackScreen('debloat_morning'); }, []);

  const advanceStep = useCallback(() => {
    const next = stepRef.current + 1;
    if (next < STEPS.length) {
      stepRef.current = next;
      setStepIdx(next);
      setRemaining(STEPS[next].secs);
      impactLight();
      return;
    }
    setRunning(false);
    setDone(true);
    notificationSuccess();
    trackEvent('debloat_morning_complete');
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        advanceStep();
        return STEPS[stepRef.current]?.secs ?? 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, advanceStep]);

  const step = STEPS[stepIdx];
  const totalSecs = STEPS.reduce((a, s) => a + s.secs, 0);
  const elapsed = STEPS.slice(0, stepIdx).reduce((a, s) => a + s.secs, 0) + (STEPS[stepIdx].secs - remaining);

  function start() {
    impactMedium();
    setDone(false);
    stepRef.current = 0;
    setStepIdx(0);
    setRemaining(STEPS[0].secs);
    setRunning(true);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.eyebrow}>5-MIN MORNING</Text>
      <Text style={styles.title}>De-bloat face reset</Text>
      <Text style={styles.sub}>Guided lymphatic routine. Wellness only, no weight tracking.</Text>

      <View style={[styles.card, shadow(2)]}>
        {!done ? (
          <>
            <Text style={styles.stepLabel}>Step {stepIdx + 1} of {STEPS.length}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.timer}>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${(elapsed / totalSecs) * 100}%` }]} /></View>
            <Text style={styles.detail}>{step.detail}</Text>
            <Pressable style={styles.btn} onPress={() => { impactMedium(); running ? setRunning(false) : start(); }}>
              <Text style={styles.btnText}>{running ? 'Pause' : stepIdx === 0 && remaining === STEPS[0].secs ? 'Start 5-min routine' : 'Resume'}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={48} color={C.good} style={{ alignSelf: 'center' }} />
            <Text style={styles.doneTitle}>Routine complete</Text>
            <Text style={styles.section}>Structural tips for today</Text>
            {STRUCTURAL_TIPS.map((t) => <Text key={t} style={styles.bullet}>· {t}</Text>)}
            <Pressable style={styles.btn} onPress={start}><Text style={styles.btnText}>Run again</Text></Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingTop: 56, paddingHorizontal: 20 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 8, marginBottom: 20 },
  card: { backgroundColor: C.card, borderRadius: radii.xl, padding: 22 },
  stepLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: C.pink, textAlign: 'center' },
  stepTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: C.text, textAlign: 'center', marginTop: 8 },
  timer: { fontFamily: fonts.displayBold, fontSize: 48, color: C.text, textAlign: 'center', marginVertical: 16 },
  track: { height: 8, backgroundColor: C.track, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  fill: { height: '100%', backgroundColor: C.pink, borderRadius: 4 },
  detail: { fontFamily: fonts.body, fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  btn: { backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16 },
  doneTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: C.text, textAlign: 'center', marginVertical: 12 },
  section: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text, marginTop: 8, marginBottom: 8 },
  bullet: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginBottom: 6, lineHeight: 18 },
});
