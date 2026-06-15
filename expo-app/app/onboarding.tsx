import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import BrandLogo from '../src/components/BrandLogo';
import { Ionicons } from '@expo/vector-icons';
import {
  trackEvent,
  trackOnboardingStarted,
  trackOnboardingCompleted,
} from '../src/services/analytics';
import { saveQuizProfile } from '../src/services/quizProfile';
import { setAiConsent } from '../src/services/aiConsent';
import { impactMedium } from '../src/services/haptics';
import { scheduleActivationSequence, scheduleRoutineMicroPushes } from '../src/services/notifications';

// ---------------------------------------------------------------------------
// Aura palette (light pink clinical-feminine theme)
// ---------------------------------------------------------------------------

const C = {
  bg: '#F9E0E8',
  card: '#FFFFFF',
  cardSoft: '#FFF6F9',
  border: '#F2C4D2',
  pink: '#E0537A',
  pinkSoft: '#F8D4DF',
  text: '#2D2330',
  textSoft: '#8A7B85',
  track: '#FFFFFF',
};

// ---------------------------------------------------------------------------
// Quiz data (Aura structure: pick type → goals → outcomes → daily basics)
// ---------------------------------------------------------------------------

const GLOW_TYPES = [
  { id: 'surgical', title: 'Surgical', subtitle: 'Rhinoplasty, facelift & more' },
  { id: 'non_surgical', title: 'Non-Surgical', subtitle: 'Botox, fillers & lasers' },
  { id: 'makeup', title: 'Makeup', subtitle: 'Professional style guide' },
] as const;

const GOALS = [
  { id: 'clear_skin', title: 'Clearer, smoother skin', subtitle: 'Even tone, refined texture' },
  { id: 'harmony', title: 'Facial harmony', subtitle: 'Balance and symmetry' },
  { id: 'eyes', title: 'Brighter eye area', subtitle: 'Dark circles, eye bags' },
  { id: 'jawline', title: 'Defined jawline', subtitle: 'Sculpt and de-bloat' },
  { id: 'lips', title: 'Fuller lips', subtitle: 'Shape and definition' },
  { id: 'hair', title: 'Better hair', subtitle: 'Shine, volume, framing' },
  { id: 'color', title: 'Your best colors', subtitle: 'Seasonal palette & shades' },
  { id: 'body_glow', title: 'Body glow & comfort', subtitle: 'Chafing, folds, glow at any size' },
];

const OUTCOMES = [
  { id: 'photos', title: 'Look great in every photo', subtitle: 'No more avoiding the camera' },
  { id: 'noticed', title: 'Get noticed', subtitle: 'Approached more, ignored less' },
  { id: 'mirror', title: 'Feel proud in the mirror', subtitle: 'See the version of yourself you want to be' },
  { id: 'confidence', title: 'Real, lasting confidence', subtitle: 'Earned through visible change' },
  { id: 'event', title: 'Glow for a big moment', subtitle: 'Wedding, reunion, fresh start' },
  { id: 'work', title: 'Win at work', subtitle: 'Polished, professional presence' },
];

const SLEEP_OPTIONS = ['< 5h', '5-6h', '6-7h', '7-8h', '8h+'];
const DIET_OPTIONS = ['Terrible', 'Not great', 'Average', 'Pretty good', 'Very healthy'];
const WORKOUT_OPTIONS = ['0', '1', '2', '3', '4', '5', '6+'];

const TOTAL_STEPS = 7;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function SelectCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => { impactMedium(); onPress(); }}
      style={[styles.selectCard, selected && styles.selectCardSelected]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.selectCardTitle}>{title}</Text>
        <Text style={styles.selectCardSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => { impactMedium(); onPress(); }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main onboarding quiz
// ---------------------------------------------------------------------------

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [glowUpType, setGlowUpType] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [sleep, setSleep] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<string | null>(null);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => {
    trackOnboardingStarted();
  }, []);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function next() {
    trackEvent('onboarding_step_completed', { step });
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function agreeAndContinue() {
    if (!ageConfirmed) return;
    await setAiConsent(true);
    try { await AsyncStorage.setItem('age_confirmed', 'true'); } catch {}
    trackEvent('ai_consent_granted', { source: 'onboarding' });
    next();
  }

  async function completeOnboarding() {
    await saveQuizProfile({
      glowUpType: (glowUpType as any) || undefined,
      goals,
      outcomes,
      sleep: sleep || undefined,
      diet: diet || undefined,
      workouts: workouts || undefined,
    });
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    trackOnboardingCompleted();
    scheduleActivationSequence().catch(() => {});
    scheduleRoutineMicroPushes().catch(() => {});
    router.replace('/(tabs)');
  }

  async function requestCamera() {
    setRequestingCamera(true);
    trackEvent('camera_permission_requested');
    try {
      const { Camera } = await import('expo-camera');
      const result = await Camera.requestCameraPermissionsAsync();
      trackEvent('camera_permission_result', { granted: result.granted });
    } catch {
      trackEvent('camera_permission_error');
    }
    setRequestingCamera(false);
    await completeOnboarding();
  }

  const canContinue =
    step === 0 ||
    (step === 1 && glowUpType !== null) ||
    (step === 2 && goals.length > 0) ||
    (step === 3 && outcomes.length > 0) ||
    (step === 4 && sleep !== null && diet !== null && workouts !== null) ||
    step === 5;

  return (
    <View style={styles.container}>
      {/* Top bar: back chevron + progress */}
      <View style={styles.topBar}>
        {step > 0 ? (
          <Pressable onPress={back} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={C.text} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 0 — Hook */}
        {step === 0 && (
          <View style={styles.hookWrap}>
            <BrandLogo width={132} style={{ marginBottom: 22 }} />
            <Text style={styles.hookTitle}>
              Ready For{'\n'}
              <Text style={{ color: C.pink }}>Glow Up?</Text>
            </Text>
            <Text style={styles.hookSubtitle}>
              Discover your facial harmony and unlock your personalized glow-up plan.
            </Text>
            <View style={styles.hookCard}>
              <Text style={styles.hookCardEmoji}>✨</Text>
              <Text style={styles.hookCardText}>
                Facial Harmony score{'\n'}6 detailed components{'\n'}Your personal treatment plan
              </Text>
            </View>
          </View>
        )}

        {/* STEP 1 — Pick Your Glow Up */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>
              Pick Your{'\n'}
              <Text style={{ color: C.pink }}>Glow Up</Text>
            </Text>
            {GLOW_TYPES.map((t) => (
              <SelectCard
                key={t.id}
                title={t.title}
                subtitle={t.subtitle}
                selected={glowUpType === t.id}
                onPress={() => setGlowUpType(t.id)}
              />
            ))}
          </View>
        )}

        {/* STEP 2 — Goals */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>What would you like to improve?</Text>
            <Text style={styles.stepSubtitle}>Pick everything that applies. Your plan adapts to what you select.</Text>
            {GOALS.map((g) => (
              <SelectCard
                key={g.id}
                title={g.title}
                subtitle={g.subtitle}
                selected={goals.includes(g.id)}
                onPress={() => toggle(goals, setGoals, g.id)}
              />
            ))}
          </View>
        )}

        {/* STEP 3 — Outcomes (desire) */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>What would that change for you?</Text>
            <Text style={styles.stepSubtitle}>Select all that resonate.</Text>
            {OUTCOMES.map((o) => (
              <SelectCard
                key={o.id}
                title={o.title}
                subtitle={o.subtitle}
                selected={outcomes.includes(o.id)}
                onPress={() => toggle(outcomes, setOutcomes, o.id)}
              />
            ))}
          </View>
        )}

        {/* STEP 4 — Daily basics */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Your daily basics</Text>
            <Text style={styles.stepSubtitle}>Three quick taps, these directly shape your glow.</Text>

            <Text style={styles.groupLabel}>Average hours of sleep per night</Text>
            <View style={styles.chipRow}>
              {SLEEP_OPTIONS.map((s) => (
                <Chip key={s} label={s} selected={sleep === s} onPress={() => setSleep(s)} />
              ))}
            </View>

            <Text style={styles.groupLabel}>How is your diet right now?</Text>
            <View style={styles.chipRow}>
              {DIET_OPTIONS.map((d) => (
                <Chip key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />
              ))}
            </View>

            <Text style={styles.groupLabel}>Workouts per week</Text>
            <View style={styles.chipRow}>
              {WORKOUT_OPTIONS.map((w) => (
                <Chip key={w} label={w} selected={workouts === w} onPress={() => setWorkouts(w)} />
              ))}
            </View>
          </View>
        )}

        {/* STEP 5 — AI consent (Apple requirement: explicit opt-in before sending to a third-party AI) */}
        {step === 5 && (
          <View>
            <View style={styles.iconCircleLeft}>
              <Ionicons name="sparkles" size={30} color={C.pink} />
            </View>
            <Text style={styles.stepTitle}>How your scan works</Text>
            <Text style={styles.stepSubtitle}>
              To analyze your facial harmony, your photo is sent to our AI provider for processing.
              Here is exactly what happens to it.
            </Text>

            <View style={styles.consentRow}>
              <Ionicons name="lock-closed" size={18} color={C.pink} />
              <Text style={styles.consentText}>Sent securely over an encrypted connection</Text>
            </View>
            <View style={styles.consentRow}>
              <Ionicons name="trash-outline" size={18} color={C.pink} />
              <Text style={styles.consentText}>Not stored after your report is generated</Text>
            </View>
            <View style={styles.consentRow}>
              <Ionicons name="close-circle-outline" size={18} color={C.pink} />
              <Text style={styles.consentText}>Never sold or used to train other models</Text>
            </View>

            {/* Age gate 17+ (body-image safety, App Store rating alignment) */}
            <Pressable style={styles.ageRow} onPress={() => { impactMedium(); setAgeConfirmed(!ageConfirmed); }}>
              <View style={[styles.ageBox, ageConfirmed && styles.ageBoxOn]}>
                {ageConfirmed && <Ionicons name="checkmark" size={15} color="#fff" />}
              </View>
              <Text style={styles.ageText}>I confirm I am 17 or older</Text>
            </Pressable>

            <Text style={styles.consentLegal}>
              By tapping "I Agree" you consent to your selfie (including facial geometry, a form of
              biometric data) being processed by AI to generate your wellness and styling results, then
              automatically deleted within 48 hours. We never sell your photos or use them to train AI.
              For wellness and entertainment only, not medical advice.{' '}
              <Text
                style={styles.consentLink}
                onPress={() => Linking.openURL('https://glowupai.app/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        )}

        {/* STEP 6 — Camera permission */}
        {step === 6 && (
          <View style={styles.cameraWrap}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={52} color={C.pink} />
            </View>
            <Text style={styles.stepTitleCenter}>One last thing</Text>
            <Text style={styles.stepSubtitleCenter}>
              We need camera access to scan your face.{'\n'}Your photo is processed securely and is never stored.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {step < 5 ? (
          <Pressable
            onPress={next}
            disabled={!canContinue}
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>{step === 0 ? 'Get Started' : 'Continue'}</Text>
          </Pressable>
        ) : step === 5 ? (
          <Pressable
            onPress={agreeAndContinue}
            disabled={!ageConfirmed}
            style={[styles.cta, !ageConfirmed && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>I Agree &amp; Continue</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={requestCamera} disabled={requestingCamera} style={styles.cta}>
              <Text style={styles.ctaText}>
                {requestingCamera ? 'Requesting...' : 'Allow Camera Access'}
              </Text>
            </Pressable>
            <Pressable onPress={completeOnboarding} hitSlop={8}>
              <Text style={styles.linkText}>Or choose photos from library</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 58 : 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    gap: 10,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.pink,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ---- Hook ----
  hookWrap: { alignItems: 'center', paddingTop: 28 },
  brand: { fontSize: 18, fontWeight: '800', color: C.pink, marginBottom: 22 },
  hookTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 16,
  },
  hookSubtitle: {
    fontSize: 16,
    color: C.textSoft,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  hookCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.border,
    paddingVertical: 26,
    alignItems: 'center',
    gap: 12,
  },
  hookCardEmoji: { fontSize: 40 },
  hookCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
    lineHeight: 26,
  },

  // ---- Step headers ----
  stepTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: C.text,
    lineHeight: 38,
    marginBottom: 10,
  },
  stepTitleCenter: {
    fontSize: 30,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 15,
    color: C.textSoft,
    lineHeight: 21,
    marginBottom: 20,
  },
  stepSubtitleCenter: {
    fontSize: 15,
    color: C.textSoft,
    lineHeight: 22,
    textAlign: 'center',
  },

  // ---- Select cards ----
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 18,
    marginBottom: 12,
  },
  selectCardSelected: {
    borderColor: C.pink,
    backgroundColor: C.cardSoft,
  },
  selectCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    marginBottom: 3,
  },
  selectCardSubtitle: {
    fontSize: 13,
    color: C.textSoft,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },

  // ---- Chips ----
  groupLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
    marginTop: 18,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: C.text },
  chipTextSelected: { color: '#fff' },

  // ---- Camera step ----
  cameraWrap: { alignItems: 'center', paddingTop: 40 },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: C.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ---- AI consent step ----
  iconCircleLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  consentText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  ageBox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: C.border,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
  },
  ageBoxOn: { backgroundColor: C.pink, borderColor: C.pink },
  ageText: { fontSize: 14, fontWeight: '700', color: C.text },
  consentLegal: {
    fontSize: 12,
    color: C.textSoft,
    lineHeight: 18,
    marginTop: 14,
  },
  consentLink: { color: C.pink, textDecorationLine: 'underline' },

  // ---- Bottom CTA ----
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    paddingTop: 10,
    gap: 12,
    alignItems: 'center',
  },
  cta: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#D98CA4',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { fontSize: 18, fontWeight: '900', color: C.text },
  linkText: {
    color: C.pink,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
