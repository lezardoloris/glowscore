import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { theme as C } from '../theme';
import { fonts } from '../typography';

interface Props {
  score: number;
  unlocked: boolean;
  label?: string;
}

/** Score that starts blurred and clears on unlock (Reveal screen). */
export default function BlurredScoreReveal({ score, unlocked, label = 'Facial Harmony' }: Props) {
  const blur = useSharedValue(unlocked ? 0 : 18);

  useEffect(() => {
    blur.value = withTiming(unlocked ? 0 : 18, { duration: 300, easing: Easing.out(Easing.ease) });
  }, [unlocked]);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: unlocked ? 1 : 0.85,
  }));

  const bandLabel = score < 60 ? 'Room to glow' : score < 75 ? 'Good balance' : 'Great harmony';

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.scoreBlock, blurStyle]}>
        <Text style={styles.score}>
          {unlocked ? score : Math.round(score * 0.95)}
          <Text style={styles.outOf}>/100</Text>
        </Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.band}>{bandLabel}</Text>
      </Animated.View>
      {!unlocked && (
        <BlurView intensity={Platform.OS === 'ios' ? 28 : 50} tint="light" style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center', borderRadius: 20, overflow: 'hidden',
    backgroundColor: C.card, paddingVertical: 20, paddingHorizontal: 28, minWidth: 200,
  },
  scoreBlock: { alignItems: 'center' },
  score: { fontFamily: fonts.displayBold, fontSize: 52, color: C.text },
  outOf: { fontFamily: fonts.bodyBold, fontSize: 20, color: C.textSoft },
  label: { fontFamily: fonts.bodySemi, fontSize: 12, color: C.textSoft, marginTop: 4 },
  band: { fontFamily: fonts.bodyBold, fontSize: 16, color: C.pink, marginTop: 8 },
});
