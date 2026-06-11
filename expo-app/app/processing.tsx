import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { notificationSuccess } from '../src/services/haptics';
import { transformHD, transformPreview } from '../src/services/transform';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { canGenerateHD, canGeneratePreview, recordHDGeneration, recordPreviewGeneration } from '../src/services/usageMeter';
import { addToHistory } from '../src/services/history';
import { trackScreen, trackTransformStart, trackTransformComplete } from '../src/services/analytics';
import { STYLE_PRESETS } from '../src/config';
import ProcessingAnimation from '../src/components/ProcessingAnimation';

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{ imageUri: string; styleId: string }>();
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : undefined;
  const styleId = typeof params.styleId === 'string' ? params.styleId : undefined;

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true); // M1 FIX: Track mount state

  const style = STYLE_PRESETS.find(s => s.id === styleId) || STYLE_PRESETS[0];

  // C2 FIX: Derive status from progress instead of setting it in updater (H5 FIX)
  const statusText = progress < 0.3
    ? 'Analyzing your face...'
    : progress < 0.6
      ? `Applying ${style.name}...`
      : progress < 1
        ? 'Almost there...'
        : 'Done! ✨';

  // C3 FIX: Guard missing params
  useEffect(() => {
    if (!imageUri || !styleId) return;

    trackScreen('processing');
    trackTransformStart(styleId);

    // Progress animation
    timerRef.current = setInterval(() => {
      setProgress(p => p >= 0.9 ? p : p + 0.02);
    }, 300);

    doTransform();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imageUri, styleId]); // C2 FIX: Include deps

  const doTransform = useCallback(async () => {
    if (!imageUri || !styleId) return;

    try {
      const isSubscribed = await checkSubscription();

      if (isSubscribed) {
        const canDo = await canGenerateHD();
        if (!canDo) {
          if (mountedRef.current) setError('Daily limit reached (10 HD/day). Try again tomorrow!');
          return;
        }
        // C1 FIX: await async getSubscriberToken
        const token = await getSubscriberToken();
        const result = await transformHD(imageUri, styleId, token);
        await recordHDGeneration();
        if (mountedRef.current) finish(result.imageUrl, true);
      } else {
        const canDo = await canGeneratePreview();
        if (!canDo) {
          if (mountedRef.current) setError('Daily limit reached (5 free transforms). Go Premium for more!');
          return;
        }
        const previewUri = await transformPreview(imageUri, styleId);
        await recordPreviewGeneration();
        if (mountedRef.current) finish(previewUri, false);
      }
    } catch (e: any) {
      // H2 FIX: Retry covers both HD and free tier
      try {
        const isSubscribed = await checkSubscription();
        if (isSubscribed) {
          const token = await getSubscriberToken();
          const result = await transformHD(imageUri, styleId, token);
          if (mountedRef.current) finish(result.imageUrl, true);
        } else {
          const previewUri = await transformPreview(imageUri, styleId);
          if (mountedRef.current) finish(previewUri, false);
        }
      } catch (retryError: any) {
        if (mountedRef.current) setError(retryError.message || 'Transformation failed. Please try again.');
      }
    }
  }, [imageUri, styleId]);

  function finish(resultUri: string, isHD: boolean) {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(1);
    notificationSuccess();

    // M7: Save to history
    addToHistory({
      id: Date.now().toString(),
      styleId: styleId!,
      styleName: style.name,
      originalUri: imageUri!,
      resultUri,
      isHD,
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    trackTransformComplete(styleId!, isHD, 0);

    setTimeout(() => {
      if (mountedRef.current) {
        router.replace({
          pathname: '/result',
          params: { imageUri, resultUri, styleId, isHD: String(isHD) },
        });
      }
    }, 600);
  }

  // C3: Missing params screen
  if (!imageUri || !styleId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Missing image or style selection.</Text>
        <Pressable style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Error screen (L9 FIX: Pressable instead of Text onPress)
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => {
          setError(null); setProgress(0);
          // BUG-13 FIX: Restart progress timer on retry
          timerRef.current = setInterval(() => { setProgress(p => p >= 0.9 ? p : p + 0.02); }, 300);
          doTransform();
        }}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // M10 FIX: Use ProcessingAnimation component
  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.photo} />
      ) : null}
      <ProcessingAnimation progress={progress} statusText={statusText} styleName={style.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 24 },
  photo: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#a855f7', marginBottom: 24, opacity: 0.6 },
  errorText: { fontSize: 16, color: '#f87171', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  retryBtn: { backgroundColor: '#ec4899', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  errorBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
