import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { faceSwap } from '../src/services/featureService';

interface TargetCategory {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: TargetCategory[] = [
  { id: 'celebrity', name: 'Celebrity', icon: '🌟' },
  { id: 'movie', name: 'Movie', icon: '🎬' },
  { id: 'magazine', name: 'Magazine', icon: '📰' },
  { id: 'historical', name: 'Historical', icon: '🏛️' },
  { id: 'superhero', name: 'Superhero', icon: '🦸' },
  { id: 'custom', name: 'Custom', icon: '📷' },
];

export default function FaceSwapScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [targetUri, setTargetUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('face_swap');
  }, []);

  async function pickTarget(category: string) {
    trackEvent('face_swap_category', { category });

    if (category === 'custom') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets[0]) {
        setTargetUri(result.assets[0].uri);
      }
      return;
    }

    // For non-custom categories, use the imageUri as placeholder target
    // In production, this would fetch from a curated library
    setTargetUri(imageUri || null);
  }

  async function generate() {
    if (!imageUri || !targetUri) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('face_swap_start');
      const resultUrl = await faceSwap(imageUri, targetUri, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'face_swap', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Face swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Face Swap</Text>
      <Text style={styles.subtitle}>Swap your face onto any photo</Text>

      {/* Source selfie */}
      {imageUri && (
        <View style={styles.photoRow}>
          <View style={styles.photoSlot}>
            <Image source={{ uri: imageUri }} style={styles.selfie} />
            <Text style={styles.photoLabel}>Your Photo</Text>
          </View>
          {targetUri && (
            <View style={styles.photoSlot}>
              <Image source={{ uri: targetUri }} style={styles.selfie} />
              <Text style={styles.photoLabel}>Target</Text>
            </View>
          )}
        </View>
      )}

      {/* Target categories */}
      <Text style={styles.sectionTitle}>Choose a Target</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.card, targetUri && cat.id !== 'custom' ? null : null]}
            onPress={() => pickTarget(cat.id)}
          >
            <Text style={styles.cardIcon}>{cat.icon}</Text>
            <Text style={styles.cardName}>{cat.name}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Generate button */}
      <Pressable
        style={[styles.cta, (!targetUri || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!targetUri || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Swapping...' : 'Swap Faces'}</Text>
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
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  photoRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  photoSlot: { alignItems: 'center' },
  selfie: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  photoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 16, alignSelf: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  card: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardIcon: { fontSize: 28, marginBottom: 6 },
  cardName: { fontSize: 12, fontWeight: '500', color: '#fff' },
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
