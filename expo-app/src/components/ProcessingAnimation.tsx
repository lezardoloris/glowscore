import { View, Text, StyleSheet, Animated, Easing, Image, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../theme';

/**
 * Clinical-luxe scan animation: the progress ring wraps the user's selfie while a
 * soft pink scan-line sweeps the face ("analyzing"). Replaces the old dark-theme
 * purple/blue rings + raw emoji that clashed with the pink palette.
 */
interface Props {
  progress: number; // 0-1
  statusText: string;
  styleName: string;
  imageUri?: string;
}

const RING = 232;
const PHOTO = 178;

export default function ProcessingAnimation({ progress, statusText, styleName, imageUri }: Props) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const travel = PHOTO / 2 - 10;
  const scanY = scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-travel, travel, -travel] });
  const haloScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const haloOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.45] });

  const pct = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />

        <AnimatedCircularProgress
          size={RING}
          width={8}
          fill={pct}
          tintColor={C.pink}
          backgroundColor={C.track}
          rotation={0}
          lineCap="round"
          duration={400}
        >
          {() => (
            <View style={styles.photoWrap}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]} />
              )}
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}>
                <LinearGradient
                  colors={['rgba(224,83,122,0)', 'rgba(224,83,122,0.85)', 'rgba(224,83,122,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanLineGrad}
                />
              </Animated.View>
              <View style={styles.tint} pointerEvents="none" />
            </View>
          )}
        </AnimatedCircularProgress>

        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Ionicons name="sparkles" size={15} color={C.pink} />
        <Text style={styles.status}>{statusText}</Text>
      </View>
      <Text style={styles.styleName}>{styleName} Transformation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: RING + 28,
    height: RING + 28,
    borderRadius: (RING + 28) / 2,
    backgroundColor: C.pinkSoft,
  },
  photoWrap: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.pinkSoft,
  },
  photo: { width: PHOTO, height: PHOTO, borderRadius: PHOTO / 2 },
  photoPlaceholder: { backgroundColor: C.pinkSoft },
  scanLine: { position: 'absolute', width: PHOTO, height: 3, alignItems: 'center', justifyContent: 'center' },
  scanLineGrad: { width: PHOTO, height: 3 },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(224,83,122,0.05)' },
  pctBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: C.pink,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: C.bg,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(224,83,122,0.35)' } as any
      : { shadowColor: C.pink, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }),
  },
  pctText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 30 },
  status: { fontSize: 16, fontWeight: '700', color: C.text },
  styleName: { fontSize: 13, color: C.textSoft, marginTop: 6, fontWeight: '500' },
});
