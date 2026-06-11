import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { instantStyle } from '../src/services/featureService';

interface ArtStyle {
  id: string;
  name: string;
  icon: string;
}

const ART_STYLES: ArtStyle[] = [
  { id: 'anime', name: 'Anime', icon: '🎌' },
  { id: 'oil_painting', name: 'Oil Painting', icon: '🖼️' },
  { id: '3d_render', name: '3D Render', icon: '🧊' },
  { id: 'pixar', name: 'Pixar', icon: '🧸' },
  { id: 'watercolor', name: 'Watercolor', icon: '🎨' },
  { id: 'comic', name: 'Comic', icon: '💥' },
];

export default function InstantStyleScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('instant_style');
  }, []);

  async function generate() {
    if (!imageUri || !selectedStyle) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('instant_style_start', { style: selectedStyle });
      const resultUrl = await instantStyle(imageUri, selectedStyle, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: `art_${selectedStyle}`, isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Style transfer failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Art Style</Text>
      <Text style={styles.subtitle}>Turn your photo into a masterpiece</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Horizontal scroll of style pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContainer}>
        {ART_STYLES.map((style) => (
          <Pressable
            key={style.id}
            style={[styles.pill, selectedStyle === style.id && styles.pillActive]}
            onPress={() => setSelectedStyle(style.id)}
          >
            <Text style={styles.pillIcon}>{style.icon}</Text>
            <Text style={[styles.pillText, selectedStyle === style.id && styles.pillTextActive]}>
              {style.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!selectedStyle || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!selectedStyle || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Creating...' : 'Apply Style'}</Text>
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
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 24 },
  pillScroll: { width: '100%', marginBottom: 32 },
  pillContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(236,72,153,0.2)',
    borderColor: 'rgba(236,72,153,0.5)',
  },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  pillTextActive: { color: '#ec4899' },
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
