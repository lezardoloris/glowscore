import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { fitnessTransform } from '../src/services/featureService';

interface Intensity {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

const INTENSITIES: Intensity[] = [
  { id: 'light', name: 'Light', icon: '🏃', desc: 'Subtle toning' },
  { id: 'moderate', name: 'Moderate', icon: '💪', desc: 'Athletic build' },
  { id: 'dramatic', name: 'Dramatic', icon: '🔥', desc: 'Peak fitness' },
];

export default function FitnessTransformScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedIntensity, setSelectedIntensity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('fitness_transform');
  }, []);

  async function generate() {
    if (!imageUri || !selectedIntensity) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('fitness_transform_start', { intensity: selectedIntensity });
      const resultUrl = await fitnessTransform(imageUri, selectedIntensity);
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'fitness_transform', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Fitness transformation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Fitness Transform</Text>
      <Text style={styles.subtitle}>Visualize your fitness goals</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Intensity cards */}
      <View style={styles.intensityRow}>
        {INTENSITIES.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.intensityCard, selectedIntensity === item.id && styles.intensityCardActive]}
            onPress={() => setSelectedIntensity(item.id)}
          >
            <Text style={styles.intensityIcon}>{item.icon}</Text>
            <Text style={[styles.intensityName, selectedIntensity === item.id && styles.intensityNameActive]}>
              {item.name}
            </Text>
            <Text style={[styles.intensityDesc, selectedIntensity === item.id && styles.intensityDescActive]}>
              {item.desc}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!selectedIntensity || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!selectedIntensity || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Transforming...' : 'Transform'}</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        AI visualization for motivation only. Results are artistic representations.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 32 },
  intensityRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  intensityCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  intensityCardActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  intensityIcon: { fontSize: 24, marginBottom: 6 },
  intensityName: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  intensityNameActive: { color: '#ec4899' },
  intensityDesc: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  intensityDescActive: { color: 'rgba(236,72,153,0.7)' },
  errorText: { fontSize: 14, color: '#f87171', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center' },
});
