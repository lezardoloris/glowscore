import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { impactMedium } from '../src/services/haptics';
import { trackScreen } from '../src/services/analytics';

/**
 * Chrono / Circadian skincare planner (2026 trend). Static, science-led guidance
 * synced to the skin's day vs night cycle. Wellness only, not medical advice.
 */
type Step = { time: string; title: string; detail: string; icon: keyof typeof Ionicons.glyphMap };

const AM: Step[] = [
  { time: '7:00', title: 'Gentle cleanse', detail: 'Rinse off overnight sebum. Skip harsh foaming in the morning.', icon: 'water-outline' },
  { time: '7:05', title: 'Antioxidant serum', detail: 'Vitamin C defends against daytime free radicals and UV stress.', icon: 'sunny-outline' },
  { time: '7:08', title: 'Lightweight moisturizer', detail: 'Skin loses water fastest midday. Lock in hydration early.', icon: 'leaf-outline' },
  { time: '7:10', title: 'SPF 50 (non-negotiable)', detail: 'Reapply every 2h outdoors. The single biggest anti-aging habit.', icon: 'shield-checkmark-outline' },
];

const PM: Step[] = [
  { time: '21:00', title: 'Double cleanse', detail: 'Oil then gel to remove SPF, makeup and pollution.', icon: 'water-outline' },
  { time: '21:10', title: 'Actives (retinol / exfoliant)', detail: 'Cell turnover and repair peak at night. Alternate nights; never with vitamin C.', icon: 'moon-outline' },
  { time: '21:15', title: 'Peptides / barrier cream', detail: 'Trans-epidermal water loss is highest overnight. Seal it in.', icon: 'shield-outline' },
  { time: '21:20', title: 'Sleep 7-8h', detail: 'Growth hormone and skin recovery peak in deep sleep. This is the real treatment.', icon: 'bed-outline' },
];

export default function ChronoSkincareScreen() {
  const [tab, setTab] = useState<'am' | 'pm'>('am');
  useEffect(() => { trackScreen('chrono_skincare'); }, []);
  const steps = tab === 'am' ? AM : PM;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>
      <Text style={styles.eyebrow}>CHRONO-SKINCARE</Text>
      <Text style={styles.title}>Sync to your skin clock</Text>
      <Text style={styles.sub}>Your skin protects by day and repairs by night. Apply the right step at the right time for maximum effect.</Text>

      <View style={styles.tabs}>
        {(['am', 'pm'] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => { impactMedium(); setTab(t); }}>
            <Ionicons name={t === 'am' ? 'sunny' : 'moon'} size={16} color={tab === t ? '#fff' : C.pink} />
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t === 'am' ? 'Morning' : 'Evening'}</Text>
          </Pressable>
        ))}
      </View>

      {steps.map((s, i) => (
        <View key={i} style={styles.step}>
          <View style={styles.timeCol}>
            <View style={styles.dot}><Ionicons name={s.icon} size={16} color={C.pink} /></View>
            {i < steps.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.stepBody}>
            <View style={styles.stepHead}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepTime}>{s.time}</Text>
            </View>
            <Text style={styles.stepDetail}>{s.detail}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.disclaimer}>General wellness guidance, not medical advice. Patch-test new actives and introduce one at a time.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 60 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: { color: C.pink, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: C.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  sub: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginTop: 8 },
  tabs: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 18 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.card, borderRadius: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: 'transparent' },
  tabOn: { backgroundColor: C.pink, borderColor: C.pink },
  tabText: { color: C.pink, fontSize: 14, fontWeight: '800' },
  tabTextOn: { color: '#fff' },
  step: { flexDirection: 'row', gap: 12 },
  timeCol: { alignItems: 'center', width: 36 },
  dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, backgroundColor: C.border, marginVertical: 2 },
  stepBody: { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 15, marginBottom: 12 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { color: C.text, fontSize: 15, fontWeight: '800', flex: 1 },
  stepTime: { color: C.pink, fontSize: 12.5, fontWeight: '800' },
  stepDetail: { color: C.textSoft, fontSize: 13, lineHeight: 19, marginTop: 4 },
  disclaimer: { color: C.textSoft, fontSize: 11, lineHeight: 16, marginTop: 12, textAlign: 'center' },
});
