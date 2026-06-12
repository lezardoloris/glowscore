import { View, Text, Pressable, Image, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { hairChange } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

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
    const sub = await checkSubscription();
    if (!sub) { router.push('/pricing'); return; }
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
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
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
        placeholderTextColor={C.textSoft}
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
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textSoft, marginBottom: 20 },
  preview: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: C.border, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  card: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    gap: 8,
  },
  cardActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  cardIcon: { fontSize: 20 },
  cardName: { fontSize: 12, fontWeight: '500', color: C.textSoft },
  cardNameActive: { color: C.pink },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: C.textSoft, marginBottom: 10, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    color: C.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
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
