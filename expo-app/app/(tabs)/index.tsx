import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, Linking, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { theme as C } from '../../src/theme';
import { trackScreen } from '../../src/services/analytics';
import { getLastScan, ScanRecord } from '../../src/services/history';
import { getStreak, getPlan, GlowPlan } from '../../src/services/glowPlan';
import BrandLogo from '../../src/components/BrandLogo';

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
          <Text style={styles.permSub}>We need camera access to scan your face. Your photo is processed securely and never stored.</Text>
          <Pressable style={styles.ctaSolid} onPress={() => Linking.openSettings()}>
            <Text style={styles.ctaText}>Open Settings</Text>
          </Pressable>
          <Pressable onPress={() => { setCameraPermDenied(false); pickImage(); }}>
            <Text style={styles.link}>Or choose a photo from your library</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const tasksToday = plan ? plan.tasks.filter((t) => t.completedDates.includes(new Date().toISOString().split('T')[0])).length : 0;
  const tasksTotal = plan ? plan.tasks.length : 0;
  const topPct = lastScan && typeof lastScan.percentile === 'number' ? Math.max(1, 100 - lastScan.percentile) : null;

  return (
    <View style={styles.container}>
      {/* Premium brand header */}
      <View style={styles.header}>
        <BrandLogo width={158} />
        <Text style={styles.tagline}>{lastScan ? 'Track your glow-up' : 'Reveal your facial harmony'}</Text>
      </View>

      {lastScan ? (
        <>
          <View style={styles.scoreCard}>
            <AnimatedCircularProgress
              size={96} width={8} fill={lastScan.overall}
              tintColor={C.pink} backgroundColor={C.track} rotation={0} lineCap="round" duration={900}
            >
              {() => (
                <View style={styles.ringInner}>
                  <Text style={styles.scoreNum}>{lastScan.overall}</Text>
                  <Text style={styles.scoreOut}>/100</Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreLabel}>Your Facial Harmony</Text>
              <Text style={styles.scoreSub}>
                {topPct ? `Top ${topPct}% · ` : ''}Last scan {timeAgo(lastScan.createdAt)}
              </Text>
              {streak > 0 && (
                <View style={styles.streakChip}>
                  <Ionicons name="flame" size={13} color="#fff" />
                  <Text style={styles.streakText}>{streak}-day streak</Text>
                </View>
              )}
            </View>
          </View>

          {tasksTotal > 0 && (
            <Pressable style={styles.planRow} onPress={() => router.push('/glow-plan')}>
              <View style={styles.planIcon}><Ionicons name="sparkles" size={16} color={C.pink} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planText}>Today's glow-up plan</Text>
                <View style={styles.planTrack}>
                  <View style={[styles.planFill, { width: `${tasksTotal ? (tasksToday / tasksTotal) * 100 : 0}%` }]} />
                </View>
              </View>
              <Text style={styles.planCount}>{tasksToday}/{tasksTotal}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
            </Pressable>
          )}

          <Pressable style={styles.planRow} onPress={() => router.push('/stress-scan')}>
            <View style={styles.planIcon}><Ionicons name="water" size={16} color={C.pink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planText}>Check your cortisol face</Text>
              <Text style={styles.scoreSub}>De-puff with a 2-min scan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
          </Pressable>

          <Pressable style={styles.planRow} onPress={() => router.push('/concerns')}>
            <View style={styles.planIcon}><Ionicons name="sparkles-outline" size={16} color={C.pink} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planText}>What do you want to improve?</Text>
              <Text style={styles.scoreSub}>Tailor your plan to your goals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
          </Pressable>

          <GradientCta icon="scan" label="Re-scan to see your progress" onPress={takePhoto} />
          <Pressable style={styles.secondary} onPress={pickImage}>
            <Text style={styles.secondaryText}>Choose a photo</Text>
          </Pressable>
          {Platform.OS !== 'web' && (
            <Pressable style={styles.liveScanLink} onPress={() => router.push('/camera-scan')}>
              <Text style={styles.liveScanText}>Try live scan (beta)</Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <View style={styles.heroCard}>
            <Image source={require('../../assets/components/symmetry.png')} style={styles.heroImg} />
            <LinearGradient colors={['transparent', 'rgba(45,35,48,0.35)']} style={styles.heroFade} />
          </View>
          <Text style={styles.heroTitle}>Scan your face,{'\n'}reveal your potential</Text>
          <Text style={styles.heroSub}>An AI-powered read of your facial harmony in seconds.</Text>
          <GradientCta icon="camera" label="Take a Selfie" onPress={takePhoto} />
          <Pressable style={styles.secondary} onPress={pickImage}>
            <Text style={styles.secondaryText}>Choose a photo</Text>
          </Pressable>
        </>
      )}

      <Text style={styles.disclaimer}>AI-generated artistic visualization for entertainment only.</Text>
    </View>
  );
}

function GradientCta({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ctaWrap}>
      <LinearGradient colors={['#E0537A', '#EC7FA0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
        <Ionicons name={icon} size={20} color="#fff" />
        <Text style={styles.ctaText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  return `${Math.floor(d / 7)}w ago`;
}

const shadow = Platform.OS === 'web'
  ? ({ boxShadow: '0 8px 24px rgba(176,98,128,0.18)' } as any)
  : { shadowColor: '#B06280', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 22, paddingTop: Platform.OS === 'ios' ? 68 : 46 },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: { marginBottom: 22, alignItems: 'center' },
  tagline: { fontSize: 15, color: C.textSoft, marginTop: 6, textAlign: 'center' },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.card,
    borderRadius: 24, padding: 18, marginBottom: 12, ...shadow,
  },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 28, fontWeight: '900', color: C.text },
  scoreOut: { fontSize: 11, color: C.textSoft, marginTop: -4 },
  scoreLabel: { fontSize: 17, fontWeight: '800', color: C.text },
  scoreSub: { fontSize: 13, color: C.textSoft, marginTop: 2 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.pink,
    alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 9,
  },
  streakText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  planRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card,
    borderRadius: 18, padding: 15, marginBottom: 18, ...shadow,
  },
  planIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  planText: { fontSize: 14.5, fontWeight: '800', color: C.text },
  planTrack: { height: 5, backgroundColor: C.track, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  planFill: { height: '100%', backgroundColor: C.pink, borderRadius: 3 },
  planCount: { fontSize: 14, fontWeight: '900', color: C.pink },

  heroCard: { borderRadius: 26, overflow: 'hidden', marginBottom: 20, backgroundColor: C.card, ...shadow },
  heroImg: { width: '100%', height: 290 },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.text, textAlign: 'center', lineHeight: 34 },
  heroSub: { fontSize: 15, color: C.textSoft, textAlign: 'center', marginTop: 8, marginBottom: 26, paddingHorizontal: 10, lineHeight: 21 },

  ctaWrap: { borderRadius: 30, ...(Platform.OS === 'web' ? ({ boxShadow: '0 6px 18px rgba(224,83,122,0.4)' } as any) : { shadowColor: C.pink, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 5 }) },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 30, paddingVertical: 18,
  },
  ctaSolid: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.pink, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 28, marginTop: 4,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  secondary: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  secondaryText: { color: C.pink, fontSize: 15, fontWeight: '700' },
  liveScanLink: { alignItems: 'center', paddingVertical: 8 },
  liveScanText: { color: C.textSoft, fontSize: 13, fontWeight: '600' },

  permCard: { width: '100%', backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  permTitle: { fontSize: 21, fontWeight: '800', color: C.text, marginBottom: 8 },
  permSub: { fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  link: { color: C.pink, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', marginTop: 14 },

  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 'auto', paddingTop: 20, opacity: 0.8 },
});
