import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
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

    if (!isSubscribed) {
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
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
  preview: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 24 },
  premiumBanner: {
    width: '100%',
    backgroundColor: 'rgba(236,72,153,0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
    marginBottom: 24,
  },
  premiumIcon: { fontSize: 32, marginBottom: 8 },
  premiumText: { fontSize: 16, fontWeight: '700', color: '#ec4899', marginBottom: 4 },
  premiumSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, alignSelf: 'flex-start' },
  bgRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  bgCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bgCardActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  bgIcon: { fontSize: 24, marginBottom: 6 },
  bgName: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  bgNameActive: { color: '#ec4899' },
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
