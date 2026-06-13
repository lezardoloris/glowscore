import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, Linking, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../../src/theme';
import { trackScreen } from '../../src/services/analytics';
import { getLastScan, ScanRecord } from '../../src/services/history';
import { getStreak, getPlan, GlowPlan } from '../../src/services/glowPlan';

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

  // Refresh the dashboard loop every time the tab gains focus (after a scan)
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

  // Camera permission denied overlay
  if (cameraPermDenied) {
    return (
      <View style={styles.center}>
        <View style={styles.permCard}>
          <View style={styles.iconCircle}><Ionicons name="camera" size={40} color={C.pink} /></View>
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permSub}>We need camera access to scan your face. Your photo is processed securely and never stored.</Text>
          <Pressable style={styles.cta} onPress={() => Linking.openSettings()}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>GlowScore</Text>
        <Text style={styles.tagline}>{lastScan ? 'Track your glow-up' : 'Reveal your facial harmony'}</Text>
      </View>

      {lastScan ? (
        <>
          {/* Last GlowScore + streak — the retention loop made visible */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreRing}>
              <Text style={styles.scoreNum}>{lastScan.overall}</Text>
              <Text style={styles.scoreOut}>/100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreLabel}>Your Facial Harmony</Text>
              <Text style={styles.scoreSub}>Last scan {timeAgo(lastScan.createdAt)}</Text>
              {streak > 0 && (
                <View style={styles.streakChip}>
                  <Ionicons name="flame" size={14} color="#fff" />
                  <Text style={styles.streakText}>{streak}-day streak</Text>
                </View>
              )}
            </View>
          </View>

          {tasksTotal > 0 && (
            <Pressable style={styles.planRow} onPress={() => router.push('/glow-plan')}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={C.pink} />
              <Text style={styles.planText}>Today's glow-up plan</Text>
              <Text style={styles.planCount}>{tasksToday}/{tasksTotal}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
            </Pressable>
          )}

          <Pressable style={styles.cta} onPress={takePhoto}>
            <Ionicons name="scan" size={20} color="#fff" />
            <Text style={styles.ctaText}>Re-scan to see your progress</Text>
          </Pressable>
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
          {/* First-time hero */}
          <View style={styles.heroCard}>
            <Image source={require('../../assets/components/symmetry.png')} style={styles.heroImg} />
          </View>
          <Text style={styles.heroTitle}>Scan your face,{'\n'}reveal your potential</Text>
          <Text style={styles.heroSub}>A clinical-grade analysis of your facial harmony in seconds.</Text>
          <Pressable style={styles.cta} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.ctaText}>Take a Selfie</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={pickImage}>
            <Text style={styles.secondaryText}>Choose a photo</Text>
          </Pressable>
        </>
      )}

      <Text style={styles.disclaimer}>AI-generated artistic visualization for entertainment only.</Text>
    </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 22, paddingTop: Platform.OS === 'ios' ? 70 : 48 },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { marginBottom: 22 },
  brand: { fontSize: 30, fontWeight: '900', color: C.text },
  tagline: { fontSize: 15, color: C.textSoft, marginTop: 2 },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.card,
    borderRadius: 22, padding: 18, marginBottom: 12,
  },
  scoreRing: {
    width: 92, height: 92, borderRadius: 46, borderWidth: 5, borderColor: C.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 30, fontWeight: '900', color: C.text },
  scoreOut: { fontSize: 12, color: C.textSoft, marginTop: -4 },
  scoreLabel: { fontSize: 17, fontWeight: '800', color: C.text },
  scoreSub: { fontSize: 13, color: C.textSoft, marginTop: 2 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.pink,
    alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  streakText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  planRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card,
    borderRadius: 16, padding: 16, marginBottom: 18,
  },
  planText: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  planCount: { fontSize: 15, fontWeight: '900', color: C.pink },

  heroCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20, backgroundColor: C.card },
  heroImg: { width: '100%', height: 280 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.text, textAlign: 'center', lineHeight: 34 },
  heroSub: { fontSize: 15, color: C.textSoft, textAlign: 'center', marginTop: 8, marginBottom: 26, paddingHorizontal: 10, lineHeight: 21 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.pink, borderRadius: 30, paddingVertical: 18,
    shadowColor: '#D98CA4', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
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
