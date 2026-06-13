import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Glow-up plan: turns the static scan tips into a persistent daily checklist
 * with a streak. This is the core week-2+ retention loop — a reason to open
 * the app every day that costs no AI call.
 */

const PLAN_KEY = 'glow_plan';

export interface GlowTask {
  id: string;
  text: string;
  completedDates: string[]; // 'YYYY-MM-DD'
}

export interface GlowPlan {
  createdAt: string; // ISO
  tasks: GlowTask[];
}

function dayKey(d: Date = new Date()): string {
  return d.toISOString().split('T')[0];
}

export async function getPlan(): Promise<GlowPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as GlowPlan) : null;
  } catch {
    return null;
  }
}

/**
 * Create/refresh the plan from the latest scan tips. Completion history is
 * preserved for tasks whose text is unchanged.
 */
export async function savePlanFromTips(tips: string[]): Promise<void> {
  if (!tips || tips.length === 0) return;
  try {
    const existing = await getPlan();
    const byText: Record<string, GlowTask> = {};
    existing?.tasks.forEach((t) => { byText[t.text] = t; });
    const tasks: GlowTask[] = tips.map((text, i) => byText[text] || {
      id: `${Date.now()}-${i}`,
      text,
      completedDates: [],
    });
    const plan: GlowPlan = { createdAt: existing?.createdAt || new Date().toISOString(), tasks };
    await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (e) {
    console.warn('[GlowPlan] save failed:', e);
  }
}

export function isDoneToday(task: GlowTask): boolean {
  return task.completedDates.includes(dayKey());
}

/** Toggle a task's completion for today. Returns the updated plan. */
export async function toggleTaskToday(taskId: string): Promise<GlowPlan | null> {
  const plan = await getPlan();
  if (!plan) return null;
  const today = dayKey();
  for (const t of plan.tasks) {
    if (t.id === taskId) {
      t.completedDates = isDoneToday(t)
        ? t.completedDates.filter((d) => d !== today)
        : [...t.completedDates, today];
      break;
    }
  }
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  return plan;
}

/** 12-week blueprint (EPIC 5.1): which program week the plan is in (1..12). */
export function getPlanWeek(plan: GlowPlan): number {
  const days = Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}

/** Weekly focus rotation across the 6 diagnostic components. */
const WEEK_FOCUS = [
  'Skin Clarity', 'Eye Area', 'Jawline Definition', 'Facial Symmetry', 'Lips & Smile', 'Nose & Profile',
];
export function getWeekFocus(week: number): string {
  return WEEK_FOCUS[(week - 1) % WEEK_FOCUS.length];
}

/** Consecutive days (ending today or yesterday) with at least one task done. */
export async function getStreak(): Promise<number> {
  const plan = await getPlan();
  if (!plan) return 0;
  const done = new Set<string>();
  plan.tasks.forEach((t) => t.completedDates.forEach((d) => done.add(d)));
  if (done.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count if today isn't done yet but yesterday is
  if (!done.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (done.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
