import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AI processing consent (Apple requirement, Nov 2025): the user must give an
 * explicit opt-in before any photo is sent to a third-party AI service.
 * Collected once in onboarding; a guard before the first scan is the safety net.
 */

const KEY = 'ai_consent_granted';

export async function hasAiConsent(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setAiConsent(granted: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, granted ? 'true' : 'false');
  } catch {}
}
