import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * Progress ring that draws an arc proportional to `score` (0-100), with a
 * faint full-circle track behind it. The arc grows as `score` changes, so
 * passing the animated count-up value gives a free sweep animation.
 */
export default function GlowRing({
  score,
  size = 184,
  stroke = 12,
  color = '#ec4899',
  children,
}: {
  score: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center} cy={center} r={r}
          stroke="rgba(255,255,255,0.10)" strokeWidth={stroke} fill="none"
        />
        <Circle
          cx={center} cy={center} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
