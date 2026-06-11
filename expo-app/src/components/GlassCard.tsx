import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

let BlurView: React.ComponentType<any> | null = null;

// Only import expo-blur on native platforms where it works reliably
if (Platform.OS !== 'web') {
  try {
    BlurView = require('expo-blur').BlurView;
  } catch {
    BlurView = null;
  }
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 20,
}: GlassCardProps) {
  const cardStyle = [styles.card, style];

  // On native with BlurView available, use real blur
  if (Platform.OS !== 'web' && BlurView) {
    return (
      <View style={cardStyle}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  // Web fallback: semi-transparent background, no blur
  return (
    <View style={[cardStyle, styles.webFallback]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inner: {
    padding: 24,
  },
});
