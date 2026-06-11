import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Custom processing animation (no external Lottie file needed)
// Renders animated concentric rings with pulsing glow

interface Props {
  progress: number; // 0-1
  statusText: string;
  styleName: string;
}

export default function ProcessingAnimation({ progress, statusText, styleName }: Props) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Rotation
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.outerRing, { opacity: glowOpacity, transform: [{ scale: pulseScale }] }]}>
        <LinearGradient
          colors={['rgba(236,72,153,0.3)', 'rgba(168,85,247,0.3)', 'rgba(59,130,246,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientRing}
        />
      </Animated.View>

      {/* Spinning ring */}
      <Animated.View style={[styles.spinRing, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.spinDot} />
      </Animated.View>

      {/* Center circle with progress */}
      <Animated.View style={[styles.centerCircle, { transform: [{ scale: pulseScale }] }]}>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.sparkle}>✨</Text>
      </Animated.View>

      {/* Status text */}
      <Text style={styles.status}>{statusText}</Text>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <LinearGradient
          colors={['#ec4899', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={styles.styleName}>{styleName} Transformation</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 20 },
  outerRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  gradientRing: { width: '100%', height: '100%', borderRadius: 110 },
  spinRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: 'transparent', borderTopColor: '#ec4899', borderRightColor: '#a855f7' },
  spinDot: { position: 'absolute', top: -4, left: '50%', marginLeft: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ec4899' },
  centerCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  progressText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  sparkle: { fontSize: 24, marginTop: 4 },
  status: { fontSize: 16, fontWeight: '600', color: '#fff', marginTop: 16 },
  progressBar: { width: 200, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  styleName: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
});
