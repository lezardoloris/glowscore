import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'transformation_history';
const MAX_RECORDS = 100;

export interface TransformationRecord {
  id: string;
  styleId: string;
  styleName: string;
  originalUri: string;
  resultUri: string;
  isHD: boolean;
  createdAt: string; // ISO string
}

export async function getHistory(): Promise<TransformationRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const records: TransformationRecord[] = JSON.parse(raw);
    // Return sorted newest-first
    return records.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    console.warn('[History] Failed to load history:', e);
    return [];
  }
}

export async function addToHistory(record: TransformationRecord): Promise<void> {
  try {
    const existing = await getHistory();
    const updated = [record, ...existing].slice(0, MAX_RECORDS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[History] Failed to save record:', e);
  }
}

// ─── GlowScore scan history (retention: track score over time) ───────────────

const SCAN_KEY = 'glowscore_history';
const MAX_SCANS = 60;

export interface ScanRecord {
  id: string;
  createdAt: string; // ISO string
  overall: number;
  skin: number;
  jawline: number;
  symmetry: number;
  eyes: number;
  harmony: number;
  nose_lip_ratio: number;
  lip_harmony: number;
  potential: number;
  percentile: number;
}

export async function getScanHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_KEY);
    if (!raw) return [];
    const records: ScanRecord[] = JSON.parse(raw);
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.warn('[History] Failed to load scans:', e);
    return [];
  }
}

export async function getLastScan(): Promise<ScanRecord | null> {
  const scans = await getScanHistory();
  return scans[0] || null;
}

export async function saveScan(record: ScanRecord): Promise<void> {
  try {
    const existing = await getScanHistory();
    const updated = [record, ...existing].slice(0, MAX_SCANS);
    await AsyncStorage.setItem(SCAN_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[History] Failed to save scan:', e);
  }
}
