import { View, Text, Image, StyleSheet } from 'react-native';
import { GlowScore } from '../services/faceScan';
import GlowRing from './GlowRing';

const PINK = '#ec4899';

function scoreColor(v: number) {
  if (v >= 80) return '#4ade80';
  if (v >= 65) return '#facc15';
  if (v >= 50) return '#fb923c';
  return '#f87171';
}

/**
 * Branded, screenshot/capture-ready GlowScore card (9:16) used as the viral
 * share asset. Rendered off-screen and captured with react-native-view-shot.
 */
export default function ShareCard({ score, imageUri }: { score: GlowScore; imageUri?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>My GlowScore</Text>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.avatar} /> : null}

      <View style={{ marginBottom: 14 }}>
        <GlowRing score={score.overall} size={172} stroke={12} color={scoreColor(score.overall)}>
          <Text style={[styles.score, { color: scoreColor(score.overall) }]}>{score.overall}</Text>
          <Text style={styles.outOf}>/ 100</Text>
        </GlowRing>
      </View>

      <View style={styles.pill}>
        <Text style={styles.pillText}>Top {Math.max(1, 100 - score.percentile)}%</Text>
      </View>

      <Text style={styles.potential}>
        Glow-up potential <Text style={styles.potentialNum}>{score.potential}</Text>
      </Text>

      <View style={styles.footer}>
        <Text style={styles.brand}>GlowUp AI</Text>
        <Text style={styles.sub}>What's your GlowScore?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    backgroundColor: '#0a0118',
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 20 },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 18 },
  ring: { width: 168, height: 168, borderRadius: 84, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  score: { fontSize: 64, fontWeight: '900' },
  outOf: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: -8 },
  pill: { backgroundColor: 'rgba(236,72,153,0.18)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 14 },
  pillText: { color: PINK, fontSize: 16, fontWeight: '800' },
  potential: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  potentialNum: { color: '#c084fc', fontWeight: '900', fontSize: 18 },
  footer: { position: 'absolute', bottom: 48, alignItems: 'center' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 },
});
