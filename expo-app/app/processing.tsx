import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { theme as C } from '../src/theme';
import { notificationSuccess } from '../src/services/haptics';
import { transformHD } from '../src/services/transform';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { canGenerateHD, recordHDGeneration } from '../src/services/usageMeter';
import { addToHistory } from '../src/services/history';
import { trackScreen, trackTransformStart, trackTransformComplete, trackEvent } from '../src/services/analytics';
import { STYLE_PRESETS } from '../src/config';
import ProcessingAnimation from '../src/components/ProcessingAnimation';

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{ imageUri: string; styleId: string }>();
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : undefined;
  const styleId = typeof params.styleId === 'string' ? params.styleId : undefined;

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);

  const style = STYLE_PRESETS.find(s => s.id === styleId) || STYLE_PRESETS[0];

  const statusText = progress < 0.3
    ? 'Analyzing your face...'
    : progress < 0.6
      ? `Applying ${style.name}...`
      : progress < 1
        ? 'Almost there...'
        : 'Done! ✨';

  useEffect(() => {
    if (!imageUri || !styleId) return;

    trackScreen('processing');
    trackTransformStart(styleId);

    timerRef.current = setInterval(() => {
      setProgress(p => p >= 0.9 ? p : p + 0.02);
    }, 300);

    doTransform();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imageUri, styleId]);

  const doTransform = useCallback(async () => {
    if (!imageUri || !styleId) return;
    // Re-entrancy guard: never fire two paid fal.ai calls for one screen
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      // HARD PAYWALL: every transformation is premium. No free preview tier.
      const isSubscribed = await checkSubscription();
      if (!isSubscribed) {
        trackEvent('paywall_gate_processing', { styleId });
        if (mountedRef.current) router.replace('/pricing');
        return;
      }

      const canDo = await canGenerateHD();
      if (!canDo) {
        if (mountedRef.current) setError('Daily limit reached (10 HD/day). Try again tomorrow!');
        return;
      }
      const token = await getSubscriberToken();
      const result = await transformHD(imageUri, styleId, token);
      await recordHDGeneration();
      if (mountedRef.current) finish(result.imageUrl, true);
    } catch (e: any) {
      if (mountedRef.current) setError(e?.message || 'Transformation failed. Please try again.');
    } finally {
      startedRef.current = false;
    }
  }, [imageUri, styleId]);

  function finish(resultUri: string, isHD: boolean) {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(1);
    notificationSuccess();

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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => {
          setError(null); setProgress(0);
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
  container: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  photo: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: C.pink, marginBottom: 24, opacity: 0.85 },
  errorText: { fontSize: 16, color: '#C2415B', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  retryBtn: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  errorBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  errorBtnText: { color: C.textSoft, fontSize: 14 },
});
