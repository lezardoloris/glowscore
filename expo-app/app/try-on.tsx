import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { tryOn } from '../src/services/featureService';
import { checkSubscription } from '../src/services/subscription';

const GARMENT_TYPES = [
  { id: 'upper_body', name: 'Upper Body', icon: '👕' },
  { id: 'lower_body', name: 'Lower Body', icon: '👖' },
  { id: 'dresses', name: 'Dresses', icon: '👗' },
];

export default function TryOnScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [garmentUri, setGarmentUri] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState('upper_body');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    trackScreen('try_on');
    checkSubscription().then(setIsSubscribed);
  }, []);

  async function pickGarment() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setGarmentUri(result.assets[0].uri);
    }
  }

  async function generate() {
    if (!imageUri || !garmentUri) return;

    if (!isSubscribed) {
      router.push('/pricing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      trackEvent('try_on_start', { garmentType });
      const resultUrl = await tryOn(imageUri, garmentUri, garmentType);
      router.push({
        pathname: '/result',
        params: { imageUri, resultUri: resultUrl, styleId: 'try_on', isHD: 'true' },
      });
    } catch (e: any) {
      setError(e.message || 'Virtual try-on failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Virtual Try-On</Text>
      <Text style={styles.subtitle}>See how clothes look on you</Text>

      {/* Premium badge */}
      {isSubscribed === false && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumIcon}>👑</Text>
          <Text style={styles.premiumText}>Premium Feature</Text>
          <Text style={styles.premiumSub}>Upgrade to try on virtual clothing</Text>
        </View>
      )}

      {/* Photo slots */}
      <View style={styles.photoRow}>
        <View style={styles.photoSlot}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.placeholderText}>You</Text>
            </View>
          )}
          <Text style={styles.photoLabel}>Your Photo</Text>
        </View>

        <Text style={styles.plusSign}>+</Text>

        <Pressable style={styles.photoSlot} onPress={pickGarment}>
          {garmentUri ? (
            <Image source={{ uri: garmentUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.placeholderIcon}>+</Text>
              <Text style={styles.placeholderText}>Garment</Text>
            </View>
          )}
          <Text style={styles.photoLabel}>Tap to add garment</Text>
        </Pressable>
      </View>

      {/* Garment type */}
      <Text style={styles.sectionTitle}>Garment Type</Text>
      <View style={styles.typeRow}>
        {GARMENT_TYPES.map((gt) => (
          <Pressable
            key={gt.id}
            style={[styles.typeBtn, garmentType === gt.id && styles.typeBtnActive]}
            onPress={() => setGarmentType(gt.id)}
          >
            <Text style={styles.typeIcon}>{gt.icon}</Text>
            <Text style={[styles.typeName, garmentType === gt.id && styles.typeNameActive]}>
              {gt.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!garmentUri || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!garmentUri || loading}
      >
        <Text style={styles.ctaText}>
          {loading ? 'Trying on...' : isSubscribed ? 'Try It On' : 'Upgrade to Try On'}
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
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  photoSlot: { alignItems: 'center' },
  photo: { width: 120, height: 150, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  photoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 32, color: 'rgba(255,255,255,0.3)' },
  placeholderText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
  photoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  plusSign: { fontSize: 24, color: 'rgba(255,255,255,0.3)', fontWeight: '300' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, alignSelf: 'flex-start' },
  typeRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 32 },
  typeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeBtnActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  typeIcon: { fontSize: 24, marginBottom: 6 },
  typeName: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  typeNameActive: { color: '#ec4899' },
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
