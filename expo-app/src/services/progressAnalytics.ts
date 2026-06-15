import { ScanRecord, getScanHistory } from './history';

/**
 * Progress analytics over the scan history: per-metric trend (linear regression),
 * delta over a window, smoothing, and a human summary for the Progress tab.
 * Pure logic, no AI. Consume getProgressSummary() from the UI.
 */
export type Metric = 'overall' | 'skin' | 'jawline' | 'symmetry' | 'eyes' | 'harmony' | 'nose_lip_ratio' | 'lip_harmony';
export const METRICS: Metric[] = ['overall', 'skin', 'jawline', 'symmetry', 'eyes', 'harmony', 'nose_lip_ratio', 'lip_harmony'];
export const METRIC_LABEL: Record<Metric, string> = {
  overall: 'Overall', skin: 'Skin', jawline: 'Jawline', symmetry: 'Symmetry',
  eyes: 'Eye area', harmony: 'Harmony', nose_lip_ratio: 'Nose & lips', lip_harmony: 'Lips',
};

export interface MetricTrend {
  key: Metric; label: string;
  current: number; first: number;
  delta: number; pctDelta: number;
  slopePerWeek: number;     // regression slope normalized to points/week
  series: number[];         // oldest -> newest
  smoothed: number[];       // 3-point moving average
}

export interface ProgressSummary {
  scans: number;
  spanDays: number;
  overall: MetricTrend | null;
  mostImproved: MetricTrend | null;
  needsWork: MetricTrend | null;   // lowest current metric
  trendLabel: 'improving' | 'steady' | 'dipping' | 'new';
  headline: string;
  sparkline: number[];             // overall oldest -> newest
}

function asc(scans: ScanRecord[]): ScanRecord[] {
  return [...scans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** Least-squares slope of y over x (x in days), returned per 7 days. */
function slopePerWeek(xsDays: number[], ys: number[]): number {
  const n = ys.length;
  if (n < 2) return 0;
  const mx = xsDays.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xsDays[i] - mx) * (ys[i] - my); den += (xsDays[i] - mx) ** 2; }
  const perDay = den === 0 ? 0 : num / den;
  return perDay * 7;
}

function movingAvg(v: number[], w = 3): number[] {
  if (v.length < w) return [...v];
  return v.map((_, i) => {
    const s = Math.max(0, i - Math.floor(w / 2)), e = Math.min(v.length, i + Math.ceil(w / 2));
    const slice = v.slice(s, e);
    return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 10) / 10;
  });
}

export function trendFor(scansAsc: ScanRecord[], key: Metric): MetricTrend | null {
  const valid = scansAsc.filter((s) => typeof s[key] === 'number');
  if (valid.length === 0) return null;
  const series = valid.map((s) => s[key] as number);
  const t0 = new Date(valid[0].createdAt).getTime();
  const xsDays = valid.map((s) => (new Date(s.createdAt).getTime() - t0) / 86400000);
  const current = series[series.length - 1];
  const first = series[0];
  const delta = current - first;
  return {
    key, label: METRIC_LABEL[key],
    current, first, delta,
    pctDelta: first ? Math.round((delta / first) * 1000) / 10 : 0,
    slopePerWeek: Math.round(slopePerWeek(xsDays, series) * 10) / 10,
    series, smoothed: movingAvg(series),
  };
}

export function summarize(scans: ScanRecord[]): ProgressSummary {
  const s = asc(scans);
  if (s.length === 0) {
    return { scans: 0, spanDays: 0, overall: null, mostImproved: null, needsWork: null, trendLabel: 'new', headline: 'Take your first scan to start tracking.', sparkline: [] };
  }
  const spanDays = Math.round((new Date(s[s.length - 1].createdAt).getTime() - new Date(s[0].createdAt).getTime()) / 86400000);
  const overall = trendFor(s, 'overall');
  const subTrends = METRICS.filter((m) => m !== 'overall').map((m) => trendFor(s, m)).filter(Boolean) as MetricTrend[];
  const mostImproved = subTrends.length ? subTrends.reduce((a, b) => (b.delta > a.delta ? b : a)) : null;
  const needsWork = subTrends.length ? subTrends.reduce((a, b) => (b.current < a.current ? b : a)) : null;

  let trendLabel: ProgressSummary['trendLabel'] = 'new';
  let headline = 'Re-scan weekly to see your progress.';
  if (overall && s.length >= 2) {
    if (overall.slopePerWeek > 0.3) { trendLabel = 'improving'; headline = `Up ${overall.delta > 0 ? '+' : ''}${overall.delta} since you started${mostImproved && mostImproved.delta > 0 ? `, ${mostImproved.label.toLowerCase()} leading the glow-up` : ''}.`; }
    else if (overall.slopePerWeek < -0.3) { trendLabel = 'dipping'; headline = 'Slight dip. Stress, sleep or consistency? Lean back into your plan.'; }
    else { trendLabel = 'steady'; headline = 'Holding steady. Stay consistent to push the trend up.'; }
  } else if (overall) {
    headline = 'One scan logged. Re-scan in a week to reveal your trend.';
  }

  return { scans: s.length, spanDays, overall, mostImproved, needsWork, trendLabel, headline, sparkline: overall ? overall.series : [] };
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  const scans = await getScanHistory();
  return summarize(scans);
}
