import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { transformPreview, transformHD } from '../src/services/transform';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { STYLE_PRESETS } from '../src/config';

export default function CoupleGlowUpScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [secondUri, setSecondUri] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ first: string; second: string } | null>(null);

  useEffect(() => {
    trackScreen('couple_glowup');
  }, []);

  async function pickSecondPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setSecondUri(result.assets[0].uri);
    }
  }

  async function generate() {
    if (!imageUri || !secondUri) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      trackEvent('couple_glowup_start', { styleId: selectedStyle });

      const isSubscribed = await checkSubscription();

      let result1: string;
      let result2: string;

      if (isSubscribed) {
        const token = await getSubscriberToken();
        const [r1, r2] = await Promise.all([
          transformHD(imageUri, selectedStyle, token),
          transformHD(secondUri, selectedStyle, token),
        ]);
        result1 = r1.imageUrl;
        result2 = r2.imageUrl;
      } else {
        const [r1, r2] = await Promise.all([
          transformPreview(imageUri, selectedStyle),
          transformPreview(secondUri, selectedStyle),
        ]);
        result1 = r1;
        result2 = r2;
      }

      setResults({ first: result1, second: result2 });
    } catch (e: any) {
      setError(e.message || 'Couple glow up failed.');
    } finally {
      setLoading(false);
    }
  }

  const style = STYLE_PRESETS.find(s => s.id === selectedStyle) || STYLE_PRESETS[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Couple Glow Up</Text>
      <Text style={styles.subtitle}>Glow up together with your partner</Text>

      {/* Photo slots */}
      <View style={styles.photoRow}>
        <View style={styles.photoSlot}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.placeholderText}>Person 1</Text>
            </View>
          )}
          <Text style={styles.photoLabel}>Person 1</Text>
        </View>

        <Text style={styles.heartIcon}>+</Text>

        <Pressable style={styles.photoSlot} onPress={pickSecondPhoto}>
          {secondUri ? (
            <Image source={{ uri: secondUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.placeholderIcon}>+</Text>
              <Text style={styles.placeholderText}>Person 2</Text>
            </View>
          )}
          <Text style={styles.photoLabel}>Tap to add</Text>
        </Pressable>
      </View>

      {/* Style selector */}
      <Text style={styles.sectionTitle}>Choose Style</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContainer}>
        {STYLE_PRESETS.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.pill, selectedStyle === s.id && styles.pillActive]}
            onPress={() => setSelectedStyle(s.id)}
          >
            <Text style={styles.pillIcon}>{s.icon}</Text>
            <Text style={[styles.pillText, selectedStyle === s.id && styles.pillTextActive]}>
              {s.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Results side by side */}
      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>{style.icon} {style.name} Results</Text>
          <View style={styles.resultsRow}>
            <Image source={{ uri: results.first }} style={styles.resultImage} />
            <Image source={{ uri: results.second }} style={styles.resultImage} />
          </View>
          <Pressable style={styles.newBtn} onPress={() => { setResults(null); }}>
            <Text style={styles.newBtnText}>Try Another Style</Text>
          </Pressable>
        </View>
      )}

      {!results && (
        <Pressable
          style={[styles.cta, (!secondUri || loading) && styles.ctaDisabled]}
          onPress={generate}
          disabled={!secondUri || loading}
        >
          <Text style={styles.ctaText}>{loading ? 'Glowing Up...' : 'Glow Up Together'}</Text>
        </Pressable>
      )}
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
  photoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  photoSlot: { alignItems: 'center' },
  photo: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  photoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 28, color: 'rgba(255,255,255,0.3)' },
  placeholderText: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
  photoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  heartIcon: { fontSize: 24, color: 'rgba(255,255,255,0.3)' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, alignSelf: 'flex-start' },
  pillScroll: { width: '100%', marginBottom: 32 },
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
  resultsContainer: { width: '100%', alignItems: 'center', marginBottom: 24 },
  resultsTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  resultsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  resultImage: { width: 160, height: 160, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  newBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  newBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
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
