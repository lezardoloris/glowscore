import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../theme';
import { typography, fonts } from '../typography';
import { shadow } from '../shadows';
import { BODY_ZONES, BodyZoneId, DISCLAIMER, SEE_A_PRO } from '../data/bodyCareProtocols';
import { recommendProducts, contextFromQuiz } from '../services/recoEngine';
import { getQuizProfile } from '../services/quizProfile';
import { ProductRecoList } from './ProductRecoCard';
import { impactMedium } from '../services/haptics';
import { trackScreen, trackEvent } from '../services/analytics';

/**
 * Body Care Hub (EPIC PS-1). Zone selector -> one symptom question -> tailored protocol,
 * recos, and a calm medical off-ramp on fold/intertrigo zones. Used both as the pushed
 * stack screen (`/body-care`, showBack) and the persistent Body tab (no back chevron).
 */
export default function BodyCareHub({ showBack = false }: { showBack?: boolean }) {
  const [zone, setZone] = useState<BodyZoneId>('groin_thighs');
  const [symptom, setSymptom] = useState<string | null>(null);
  const [recos, setRecos] = useState<ReturnType<typeof recommendProducts>>([]);

  useEffect(() => { trackScreen('body_care'); }, []);

  // Reset the symptom answer whenever the zone changes.
  useEffect(() => { setSymptom(null); }, [zone]);

  useEffect(() => {
    (async () => {
      const quiz = await getQuizProfile();
      // The hub is the plus-size context by definition: every zone maps to a plus-size
      // concern, so we gate the persona reco rules (reco_031-035/048) explicitly.
      const ctx = contextFromQuiz(quiz, { persona: 'us_plus_size' });
      const z = BODY_ZONES.find((b) => b.id === zone);
      if (z) ctx.concerns = [...new Set([...ctx.concerns, z.concernId])];
      setRecos(recommendProducts(ctx, 4));
    })();
  }, [zone]);

  const protocol = useMemo(() => BODY_ZONES.find((z) => z.id === zone)!, [zone]);
  const picked = protocol.triage.options.find((o) => o.id === symptom) || null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {showBack && (
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={C.text} />
        </Pressable>
      )}

      <Image source={require('../../assets/components/bodycare.png')} style={styles.hero} resizeMode="cover" />

      <Text style={styles.eyebrow}>BODY GLOW CARE</Text>
      <Text style={styles.title}>Glow at any size</Text>
      <Text style={styles.sub}>Comfort-first protocols for folds and friction. Support your skin, never shame it.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zoneScroll} contentContainerStyle={styles.zoneRow}>
        {BODY_ZONES.map((z) => (
          <Pressable
            key={z.id}
            style={[styles.zoneChip, zone === z.id && styles.zoneChipOn]}
            onPress={() => { impactMedium(); setZone(z.id); }}
          >
            <Text style={[styles.zoneLabel, zone === z.id && styles.zoneLabelOn]}>{z.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* One symptom question, then a tailored tip (zone -> 1 question -> protocol). */}
      <View style={styles.triage}>
        <Text style={styles.triageQ}>{protocol.triage.question}</Text>
        <View style={styles.triageRow}>
          {protocol.triage.options.map((o) => {
            const on = symptom === o.id;
            return (
              <Pressable
                key={o.id}
                style={[styles.triageChip, on && styles.triageChipOn]}
                onPress={() => { impactMedium(); setSymptom(o.id); trackEvent('body_care_triage', { zone, symptom: o.id }); }}
              >
                <Text style={[styles.triageChipText, on && styles.triageChipTextOn]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {picked && (
          <View style={[styles.tip, picked.offramp && styles.tipOfframp]}>
            <Ionicons
              name={picked.offramp ? 'medkit-outline' : 'bulb-outline'}
              size={16}
              color={picked.offramp ? '#C2415B' : C.pink}
            />
            <Text style={[styles.tipText, picked.offramp && styles.tipTextOfframp]}>{picked.tip}</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, shadow(2)]}>
        <Text style={styles.zoneTitle}>{protocol.label}</Text>
        <Text style={styles.zoneSub}>{protocol.subtitle}</Text>

        <View style={styles.weekRow}>
          <Ionicons name="calendar-outline" size={14} color={C.pink} />
          <Text style={styles.weekLabel}>This week</Text>
        </View>
        <Text style={styles.weekText}>{protocol.thisWeek}</Text>

        {protocol.steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDetail}>{s.detail}</Text>
            </View>
          </View>
        ))}

        {/* Calm "better to skip" chips, not an alarm box. */}
        <Text style={styles.avoidTitle}>Better to skip on irritated skin</Text>
        <View style={styles.avoidRow}>
          {protocol.avoid.map((a) => (
            <View key={a} style={styles.avoidChip}>
              <Text style={styles.avoidChipText}>{a}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.timeline}>{protocol.timelineNote}</Text>

        {/* Medical off-ramp: always present on fold/intertrigo zones (PS-1.2). */}
        {protocol.medicalOfframp && (
          <View style={styles.proRow}>
            <Ionicons name="medkit-outline" size={15} color={C.textSoft} />
            <Text style={styles.proText}>{SEE_A_PRO}</Text>
          </View>
        )}
      </View>

      <ProductRecoList recos={recos} />

      <Pressable style={styles.linkRow} onPress={() => router.push('/skin-change-track')}>
        <Ionicons name="images-outline" size={18} color={C.pink} />
        <Text style={styles.linkText}>Track skin through change (photo journal)</Text>
        <Ionicons name="chevron-forward" size={16} color={C.textSoft} />
      </Pressable>

      <Pressable style={styles.linkRow} onPress={() => router.push('/makeup-round-face')}>
        <Ionicons name="brush-outline" size={18} color={C.pink} />
        <Text style={styles.linkText}>Makeup for round face guide</Text>
        <Ionicons name="chevron-forward" size={16} color={C.textSoft} />
      </Pressable>

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 48 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  hero: { width: '100%', height: 150, borderRadius: radii.xl, marginBottom: 16, backgroundColor: C.panel },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 8, marginBottom: 16 },
  zoneScroll: { marginBottom: 14 },
  zoneRow: { gap: 8, paddingRight: 8 },
  zoneChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.full, backgroundColor: C.card, ...shadow(1) },
  zoneChipOn: { backgroundColor: C.pink },
  zoneLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: C.textSoft },
  zoneLabelOn: { color: '#fff' },

  triage: { marginBottom: 14 },
  triageQ: { fontFamily: fonts.bodyBold, fontSize: 14.5, color: C.text, marginBottom: 8 },
  triageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triageChip: { backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1.5, borderColor: 'transparent', ...shadow(1) },
  triageChipOn: { borderColor: C.pink, backgroundColor: C.panel },
  triageChipText: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: C.text },
  triageChipTextOn: { color: C.pink },
  tip: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: C.cream, borderRadius: radii.md, padding: 12, marginTop: 10 },
  tipOfframp: { backgroundColor: '#FDF4F7' },
  tipText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, color: C.text, lineHeight: 18 },
  tipTextOfframp: { color: '#C2415B' },

  card: { backgroundColor: C.card, borderRadius: radii.xl, padding: 18 },
  zoneTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: C.text },
  zoneSub: { fontFamily: fonts.body, fontSize: 13, color: C.pink, marginTop: 4, marginBottom: 14 },

  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  weekLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: C.pink, letterSpacing: 0.6, textTransform: 'uppercase' },
  weekText: { fontFamily: fonts.body, fontSize: 13, color: C.text, lineHeight: 18, marginBottom: 14 },

  step: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.bodyBold, fontSize: 12, color: C.pink },
  stepTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text },
  stepDetail: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginTop: 2, lineHeight: 18 },

  avoidTitle: { fontFamily: fonts.bodySemi, fontSize: 12.5, color: C.textSoft, marginTop: 6, marginBottom: 8 },
  avoidRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  avoidChip: { backgroundColor: C.blush, borderRadius: radii.full, paddingHorizontal: 11, paddingVertical: 6 },
  avoidChipText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: '#A85B72' },

  timeline: { ...typography.caption, marginTop: 14, textAlign: 'center' },
  proRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.track },
  proText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: C.textSoft, lineHeight: 17 },

  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: radii.lg, padding: 14, marginTop: 12, ...shadow(1) },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 14, color: C.text, flex: 1 },
  disclaimer: { ...typography.caption, textAlign: 'center', marginTop: 20 },
});
