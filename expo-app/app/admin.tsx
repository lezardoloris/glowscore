import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';

// Dev/admin console: navigate every screen + flip locked/unlocked state to
// preview the app before AND after the paywall. Not for production builds.
const DEMO_FACE = 'https://i.pravatar.cc/512?img=5';

const FLAGS = [
  { key: 'invite_unlocked', label: 'Débloqué (après paywall)', hint: 'Affiche les vrais scores, treatments, before/after' },
  { key: 'hasCompletedOnboarding', label: 'Onboarding terminé', hint: 'Sinon le home renvoie au quiz' },
  { key: 'ai_consent_granted', label: 'Consentement IA donné', hint: 'Sinon le scan demande l’opt-in' },
];

const SCREENS = [
  { label: 'Onboarding (quiz)', go: () => router.push('/onboarding') },
  { label: 'Home (dashboard)', go: () => router.push('/(tabs)') },
  { label: 'Reveal — scan (démo)', go: () => router.push({ pathname: '/scan-result', params: { imageUri: DEMO_FACE } }) },
  { label: 'Paywall / Pricing', go: () => router.push('/pricing') },
  { label: 'Glow-Up Plan', go: () => router.push('/glow-plan') },
  { label: 'Progress / History', go: () => router.push('/(tabs)/history') },
  { label: 'Settings', go: () => router.push('/(tabs)/settings') },
  { label: 'Feature Hub', go: () => router.push({ pathname: '/feature-hub', params: { imageUri: DEMO_FACE } }) },
];

const TECH_FREE = [
  ['Onboarding quiz', 'expo-router + reanimated — quiz multi-étapes (Pick Your Glow Up, goals, daily basics)'],
  ['Consentement IA', 'aiConsent.ts — opt-in avant tout envoi (exigence Apple)'],
  ['Face scan → score', 'Cloudflare Worker → vision LLM (OpenRouter gpt-4o-mini) = Facial Harmony + 6 composants'],
  ['Reveal locké', 'react-native-circular-progress (ring) + react-native-animated-numbers (count-up) + react-native-progress (barres)'],
  ['Vignettes composants', 'assets générés (Higgsfield) — Skin Clarity → Lips & Smile'],
  ['Paywall', 'react-native-purchases (RevenueCat) — Annual/Weekly/Lifetime'],
  ['Invite-unlock', 'Share natif — débloque en invitant 3 amis'],
];

const TECH_PREMIUM = [
  ['Scores complets + treatments', 'Worker face-scan (rubrique 6 composants + 3 treatments ciblés)'],
  ['Maxed-Out Self', 'fal.ai (flux/dev + IP-adapter face-id) via Worker — before/after photoréaliste'],
  ['Slider before/after', 'expo-image-compare (reanimated 3)'],
  ['Plan + rétention', 'glowPlan.ts (streak) + history.ts (ScanRecord) + delta de re-scan'],
  ['Share card 9:16', '@shopify/react-native-skia (roadmap) + view-shot'],
];

const TECH_ROADMAP = [
  ['Scan on-device', 'react-native-vision-camera 4 + face-detector — valide le visage avant l’appel payant + animation mesh'],
  ['Durcir Worker', 'URLs R2 signées (HMAC) + magic-byte + rate-limit KV + percentile server-side (GoldenFace)'],
  ['Web-to-app', 'Stripe Checkout → webhook → RevenueCat (modèle Cal AI)'],
];

export default function AdminScreen() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const out: Record<string, boolean> = {};
    for (const f of FLAGS) out[f.key] = (await AsyncStorage.getItem(f.key)) === 'true';
    setFlags(out);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(key: string, val: boolean) {
    if (val) {
      await AsyncStorage.setItem(key, 'true');
      if (key === 'invite_unlocked') await AsyncStorage.setItem('invite_share_count', '3');
    } else {
      await AsyncStorage.removeItem(key);
    }
    setFlags((p) => ({ ...p, [key]: val }));
  }

  async function resetAll() {
    await AsyncStorage.clear();
    await load();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Admin / Debug</Text>
        <Pressable onPress={() => router.push('/(tabs)')} hitSlop={8}>
          <Ionicons name="close" size={24} color={C.text} />
        </Pressable>
      </View>
      <Text style={styles.warn}>Console dev (web / __DEV__). Ne pas shipper en prod.</Text>

      {/* State flags */}
      <Text style={styles.section}>ÉTAT (AVANT / APRÈS PAYWALL)</Text>
      <View style={styles.card}>
        {FLAGS.map((f) => (
          <View key={f.key} style={styles.flagRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.flagLabel}>{f.label}</Text>
              <Text style={styles.flagHint}>{f.hint}</Text>
            </View>
            <Switch
              value={!!flags[f.key]}
              onValueChange={(v) => toggle(f.key, v)}
              trackColor={{ true: C.pink, false: C.trackLocked }}
              thumbColor="#fff"
            />
          </View>
        ))}
        <Pressable style={styles.resetBtn} onPress={resetAll}>
          <Text style={styles.resetText}>Reset complet (efface tout le stockage)</Text>
        </Pressable>
      </View>

      {/* Screens */}
      <Text style={styles.section}>ÉCRANS</Text>
      <View style={styles.grid}>
        {SCREENS.map((s) => (
          <Pressable key={s.label} style={styles.navBtn} onPress={s.go}>
            <Text style={styles.navText}>{s.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.pink} />
          </Pressable>
        ))}
      </View>

      {/* Tech map */}
      <Text style={styles.section}>TECHNO — AVANT PAYWALL (gratuit)</Text>
      <View style={styles.card}>{TECH_FREE.map(renderTech)}</View>

      <Text style={styles.section}>TECHNO — APRÈS PAYWALL (premium)</Text>
      <View style={styles.card}>{TECH_PREMIUM.map(renderTech)}</View>

      <Text style={styles.section}>ROADMAP (installé / à câbler)</Text>
      <View style={styles.card}>{TECH_ROADMAP.map(renderTech)}</View>

      <Text style={styles.foot}>Détails: market-research/ (github-toolkit, review-cro-multiagents, diagnostic-composants-visage)</Text>
    </ScrollView>
  );
}

function renderTech([name, desc]: string[]) {
  return (
    <View key={name} style={styles.techRow}>
      <View style={styles.dot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.techName}>{name}</Text>
        <Text style={styles.techDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingHorizontal: 18, paddingBottom: 60 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: C.text },
  warn: { fontSize: 12, color: C.pink, fontWeight: '700', marginTop: 2, marginBottom: 6 },
  section: { fontSize: 12, fontWeight: '800', color: C.textSoft, letterSpacing: 1, marginTop: 22, marginBottom: 8 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14 },
  flagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  flagLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  flagHint: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  resetBtn: { marginTop: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: '#FCE2E2', borderRadius: 12 },
  resetText: { color: '#C2415B', fontSize: 13, fontWeight: '800' },
  grid: { gap: 8 },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16 },
  navText: { fontSize: 15, fontWeight: '700', color: C.text },
  techRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.pink, marginTop: 6 },
  techName: { fontSize: 14, fontWeight: '800', color: C.text },
  techDesc: { fontSize: 12.5, color: C.textSoft, marginTop: 1, lineHeight: 17 },
  foot: { fontSize: 11, color: C.textSoft, textAlign: 'center', marginTop: 24, opacity: 0.7 },
});
