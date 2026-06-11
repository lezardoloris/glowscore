import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';

interface UsageBannerProps {
  isSubscribed: boolean;
  remaining: number;
  total: number;
  onUpgrade?: () => void;
}

export default function UsageBanner({
  isSubscribed,
  remaining,
  total,
  onUpgrade,
}: UsageBannerProps) {
  const slideAnim = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const used = total - remaining;
  const progress = total > 0 ? used / total : 0;

  // Color based on usage: green (plenty), yellow (half), red (full)
  const getBarColor = (): string => {
    if (!isSubscribed) {
      return progress >= 1 ? '#ef4444' : '#f59e0b';
    }
    if (progress >= 0.8) return '#f59e0b';
    return '#4ade80';
  };

  const barColor = getBarColor();

  const bannerText = isSubscribed
    ? `${remaining} of ${total} HD left today`
    : `${used} of ${total} HD used today ✨ Get ${isSubscribed ? total : 10}/day →`;

  const content = (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
        !isSubscribed && styles.containerFree,
      ]}
    >
      <View style={styles.textRow}>
        <Text style={styles.text}>{bannerText}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(progress * 100, 100)}%` as any,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </Animated.View>
  );

  // Free users: entire banner is tappable -> paywall
  if (!isSubscribed && onUpgrade) {
    return (
      <Pressable onPress={onUpgrade} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  containerFree: {
    borderColor: 'rgba(236,72,153,0.3)',
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
