import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import BrandLogo from '../src/components/BrandLogo';
import { Ionicons } from '@expo/vector-icons';
import { trackEvent, trackOnboardingStarted } from '../src/services/analytics';
import { setAiConsent } from '../src/services/aiConsent';
import { impactMedium } from '../src/services/haptics';

/**
 * Scan-first onboarding (review 2026-06): a short hook, then the AI-consent + age
 * gate (required before any photo goes to the AI), then straight to the live scan.
 * The personalization quiz now runs AFTER the reveal, in app/personalize.tsx, so a
 * woman sees her GlowScore first and personalizes second.
 */

const C = {
  bg: '#F9E0E8', card: '#FFFFFF', border: '#F2C4D2', pink: '#E0537A',
  pinkSoft: '#F8D4DF', text: '#2D2330', textSoft: '#8A7B85',
};

const TOTAL_STEPS = 2;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  useEffect(() => { trackOnboardingStarted(); }, []);

  function next() { trackEvent('onboarding_step_completed', { step }); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function agreeAndScan() {
    if (!ageConfirmed) return;
    await setAiConsent(true);
    try {
      await AsyncStorage.setItem('age_confirmed', 'true');
      // Mark onboarding done so the scan flow never bounces back here; the quiz
      // (personalize) runs after the reveal and refines the plan.
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    } catch {}
    trackEvent('ai_consent_granted', { source: 'onboarding' });
    router.replace('/multi-scan?first=1');
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {step > 0 ? (
          <Pressable onPress={back} hitSlop={12} style={styles.backBtn}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>
        ) : <View style={styles.backBtn} />}
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} /></View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.hookWrap}>
            <BrandLogo width={132} style={{ marginBottom: 22 }} />
            <Text style={styles.hookTitle}>Ready For{'\n'}<Text style={{ color: C.pink }}>Glow Up?</Text></Text>
            <Text style={styles.hookSubtitle}>Scan your face, see your Facial Harmony score, and get your personalized glow-up plan.</Text>
            <View style={styles.hookCard}>
              <Text style={styles.hookCardEmoji}>✨</Text>
              <Text style={styles.hookCardText}>Facial Harmony score{'\n'}6 detailed components{'\n'}Your personal glow-up plan</Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <View style={styles.iconCircleLeft}><Ionicons name="sparkles" size={30} color={C.pink} /></View>
            <Text style={styles.stepTitle}>How your scan works</Text>
            <Text style={styles.stepSubtitle}>To analyze your facial harmony, your photo is sent to our AI provider for processing. Here is exactly what happens to it.</Text>

            <View style={styles.consentRow}><Ionicons name="lock-closed" size={18} color={C.pink} /><Text style={styles.consentText}>Sent securely over an encrypted connection</Text></View>
            <View style={styles.consentRow}><Ionicons name="trash-outline" size={18} color={C.pink} /><Text style={styles.consentText}>Not stored after your report is generated</Text></View>
            <View style={styles.consentRow}><Ionicons name="close-circle-outline" size={18} color={C.pink} /><Text style={styles.consentText}>Never sold or used to train other models</Text></View>

            <Pressable style={styles.ageRow} onPress={() => { impactMedium(); setAgeConfirmed(!ageConfirmed); }}>
              <View style={[styles.ageBox, ageConfirmed && styles.ageBoxOn]}>{ageConfirmed && <Ionicons name="checkmark" size={15} color="#fff" />}</View>
              <Text style={styles.ageText}>I confirm I am 17 or older</Text>
            </Pressable>

            <Text style={styles.consentLegal}>
              By tapping "Agree and scan" you consent to your selfie (including facial geometry, a form of biometric data) being processed by AI to generate your wellness and styling results, then automatically deleted within 48 hours. We never sell your photos or use them to train AI. For wellness and entertainment only, not medical advice.{' '}
              <Text style={styles.consentLink} onPress={() => Linking.openURL('https://glowupai.app/privacy')}>Privacy Policy</Text>
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step === 0 ? (
          <Pressable onPress={next} style={styles.cta}><Text style={styles.ctaText}>Get Started</Text></Pressable>
        ) : (
          <Pressable onPress={agreeAndScan} disabled={!ageConfirmed} style={[styles.cta, !ageConfirmed && styles.ctaDisabled]}>
            <Text style={styles.ctaText}>Agree &amp; scan</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'ios' ? 58 : 36 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 10, gap: 10 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#fff', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: C.pink },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

  hookWrap: { alignItems: 'center', paddingTop: 28 },
  hookTitle: { fontSize: 44, fontWeight: '900', color: C.text, textAlign: 'center', lineHeight: 52, marginBottom: 16 },
  hookSubtitle: { fontSize: 16, color: C.textSoft, textAlign: 'center', lineHeight: 23, marginBottom: 30, paddingHorizontal: 8 },
  hookCard: { width: '100%', backgroundColor: C.card, borderRadius: 24, borderWidth: 2, borderColor: C.border, paddingVertical: 26, alignItems: 'center', gap: 12 },
  hookCardEmoji: { fontSize: 40 },
  hookCardText: { fontSize: 15, fontWeight: '600', color: C.text, textAlign: 'center', lineHeight: 26 },

  stepTitle: { fontSize: 32, fontWeight: '900', color: C.text, lineHeight: 38, marginBottom: 10 },
  stepSubtitle: { fontSize: 15, color: C.textSoft, lineHeight: 21, marginBottom: 20 },

  iconCircleLeft: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10 },
  consentText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  ageBox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  ageBoxOn: { backgroundColor: C.pink, borderColor: C.pink },
  ageText: { fontSize: 14, fontWeight: '700', color: C.text },
  consentLegal: { fontSize: 12, color: C.textSoft, lineHeight: 18, marginTop: 14 },
  consentLink: { color: C.pink, textDecorationLine: 'underline' },

  bottomBar: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 22, paddingTop: 10, gap: 12, alignItems: 'center' },
  cta: { width: '100%', backgroundColor: C.pink, borderRadius: 30, paddingVertical: 18, alignItems: 'center', shadowColor: '#D98CA4', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { fontSize: 18, fontWeight: '900', color: '#fff' },
});
