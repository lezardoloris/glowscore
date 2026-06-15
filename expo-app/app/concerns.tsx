import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CONCERNS, CONCERN_HEADS, MAX_CONCERNS } from '../src/config/concernHeads';
import { savePlanFromConcerns } from '../src/services/glowPlan';
import { impactMedium } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';

export default function ConcernsScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { trackScreen('concerns'); }, []);

  function toggle(id: string) {
    impactMedium();
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= MAX_CONCERNS) return s;
      return [...s, id];
    });
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
          <Ionicons name="chevron-back" size={26} color={C.text} />
        </Pressable>
        <Text style={styles.title}>What concerns you?</Text>
        <Text style={styles.sub}>Select up to {MAX_CONCERNS} priorities. Your plan adapts to what you pick.</Text>

        <View style={styles.grid}>
          {CONCERNS.map((c) => {
            const on = selected.includes(c.id);
            const disabled = !on && selected.length >= MAX_CONCERNS;
            return (
              <Pressable
                key={c.id}
                style={[styles.card, on && styles.cardOn, disabled && styles.cardDisabled]}
                onPress={() => toggle(c.id)}
                disabled={disabled}
              >
                <Image source={CONCERN_HEADS[c.id]} style={styles.head} />
                {on && (
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardSub}>{c.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.counter}>
          {selected.length} selected{selected.length >= MAX_CONCERNS ? ' · max reached' : ''}
        </Text>
        <Pressable onPress={cont} disabled={selected.length === 0}>
          <LinearGradient
            colors={selected.length ? C.pinkGrad : [C.trackLocked, C.trackLocked]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cta, selected.length === 0 && styles.ctaOff]}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', marginBottom: 10 },
  title: { ...typography.h2, fontFamily: fonts.displayBold },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 8, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '31.5%',
    backgroundColor: C.card,
    borderRadius: radii.md,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    ...shadow(1),
  },
  cardOn: { borderColor: C.pink, backgroundColor: C.blush },
  cardDisabled: { opacity: 0.45 },
  head: { width: '100%', height: 88, borderRadius: radii.sm, marginBottom: 6 },
  check: {
    position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.pink, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: C.text },
  cardSub: { fontFamily: fonts.body, fontSize: 10, color: C.textSoft, marginTop: 1 },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border },
  counter: { ...typography.caption, textAlign: 'center', marginBottom: 10, color: C.textSoft },
  cta: { borderRadius: radii.full, paddingVertical: 17, alignItems: 'center', ...shadow(2) },
  ctaOff: { opacity: 0.5 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 17 },
});
