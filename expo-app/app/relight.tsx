import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { relight as relightApi } from '../src/services/featureService';

interface LightPreset {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

const LIGHT_PRESETS: LightPreset[] = [
  { id: 'golden_hour', name: 'Golden Hour', icon: '🌅', prompt: 'warm golden hour sunlight' },
  { id: 'studio_flash', name: 'Studio Flash', icon: '📸', prompt: 'professional studio flash lighting' },
  { id: 'dramatic_side', name: 'Dramatic Side', icon: '🎭', prompt: 'dramatic side lighting with deep shadows' },
  { id: 'neon_glow', name: 'Neon Glow', icon: '💜', prompt: 'neon purple and blue glow lighting' },
  { id: 'candlelight', name: 'Candlelight', icon: '🕯️', prompt: 'warm soft candlelight glow' },
  { id: 'moonlight', name: 'Moonlight', icon: '🌙', prompt: 'cool blue moonlight at night' },
];

const DIRECTIONS = [
  { id: 'left', name: 'Left', icon: '◀' },
  { id: 'right', name: 'Right', icon: '▶' },
  { id: 'top', name: 'Top', icon: '▲' },
  { id: 'bottom', name: 'Bottom', icon: '▼' },
];

export default function RelightScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [direction, setDirection] = useState('right');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('relight');
  }, []);

  async function generate() {
    if (!imageUri || !selectedPreset) return;
    const preset = LIGHT_PRESETS.find(p => p.id === selectedPreset);
    if (!preset) return;

    setLoading(true);
    setError(null);

    try {
      trackEvent('relight_start', { preset: selectedPreset, direction });
      const resultUrl = await relightApi(imageUri, preset.prompt, direction, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'relight', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Relighting failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Relight</Text>
      <Text style={styles.subtitle}>Change the lighting on your photo</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Lighting presets as pills */}
      <Text style={styles.sectionTitle}>Lighting Style</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContainer}>
        {LIGHT_PRESETS.map((preset) => (
          <Pressable
            key={preset.id}
            style={[styles.pill, selectedPreset === preset.id && styles.pillActive]}
            onPress={() => setSelectedPreset(preset.id)}
          >
            <Text style={styles.pillIcon}>{preset.icon}</Text>
            <Text style={[styles.pillText, selectedPreset === preset.id && styles.pillTextActive]}>
              {preset.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Direction buttons */}
      <Text style={styles.sectionTitle}>Light Direction</Text>
      <View style={styles.dirRow}>
        {DIRECTIONS.map((dir) => (
          <Pressable
            key={dir.id}
            style={[styles.dirBtn, direction === dir.id && styles.dirBtnActive]}
            onPress={() => setDirection(dir.id)}
          >
            <Text style={styles.dirIcon}>{dir.icon}</Text>
            <Text style={[styles.dirText, direction === dir.id && styles.dirTextActive]}>{dir.name}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!selectedPreset || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!selectedPreset || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Relighting...' : 'Apply Lighting'}</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, alignSelf: 'flex-start' },
  pillScroll: { width: '100%', marginBottom: 24 },
  pillContainer: { flexDirection: 'row', gap: 10 },
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
  pillActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  pillTextActive: { color: '#ec4899' },
  dirRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  dirBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dirBtnActive: { backgroundColor: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.5)' },
  dirIcon: { fontSize: 18, marginBottom: 4, color: '#fff' },
  dirText: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  dirTextActive: { color: '#a855f7' },
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
