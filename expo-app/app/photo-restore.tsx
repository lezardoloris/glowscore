import { View, Text, Pressable, Image, ScrollView, Switch, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { photoRestore } from '../src/services/featureService';

export default function PhotoRestoreScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [fixColors, setFixColors] = useState(true);
  const [removeScratches, setRemoveScratches] = useState(true);
  const [enhanceResolution, setEnhanceResolution] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('photo_restore');
  }, []);

  async function generate() {
    if (!imageUri) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('photo_restore_start', { fixColors, removeScratches, enhanceResolution });
      const resultUrl = await photoRestore(imageUri, fixColors, removeScratches, enhanceResolution);
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'photo_restore', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Photo restoration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Photo Restore</Text>
      <Text style={styles.subtitle}>Restore old, scratched, or faded photos</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Toggle options */}
      <View style={styles.toggleList}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Fix Colors</Text>
          <Switch
            value={fixColors}
            onValueChange={setFixColors}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(236,72,153,0.5)' }}
            thumbColor={fixColors ? '#ec4899' : 'rgba(255,255,255,0.4)'}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Remove Scratches</Text>
          <Switch
            value={removeScratches}
            onValueChange={setRemoveScratches}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(236,72,153,0.5)' }}
            thumbColor={removeScratches ? '#ec4899' : 'rgba(255,255,255,0.4)'}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Enhance Resolution</Text>
          <Switch
            value={enhanceResolution}
            onValueChange={setEnhanceResolution}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(236,72,153,0.5)' }}
            thumbColor={enhanceResolution ? '#ec4899' : 'rgba(255,255,255,0.4)'}
          />
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, loading && styles.ctaDisabled]}
        onPress={generate}
        disabled={loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Restoring...' : 'Restore Photo'}</Text>
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
  preview: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 24,
  },
  toggleList: { width: '100%', gap: 10, marginBottom: 32 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
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
