import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, Linking, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { theme as C, radii } from '../../src/theme';
import { typography, fonts } from '../../src/typography';
import { shadow } from '../../src/shadows';
import { trackScreen } from '../../src/services/analytics';
import { getLastScan, ScanRecord } from '../../src/services/history';
import { getStreak, getPlan, GlowPlan } from '../../src/services/glowPlan';
import BrandLogo from '../../src/components/BrandLogo';

const SUB_LABELS: Record<string, string> = {
  skin: 'Skin texture', eyes: 'Eye area', jawline: 'Jawline',
  symmetry: 'Symmetry', harmony: 'Harmony', nose_lip_ratio: 'Nose & lips', lip_harmony: 'Lips',
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [cameraPermDenied, setCameraPermDenied] = useState(false);
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [streak, setStreak] = useState(0);
  const [plan, setPlan] = useState<GlowPlan | null>(null);

  useEffect(() => {
    trackScreen('home');
    const checkOnboarding = async () => {
      try {
        const done = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (!done) { router.replace('/onboarding'); return; }
      } catch {}
      setLoading(false);
    };
    checkOnboarding();
    if (Platform.OS !== 'web') {
      ImagePicker.getCameraPermissionsAsync().then(({ status }) => {
        if (status === 'denied') setCameraPermDenied(true);
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [scan, s, p] = await Promise.all([getLastScan(), getStreak(), getPlan()]);
        if (active) { setLastScan(scan); setStreak(s); setPlan(p); }
      })();
      return () => { active = false; };
    }, [])
  );

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: '/scan-result', params: { imageUri: result.assets[0].uri } });
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { setCameraPermDenied(true); return; }
    setCameraPermDenied(false);
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85, allowsEditing: true, aspect: [1, 1], cameraType: 'front' as any,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: '/scan-result', params: { imageUri: result.assets[0].uri } });
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.pink} /></View>;
  }

  if (cameraPermDenied) {
    return (
      <View style={styles.center}>
        <View style={styles.permCard}>
          <View style={styles.iconCircle}><Ionicons name="camera" size={40} color={C.pink} /></View>
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permSub}>We need camera access to scan your face. Your photo is processed securely and deleted after.</Text>
          <Pressable style={styles.ctaSolid} onPress={() => Linking.openSettings()}><Text style={styles.ctaText}>Open Settings</Text></Pressable>
          <Pressable onPress={() => { setCameraPermDenied(false); pickImage(); }}><Text style={styles.link}>Or choose a photo from your library</Text></Pressable>
        </View>
      </View>
    );
  }

  const tasksToday = plan ? plan.tasks.filter((t) => t.completedDates.includes(new Date().toISOString().split('T')[0])).length : 0;
  const tasksTotal = plan ? plan.tasks.length : 0;
  const topPct = lastScan && typeof lastScan.percentile === 'number' ? Math.max(1, 100 - lastScan.percentile) : null;
  const band = lastScan ? (lastScan.overall < 60 ? 'Room to glow' : lastScan.overall < 75 ? 'Good balance' : 'Great harmony') : '';
  const chips = lastScan ? weakestChips(lastScan) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BrandLogo width={150} />
        <Text style={styles.tagline}>{lastScan ? 'Glow at any size — your routine, your evolution' : 'Glow at any size — reveal your facial harmony'}</Text>
      </View>

      {lastScan ? (
        <>
          {/* Unified premium hero card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Your Facial Harmony</Text>
            <AnimatedCircularProgress
              size={150} width={11} fill={lastScan.overall}
              tintColor={C.pink} backgroundColor={C.track} rotation={0} lineCap="round" duration={900}
              style={{ marginVertical: 10 }}
            >
              {() => (
                <View style={styles.ringInner}>
                  <Text style={styles.scoreNum}>{lastScan.overall}</Text>
                  <Text style={styles.scoreOut}>/100</Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <Text style={styles.band}>{band}</Text>
            {topPct ? <Text style={styles.topPct}>Top {topPct}% of users · {timeAgo(lastScan.createdAt)}</Text> : null}
            {streak > 0 && (
              <View style={styles.streakChip}>
                <Ionicons name="flame" size={13} color="#fff" />
                <Text style={styles.streakText}>{streak}-day streak</Text>
              </View>
            )}
          </View>

          {tasksTotal > 0 && (
            <Pressable style={styles.row} onPress={() => router.push('/glow-plan')}>
              <View style={styles.rowIcon}><Ionicons name="sparkles" size={16} color={C.pink} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Today's glow-up plan</Text>
                <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${tasksTotal ? (tasksToday / tasksTotal) * 100 : 0}%` }]} /></View>
              </View>
              <Text style={styles.rowCount}>{tasksToday}/{tasksTotal}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
            </Pressable>
          )}

          <Pressable style={styles.row} onPress={() => router.push('/stress-scan')}>
            <View style={styles.rowIcon}><Ionicons name="water" size={16} color={C.pink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Check your cortisol face</Text>
              <Text style={styles.rowSub}>De-puff with a 2-min scan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
          </Pressable>

          {chips.length > 0 && (
            <View style={styles.workBlock}>
              <View style={styles.workHead}>
                <Text style={styles.workTitle}>What to work on</Text>
                <Pressable onPress={() => router.push('/concerns')}><Text style={styles.workSeeAll}>See all</Text></Pressable>
              </View>
              <View style={styles.chipRow}>
                {chips.map((c) => (
                  <Pressable key={c} style={styles.chip} onPress={() => router.push('/concerns')}>
                    <Text style={styles.chipText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <GradientCta icon="scan" label="Re-scan to see your progress" onPress={takePhoto} />
          <Pressable style={styles.secondary} onPress={pickImage}><Text style={styles.secondaryText}>Choose a photo</Text></Pressable>
          {Platform.OS !== 'web' && (
            <Pressable style={styles.liveScanLink} onPress={() => router.push('/camera-scan')}><Text style={styles.liveScanText}>Try live scan (beta)</Text></Pressable>
          )}
        </>
      ) : (
        <>
          <View style={styles.firstHero}>
            <Image source={require('../../assets/components/symmetry.png')} style={styles.heroImg} />
            <LinearGradient colors={['transparent', 'rgba(45,35,48,0.35)']} style={styles.heroFade} />
          </View>
          <Text style={styles.firstTitle}>Scan your face,{'\n'}reveal your potential</Text>
          <Text style={styles.firstSub}>An AI-powered read of your facial harmony in seconds.</Text>
          <GradientCta icon="camera" label="Take a Selfie" onPress={takePhoto} />
          <Pressable style={styles.secondary} onPress={pickImage}><Text style={styles.secondaryText}>Choose a photo</Text></Pressable>
        </>
      )}

      <Text style={styles.disclaimer}>For wellness and entertainment only. Not a medical device.</Text>
    </View>
  );
}

function weakestChips(s: ScanRecord): string[] {
  const keys: (keyof ScanRecord)[] = ['skin', 'eyes', 'jawline', 'symmetry', 'harmony', 'nose_lip_ratio', 'lip_harmony'];
  return keys
    .map((k) => ({ k: k as string, v: s[k] as number | undefined }))
    .filter((e) => typeof e.v === 'number')
    .sort((a, b) => (a.v as number) - (b.v as number))
    .slice(0, 3)
    .map((e) => SUB_LABELS[e.k] || e.k);
}

function GradientCta({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ctaWrap}>
      <LinearGradient colors={C.pinkGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
        <Ionicons name={icon} size={20} color="#fff" />
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

const cardShadow = shadow(2);
const chipShadow = shadow(1);
const ctaGlow = shadow(2);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 20, paddingTop: Platform.OS === 'ios' ? 64 : 44 },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: { marginBottom: 18, alignItems: 'center' },
  tagline: { fontSize: 14.5, color: C.textSoft, marginTop: 6, textAlign: 'center' },

  heroCard: { backgroundColor: C.card, borderRadius: radii.xxl, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center', marginBottom: 12, ...cardShadow },
  heroTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: C.text },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontFamily: fonts.displayBold, fontSize: 42, color: C.text },
  scoreOut: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginTop: -6 },
  band: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.pink, marginTop: 2 },
  topPct: { fontSize: 12.5, color: C.textSoft, marginTop: 4 },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.pink, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  streakText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: radii.lg, padding: 14, marginBottom: 10, ...chipShadow },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '800', color: C.text },
  rowSub: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  rowCount: { fontSize: 14, fontWeight: '900', color: C.pink },
  miniTrack: { height: 5, backgroundColor: C.track, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  miniFill: { height: '100%', backgroundColor: C.pink, borderRadius: 3 },

  workBlock: { marginTop: 4, marginBottom: 14 },
  workHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 2 },
  workTitle: { fontSize: 14.5, fontWeight: '900', color: C.text },
  workSeeAll: { fontSize: 13, fontWeight: '700', color: C.pink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: C.card, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 9, ...chipShadow },
  chipText: { fontSize: 13, fontWeight: '700', color: C.text },

  ctaWrap: { borderRadius: radii.full, marginTop: 4, ...ctaGlow },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 30, paddingVertical: 18 },
  ctaSolid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.pink, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 28, marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 16.5, fontWeight: '900' },
  secondary: { alignItems: 'center', paddingVertical: 14, marginTop: 2 },
  secondaryText: { color: C.pink, fontSize: 15, fontWeight: '700' },
  liveScanLink: { alignItems: 'center', paddingVertical: 6 },
  liveScanText: { color: C.textSoft, fontSize: 13, fontWeight: '600' },

  firstHero: { borderRadius: radii.xl, overflow: 'hidden', marginBottom: 20, backgroundColor: C.card, ...cardShadow },
  heroImg: { width: '100%', height: 290 },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 },
  firstTitle: { ...typography.h2, fontFamily: fonts.displayBold, textAlign: 'center' },
  firstSub: { fontSize: 15, color: C.textSoft, textAlign: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 10, lineHeight: 21 },

  permCard: { width: '100%', backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  permTitle: { fontSize: 21, fontWeight: '800', color: C.text, marginBottom: 8 },
  permSub: { fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  link: { color: C.pink, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', marginTop: 14 },

  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 'auto', paddingTop: 18, opacity: 0.85 },
});
