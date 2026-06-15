import {
  View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { analyzeVisualWeight, VisualWeightResult } from '../src/services/styling';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { notificationSuccess, impactMedium } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

export default function VisualWeightScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [imageUri, setImageUri] = useState<string | undefined>(typeof params.imageUri === 'string' ? params.imageUri : undefined);
  const [result, setResult] = useState<VisualWeightResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { trackScreen('visual_weight'); }, []);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.9, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  }

  async function analyze() {
    if (!imageUri) return;
    const sub = await checkSubscription();
    if (!sub) { trackEvent('paywall_gate_vweight'); router.push({ pathname: '/pricing', params: { source: 'visual_weight' } }); return; }
    setBusy(true); setErr(null);
    try {
      const token = await getSubscriberToken();
      const res = await analyzeVisualWeight(imageUri, token);
      if (!res.confidence) throw new Error('Could not read your features. Use a clear, front-facing selfie.');
      setResult(res); notificationSuccess(); trackEvent('visual_weight_done');
    } catch (e: any) {
      setErr(e?.message || 'Analysis failed. Please try again.');
    } finally { setBusy(false); }
  }

  async function share() {
    if (!result) return;
    try {
      await Share.share({ message: `My visual weight is "${result.label}" (${result.weight}) on GlowScore. ${result.description}` });
      trackEvent('visual_weight_share');
    } catch {}
  }

  if (!imageUri) {
    return (
      <View style={styles.center}>
        <Back />
        <View style={styles.iconCircle}><Ionicons name="contrast-outline" size={36} color={C.pink} /></View>
        <Text style={styles.bigTitle}>Visual Weight</Text>
        <Text style={styles.sub}>Discover whether your features read soft or striking, and the makeup that suits them best.</Text>
        <Pressable style={styles.cta} onPress={pick}><Text style={styles.ctaText}>Choose a selfie</Text></Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Back />
      {!result ? (
        <>
          <Text style={styles.eyebrow}>VISUAL WEIGHT</Text>
          <Text style={styles.title}>Feature analysis</Text>
          <Text style={styles.sub}>We read how soft vs striking your features are, to tailor your makeup intensity.</Text>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {busy ? (
            <View style={styles.loadingBox}><ActivityIndicator size="large" color={C.pink} /><Text style={styles.note}>Reading your features…</Text></View>
          ) : err ? (
            <View style={styles.loadingBox}><Text style={[styles.note, { color: '#C2415B' }]}>{err}</Text></View>
          ) : null}
          {!busy && (
            <>
              <Pressable style={styles.cta} onPress={analyze}><Ionicons name="sparkles" size={18} color="#fff" /><Text style={styles.ctaText}>Analyze my features</Text></Pressable>
              <Pressable style={styles.ghost} onPress={pick}><Text style={styles.ghostText}>Use a different photo</Text></Pressable>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.eyebrow}>YOUR VISUAL WEIGHT</Text>
          <Text style={styles.title}>{result.label}</Text>
          <Text style={styles.bandText}>{result.weight === 'high' ? 'High visual weight' : result.weight === 'low' ? 'Low visual weight' : 'Balanced'}</Text>
          <Text style={styles.note}>{result.description}</Text>

          <View style={styles.scaleRow}>
            <Text style={styles.scaleEnd}>Soft</Text>
            <View style={styles.scaleTrack}><View style={[styles.scaleDot, { left: `${Math.max(2, Math.min(96, result.score))}%` }]} /></View>
            <Text style={styles.scaleEnd}>Striking</Text>
          </View>

          <Text style={styles.section}>Makeup that suits you</Text>
          {result.makeup_tips.map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color={C.pink} />
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}

          <Pressable style={styles.cta} onPress={share}><Ionicons name="share-social" size={18} color="#fff" /><Text style={styles.ctaText}>Share my result</Text></Pressable>
          <Pressable style={styles.ghost} onPress={() => { impactMedium(); setResult(null); }}><Text style={styles.ghostText}>Re-analyze</Text></Pressable>
          <Text style={styles.disclaimer}>Styling guidance for entertainment, not an attractiveness rating.</Text>
        </>
      )}
    </ScrollView>
  );
}

function Back() {
  return <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 60 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 26 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: { color: C.pink, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: C.text, fontSize: 30, fontWeight: '900', marginTop: 4 },
  bigTitle: { color: C.text, fontSize: 26, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  bandText: { color: C.pink, fontSize: 15, fontWeight: '800', marginTop: 4 },
  sub: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  note: { color: C.textSoft, fontSize: 13, lineHeight: 19, marginTop: 10 },
  section: { color: C.text, fontSize: 15, fontWeight: '900', marginTop: 24, marginBottom: 8 },
  preview: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginVertical: 18, borderWidth: 3, borderColor: C.pink },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 12 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 },
  scaleEnd: { color: C.textSoft, fontSize: 12, fontWeight: '700' },
  scaleTrack: { flex: 1, height: 8, backgroundColor: C.track, borderRadius: 4, justifyContent: 'center' },
  scaleDot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: C.pink, marginLeft: -9, borderWidth: 2, borderColor: '#fff' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 9 },
  tipText: { color: C.text, fontSize: 14, flex: 1, lineHeight: 20, fontWeight: '500' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: C.pink, borderRadius: 28, paddingVertical: 16, marginTop: 24 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: C.pink, fontSize: 14, fontWeight: '700' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { color: C.textSoft, fontSize: 11, lineHeight: 16, marginTop: 14, textAlign: 'center' },
});
