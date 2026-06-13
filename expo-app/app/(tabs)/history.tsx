import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../../src/theme';
import { getScanHistory, ScanRecord } from '../../src/services/history';
import { getStreak } from '../../src/services/glowPlan';
import { trackScreen } from '../../src/services/analytics';

/**
 * Progress tab: the GlowScore timeline (EPIC 5.2). Shows the scan-over-time
 * story — score, delta vs previous scan, streak — instead of the legacy
 * transformation grid. This is the retention loop made visible.
 */
export default function ProgressScreen() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      trackScreen('progress');
      let active = true;
      (async () => {
        const [s, st] = await Promise.all([getScanHistory(), getStreak()]);
        if (active) { setScans(s); setStreak(st); }
      })();
      return () => { active = false; };
    }, [])
  );

  if (scans.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="trending-up" size={40} color={C.pink} />
        </View>
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptySub}>Scan your face to start tracking your glow-up over time.</Text>
        <Pressable style={styles.cta} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.ctaText}>Take Your First Scan</Text>
        </Pressable>
      </View>
    );
  }

  const latest = scans[0];
  const first = scans[scans.length - 1];
  const totalDelta = latest.overall - first.overall;
  const skinDelta = latest.skin - first.skin; // skin tracker: fastest-moving component

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Your Progress</Text>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{latest.overall}</Text>
          <Text style={styles.summaryLabel}>Current</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: totalDelta >= 0 ? C.good : '#D97742' }]}>
            {totalDelta >= 0 ? '+' : ''}{totalDelta}
          </Text>
          <Text style={styles.summaryLabel}>All time</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: skinDelta >= 0 ? C.good : '#D97742' }]}>
            {skinDelta >= 0 ? '+' : ''}{skinDelta}
          </Text>
          <Text style={styles.summaryLabel}>Skin</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="flame" size={17} color={C.pink} />
            <Text style={styles.summaryNum}>{streak}</Text>
          </View>
          <Text style={styles.summaryLabel}>Streak</Text>
        </View>
      </View>

      {/* Timeline */}
      {scans.map((scan, i) => {
        const prev = scans[i + 1];
        const delta = prev ? scan.overall - prev.overall : null;
        return (
          <View key={scan.id} style={styles.scanRow}>
            <View style={styles.scanRing}>
              <Text style={styles.scanScore}>{scan.overall}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scanDate}>{formatDate(scan.createdAt)}</Text>
              <Text style={styles.scanDetail}>
                Skin {scan.skin} · Symmetry {scan.symmetry} · Eyes {scan.eyes}
              </Text>
            </View>
            {delta != null && (
              <View style={[styles.deltaChip, { backgroundColor: delta >= 0 ? '#DDF3E4' : '#FBE9DC' }]}>
                <Text style={[styles.deltaText, { color: delta >= 0 ? C.good : '#D97742' }]}>
                  {delta >= 0 ? '+' : ''}{delta}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <Pressable style={styles.cta} onPress={() => router.push('/(tabs)')}>
        <Ionicons name="scan" size={18} color="#fff" />
        <Text style={styles.ctaText}>Re-scan now</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: Platform.OS === 'ios' ? 70 : 48, paddingHorizontal: 18, paddingBottom: 110 },
  header: { fontSize: 30, fontWeight: '900', color: C.text, marginBottom: 16 },

  summaryCard: {
    flexDirection: 'row', backgroundColor: C.card, borderRadius: 20, padding: 18,
    marginBottom: 18, alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 24, fontWeight: '900', color: C.text },
  summaryLabel: { fontSize: 11, color: C.textSoft, fontWeight: '700', marginTop: 2 },
  summaryDivider: { width: 1, height: 34, backgroundColor: C.bg },

  scanRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10,
  },
  scanRing: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 4, borderColor: C.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  scanScore: { fontSize: 16, fontWeight: '900', color: C.text },
  scanDate: { fontSize: 14, fontWeight: '800', color: C.text },
  scanDetail: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  deltaChip: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  deltaText: { fontSize: 13, fontWeight: '900' },

  empty: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: C.pinkSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.pink, borderRadius: 28, paddingVertical: 16, paddingHorizontal: 28, marginTop: 8,
    shadowColor: '#D98CA4', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
