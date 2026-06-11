import { View, Text, Pressable, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { animatePortrait } from '../src/services/featureService';

export default function AnimatePortraitScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('animate_portrait');
  }, []);

  async function pickVideo() {
    if (Platform.OS === 'web') {
      setError('Video picking not available on web.');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 15,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setError(null);
      }
    } catch (e: any) {
      setError('Could not pick video.');
    }
  }

  async function recordVideo() {
    if (Platform.OS === 'web') {
      setError('Camera not available on web.');
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission needed to record video.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 10,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setError(null);
      }
    } catch (e: any) {
      setError('Could not record video.');
    }
  }

  async function generate() {
    if (!imageUri || !videoUri) return;
    setLoading(true);
    setError(null);

    try {
      trackEvent('animate_portrait_start', {});
      const resultUrl = await animatePortrait(imageUri, videoUri);
      router.push({
        pathname: '/video-result',
        params: { videoUri: resultUrl, featureType: 'animate_portrait' },
      });
    } catch (e: any) {
      setError(e.message || 'Animation failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Animate Portrait</Text>
      <Text style={styles.subtitle}>Bring your photo to life with a driving video</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {/* Driving video section */}
      <Text style={styles.sectionTitle}>Driving Video</Text>
      <Text style={styles.hint}>
        Record yourself making expressions — they'll transfer to your photo
      </Text>

      {videoUri ? (
        <View style={styles.videoPreview}>
          <Text style={styles.videoText}>Video selected</Text>
          <Pressable onPress={() => setVideoUri(null)}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.videoButtons}>
          <Pressable style={styles.videoBtn} onPress={recordVideo}>
            <Text style={styles.videoBtnIcon}>📹</Text>
            <Text style={styles.videoBtnText}>Record</Text>
          </Pressable>
          <Pressable style={styles.videoBtn} onPress={pickVideo}>
            <Text style={styles.videoBtnIcon}>📁</Text>
            <Text style={styles.videoBtnText}>Gallery</Text>
          </Pressable>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!videoUri || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!videoUri || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Animating...' : 'Animate Portrait'}</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        AI-generated artistic animation for entertainment purposes only.
      </Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8, alignSelf: 'flex-start' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16, alignSelf: 'flex-start' },
  videoButtons: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 },
  videoBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  videoBtnIcon: { fontSize: 32 },
  videoBtnText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  videoPreview: {
    width: '100%',
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    marginBottom: 24,
  },
  videoText: { fontSize: 14, color: '#4ade80', fontWeight: '500' },
  changeText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  errorText: { fontSize: 14, color: '#f87171', marginBottom: 12 },
  cta: {
    width: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center' },
});
