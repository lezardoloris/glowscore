import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow, ctaShadow } from '../src/shadows';
import { impactMedium } from '../src/services/haptics';
import { saveQuizProfile } from '../src/services/quizProfile';
import { savePlanForProfile, PlanScoreInput } from '../src/services/glowPlan';
import { getLastScan } from '../src/services/history';
import { requestPermission, scheduleActivationSequence, scheduleRoutineMicroPushes } from '../src/services/notifications';
import { trackScreen, trackOnboardingCompleted } from '../src/services/analytics';
import InfoSheet, { InfoButton, InfoContent } from '../src/components/InfoSheet';

/**
 * Scan-first funnel (review 2026-06): the quiz now runs AFTER the scan reveal, so a
 * woman sees her score first, then personalizes her plan. Saves the profile, rebuilds
 * the persona + score aware plan, and finishes onboarding.
 */
const GLOW_TYPES = [
  { id: 'skincare', title: 'Skincare & glow', subtitle: 'Clearer, healthier-looking skin' },
  { id: 'makeup', title: 'Makeup & style', subtitle: 'Contour, color and looks' },
  { id: 'full', title: 'Full glow-up', subtitle: 'Skin, features, hair and more' },
] as const;

const GOALS = [
  { id: 'clear_skin', title: 'Clearer, smoother skin', subtitle: 'Even tone, refined texture' },
  { id: 'harmony', title: 'Facial harmony', subtitle: 'Balance and symmetry' },
  { id: 'eyes', title: 'Brighter eye area', subtitle: 'Dark circles, eye bags' },
  { id: 'body_glow', title: 'Body glow & comfort', subtitle: 'Comfort and care at any size' },
  { id: 'jawline', title: 'Defined jawline', subtitle: 'Sculpt and de-bloat' },
  { id: 'lips', title: 'Fuller lips', subtitle: 'Shape and definition' },
  { id: 'hair', title: 'Better hair', subtitle: 'Shine, volume, framing' },
  { id: 'color', title: 'Your best colors', subtitle: 'Seasonal palette & shades' },
];

const GOAL_INFO: Record<string, InfoContent> = {
  clear_skin: { title: 'Clearer, smoother skin', body: 'Even tone and refined texture make your whole face look brighter and healthier. Gentle actives plus barrier care. Most people see a difference in 8-12 weeks.' },
  harmony: { title: 'Facial harmony', body: 'How balanced your features look together. Small habits like de-puffing, posture and good angles enhance it. About your own balance, not a standard.' },
  eyes: { title: 'Brighter eye area', body: 'Soften the look of dark circles and puffiness with cooling, caffeine eye care and sleep. A rested eye area lifts the whole face.' },
  body_glow: { title: 'Body glow & comfort', body: 'Care for the skin your face does not get all the attention: comfort for folds and friction zones, even tone, soft hydrated skin. Glow at any size, never about weight.' },
  jawline: { title: 'Defined jawline', body: 'De-bloating and posture make the jaw and neck look more sculpted. Gua sha, less salt and your sleep position help in days, no surgery.' },
  lips: { title: 'Fuller lips', body: 'Smooth, hydrated, well-shaped lips look fuller naturally. Lip care plus a subtle liner technique, no fillers needed.' },
  hair: { title: 'Better hair', body: 'Shine, volume and face-framing cuts change how your whole face reads. Scalp care, heat protection and the right shape.' },
  color: { title: 'Your best colors', body: 'Shades that match your undertone make your skin look instantly clearer and more awake. We help you find your seasonal palette.' },
};

const SLEEP_OPTIONS = ['< 5h', '5-6h', '6-7h', '7-8h', '8h+'];
const DIET_OPTIONS = ['Could be better', 'Average', 'Pretty good', 'Very healthy'];
const WORKOUT_OPTIONS = ['0', '1', '2', '3', '4', '5', '6+'];

export default function PersonalizeScreen() {
  const [glowUpType, setGlowUpType] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [sleep, setSleep] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<string | null>(null);
  const [info, setInfo] = useState<InfoContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { trackScreen('personalize'); }, []);

  const canBuild = goals.length > 0;

  function toggleGoal(id: string) {
    impactMedium();
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  }

  async function build() {
    if (!canBuild || saving) return;
    setSaving(true);
    await saveQuizProfile({
      glowUpType: (glowUpType as any) || undefined,
      goals,
      outcomes: [],
      sleep: sleep || undefined,
      diet: diet || undefined,
      workouts: workouts || undefined,
    });
    // Rebuild the plan with the persona + the score from the scan we just did.
    const scan = await getLastScan();
    const score: PlanScoreInput | undefined = scan
      ? { overall: scan.overall, skin: scan.skin, jawline: scan.jawline, symmetry: scan.symmetry, eyes: scan.eyes, harmony: scan.harmony, nose_lip_ratio: scan.nose_lip_ratio, lip_harmony: scan.lip_harmony }
      : undefined;
    await savePlanForProfile({ glowUpType: (glowUpType as any) || undefined, goals, outcomes: [], sleep: sleep || undefined, diet: diet || undefined, workouts: workouts || undefined } as any, score);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    trackOnboardingCompleted();
    requestPermission().then((g) => { if (g) { scheduleActivationSequence().catch(() => {}); scheduleRoutineMicroPushes().catch(() => {}); } }).catch(() => {});
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ALMOST THERE</Text>
        <Text style={styles.title}>Personalize your plan</Text>
        <Text style={styles.sub}>Your scan is done. Tell us what you care about and we will tailor your daily glow-up.</Text>

        <Text style={styles.group}>What is your focus?</Text>
        {GLOW_TYPES.map((t) => (
          <Card key={t.id} title={t.title} subtitle={t.subtitle} selected={glowUpType === t.id} onPress={() => { impactMedium(); setGlowUpType(t.id); }} />
        ))}

        <Text style={styles.group}>What would you like to improve?</Text>
        {GOALS.map((g) => (
          <Card key={g.id} title={g.title} subtitle={g.subtitle} selected={goals.includes(g.id)} onPress={() => toggleGoal(g.id)} onInfo={GOAL_INFO[g.id] ? () => setInfo(GOAL_INFO[g.id]) : undefined} />
        ))}

        <Text style={styles.group}>Your daily basics</Text>
        <Text style={styles.groupSub}>Sleep</Text>
        <View style={styles.chipRow}>{SLEEP_OPTIONS.map((s) => <Chip key={s} label={s} selected={sleep === s} onPress={() => { impactMedium(); setSleep(s); }} />)}</View>
        <Text style={styles.groupSub}>How is your diet right now?</Text>
        <View style={styles.chipRow}>{DIET_OPTIONS.map((d) => <Chip key={d} label={d} selected={diet === d} onPress={() => { impactMedium(); setDiet(d); }} />)}</View>
        <Text style={styles.groupSub}>Workouts per week</Text>
        <View style={styles.chipRow}>{WORKOUT_OPTIONS.map((w) => <Chip key={w} label={w} selected={workouts === w} onPress={() => { impactMedium(); setWorkouts(w); }} />)}</View>

        <Pressable onPress={build} disabled={!canBuild || saving} style={{ opacity: canBuild && !saving ? 1 : 0.5 }}>
          <View style={[styles.cta, ctaShadow()]}>
            <Text style={styles.ctaText}>{saving ? 'Building your plan...' : 'Build my plan'}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <InfoSheet visible={!!info} content={info} onClose={() => setInfo(null)} />
    </View>
  );
}

function Card({ title, subtitle, selected, onPress, onInfo }: { title: string; subtitle: string; selected: boolean; onPress: () => void; onInfo?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardSel, shadow(1)]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      {onInfo ? <InfoButton onPress={onInfo} /> : null}
      <View style={[styles.radio, selected && styles.radioSel]}>{selected && <Ionicons name="checkmark" size={15} color="#fff" />}</View>
    </Pressable>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSel]}>
      <Text style={[styles.chipText, selected && styles.chipTextSel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingBottom: 48 },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 6, marginBottom: 8 },
  group: { fontFamily: fonts.bodyBold, fontSize: 16, color: C.text, marginTop: 22, marginBottom: 10 },
  groupSub: { fontFamily: fonts.bodySemi, fontSize: 13, color: C.textSoft, marginTop: 12, marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: radii.lg, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  cardSel: { borderColor: C.pink },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: C.text },
  cardSub: { fontFamily: fonts.body, fontSize: 12.5, color: C.textSoft, marginTop: 2 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  radioSel: { backgroundColor: C.pink, borderColor: C.pink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.full, backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent' },
  chipSel: { backgroundColor: C.pink, borderColor: C.pink },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 14, color: C.text },
  chipTextSel: { color: '#fff' },
  cta: { backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 17, alignItems: 'center', marginTop: 26 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16.5 },
});
