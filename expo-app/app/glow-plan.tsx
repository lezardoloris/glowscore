import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { getPlan, toggleTaskToday, isDoneToday, getStreak, GlowPlan } from '../src/services/glowPlan';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackEvent } from '../src/services/analytics';

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.title}>Your Glow-Up Plan</Text>

      <View style={styles.streakCard}>
        <Text style={styles.streakNum}>🔥 {streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>

      <Text style={styles.progress}>{doneToday}/{plan.tasks.length} done today</Text>

      {plan.tasks.map((t) => {
        const done = isDoneToday(t);
        return (
          <Pressable key={t.id} style={[styles.task, done && styles.taskDone]} onPress={() => toggle(t.id)}>
            <View style={[styles.checkBox, done && styles.checkDone]}>
              {done ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </View>
            <Text style={[styles.taskText, done && styles.taskTextDone]}>{t.text}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.hint}>
        Complete a task each day to keep your streak. Re-scan weekly to watch your GlowScore climb.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 60 },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: C.textSoft, fontSize: 16, marginBottom: 18 },
  cta: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 26 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  back: { alignSelf: 'flex-start', marginBottom: 6 },
  title: { color: C.text, fontSize: 26, fontWeight: '900', marginBottom: 16 },

  streakCard: { alignSelf: 'center', alignItems: 'center', backgroundColor: C.card, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 8 },
  streakNum: { color: C.text, fontSize: 34, fontWeight: '900' },
  streakLabel: { color: C.textSoft, fontSize: 13, marginTop: 2 },
  progress: { color: C.textSoft, fontSize: 13, textAlign: 'center', marginBottom: 18, fontWeight: '600' },

  task: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10 },
  taskDone: { backgroundColor: '#FDF4F7' },
  checkBox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  checkDone: { backgroundColor: C.pink, borderColor: C.pink },
  taskText: { color: C.text, fontSize: 15, flex: 1, lineHeight: 20, fontWeight: '500' },
  taskTextDone: { color: C.textSoft, textDecorationLine: 'line-through' },

  hint: { color: C.textSoft, fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
