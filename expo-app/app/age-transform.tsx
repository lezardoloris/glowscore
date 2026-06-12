import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { ageTransform } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

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

    const sub = await checkSubscription();
    if (!sub) {
      router.push('/pricing');
      return;
    }

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
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
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
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textSoft, marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: C.border, marginBottom: 32 },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
    marginBottom: 32,
  },
  ageBtn: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 80,
  },
  ageBtnActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  ageIcon: { fontSize: 24, marginBottom: 4 },
  ageNum: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 2 },
  ageNumActive: { color: C.pink },
  ageLabel: { fontSize: 10, color: C.textSoft },
  ageLabelActive: { color: C.pink },
  errorText: { fontSize: 14, color: '#D14343', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: C.pink,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
