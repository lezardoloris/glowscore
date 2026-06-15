import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Push Notification service for weekly style drops.
 * All functions are no-ops on web.
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
    await Notifications.setNotificationChannelAsync('style-drops', {
      name: 'Weekly Style Drops',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF2D87',
    });
  }

  return true;
}

export async function scheduleWeeklyStyleDrop(): Promise<string | null> {
  if (isWeb) return null;

  const Notifications = await import('expo-notifications');

  // Cancel any existing weekly style drop notifications first
  await cancelAllNotifications();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Style Drop! \u2728',
      body: 'A fresh glow-up style just landed. Try it now!',
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'style-drops' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2, // Monday (1=Sunday, 2=Monday in expo-notifications)
      hour: 10,
      minute: 0,
    },
  });

  console.log('[Notifications] Weekly style drop scheduled, id:', id);
  return id;
}

/**
 * Schedule a re-engagement notification 72 hours from now.
 * Call on every app open to reset the timer.
 */
export async function scheduleReEngagementNotification(): Promise<string | null> {
  if (isWeb) return null;

  const Notifications = await import('expo-notifications');

  // Cancel existing re-engagement notification
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('re_engagement_')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    identifier: 're_engagement_72h',
    content: {
      title: 'Your glow up is waiting',
      body: 'See what new styles are available today.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 72 * 60 * 60, // 72 hours
      repeats: false,
    },
  });

  console.log('[Notifications] Re-engagement notification scheduled, id:', id);
  return id;
}

/**
 * Schedule a trial-ending reminder 2 days after trial start.
 * @param trialStartTimestamp - Unix timestamp (ms) of when trial began.
 */
export async function scheduleTrialEndingReminder(
  trialStartTimestamp: number
): Promise<string | null> {
  if (isWeb) return null;

  const Notifications = await import('expo-notifications');

  // Cancel existing trial-ending notification
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('trial_ending_')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  const fireAt = trialStartTimestamp + twoDaysMs;
  const secondsFromNow = Math.max(
    Math.floor((fireAt - Date.now()) / 1000),
    60 // minimum 60 seconds to avoid invalid trigger
  );

  const id = await Notifications.scheduleNotificationAsync({
    identifier: 'trial_ending_reminder',
    content: {
      title: 'Your free trial ends tomorrow',
      body: 'Keep your premium access — your glow ups look amazing!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
      repeats: false,
    },
  });

  console.log('[Notifications] Trial ending reminder scheduled, id:', id);
  return id;
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

/**
 * 10 supportive micro-nudges (EPIC 10.5), one per day for ~10 days. Behaviour-
 * triggered (call after onboarding/first scan), App Store compliant, no-op on web.
 * Reinforces the daily glow-up habit with bite-size, kind tips.
 */
const MICRO_NUDGES: { title: string; body: string }[] = [
  { title: 'Glow tip ✨', body: 'SPF every morning is the single biggest glow + anti-aging habit. Two seconds, big payoff.' },
  { title: 'Hydration check', body: 'Apply your serum on slightly damp skin to lock in more moisture.' },
  { title: 'Keep it simple', body: 'A few consistent steps beat a 12-step routine you cannot keep up. Skinimalism wins.' },
  { title: 'De-puff minute', body: '60 seconds of gua sha, sweeping up and toward the ears, wakes up your face.' },
  { title: 'Layer smart', body: 'Vitamin C in the AM, retinol in the PM. Never the same routine.' },
  { title: 'Sleep is skincare', body: '7-8 hours is when your skin repairs. The cheapest glow-up there is.' },
  { title: 'Progress, not perfection', body: 'Take your front-lit selfie today. Future you will love the before/after.' },
  { title: 'Your colors', body: 'Wearing one shade from your palette makes your skin look instantly more awake.' },
  { title: 'Barrier first', body: 'If skin feels tight or stings, pause actives and let ceramides rebuild the barrier.' },
  { title: 'Re-scan day', body: 'Been following your plan? Re-scan to watch your GlowScore climb.' },
];

export async function scheduleMicroNudges(): Promise<void> {
  if (isWeb) return;
  const Notifications = await import('expo-notifications');
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('micro_')) await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
  const day = 24 * 60 * 60;
  for (let i = 0; i < MICRO_NUDGES.length; i++) {
    const n = MICRO_NUDGES[i];
    await Notifications.scheduleNotificationAsync({
      identifier: `micro_${i}`,
      content: { title: n.title, body: n.body, sound: false },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: (i + 1) * day + 9 * 3600, repeats: false },
    });
  }
  console.log('[Notifications] 10 micro-nudges scheduled');
}

export async function cancelAllNotifications(): Promise<void> {
  if (isWeb) return;

  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notifications] All scheduled notifications cancelled');
}
