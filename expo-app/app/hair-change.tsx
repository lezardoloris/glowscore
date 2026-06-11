import { View, Text, Pressable, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { hairChange } from '../src/services/featureService';

interface HairPreset {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

const HAIR_PRESETS: HairPreset[] = [
  { id: 'blonde_bob', name: 'Blonde Bob', icon: '👱‍♀️', prompt: 'short blonde bob haircut' },
  { id: 'red_curls', name: 'Red Curls', icon: '🦰', prompt: 'long red curly hair' },
  { id: 'buzz_cut', name: 'Buzz Cut', icon: '💈', prompt: 'buzz cut very short hair' },
  { id: 'long_straight', name: 'Long Straight', icon: '👩‍🦰', prompt: 'long straight silky hair' },
  { id: 'braids', name: 'Braids', icon: '🫘', prompt: 'long braided hairstyle' },
  { id: 'mohawk', name: 'Mohawk', icon: '🤘', prompt: 'mohawk punk hairstyle' },
  { id: 'afro', name: 'Afro', icon: '🧑‍🦱', prompt: 'big natural afro hairstyle' },
  { id: 'platinum', name: 'Platinum', icon: '🤍', prompt: 'platinum white blonde hair' },
  { id: 'balayage', name: 'Balayage', icon: '🎨', prompt: 'balayage ombre hair coloring' },
  { id: 'bangs', name: 'Bangs', icon: '✂️', prompt: 'straight bangs fringe hairstyle' },
  { id: 'pixie_cut', name: 'Pixie Cut', icon: '🧚', prompt: 'short pixie cut hairstyle' },
  { id: 'dreadlocks', name: 'Dreadlocks', icon: '🦁', prompt: 'long dreadlocks hairstyle' },
];

export default function HairChangeScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('hair_change');
  }, []);

  function getPrompt(): string {
    if (customPrompt.trim()) return customPrompt.trim();
    const preset = HAIR_PRESETS.find(p => p.id === selectedPreset);
    return preset?.prompt || '';
  }

  async function generate() {
    const prompt = getPrompt();
    if (!imageUri || !prompt) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('hair_change_start', { preset: selectedPreset || 'custom' });
      const resultUrl = await hairChange(imageUri, prompt, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'hair_change', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Hair change failed.');
    } finally {
      setLoading(false);
    }
  }

  const hasSelection = selectedPreset || customPrompt.trim();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Hair Change</Text>
      <Text style={styles.subtitle}>Try any hairstyle on yourself</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Preset grid */}
      <View style={styles.grid}>
        {HAIR_PRESETS.map((preset) => (
          <Pressable
            key={preset.id}
            style={[styles.card, selectedPreset === preset.id && styles.cardActive]}
            onPress={() => { setSelectedPreset(preset.id); setCustomPrompt(''); }}
          >
            <Text style={styles.cardIcon}>{preset.icon}</Text>
            <Text style={[styles.cardName, selectedPreset === preset.id && styles.cardNameActive]}>
              {preset.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom input */}
      <Text style={styles.sectionTitle}>Or describe any hairstyle</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Silver wolf cut with layers..."
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={customPrompt}
        onChangeText={(t) => { setCustomPrompt(t); setSelectedPreset(null); }}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!hasSelection || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!hasSelection || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Changing...' : 'Change Hair'}</Text>
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
  sectionTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 10, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
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
