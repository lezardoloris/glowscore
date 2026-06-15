import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Push notifications for the glow-up retention loop. All behaviour-triggered
 * (fired off a user action), so App Store compliant. No-ops on web.
 */

export async function requestPermission(): Promise<boolean> {
  if (isWeb) return false;

  const Notifications = await import('expo-notifications');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return false;
  }

  // On Android, set up a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('glow-reminders', {
      name: 'Glow-up reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E0537A',
    });
  }

  return true;
}

/**
 * Schedule a personalized re-scan reminder ~6 days after a GlowScore scan.
 * Behaviour-triggered (fires off a user action), so it is App Store compliant.
 */
export async function scheduleRescanReminder(overall: number): Promise<string | null> {
  if (isWeb) return null;

  const Notifications = await import('expo-notifications');

  // Cancel any existing rescan reminder first
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('rescan_')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const sixDays = 6 * 24 * 60 * 60;
  const id = await Notifications.scheduleNotificationAsync({
    identifier: 'rescan_reminder',
    content: {
      title: 'Time to check your GlowScore',
      body: `You scored ${overall} last week. Been following your plan? Rescan to see your progress.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: sixDays,
      repeats: false,
    },
  });

  console.log('[Notifications] Rescan reminder scheduled, id:', id);
  return id;
}

/**
 * Activation sequence (D1/D3/D7): the habit-forming nudges that carry a new user
 * from paywall to first visible delta. Behaviour-triggered (call after onboarding
 * or the first scan), so it is App Store compliant. No-op on web.
 */
export async function scheduleActivationSequence(): Promise<void> {
  if (isWeb) return;
  const Notifications = await import('expo-notifications');
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('activation_')) await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
  const day = 24 * 60 * 60;
  const seq = [
    { id: 'activation_d1', s: day, title: 'Your glow-up starts today ✨', body: 'Take your before photo and tick off your first routine step.' },
    { id: 'activation_d3', s: 3 * day, title: 'Keep your streak going', body: 'Small daily habits compound. Open your glow-up plan for today.' },
    { id: 'activation_d7', s: 7 * day, title: 'Your week-1 reveal is ready', body: 'Re-scan to see your first GlowScore progress.' },
  ];
  for (const n of seq) {
    await Notifications.scheduleNotificationAsync({
      identifier: n.id,
      content: { title: n.title, body: n.body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: n.s, repeats: false },
    });
  }
  console.log('[Notifications] Activation sequence (D1/D3/D7) scheduled');
}

export async function cancelAllNotifications(): Promise<void> {
  if (isWeb) return;

  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notifications] All scheduled notifications cancelled');
}

/** Daily micro-tips from routineCopy (market research verbatims). */
export async function scheduleRoutineMicroPushes(): Promise<void> {
  if (isWeb) return;
  const { MICRO_PUSH_TIPS } = await import('../data/routineCopy');
  const Notifications = await import('expo-notifications');

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('micro_tip_')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const tips = MICRO_PUSH_TIPS.slice(0, 5);
  for (let i = 0; i < tips.length; i++) {
    const day = (i + 1) * 24 * 60 * 60;
    await Notifications.scheduleNotificationAsync({
      identifier: `micro_tip_${i}`,
      content: {
        title: 'Glow tip of the day',
        body: tips[i],
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: day,
        repeats: false,
      },
    });
  }
  console.log('[Notifications] Routine micro-tips scheduled');
}
