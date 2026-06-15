import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import { theme } from '../theme';

/** Soft pulsing gradient backdrop for the analysis loader. */
export default function BreathingBackground() {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.55 + breath.value * 0.35,
    transform: [{ scale: 1 + breath.value * 0.06 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, anim]} pointerEvents="none">
      <LinearGradient
        colors={[theme.cream, theme.blush, theme.pinkSoft, theme.bg]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
