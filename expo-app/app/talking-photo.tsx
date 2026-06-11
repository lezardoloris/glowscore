import { View, Text, Pressable, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import { talkingPhoto } from '../src/services/featureService';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';

export default function TalkingPhotoScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const recordingRef = useRef<any>(null);

  useEffect(() => {
    trackScreen('talking_photo');
    checkSubscription().then(setIsSubscribed);
  }, []);

  async function pickVideo() {
    if (Platform.OS === 'web') return;
    try {
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 10,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
      }
    } catch {
      setError('Could not pick video.');
    }
  }

  async function toggleRecording() {
    if (Platform.OS === 'web') {
      setError('Audio recording not available on web.');
      return;
    }

    if (isRecording) {
      // Stop
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          setAudioUri(uri);
        } catch {}
        recordingRef.current = null;
      }
      setIsRecording(false);
    } else {
      // Start
      try {
        const Audio = await import('expo-av').then(m => m.Audio);
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Microphone permission needed.');
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recordingRef.current = recording;
        setIsRecording(true);
        setError(null);
      } catch {
        setError('Could not start recording.');
      }
    }
  }

  async function generate() {
    if (!videoUri || !audioUri) return;
    if (!isSubscribed) {
      router.push('/pricing');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      trackEvent('talking_photo_start', {});
      const token = await getSubscriberToken();
      if (!token) throw new Error('Subscribe to use Talking Photo.');
      const resultUrl = await talkingPhoto(videoUri, audioUri, token);
      router.push({
        pathname: '/video-result',
        params: { videoUri: resultUrl, featureType: 'talking_photo' },
      });
    } catch (e: any) {
      setError(e.message || 'Lip-sync failed.');
    } finally {
      setLoading(false);
    }
  }

  const canGenerate = !!videoUri && !!audioUri;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Talking Photo</Text>
      <Text style={styles.subtitle}>Make any face lip-sync to your voice</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      {!isSubscribed && (
        <Pressable style={styles.premiumBanner} onPress={() => router.push('/pricing')}>
          <Text style={styles.premiumText}>Premium Feature</Text>
        </Pressable>
      )}

      {/* Step 1: Source video */}
      <View style={styles.step}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
          <Text style={styles.stepTitle}>Source Video</Text>
          {videoUri && <Text style={styles.checkmark}>Done</Text>}
        </View>
        {videoUri ? (
          <Pressable style={styles.doneCard} onPress={() => setVideoUri(null)}>
            <Text style={styles.doneText}>Video selected</Text>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.pickBtn} onPress={pickVideo}>
            <Text style={styles.pickIcon}>📹</Text>
            <Text style={styles.pickText}>Select a short face video (3-10s)</Text>
          </Pressable>
        )}
      </View>

      {/* Step 2: Audio */}
      <View style={styles.step}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
          <Text style={styles.stepTitle}>Audio</Text>
          {audioUri && <Text style={styles.checkmark}>Done</Text>}
        </View>
        {audioUri ? (
          <Pressable style={styles.doneCard} onPress={() => setAudioUri(null)}>
            <Text style={styles.doneText}>Audio recorded</Text>
            <Text style={styles.changeText}>Re-record</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
            onPress={toggleRecording}
          >
            <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.recordText}>{isRecording ? 'Tap to Stop' : 'Tap to Record'}</Text>
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.cta, (!canGenerate || loading) && styles.ctaDisabled]}
        onPress={generate}
        disabled={!canGenerate || loading}
      >
        <Text style={styles.ctaText}>{loading ? 'Processing...' : 'Make It Talk'}</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        AI-generated lip-sync for entertainment purposes only.
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
  preview: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  premiumBanner: {
    backgroundColor: 'rgba(234,179,8,0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    marginBottom: 20,
  },
  premiumText: { color: '#eab308', fontSize: 13, fontWeight: '700' },
  step: { width: '100%', marginBottom: 20 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1 },
  checkmark: { fontSize: 12, color: '#4ade80', fontWeight: '600' },
  pickBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickIcon: { fontSize: 24 },
  pickText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  recordBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  recordBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.4)',
  },
  recordIcon: { fontSize: 24 },
  recordText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  doneCard: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  doneText: { fontSize: 14, color: '#4ade80', fontWeight: '500' },
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
