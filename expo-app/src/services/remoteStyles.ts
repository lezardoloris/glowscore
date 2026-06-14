import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG, STYLE_PRESETS, workerHeaders } from '../config';

const isWeb = Platform.OS === 'web';

const CACHE_KEY = 'remote_styles_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface RemoteStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium: boolean;
  isNew?: boolean;
  order?: number;
}

interface CachedStyles {
  styles: RemoteStyle[];
  timestamp: number;
}

/**
 * Fetches style presets from the Cloudflare Worker API.
 * Falls back to local STYLE_PRESETS on failure.
 * Caches results in AsyncStorage with a 1-hour TTL.
 */
export async function fetchRemoteStyles(): Promise<RemoteStyle[]> {
  // On web in dev mode, return local presets immediately (Worker may not be deployed)
  if (isWeb && __DEV__) {
    return STYLE_PRESETS.map((s, i) => ({
      ...s,
      isNew: false,
      order: i,
    }));
  }

  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedStyles = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      if (age < CACHE_TTL_MS && parsed.styles.length > 0) {
        return parsed.styles;
      }
    }
  } catch (cacheErr) {
    console.warn('[remoteStyles] Cache read error:', cacheErr);
  }

  // Fetch from Worker
  try {
    const response = await fetch(`${CONFIG.WORKER_BASE_URL}/api/styles`, {
      method: 'GET',
      headers: workerHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }

    const data = await response.json();
    const styles: RemoteStyle[] = (data.styles || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      icon: s.icon || '',
      isPremium: s.isPremium ?? true,
      isNew: s.isNew ?? false,
      order: s.order ?? 0,
    }));

    if (styles.length === 0) {
      throw new Error('Empty styles response');
    }

    // Sort by order field
    styles.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Cache the result
    try {
      const toCache: CachedStyles = { styles, timestamp: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache));
    } catch (cacheErr) {
      console.warn('[remoteStyles] Cache write error:', cacheErr);
    }

    return styles;
  } catch (fetchErr) {
    console.warn('[remoteStyles] Fetch failed, using local presets:', fetchErr);

    // Fall back to local STYLE_PRESETS
    return STYLE_PRESETS.map((s, i) => ({
      ...s,
      isNew: false,
      order: i,
    }));
  }
}
