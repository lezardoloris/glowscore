import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { fitnessTransform } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

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

    const sub = await checkSubscription();
    if (!sub) {
      router.push('/pricing');
      return;
    }

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
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
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
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textSoft, marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: C.border, marginBottom: 32 },
  intensityRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  intensityCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  intensityCardActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  intensityIcon: { fontSize: 24, marginBottom: 6 },
  intensityName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  intensityNameActive: { color: C.pink },
  intensityDesc: { fontSize: 10, color: C.textSoft, textAlign: 'center' },
  intensityDescActive: { color: C.pink },
  errorText: { fontSize: 14, color: '#D14343', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: C.pink,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center' },
});
