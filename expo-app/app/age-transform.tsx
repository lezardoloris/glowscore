import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { ageTransform } from '../src/services/featureService';

interface AgeOption {
  age: number;
  label: string;
  icon: string;
}

const AGE_OPTIONS: AgeOption[] = [
  { age: 5, label: 'Baby', icon: '👶' },
  { age: 15, label: 'Teen', icon: '🧑' },
  { age: 25, label: 'Young Adult', icon: '🧑‍🎓' },
  { age: 40, label: 'Middle Age', icon: '🧑‍💼' },
  { age: 60, label: 'Senior', icon: '🧓' },
  { age: 80, label: 'Elder', icon: '👴' },
];

export default function AgeTransformScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('age_transform');
  }, []);

  async function generate() {
    if (!imageUri || selectedAge === null) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('age_transform_start', { targetAge: selectedAge });
      const resultUrl = await ageTransform(imageUri, selectedAge, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'age_transform', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Age transformation failed.');
    } finally {
      setLoading(false);
    }
  }

  const ageOption = AGE_OPTIONS.find(o => o.age === selectedAge);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Age Machine</Text>
      <Text style={styles.subtitle}>See yourself at any age</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Age buttons */}
      <View style={styles.ageRow}>
        {AGE_OPTIONS.map((option) => (
          <Pressable
            key={option.age}
            style={[styles.ageBtn, selectedAge === option.age && styles.ageBtnActive]}
            onPress={() => setSelectedAge(option.age)}
          >
            <Text style={styles.ageIcon}>{option.icon}</Text>
            <Text style={[styles.ageNum, selectedAge === option.age && styles.ageNumActive]}>
              {option.age}
            </Text>
            <Text style={[styles.ageLabel, selectedAge === option.age && styles.ageLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (selectedAge === null || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={selectedAge === null || loading}
      >
        <Text style={styles.ctaText}>
          {loading ? 'Transforming...' : selectedAge !== null ? `See Yourself at ${selectedAge}` : 'Select an Age'}
        </Text>
      </Pressable>
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
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
    marginBottom: 32,
  },
  ageBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 80,
  },
  ageBtnActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  ageIcon: { fontSize: 24, marginBottom: 4 },
  ageNum: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  ageNumActive: { color: '#ec4899' },
  ageLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  ageLabelActive: { color: 'rgba(236,72,153,0.7)' },
  errorText: { fontSize: 14, color: '#f87171', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
