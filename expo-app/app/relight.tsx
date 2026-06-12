import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { relight as relightApi } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

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
    const sub = await checkSubscription();
    if (!sub) { router.push('/pricing'); return; }
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
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
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
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textSoft, marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: C.border, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 12, alignSelf: 'flex-start' },
  pillScroll: { width: '100%', marginBottom: 24 },
  pillContainer: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  pillActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 13, fontWeight: '500', color: C.textSoft },
  pillTextActive: { color: C.pink },
  dirRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  dirBtn: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  dirBtnActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  dirIcon: { fontSize: 18, marginBottom: 4, color: C.text },
  dirText: { fontSize: 11, fontWeight: '500', color: C.textSoft },
  dirTextActive: { color: C.pink },
  errorText: { fontSize: 14, color: '#DC2626', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: C.pink,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
