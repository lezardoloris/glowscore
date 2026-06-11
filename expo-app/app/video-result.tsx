import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackShare } from '../src/services/analytics';

export default function VideoResultScreen() {
  const { videoUri, featureType } = useLocalSearchParams<{
    videoUri: string;
    featureType: string;
  }>();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [VideoComponent, setVideoComponent] = useState<any>(null);

  const featureTitle = featureType === 'animate_portrait' ? 'Animated Portrait' : 'Talking Photo';

  useEffect(() => {
    trackScreen('video_result');
    // Dynamically import Video component (expo-av)
    if (Platform.OS !== 'web') {
      import('expo-av').then(({ Video, ResizeMode }) => {
        setVideoComponent(() => ({ uri }: { uri: string }) => (
          <Video
            source={{ uri }}
            style={styles.video}
            useNativeControls
            isLooping
            shouldPlay
            resizeMode={ResizeMode.CONTAIN}
          />
        ));
      });
    }
  }, []);

  async function shareVideo() {
    if (!videoUri) return;
    try {
      if (Platform.OS === 'web') {
        window.open(videoUri, '_blank');
        return;
      }
      const Sharing = await import('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        // Download to temp file first if remote URL
        const FileSystem = await import('expo-file-system');
        const localUri = `${FileSystem.cacheDirectory}glowup-video-${Date.now()}.mp4`;
        const download = await FileSystem.downloadAsync(videoUri, localUri);
        await Sharing.shareAsync(download.uri);
        trackShare('video_share');
      }
    } catch (e) {
      console.log('Share failed:', e);
    }
  }

  async function saveVideo() {
    if (!videoUri || Platform.OS === 'web') return;
    setIsSaving(true);
    try {
      const MediaLibrary = await import('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const FileSystem = await import('expo-file-system');
      const localUri = `${FileSystem.cacheDirectory}glowup-save-${Date.now()}.mp4`;
      const download = await FileSystem.downloadAsync(videoUri, localUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      setSaved(true);
      trackShare('video_save');
    } catch (e) {
      console.log('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{featureType === 'animate_portrait' ? '🎬' : '🗣️'}</Text>
        <Text style={styles.headerTitle}>{featureTitle}</Text>
      </View>

      {/* Video player */}
      <View style={styles.videoContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webText}>Video ready!</Text>
            <Pressable onPress={() => window.open(videoUri, '_blank')}>
              <Text style={styles.webLink}>Open in new tab</Text>
            </Pressable>
          </View>
        ) : VideoComponent && videoUri ? (
          <VideoComponent uri={videoUri} />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
      </View>

      <Text style={styles.disclaimer}>
        AI-generated artistic animation for entertainment purposes only.
      </Text>

      {/* Action buttons */}
      <View style={styles.row}>
        <Pressable style={styles.glassBtn} onPress={shareVideo}>
          <Text style={styles.glassBtnText}>Share</Text>
        </Pressable>
        <Pressable style={styles.glassBtn} onPress={saveVideo} disabled={isSaving}>
          <Text style={styles.glassBtnText}>{saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/')}>
          <Text style={styles.primaryBtnText}>New</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 16, gap: 16, alignItems: 'center' as const },
  backBtn: { alignSelf: 'flex-start' as const, marginBottom: 0 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  videoContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  video: { width: '100%', height: '100%' },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  webText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  webLink: { color: '#ec4899', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  disclaimer: { fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  glassBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glassBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#ec4899',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
