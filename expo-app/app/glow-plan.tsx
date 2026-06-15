import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import {
  getPlan, toggleTaskToday, isDoneToday, getStreak, getPlanWeek, getWeekFocus,
  GlowPlan, GlowTask, PlanCategory,
} from '../src/services/glowPlan';
import { recommendProducts, contextFromConcerns, ProductRecommendation } from '../src/services/recoEngine';
import { GlowProduct } from '../src/services/products';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Skincare: 'water-outline',
  'Face Fitness': 'fitness-outline',
  Lifestyle: 'moon-outline',
  'Style & Color': 'color-palette-outline',
  Makeup: 'brush-outline',
  Hair: 'cut-outline',
  Eyes: 'eye-outline',
  'Glow Habits': 'sparkles-outline',
};
const CAT_ORDER: PlanCategory[] = [
  'Skincare', 'Face Fitness', 'Eyes', 'Makeup', 'Hair', 'Style & Color', 'Lifestyle', 'Glow Habits',
];

export default function GlowPlanScreen() {
  const [plan, setPlan] = useState<GlowPlan | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackScreen('glow_plan');
    (async () => {
      setPlan(await getPlan());
      setStreak(await getStreak());
      setLoading(false);
    })();
  }, []);

  async function toggle(id: string) {
    impactMedium();
    const p = await toggleTaskToday(id);
    setPlan(p ? { ...p } : p);
    const s = await getStreak();
    setStreak(s);
    trackEvent('glowplan_task_toggled');
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

  const doneToday = plan.tasks.filter(isDoneToday).length;
  const total = plan.tasks.length;
  const pct = total ? Math.round((doneToday / total) * 100) : 0;
  const week = getPlanWeek(plan);

  // Group tasks by category, preserving a sensible category order
  const groups: { cat: PlanCategory; tasks: GlowTask[] }[] = [];
  for (const cat of CAT_ORDER) {
    const tasks = plan.tasks.filter((t) => (t.category || 'Glow Habits') === cat);
    if (tasks.length) groups.push({ cat, tasks });
  }
  // Any uncategorized fallthrough
  const known = new Set(groups.flatMap((g) => g.tasks.map((t) => t.id)));
  const rest = plan.tasks.filter((t) => !known.has(t.id));
  if (rest.length) groups.push({ cat: 'Glow Habits', tasks: rest });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.eyebrow}>YOUR GLOW-UP PLAN</Text>
      <Text style={styles.title}>{plan.personaLabel || 'Your Glow-Up'}</Text>
      {plan.intro ? <Text style={styles.intro}>{plan.intro}</Text> : null}

      <View style={styles.chipsRow}>
        {typeof plan.score === 'number' && (
          <View style={styles.chip}>
            <Ionicons name="analytics-outline" size={13} color={C.pink} />
            <Text style={styles.chipText}>GlowScore {plan.score}</Text>
          </View>
        )}
        <View style={styles.chip}>
          <Ionicons name="calendar-outline" size={13} color={C.pink} />
          <Text style={styles.chipText}>Week {week}/12 · {getWeekFocus(week)}</Text>
        </View>
      </View>

      {/* Progress + streak */}
      <View style={styles.statsCard}>
        <View style={styles.statBlock}>
          <Text style={styles.statNum}>{doneToday}<Text style={styles.statDen}>/{total}</Text></Text>
          <Text style={styles.statLabel}>done today</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBlock}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={22} color={C.pink} />
            <Text style={styles.statNum}>{streak}</Text>
          </View>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      {groups.map((g) => (
        <View key={g.cat} style={styles.group}>
          <View style={styles.groupHead}>
            <Ionicons name={CAT_ICON[g.cat] || 'sparkles-outline'} size={16} color={C.pink} />
            <Text style={styles.groupTitle}>{g.cat}</Text>
          </View>
          {g.tasks.map((t) => {
            const done = isDoneToday(t);
            return (
              <Pressable key={t.id} style={[styles.task, done && styles.taskDone]} onPress={() => toggle(t.id)}>
                <View style={[styles.checkBox, done && styles.checkDone]}>
                  {done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
                </View>
                <Text style={[styles.taskText, done && styles.taskTextDone]}>{t.text}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <RecommendedProducts />

      <Text style={styles.hint}>
        Check off a task each day to keep your streak. Re-scan weekly to watch your GlowScore climb.
      </Text>
    </ScrollView>
  );
}

function RecommendedProducts() {
  const [recs, setRecs] = useState<ProductRecommendation[]>([]);
  useEffect(() => {
    (async () => {
      let ids: string[] = [];
      try { ids = JSON.parse((await AsyncStorage.getItem('glow_concerns')) || '[]'); } catch {}
      const ctx = contextFromConcerns(ids);
      setRecs(recommendProducts(ctx, 6).filter((r) => r.product));
    })();
  }, []);
  if (!recs.length) return null;
  const tier = (b: GlowProduct['budgetTier']) => (b === 'budget' ? '$' : b === 'mid' ? '$$' : b === 'premium' ? '$$$' : '$$$$');
  return (
    <View style={styles.recoBlock}>
      <Text style={styles.recoTitle}>Recommended for you</Text>
      <Text style={styles.recoSub}>Picked for your concerns. Affiliate links support the app.</Text>
      {recs.map((r) => r.product ? (
        <Pressable key={r.ruleId + r.product.id} style={styles.recoCard} onPress={() => { trackEvent('product_tapped', { id: r.product!.id }); Linking.openURL(r.affiliateUrl || '').catch(() => {}); }}>
          <View style={styles.recoIcon}><Ionicons name="bag-handle-outline" size={18} color={C.pink} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recoBrand}>{r.product.brand}</Text>
            <Text style={styles.recoName} numberOfLines={1}>{r.product.name}</Text>
          </View>
          <Text style={styles.recoTier}>{tier(r.product.budgetTier)}</Text>
          <Ionicons name="open-outline" size={16} color={C.textSoft} />
        </Pressable>
      ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 64 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: C.textSoft, fontSize: 16, marginBottom: 18 },
  cta: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 26 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: { color: C.pink, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: C.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  intro: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginTop: 8 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.pinkSoft,
    borderRadius: 12, paddingHorizontal: 11, paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '800', color: C.pink },

  statsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: C.card, borderRadius: 20, paddingVertical: 18, marginTop: 16, marginBottom: 10,
  },
  statBlock: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 36, backgroundColor: C.border },
  statNum: { color: C.text, fontSize: 30, fontWeight: '900' },
  statDen: { color: C.textSoft, fontSize: 16, fontWeight: '800' },
  statLabel: { color: C.textSoft, fontSize: 12.5, marginTop: 2 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  progressTrack: { height: 8, backgroundColor: C.track, borderRadius: 4, overflow: 'hidden', marginBottom: 22 },
  progressFill: { height: '100%', backgroundColor: C.pink, borderRadius: 4 },

  group: { marginBottom: 18 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9, marginLeft: 2 },
  groupTitle: { color: C.text, fontSize: 14, fontWeight: '900', letterSpacing: 0.2 },

  task: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 15, padding: 15, marginBottom: 9 },
  taskDone: { backgroundColor: '#FDF4F7' },
  checkBox: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  checkDone: { backgroundColor: C.pink, borderColor: C.pink },
  taskText: { color: C.text, fontSize: 14.5, flex: 1, lineHeight: 20, fontWeight: '500' },
  taskTextDone: { color: C.textSoft, textDecorationLine: 'line-through' },

  hint: { color: C.textSoft, fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },

  recoBlock: { marginTop: 10, marginBottom: 8 },
  recoTitle: { color: C.text, fontSize: 16, fontWeight: '900' },
  recoSub: { color: C.textSoft, fontSize: 12, marginTop: 2, marginBottom: 10 },
  recoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 15, padding: 13, marginBottom: 9 },
  recoIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  recoBrand: { color: C.textSoft, fontSize: 11.5, fontWeight: '700' },
  recoName: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 1 },
  recoTier: { color: C.pink, fontSize: 13, fontWeight: '900', marginRight: 2 },
});
