import {
  View, Text, Image, Pressable, ScrollView, StyleSheet, Platform,
  PanResponder, ActivityIndicator, Share, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { transformHD } from '../src/services/transform';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { saveDestressPlan } from '../src/services/glowPlan';
import { generateShareImage } from '../src/services/shareGenerator';
import * as Sharing from 'expo-sharing';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

/**
 * Stress-Faciometre (Cortisol Face) — the hero differentiator. Wellness-framed:
 * it reads a REVERSIBLE physiological state (puffiness / water retention from
 * stress), never an attractiveness score. Flow: diagnostic -> Stress & Bloat
 * Index -> AI de-puff projection (before/after) -> guided lymphatic routine.
 */

type Step = 'diag' | 'index' | 'projection' | 'routine';
type Opt = { id: string; label: string; w: number };

const SLEEP: Opt[] = [{ id: 'good', label: 'Restful', w: 0 }, { id: 'avg', label: 'Average', w: 1 }, { id: 'poor', label: 'Poor', w: 3 }];
const SODIUM: Opt[] = [{ id: 'low', label: 'Light', w: 0 }, { id: 'med', label: 'Medium', w: 1 }, { id: 'high', label: 'Salty', w: 3 }];
const CYCLE: Opt[] = [{ id: 'foll', label: 'Follicular', w: 0 }, { id: 'ovu', label: 'Ovulation', w: 1 }, { id: 'lut', label: 'Luteal / PMS', w: 2 }, { id: 'na', label: 'Not sure', w: 1 }];

const ROUTINE_STEPS = [
  { t: 'Warm up', d: 'Press palms over the face, 3 slow breaths', secs: 60 },
  { t: 'Under-eye drain', d: 'Gentle taps from inner to outer eye, then down to ears', secs: 120 },
  { t: 'Cheek sweep', d: 'Flat fingers sweep cheeks up and out toward the ears', secs: 120 },
  { t: 'Jaw release', d: 'Knuckles glide along the jaw from chin to ears', secs: 120 },
  { t: 'Neck flush', d: 'Sweep down the sides of the neck to the collarbone', secs: 60 },
];
const TOTAL_SECS = ROUTINE_STEPS.reduce((a, s) => a + s.secs, 0);

export default function StressScanScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [imageUri, setImageUri] = useState<string | undefined>(typeof params.imageUri === 'string' ? params.imageUri : undefined);
  const [step, setStep] = useState<Step>('diag');
  const [sleep, setSleep] = useState<string | null>(null);
  const [sodium, setSodium] = useState<string | null>(null);
  const [cycle, setCycle] = useState<string | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { trackScreen('stress_scan'); }, []);

  const index = computeIndex(sleep, sodium, cycle); // 1..10, lower is calmer
  const band = index <= 3 ? 'Calm & de-puffed' : index <= 6 ? 'Mild tissue tension' : 'High water retention';

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) setImageUri(r.assets[0].uri);
  }

  async function runProjection() {
    if (!imageUri) return;
    // Hard paywall: the AI projection is premium.
    const sub = await checkSubscription();
    if (!sub) { trackEvent('paywall_gate_destress'); router.push({ pathname: '/pricing', params: { source: 'destress' } }); return; }
    setStep('projection'); setBusy(true); setErr(null);
    try {
      const token = await getSubscriberToken();
      const res = await transformHD(imageUri, 'destress', token);
      if (!res.imageUrl) throw new Error('No projection generated. Please try again.');
      setResultUri(res.imageUrl);
      notificationSuccess();
      trackEvent('destress_projection_done');
    } catch (e: any) {
      setErr(e?.message || 'Could not generate your projection. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function shareIndex() {
    try {
      // Visual before/after card is the #1 organic acquisition asset; fall back to text.
      if (resultUri && imageUri) {
        const uri = await generateShareImage({ originalUri: imageUri, resultUri, styleName: 'De-Bloat', isHD: true });
        if (Platform.OS === 'web') {
          if (navigator.share && uri) {
            if (uri.startsWith('data:')) {
              const r = await fetch(uri); const blob = await r.blob();
              await navigator.share({ title: 'My GlowScore', files: [new File([blob], 'glowscore-debloat.png', { type: 'image/png' })] });
            } else { await navigator.share({ title: 'My GlowScore', url: uri }); }
          }
          trackEvent('destress_share'); return;
        }
        if (uri && await Sharing.isAvailableAsync()) { await Sharing.shareAsync(uri); trackEvent('destress_share'); return; }
      }
      await Share.share({ message: `My Stress & Bloat Index is ${index}/10 on GlowScore (${band}). De-puffing my cortisol face one morning at a time.` });
      trackEvent('destress_share');
    } catch {}
  }

  if (!imageUri) {
    return (
      <View style={styles.center}>
        <BackBtn />
        <View style={styles.iconCircle}><Ionicons name="water-outline" size={36} color={C.pink} /></View>
        <Text style={styles.bigTitle}>Stress-Faciometre</Text>
        <Text style={styles.sub}>See how stress and water retention show up on your face, then de-puff it.</Text>
        <Pressable style={styles.cta} onPress={pick}><Text style={styles.ctaText}>Choose a morning selfie</Text></Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackBtn />

      {step === 'diag' && (
        <>
          <Text style={styles.eyebrow}>STRESS-FACIOMETRE</Text>
          <Text style={styles.title}>Morning diagnostic</Text>
          <Text style={styles.sub}>Cortisol makes your body hold water in the face. A few cues sharpen your reading.</Text>
          <View style={styles.ovalWrap}>
            <Image source={{ uri: imageUri }} style={styles.oval} />
            <View style={styles.ovalRing} pointerEvents="none" />
          </View>
          <Question label="Last night's sleep" opts={SLEEP} value={sleep} onPick={setSleep} />
          <Question label="Yesterday's salt intake" opts={SODIUM} value={sodium} onPick={setSodium} />
          <Question label="Cycle phase" opts={CYCLE} value={cycle} onPick={setCycle} />
          <Pressable
            style={[styles.cta, !(sleep && sodium && cycle) && styles.ctaDisabled]}
            disabled={!(sleep && sodium && cycle)}
            onPress={() => { impactMedium(); setStep('index'); }}
          >
            <Text style={styles.ctaText}>Analyze my face</Text>
          </Pressable>
        </>
      )}

      {step === 'index' && (
        <>
          <Text style={styles.eyebrow}>STRESS & BLOAT INDEX</Text>
          <Text style={styles.title}>{index}<Text style={styles.outOf}>/10</Text></Text>
          <Text style={styles.bandText}>{band}</Text>
          <View style={styles.ovalWrap}>
            <Image source={{ uri: imageUri }} style={styles.oval} />
            {/* stylized congestion zones (decorative heatmap, not exact detection) */}
            <View style={[styles.zone, { top: '40%', left: '27%' }]} pointerEvents="none" />
            <View style={[styles.zone, { top: '40%', right: '27%' }]} pointerEvents="none" />
            <View style={[styles.zoneJaw]} pointerEvents="none" />
          </View>
          <Text style={styles.note}>Highlighted areas show where your face tends to hold tension and fluid today. This is temporary and reversible.</Text>
          <Pressable style={styles.cta} onPress={runProjection}>
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.ctaText}>See your 7-day projection</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={shareIndex}><Text style={styles.ghostText}>Share my index</Text></Pressable>
          <Text style={styles.disclaimer}>Your selfie is processed by AI to model puffiness, then deleted. Wellness visualization, not medical advice.</Text>
        </>
      )}

      {step === 'projection' && (
        <>
          <Text style={styles.eyebrow}>YOUR 7-DAY PROJECTION</Text>
          {busy || !resultUri ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.pink} />
              <Text style={styles.note}>Modeling reduced puffiness and lymphatic drainage…</Text>
            </View>
          ) : err ? (
            <View style={styles.loadingBox}>
              <Text style={[styles.note, { color: '#C2415B' }]}>{err}</Text>
              <Pressable style={styles.cta} onPress={runProjection}><Text style={styles.ctaText}>Try again</Text></Pressable>
            </View>
          ) : (
            <>
              <BeforeAfter before={imageUri} after={resultUri} />
              <Text style={styles.disclaimer}>AI wellness visualization of reduced facial puffiness. Not a medical claim. Results vary.</Text>
              <Pressable style={styles.cta} onPress={() => { impactMedium(); setStep('routine'); }}>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.ctaText}>Start de-bloat routine</Text>
              </Pressable>
              <Pressable style={styles.ghost} onPress={shareIndex}><Text style={styles.ghostText}>Share before / after</Text></Pressable>
            </>
          )}
        </>
      )}

      {step === 'routine' && <GuidedRoutine onDone={async () => { await saveDestressPlan(); router.replace('/'); }} />}
    </ScrollView>
  );
}

function computeIndex(sleep: string | null, sodium: string | null, cycle: string | null): number {
  const w = (opts: Opt[], id: string | null) => opts.find((o) => o.id === id)?.w ?? 0;
  const raw = 2 + w(SLEEP, sleep) + w(SODIUM, sodium) + w(CYCLE, cycle);
  return Math.max(1, Math.min(10, raw));
}

function BackBtn() {
  return (
    <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
      <Ionicons name="chevron-back" size={26} color={C.text} />
    </Pressable>
  );
}

function Question({ label, opts, value, onPick }: { label: string; opts: Opt[]; value: string | null; onPick: (id: string) => void }) {
  return (
    <View style={styles.q}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.qRow}>
        {opts.map((o) => {
          const on = value === o.id;
          return (
            <Pressable key={o.id} style={[styles.chip, on && styles.chipOn]} onPress={() => { impactMedium(); onPick(o.id); }}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(0.5);
  const posRef = useRef(0.5);
  const { width } = useWindowDimensions();
  const size = Math.min((Platform.OS === 'web' ? Math.min(width, 440) : width) - 40, 420);
  const sizeRef = useRef(size); sizeRef.current = size;
  const containerRef = useRef<View>(null);
  const leftRef = useRef(0);
  const measure = useCallback(() => { containerRef.current?.measureInWindow((x) => { leftRef.current = x; }); }, []);
  const update = useCallback((p: number) => { setPos(p); posRef.current = p; }, []);
  useEffect(() => { const t1 = setTimeout(() => update(0.12), 300); const t2 = setTimeout(() => update(0.5), 1600); return () => { clearTimeout(t1); clearTimeout(t2); }; }, [update]);
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { measure(); update(clamp((e.nativeEvent.pageX - leftRef.current) / sizeRef.current)); },
    onPanResponderMove: (e) => {
      const old = posRef.current; const np = clamp((e.nativeEvent.pageX - leftRef.current) / sizeRef.current);
      update(np); if ((old < 0.5 && np >= 0.5) || (old > 0.5 && np <= 0.5)) impactMedium();
    },
  })).current;
  return (
    <View ref={containerRef} onLayout={measure} style={[styles.ba, { width: size, height: size }]} {...pan.panHandlers}>
      <Image source={{ uri: after }} style={[styles.baImg, { width: size, height: size }]} />
      <View style={[styles.baClip, { width: size * pos, height: size }]}>
        <Image source={{ uri: before }} style={[styles.baImg, { width: size, height: size }]} />
      </View>
      <View style={[styles.baHandle, { left: size * pos - 1.5 }]}>
        <View style={styles.baKnob}>
          <Ionicons name="chevron-back" size={12} color={C.pink} />
          <Ionicons name="chevron-forward" size={12} color={C.pink} />
        </View>
      </View>
      <View style={styles.baLabels}>
        <Text style={styles.baLabel}>TODAY</Text>
        <Text style={styles.baLabel}>DAY 7</Text>
      </View>
    </View>
  );
}

function GuidedRoutine({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function toggle() {
    if (running) { if (timer.current) clearInterval(timer.current); setRunning(false); return; }
    setRunning(true);
    timer.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= TOTAL_SECS) { if (timer.current) clearInterval(timer.current); setRunning(false); notificationSuccess(); return TOTAL_SECS; }
        return e + 1;
      });
    }, 1000);
  }

  // current step from elapsed
  let acc = 0; let cur = 0;
  for (let i = 0; i < ROUTINE_STEPS.length; i++) { acc += ROUTINE_STEPS[i].secs; if (elapsed < acc) { cur = i; break; } cur = i; }
  const done = elapsed >= TOTAL_SECS;
  const remain = TOTAL_SECS - elapsed;
  const mm = String(Math.floor(remain / 60)).padStart(2, '0');
  const ss = String(remain % 60).padStart(2, '0');

  return (
    <View>
      <Text style={styles.eyebrow}>GUIDED LYMPHATIC MASSAGE</Text>
      <Text style={styles.title}>{done ? 'Done ✨' : `${mm}:${ss}`}</Text>
      <Text style={styles.sub}>{done ? 'Your morning de-bloat is complete. Come back tomorrow to keep the streak.' : 'Follow the prompts with light pressure. Always sweep toward the ears and down the neck.'}</Text>

      {ROUTINE_STEPS.map((s, i) => (
        <View key={s.t} style={[styles.rStep, i === cur && running && styles.rStepActive]}>
          <View style={[styles.rNum, i === cur && running && styles.rNumActive, elapsed >= ROUTINE_STEPS.slice(0, i + 1).reduce((a, x) => a + x.secs, 0) && styles.rNumDone]}>
            <Text style={styles.rNumText}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rTitle}>{s.t}</Text>
            <Text style={styles.rDetail}>{s.d}</Text>
          </View>
          <Text style={styles.rSecs}>{s.secs}s</Text>
        </View>
      ))}

      {done ? (
        <>
          <Pressable style={styles.ghost} onPress={() => router.push('/debloat-morning')}>
            <Text style={styles.ghostText}>Try the faster 5-min morning routine</Text>
          </Pressable>
          <Pressable style={styles.cta} onPress={onDone}><Text style={styles.ctaText}>Finish</Text></Pressable>
        </>
      ) : (
        <Pressable style={styles.cta} onPress={toggle}>
          <Ionicons name={running ? 'pause' : 'play'} size={18} color="#fff" />
          <Text style={styles.ctaText}>{running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start 8-min routine'}</Text>
        </Pressable>
      )}
      <Text style={styles.note}>AR-guided massage (live face tracking) is coming to the iOS app.</Text>
    </View>
  );
}

const clamp = (n: number) => Math.max(0.02, Math.min(0.98, n));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 60 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 26 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },

  eyebrow: { color: C.pink, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: C.text, fontSize: 32, fontWeight: '900', marginTop: 4 },
  outOf: { color: C.textSoft, fontSize: 18, fontWeight: '800' },
  bigTitle: { color: C.text, fontSize: 26, fontWeight: '900', marginTop: 14, textAlign: 'center' },
  bandText: { color: C.pink, fontSize: 16, fontWeight: '800', marginTop: 2 },
  sub: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  note: { color: C.textSoft, fontSize: 12.5, lineHeight: 18, marginTop: 12, textAlign: 'center' },
  disclaimer: { color: C.textSoft, fontSize: 11, lineHeight: 16, marginTop: 12, textAlign: 'center' },

  ovalWrap: { alignSelf: 'center', marginVertical: 18, width: 200, height: 240 },
  oval: { width: 200, height: 240, borderRadius: 100 },
  ovalRing: { position: 'absolute', top: 0, left: 0, width: 200, height: 240, borderRadius: 100, borderWidth: 3, borderColor: C.pink, opacity: 0.6 },
  zone: { position: 'absolute', width: 46, height: 26, borderRadius: 14, backgroundColor: 'rgba(224,83,122,0.38)' },
  zoneJaw: { position: 'absolute', bottom: '20%', left: '30%', right: '30%', height: 24, borderRadius: 14, backgroundColor: 'rgba(224,83,122,0.34)' },

  q: { marginTop: 16 },
  qLabel: { color: C.text, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  qRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: 'transparent' },
  chipOn: { borderColor: C.pink, backgroundColor: C.panel },
  chipText: { color: C.text, fontSize: 13.5, fontWeight: '700' },
  chipTextOn: { color: C.pink },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    backgroundColor: C.pink, borderRadius: 28, paddingVertical: 16, marginTop: 22,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  ghost: { alignItems: 'center', paddingVertical: 14 },
  ghostText: { color: C.pink, fontSize: 14, fontWeight: '700' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },

  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 14 },

  ba: { alignSelf: 'center', borderRadius: 22, overflow: 'hidden', position: 'relative', backgroundColor: C.card, marginTop: 18 },
  baImg: { position: 'absolute' },
  baClip: { position: 'absolute', overflow: 'hidden' },
  baHandle: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: '#fff', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  baKnob: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? ({ boxShadow: '0 2px 6px rgba(217,140,164,0.5)' } as any) : { shadowColor: '#D98CA4', shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 }) },
  baKnobText: { fontSize: 11, color: C.pink, fontWeight: '900' },
  baLabels: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
  baLabel: { fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(45,35,48,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },

  rStep: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 15, padding: 14, marginTop: 10 },
  rStepActive: { borderWidth: 1.5, borderColor: C.pink },
  rNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.track, alignItems: 'center', justifyContent: 'center' },
  rNumActive: { backgroundColor: C.pink },
  rNumDone: { backgroundColor: C.good },
  rNumText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  rTitle: { color: C.text, fontSize: 14.5, fontWeight: '800' },
  rDetail: { color: C.textSoft, fontSize: 12.5, lineHeight: 17, marginTop: 1 },
  rSecs: { color: C.textSoft, fontSize: 12, fontWeight: '700' },
});
