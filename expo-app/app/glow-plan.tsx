import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import {
  getPlan, toggleTaskToday, isDoneToday, getStreak, getPlanWeek, getWeekFocus,
  getCurrentWeekDays, getCategoryCompletion, getDayCompletion,
  GlowPlan, GlowTask, PlanCategory,
} from '../src/services/glowPlan';
import { recommendForQuiz } from '../src/services/recoEngine';
import { getQuizProfile } from '../src/services/quizProfile';
import { ProductRecoList } from '../src/components/ProductRecoCard';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackPlanViewed, trackTaskCompleted } from '../src/services/analytics';

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Skincare: 'water-outline',
  'Face Fitness': 'fitness-outline',
  Lifestyle: 'moon-outline',
  'Style & Color': 'color-palette-outline',
  Makeup: 'brush-outline',
  Hair: 'cut-outline',
  Eyes: 'eye-outline',
  'Glow Habits': 'sparkles-outline',
  'Body Care': 'body-outline',
};
const CAT_ORDER: PlanCategory[] = [
  'Skincare', 'Body Care', 'Face Fitness', 'Eyes', 'Makeup', 'Hair', 'Style & Color', 'Lifestyle', 'Glow Habits',
];

export default function GlowPlanScreen() {
  const [plan, setPlan] = useState<GlowPlan | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recos, setRecos] = useState<ReturnType<typeof recommendForQuiz>>([]);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().split('T')[0]);
  const weekDays = getCurrentWeekDays();
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    trackScreen('glow_plan');
    (async () => {
      const [p, quiz] = await Promise.all([getPlan(), getQuizProfile()]);
      setPlan(p);
      trackPlanViewed(p?.persona);
      setStreak(await getStreak());
      setRecos(recommendForQuiz(quiz, 4));
      setLoading(false);
    })();
  }, []);

  async function toggle(id: string) {
    if (selectedDay !== todayKey) return;
    impactMedium();
    const p = await toggleTaskToday(id);
    setPlan(p ? { ...p } : p);
    const s = await getStreak();
    setStreak(s);
    trackTaskCompleted();
    if (s > 0) notificationSuccess();
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.pink} size="large" /></View>;
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No glow-up plan yet.</Text>
        <Pressable style={styles.cta} onPress={() => router.replace('/')}>
          <Text style={styles.ctaText}>Scan to get your plan</Text>
        </Pressable>
      </View>
    );
  }

  const week = getPlanWeek(plan);
  const dayStats = getDayCompletion(plan, selectedDay);
  const categoryRows = getCategoryCompletion(plan, selectedDay);
  const isToday = selectedDay === todayKey;

  const groups: { cat: PlanCategory; tasks: GlowTask[] }[] = [];
  for (const cat of CAT_ORDER) {
    const tasks = plan.tasks.filter((t) => (t.category || 'Glow Habits') === cat);
    if (tasks.length) groups.push({ cat, tasks });
  }
  const known = new Set(groups.flatMap((g) => g.tasks.map((t) => t.id)));
  const rest = plan.tasks.filter((t) => !known.has(t.id));
  if (rest.length) groups.push({ cat: 'Glow Habits', tasks: rest });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.eyebrow}>MY GLOW-UP PLAN</Text>
      <Text style={styles.title}>{plan.personaLabel || 'Your Glow-Up'}</Text>
      <Text style={styles.weekLabel}>Week {week}/12 · {getWeekFocus(week)}</Text>

      {/* Day selector M T W T F S S */}
      <View style={styles.dayRow}>
        {weekDays.map((d) => {
          const active = d.key === selectedDay;
          const dayDone = getDayCompletion(plan, d.key);
          const hasActivity = dayDone.done > 0;
          return (
            <Pressable
              key={d.key}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => { impactMedium(); setSelectedDay(d.key); }}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d.label}</Text>
              {hasActivity && <View style={[styles.dayDot, active && styles.dayDotActive]} />}
            </Pressable>
          );
        })}
      </View>

      {/* Category summary with % bars */}
      <View style={[styles.summaryCard, shadow(2)]}>
        {categoryRows.map((row) => (
          <View key={row.label} style={styles.catRow}>
            <View style={styles.catHead}>
              <Text style={styles.catTitle}>{row.label}</Text>
              <Text style={styles.catMeta}>{row.total} task{row.total > 1 ? 's' : ''} · {row.pct}%</Text>
            </View>
            <View style={styles.catTrack}>
              <View style={[styles.catFill, { width: `${row.pct}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Streak */}
      <View style={[styles.streakCard, shadow(1)]}>
        <Ionicons name="flame" size={22} color={C.pink} />
        <Text style={styles.streakText}>Current streak · {streak} day{streak !== 1 ? 's' : ''}</Text>
        <Text style={styles.streakPct}>{dayStats.done}/{dayStats.total} today</Text>
      </View>

      {!isToday && (
        <Text style={styles.viewHint}>Viewing {selectedDay}. Switch to today to check off tasks.</Text>
      )}

      {groups.map((g) => (
        <View key={g.cat} style={styles.group}>
          <View style={styles.groupHead}>
            <Ionicons name={CAT_ICON[g.cat] || 'sparkles-outline'} size={16} color={C.pink} />
            <Text style={styles.groupTitle}>{g.cat}</Text>
          </View>
          {g.tasks.map((t) => {
            const done = isToday ? isDoneToday(t) : t.completedDates.includes(selectedDay);
            return (
              <Pressable
                key={t.id}
                style={[styles.task, done && styles.taskDone]}
                onPress={() => toggle(t.id)}
                disabled={!isToday}
              >
                <View style={[styles.checkBox, done && styles.checkDone]}>
                  {done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
                </View>
                <Text style={[styles.taskText, done && styles.taskTextDone]}>{t.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <Pressable style={styles.linkRow} onPress={() => router.push('/body-care')}>
        <Ionicons name="body-outline" size={18} color={C.pink} />
        <Text style={styles.linkText}>Body glow & comfort hub</Text>
        <Ionicons name="chevron-forward" size={16} color={C.textSoft} />
      </Pressable>

      <Text style={styles.hint}>
        Check off a task each day to keep your streak. Re-scan weekly to watch your GlowScore climb.
      </Text>

      <ProductRecoList recos={recos} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 64 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { ...typography.body1, color: C.textSoft, marginBottom: 18 },
  cta: { backgroundColor: C.pink, borderRadius: radii.xl, paddingVertical: 14, paddingHorizontal: 26 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 15 },

  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  weekLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: C.pink, marginTop: 6, marginBottom: 14 },

  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayChip: {
    width: 40, height: 48, borderRadius: radii.md, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', ...shadow(1),
  },
  dayChipActive: { backgroundColor: C.pink },
  dayLabel: { fontFamily: fonts.bodyBold, fontSize: 13, color: C.textSoft },
  dayLabelActive: { color: '#fff' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.pink, marginTop: 4 },
  dayDotActive: { backgroundColor: '#fff' },

  summaryCard: { backgroundColor: C.card, borderRadius: radii.xl, padding: 16, marginBottom: 12, gap: 14 },
  catRow: { gap: 6 },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  catTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text },
  catMeta: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft },
  catTrack: { height: 6, backgroundColor: C.track, borderRadius: 3, overflow: 'hidden' },
  catFill: { height: '100%', backgroundColor: C.pink, borderRadius: 3 },

  streakCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card,
    borderRadius: radii.lg, padding: 14, marginBottom: 18,
  },
  streakText: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text, flex: 1 },
  streakPct: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.pink },

  viewHint: { ...typography.caption, textAlign: 'center', marginBottom: 12 },

  group: { marginBottom: 18 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9, marginLeft: 2 },
  groupTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text },

  task: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: radii.md,
    padding: 15, marginBottom: 9, ...shadow(1),
  },
  taskDone: { backgroundColor: C.blush },
  checkBox: {
    width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  checkDone: { backgroundColor: C.pink, borderColor: C.pink },
  taskText: { fontFamily: fonts.body, fontSize: 14.5, flex: 1, lineHeight: 20, color: C.text },
  taskTextDone: { color: C.textSoft, textDecorationLine: 'line-through' },

  hint: { ...typography.caption, textAlign: 'center', marginTop: 8 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card,
    borderRadius: radii.lg, padding: 14, marginTop: 12, ...shadow(1),
  },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 14, color: C.text, flex: 1 },
});
