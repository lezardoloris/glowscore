import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CONCERNS, CONCERN_HEADS } from '../src/config/concernHeads';
import { savePlanFromConcerns } from '../src/services/glowPlan';
import { impactMedium } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

/**
 * Premium dark "what do you want to improve" concern picker. Female-framed
 * equivalent of Mogged's purple 3D-head selector: feminine 3D heads with a
 * rose-pink glow on each concern zone. Multi-select, feeds the glow-up plan.
 */
const P = '#E0537A';

export default function ConcernsScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { trackScreen('concerns'); }, []);

  function toggle(id: string) {
    impactMedium();
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function cont() {
    trackEvent('concerns_selected', { count: selected.length });
    try { await AsyncStorage.setItem('glow_concerns', JSON.stringify(selected)); } catch {}
    const foci = selected.map((id) => CONCERNS.find((c) => c.id === id)?.focus).filter(Boolean) as string[];
    await savePlanFromConcerns(foci);
    router.replace('/glow-plan');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.title}>What do you want{'\n'}to improve?</Text>
        <Text style={styles.sub}>Pick everything you'd like to work on. Your plan adapts to what you select.</Text>

        <View style={styles.grid}>
          {CONCERNS.map((c) => {
            const on = selected.includes(c.id);
            return (
              <Pressable key={c.id} style={[styles.card, on && styles.cardOn]} onPress={() => toggle(c.id)}>
                <Image source={CONCERN_HEADS[c.id]} style={styles.head} />
                {on && <View style={styles.check}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardSub}>{c.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.cta, selected.length === 0 && styles.ctaOff]} disabled={selected.length === 0} onPress={cont}>
          <Text style={styles.ctaText}>Continue{selected.length ? ` (${selected.length})` : ''}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14111A' },
  content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', marginBottom: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  sub: { color: '#A79CB0', fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48.5%', backgroundColor: '#1D1925', borderRadius: 18, padding: 12, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden' },
  cardOn: { borderColor: P, backgroundColor: '#241A22' },
  head: { width: '100%', height: 150, borderRadius: 12, marginBottom: 8 },
  check: { position: 'absolute', top: 18, right: 18, width: 24, height: 24, borderRadius: 12, backgroundColor: P, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cardSub: { color: '#A79CB0', fontSize: 12, marginTop: 2 },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: '#14111A' },
  cta: { backgroundColor: P, borderRadius: 28, paddingVertical: 17, alignItems: 'center' },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
