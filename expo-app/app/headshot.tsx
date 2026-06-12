import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { headshot } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

interface Background {
  id: string;
  name: string;
  icon: string;
}

const BACKGROUNDS: Background[] = [
  { id: 'office', name: 'Office', icon: '🏢' },
  { id: 'neutral', name: 'Neutral', icon: '⬜' },
  { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
  { id: 'studio', name: 'Studio', icon: '📸' },
];

export default function HeadshotScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    trackScreen('headshot');
    checkSubscription().then(setIsSubscribed);
  }, []);

  async function generate() {
    if (!imageUri || !selectedBg) return;

    const sub = await checkSubscription();
    if (!sub) {
      router.push('/pricing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      trackEvent('headshot_start', { background: selectedBg });
      const resultUrl = await headshot(imageUri, selectedBg, 'hd');
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'headshot', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Headshot generation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>AI Headshot</Text>
      <Text style={styles.subtitle}>Professional headshots in seconds</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Premium badge */}
      {isSubscribed === false && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumIcon}>👑</Text>
          <Text style={styles.premiumText}>Premium Feature</Text>
          <Text style={styles.premiumSub}>Upgrade to generate professional headshots</Text>
        </View>
      )}

      {/* Background selector */}
      <Text style={styles.sectionTitle}>Background</Text>
      <View style={styles.bgRow}>
        {BACKGROUNDS.map((bg) => (
          <Pressable
            key={bg.id}
            style={[styles.bgCard, selectedBg === bg.id && styles.bgCardActive]}
            onPress={() => setSelectedBg(bg.id)}
          >
            <Text style={styles.bgIcon}>{bg.icon}</Text>
            <Text style={[styles.bgName, selectedBg === bg.id && styles.bgNameActive]}>{bg.name}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!selectedBg || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!selectedBg || loading}
      >
        <Text style={styles.ctaText}>
          {loading ? 'Generating...' : isSubscribed ? 'Generate Professional Headshot' : 'Upgrade to Unlock'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textSoft, marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: C.border, marginBottom: 24 },
  premiumBanner: {
    width: '100%',
    backgroundColor: C.pinkSoft,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  premiumIcon: { fontSize: 32, marginBottom: 8 },
  premiumText: { fontSize: 16, fontWeight: '700', color: C.pink, marginBottom: 4 },
  premiumSub: { fontSize: 12, color: C.textSoft, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 12, alignSelf: 'flex-start' },
  bgRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  bgCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  bgCardActive: { backgroundColor: C.pinkSoft, borderColor: C.pink },
  bgIcon: { fontSize: 24, marginBottom: 6 },
  bgName: { fontSize: 11, fontWeight: '500', color: C.textSoft },
  bgNameActive: { color: C.pink },
  errorText: { fontSize: 14, color: '#D14343', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: C.pink,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
