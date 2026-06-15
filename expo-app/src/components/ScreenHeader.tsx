import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../theme';
import { fonts } from '../typography';

/**
 * Shared sub-page header: an always-visible back affordance (44pt target, safe-area
 * aware) so a woman can return in one tap from any pushed screen, on web and native.
 * Review 2026-06: this was the single most requested fix (navigation dead ends).
 * Use `variant="dark"` over photos/dark backgrounds.
 */
export default function ScreenHeader({
  title,
  onBack,
  variant = 'light',
  close = false,
}: {
  title?: string;
  onBack?: () => void;
  variant?: 'light' | 'dark';
  close?: boolean;
}) {
  const color = variant === 'dark' ? '#fff' : C.text;
  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} hitSlop={10} onPress={onBack || (() => router.back())} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name={close ? 'close' : 'chevron-back'} size={26} color={color} />
      </Pressable>
      {title ? <Text style={[styles.title, { color }]} numberOfLines={1}>{title}</Text> : null}
      <View style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 44, paddingBottom: 6, paddingHorizontal: 8 },
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 17, textAlign: 'center' },
});
