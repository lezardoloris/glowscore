import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from './analytics';

/**
 * "Or invite 3 friends" unlock (Umax/Aura pattern): the alternative to paying.
 * Client-side MVP — counts completed share-sheet actions. Server-side referral
 * attribution can replace this later without changing the call sites.
 */

const COUNT_KEY = 'invite_share_count';
const UNLOCK_KEY = 'invite_unlocked';
const LAST_KEY = 'invite_last_ts';
const COOLDOWN_MS = 15000; // prevent 3 rapid taps from all counting

export const INVITES_REQUIRED = 3;

// Comparison hook drives the viral loop (F2/F3 share to compare).
const INVITE_MESSAGE =
  'I just scored my Facial Harmony on GlowUp AI ✨ bet you cannot beat mine 👀 ' +
  'Scan yours: https://glowupai.app/download';

export async function getInviteCount(): Promise<number> {
  try {
    return parseInt((await AsyncStorage.getItem(COUNT_KEY)) || '0', 10);
  } catch {
    return 0;
  }
}

export async function isInviteUnlocked(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(UNLOCK_KEY)) === 'true';
  } catch {
    return false;
  }
}

/**
 * Open the share sheet; count the invite when the user completes it.
 * Returns the updated count and whether the reveal is now unlocked.
 */
export async function shareInvite(): Promise<{ count: number; unlocked: boolean }> {
  trackEvent('invite_share_opened');
  let completed = false;
  try {
    const result = await Share.share({ message: INVITE_MESSAGE });
    completed = result.action === Share.sharedAction;
  } catch {
    completed = false;
  }

  let count = await getInviteCount();
  if (completed) {
    // Cooldown: stop rapid repeat taps from counting as separate invites
    const now = Date.now();
    let last = 0;
    try { last = parseInt((await AsyncStorage.getItem(LAST_KEY)) || '0', 10); } catch {}
    if (now - last < COOLDOWN_MS) {
      return { count, unlocked: count >= INVITES_REQUIRED };
    }
    count += 1;
    try {
      await AsyncStorage.setItem(COUNT_KEY, String(count));
      await AsyncStorage.setItem(LAST_KEY, String(now));
      if (count >= INVITES_REQUIRED) {
        await AsyncStorage.setItem(UNLOCK_KEY, 'true');
        trackEvent('invite_unlock_earned');
      }
    } catch {}
    trackEvent('invite_share_completed', { count });
  }

  return { count, unlocked: count >= INVITES_REQUIRED };
}
