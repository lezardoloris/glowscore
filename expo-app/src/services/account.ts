import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetSubscriber } from './subscription';
import { cancelAllNotifications } from './notifications';

/**
 * In-app account & data deletion (Apple Guideline 5.1.1(v) / Google Play).
 * Clears ALL locally stored data (onboarding, AI consent, quiz, plan, scan
 * history, invites, usage caches) and resets the RevenueCat identity so the
 * device is no longer associated with any purchase profile.
 *
 * The app keeps no server-side account: photos are never stored after scoring
 * (the Worker does not persist the raw selfie), so clearing local state + the
 * RevenueCat alias is a complete deletion from the user's perspective.
 */
export async function deleteAllData(): Promise<void> {
  try {
    await cancelAllNotifications();
  } catch {}
  try {
    await resetSubscriber();
  } catch {}
  try {
    await AsyncStorage.clear();
  } catch {}
}
