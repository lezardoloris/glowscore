import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Onboarding quiz answers. Stored locally and used to personalize copy,
 * the glow-up plan, and (later) ad audiences. No PII.
 */

const KEY = 'quiz_profile';

export interface QuizProfile {
  glowUpType?: 'surgical' | 'non_surgical' | 'makeup';
  goals: string[];
  outcomes: string[];
  sleep?: string;
  diet?: string;
  workouts?: string;
  completedAt?: string; // ISO
}

export async function getQuizProfile(): Promise<QuizProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuizProfile) : null;
  } catch {
    return null;
  }
}

export async function saveQuizProfile(profile: QuizProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...profile, completedAt: new Date().toISOString() }));
  } catch {}
}
