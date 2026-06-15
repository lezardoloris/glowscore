import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CONFIG } from '../config';

const isWeb = Platform.OS === 'web';

const HD_COUNT_KEY = 'hd_generation_count';
const HD_DATE_KEY = 'hd_generation_date';
const STANDARD_COUNT_KEY = 'standard_generation_count';
const STANDARD_DATE_KEY = 'standard_generation_date';

async function resetIfNewDay(countKey: string, dateKey: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = await AsyncStorage.getItem(dateKey);

  if (lastDate !== today) {
    await AsyncStorage.setItem(countKey, '0');
    await AsyncStorage.setItem(dateKey, today);
    return 0;
  }

  const count = parseInt((await AsyncStorage.getItem(countKey)) || '0');
  return count;
}

export async function canGenerateHD(): Promise<boolean> {
  if (isWeb) return true; // Web preview — no limits
  const count = await resetIfNewDay(HD_COUNT_KEY, HD_DATE_KEY);
  return count < CONFIG.MAX_HD_TRANSFORMS_PER_DAY;
}

export async function recordHDGeneration(): Promise<void> {
  const count = await resetIfNewDay(HD_COUNT_KEY, HD_DATE_KEY);
  await AsyncStorage.setItem(HD_COUNT_KEY, String(count + 1));
}

// HARD PAYWALL: the free "preview" quota helpers were removed with the free tier.
