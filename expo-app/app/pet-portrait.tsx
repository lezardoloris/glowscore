import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { petPortrait } from '../src/services/featureService';

interface PetStyle {
  id: string;
  name: string;
  icon: string;
}

const PET_STYLES: PetStyle[] = [
  { id: 'royal', name: 'Royal', icon: '👑' },
  { id: 'superhero', name: 'Superhero', icon: '🦸' },
  { id: 'astronaut', name: 'Astronaut', icon: '🚀' },
  { id: 'renaissance', name: 'Renaissance', icon: '🎨' },
  { id: 'anime', name: 'Anime', icon: '🌸' },
  { id: 'detective', name: 'Detective', icon: '🔍' },
  { id: 'wizard', name: 'Wizard', icon: '🧙' },
  { id: 'chef', name: 'Chef', icon: '👨‍🍳' },
];

export default function PetPortraitScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('pet_portrait');
  }, []);

  async function generate() {
    if (!imageUri || !selectedStyle) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('pet_portrait_start', { style: selectedStyle });
      const resultUrl = await petPortrait(imageUri, selectedStyle);
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'pet_portrait', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Pet portrait failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Pet Portrait</Text>
      <Text style={styles.subtitle}>Transform your pet into a character</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Style grid */}
      <View style={styles.grid}>
        {PET_STYLES.map((style) => (
          <Pressable
            key={style.id}
            style={[styles.card, selectedStyle === style.id && styles.cardActive]}
            onPress={() => setSelectedStyle(style.id)}
          >
            <Text style={styles.cardIcon}>{style.icon}</Text>
            <Text style={[styles.cardName, selectedStyle === style.id && styles.cardNameActive]}>
              {style.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!selectedStyle || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!selectedStyle || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Creating...' : 'Create Portrait'}</Text>
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
  preview: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    gap: 8,
  },
  cardActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  cardIcon: { fontSize: 20 },
  cardName: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  cardNameActive: { color: '#ec4899' },
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
