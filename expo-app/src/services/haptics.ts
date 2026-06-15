import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export async function notificationSuccess() {
  if (isWeb) return;
  const Haptics = await import('expo-haptics');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function impactLight() {
  if (isWeb) return;
  const Haptics = await import('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function impactMedium() {
  if (isWeb) return;
  const Haptics = await import('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
