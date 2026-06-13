import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme as C } from '../theme';

/**
 * Reveal metric bar (EPIC 9.2): animates 0 -> value with a per-row stagger so
 * the breakdown "fills in" sequentially. Locked state shows a static teaser bar.
 */
export default function AnimatedBar({
  value, unlocked, delay = 0,
}: { value: number; unlocked: boolean; delay?: number }) {
  const w = useRef(new Animated.Value(unlocked ? 0 : 30)).current;

  useEffect(() => {
    if (!unlocked) return;
    const anim = Animated.timing(w, {
      toValue: Math.max(0, Math.min(100, value)),
      duration: 750,
      delay,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [unlocked, value, delay, w]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: unlocked ? C.pink : C.trackLocked,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', height: 8, borderRadius: 4, backgroundColor: C.track, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
