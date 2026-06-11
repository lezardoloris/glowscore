import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { backgroundRemoval } from '../src/services/featureService';

export default function BackgroundRemovalScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('background_removal');
  }, []);

  async function generate() {
    if (!imageUri) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('background_removal_start', {});
      const resultUrl = await backgroundRemoval(imageUri);
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'background_removal', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Background removal failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Remove Background</Text>
      <Text style={styles.subtitle}>Instantly remove the background from your photo</Text>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewLarge} />
          <View style={styles.checkerboard} />
        </View>
      )}

      {/* Info cards */}
      <View style={styles.infoList}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>AI</Text>
          <Text style={styles.infoText}>AI-powered portrait detection</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>PNG</Text>
          <Text style={styles.infoText}>Clean transparent PNG output</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>FREE</Text>
          <Text style={styles.infoText}>5 free removals per day</Text>
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, loading && styles.ctaDisabled]}
        onPress={generate}
        disabled={loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Removing...' : 'Remove Background'}</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Uses AI portrait segmentation for clean cutouts.
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
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  imageContainer: { position: 'relative', marginBottom: 24 },
  previewLarge: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 1,
  },
  checkerboard: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoList: { width: '100%', gap: 8, marginBottom: 32 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4ade80',
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  infoText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
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
