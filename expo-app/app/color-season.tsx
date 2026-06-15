import {
  View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator, Share, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { analyzeColorSeason, ColorSeasonResult } from '../src/services/styling';
import { splitSeasonPalette, generateLipSwatches, generateBlushSwatches } from '../src/utils/colorPalette';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { notificationSuccess, impactMedium } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

export default function ColorSeasonScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [imageUri, setImageUri] = useState<string | undefined>(typeof params.imageUri === 'string' ? params.imageUri : undefined);
  const [result, setResult] = useState<ColorSeasonResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { trackScreen('color_season'); }, []);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.9, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  }

  async function analyze() {
    if (!imageUri) return;
    const sub = await checkSubscription();
    if (!sub) { trackEvent('paywall_gate_color'); router.push({ pathname: '/pricing', params: { source: 'color_season' } }); return; }
    setBusy(true); setErr(null);
    try {
      const token = await getSubscriberToken();
      const res = await analyzeColorSeason(imageUri, token);
      if (!res.confidence) throw new Error('Could not read your coloring. Use a clear, well-lit, front-facing selfie with no filter.');
      setResult(res); notificationSuccess(); trackEvent('color_season_done');
    } catch (e: any) {
      setErr(e?.message || 'Analysis failed. Please try again.');
    } finally { setBusy(false); }
  }

  async function share() {
    if (!result) return;
    try {
      await Share.share({ message: `My color season is ${result.sub_season || result.season} (${result.undertone} undertone) on GlowScore. My palette: ${result.palette.join(' ')}` });
      trackEvent('color_season_share');
    } catch {}
  }

  if (!imageUri) {
    return (
      <View style={styles.center}>
        <Back />
        <View style={styles.iconCircle}><Ionicons name="color-palette-outline" size={36} color={C.pink} /></View>
        <Text style={styles.bigTitle}>Color Season</Text>
        <Text style={styles.sub}>Find the exact palette that makes your skin glow. Use a clear daylight selfie, no filter.</Text>
        <Pressable style={styles.cta} onPress={pick}><Text style={styles.ctaText}>Choose a daylight selfie</Text></Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Back />

      {!result ? (
        <>
          <Text style={styles.eyebrow}>COLOR SEASON</Text>
          <Text style={styles.title}>Light calibration</Text>
          <Text style={styles.sub}>For a stable result, use natural daylight, face a window, remove glasses and heavy makeup, and turn off camera filters.</Text>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          {busy ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.pink} />
              <Text style={styles.note}>Reading your undertone, hair and eyes…</Text>
            </View>
          ) : err ? (
            <View style={styles.loadingBox}><Text style={[styles.note, { color: '#C2415B' }]}>{err}</Text></View>
          ) : null}
          {!busy && (
            <>
              <Pressable style={styles.cta} onPress={analyze}>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.ctaText}>Analyze my colors</Text>
              </Pressable>
              <Pressable style={styles.ghost} onPress={pick}><Text style={styles.ghostText}>Use a different photo</Text></Pressable>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.eyebrow}>YOUR COLOR SEASON</Text>
          <Text style={styles.title}>{result.sub_season || result.season}</Text>
          <Text style={styles.bandText}>{result.undertone} undertone · {result.metal} jewelry</Text>
          <Text style={styles.note}>{result.description}</Text>

          {(() => {
            const { neutrals, accents, makeup } = splitSeasonPalette(result.palette);
            const lips = generateLipSwatches(result.lip, 12);
            const blushes = generateBlushSwatches(result.blush, 8);
            return (
              <>
                <Text style={styles.section}>Neutrals</Text>
                <View style={styles.swatchRow}>
                  {neutrals.map((c, i) => <View key={`n${i}`} style={[styles.swatch, { backgroundColor: c }]} />)}
                </View>

                <Text style={styles.section}>Accents</Text>
                <View style={styles.swatchRow}>
                  {accents.map((c, i) => <View key={`a${i}`} style={[styles.swatch, { backgroundColor: c }]} />)}
                </View>

                <Text style={styles.section}>Makeup wardrobe</Text>
                <View style={styles.swatchRow}>
                  {makeup.map((c, i) => <View key={`m${i}`} style={[styles.swatch, { backgroundColor: c }]} />)}
                </View>

                <Text style={styles.section}>Lip shades (12)</Text>
                <View style={styles.swatchRow}>
                  {lips.map((c, i) => <View key={`l${i}`} style={[styles.swatchSm, { backgroundColor: c }]} />)}
                </View>

                <Text style={styles.section}>Blush shades (8)</Text>
                <View style={styles.swatchRow}>
                  {blushes.map((c, i) => <View key={`b${i}`} style={[styles.swatchSm, { backgroundColor: c }]} />)}
                </View>
              </>
            );
          })()}

          {result.avoid.length > 0 && (
            <>
              <Text style={styles.section}>Colors to skip</Text>
              <View style={styles.swatchRow}>
                {result.avoid.map((c, i) => <View key={i} style={[styles.swatch, styles.swatchAvoid, { backgroundColor: c }]} />)}
              </View>
            </>
          )}

          <Text style={styles.section}>Contrast level</Text>
          <View style={styles.contrastTrack}><View style={[styles.contrastFill, { width: `${result.contrast * 10}%` }]} /></View>
          <Text style={styles.note}>{result.contrast}/10 · {result.contrast >= 7 ? 'high contrast (bold shades suit you)' : result.contrast <= 3 ? 'low contrast (soft, blended shades suit you)' : 'medium contrast'}</Text>

          <View style={styles.shareCard}>
            <Text style={styles.shareCardEyebrow}>MY COLOR SEASON</Text>
            <Text style={styles.shareCardTitle}>{result.sub_season || result.season}</Text>
            <View style={styles.shareSwatches}>
              {result.palette.slice(0, 6).map((c, i) => (
                <View key={i} style={[styles.shareSwatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.shareCardBrand}>GlowUp</Text>
          </View>

          <Pressable style={styles.cta} onPress={share}>
            <Ionicons name="share-social" size={18} color="#fff" />
            <Text style={styles.ctaText}>Share my colors</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={() => { impactMedium(); setResult(null); }}><Text style={styles.ghostText}>Re-analyze</Text></Pressable>
          <Text style={styles.disclaimer}>Styling guidance for entertainment. Lighting affects results; re-scan in daylight for best accuracy.</Text>
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
  bandText: { color: C.pink, fontSize: 15, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' },
  sub: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  note: { color: C.textSoft, fontSize: 13, lineHeight: 19, marginTop: 10 },
  section: { color: C.text, fontSize: 15, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  preview: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginVertical: 18, borderWidth: 3, borderColor: C.pink },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 12 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  swatchSm: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  swatchAvoid: { opacity: 0.6 },
  swatchLg: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  lbItem: { alignItems: 'center', gap: 5 },
  lbLabel: { color: C.textSoft, fontSize: 12, fontWeight: '700' },
  contrastTrack: { height: 10, backgroundColor: C.track, borderRadius: 5, overflow: 'hidden' },
  contrastFill: { height: '100%', backgroundColor: C.pink, borderRadius: 5 },
  shareCard: {
    width: '72%', aspectRatio: 9 / 16, alignSelf: 'center', backgroundColor: C.card,
    borderRadius: 20, padding: 20, marginTop: 24, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  shareCardEyebrow: { color: C.pink, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  shareCardTitle: { color: C.text, fontSize: 22, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  shareSwatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 },
  shareSwatch: { width: 36, height: 36, borderRadius: 10 },
  shareCardBrand: { color: C.textSoft, fontSize: 11, fontWeight: '700', marginTop: 'auto' },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: C.pink, borderRadius: 28, paddingVertical: 16, marginTop: 24 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: C.pink, fontSize: 14, fontWeight: '700' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { color: C.textSoft, fontSize: 11, lineHeight: 16, marginTop: 14, textAlign: 'center' },
});
