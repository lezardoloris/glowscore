import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS,
} from 'react-native-reanimated';
import { theme } from '../theme';

const COLORS = [theme.pink, theme.roseGold, theme.pinkSoft, '#F9C5D5', theme.good];
const { width: W } = Dimensions.get('window');

interface Props { active: boolean; onDone?: () => void; count?: number }

/** Lightweight success confetti (unlock / routine complete). */
export default function SoftConfetti({ active, onDone, count = 24 }: Props) {
  if (!active) return null;
  return (
    <Animated.View style={styles.layer} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} index={i} onLastDone={i === count - 1 ? onDone : undefined} />
      ))}
    </Animated.View>
  );
}

function Particle({ index, onLastDone }: { index: number; onLastDone?: () => void }) {
  const y = useSharedValue(-20);
  const x = useSharedValue((W / 24) * index + Math.random() * 40);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);
  const color = COLORS[index % COLORS.length];
  const size = 6 + (index % 4) * 2;
  const delay = (index % 8) * 40;

  useEffect(() => {
    y.value = withDelay(delay, withTiming(420 + Math.random() * 120, { duration: 2200, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished && onLastDone) runOnJS(onLastDone)();
    }));
    rot.value = withDelay(delay, withTiming(360 * (index % 2 === 0 ? 1 : -1), { duration: 2200 }));
    opacity.value = withDelay(delay + 1400, withTiming(0, { duration: 800 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, { width: size, height: size * 1.4, backgroundColor: color, borderRadius: index % 3 === 0 ? size : 2 }, style]} />
  );
}

const count = 24;

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, zIndex: 100, overflow: 'hidden' },
  particle: { position: 'absolute', top: 0 },
});
