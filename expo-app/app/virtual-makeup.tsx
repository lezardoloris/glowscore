import { View, Text, Pressable, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { applyMakeup } from '../src/services/featureService';

interface MakeupLook {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
}

const LOOKS: MakeupLook[] = [
  { id: 'natural', name: 'Natural', icon: 'leaf-outline', desc: 'Fresh, barely-there glow' },
  { id: 'soft_glam', name: 'Soft Glam', icon: 'sparkles-outline', desc: 'Soft shimmer and warm tones' },
  { id: 'glam', name: 'Full Glam', icon: 'diamond-outline', desc: 'Bold eyes, sculpted finish' },
  { id: 'bold_lip', name: 'Bold Lip', icon: 'heart-outline', desc: 'Statement lip, clean base' },
];

export default function VirtualMakeupScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [look, setLook] = useState('natural');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('virtual_makeup');
  }, []);

  async function onApply() {
    if (!imageUri || loading) return;
    setError(null);

    const sub = await checkSubscription();
    if (!sub) { router.push('/pricing'); return; }

    try {
      setLoading(true);
      trackEvent('makeup_apply', { look });
      const token = await getSubscriberToken();
      const url = await applyMakeup(imageUri, look, token);
      router.replace({
        pathname: '/result',
        params: { imageUri, resultUri: url, styleId: 'clear_skin', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>Makeup</Text>
      <Text style={styles.subtitle}>Pick a look, our AI applies it to your photo</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : null}

      <View style={styles.grid}>
        {LOOKS.map((l) => {
          const active = look === l.id;
          return (
            <Pressable
              key={l.id}
              style={[styles.lookCard, active && styles.lookCardActive]}
              onPress={() => setLook(l.id)}
            >
              <View style={[styles.lookIcon, active && styles.lookIconActive]}>
                <Ionicons name={l.icon} size={22} color={active ? '#fff' : C.pink} />
              </View>
              <Text style={[styles.lookName, active && styles.lookNameActive]}>{l.name}</Text>
              <Text style={styles.lookDesc}>{l.desc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.cta, loading && styles.ctaDisabled]} onPress={onApply} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="color-wand" size={20} color="#fff" />
            <Text style={styles.ctaText}>Apply Makeup</Text>
          </>
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 80 },
  back: { alignSelf: 'flex-start', marginBottom: 6 },
  title: { color: C.text, fontSize: 26, fontWeight: '900', marginBottom: 4 },
  subtitle: { color: C.textSoft, fontSize: 14, marginBottom: 18 },

  preview: {
    width: '100%', height: 260, borderRadius: 20, marginBottom: 18,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  lookCard: {
    width: '47%', flexGrow: 1, backgroundColor: C.card, borderRadius: 18,
    padding: 14, borderWidth: 2, borderColor: C.border,
  },
  lookCardActive: { borderColor: C.pink, backgroundColor: '#FDF4F7' },
  lookIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.pinkSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  lookIconActive: { backgroundColor: C.pink },
  lookName: { color: C.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  lookNameActive: { color: C.pink },
  lookDesc: { color: C.textSoft, fontSize: 12, lineHeight: 16 },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.pink, borderRadius: 24, paddingVertical: 18,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  error: { color: '#C0334D', fontSize: 13, textAlign: 'center', marginTop: 12, fontWeight: '600' },
});
