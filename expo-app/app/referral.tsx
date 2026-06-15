import { View, Text, Pressable, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { getReferralStats, shareReferral, redeemCode, ReferralStats, INVITER_GOAL } from '../src/services/referral';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen } from '../src/services/analytics';

export default function ReferralScreen() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { trackScreen('referral'); getReferralStats().then(setStats); }, []);

  async function onShare() { impactMedium(); setStats(await shareReferral()); }
  async function onRedeem() {
    const r = await redeemCode(code);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) { notificationSuccess(); setStats(await getReferralStats()); setCode(''); }
  }

  const shares = stats?.shares ?? 0;
  const pct = Math.min(100, (shares / INVITER_GOAL) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>

      <View style={styles.hero}>
        <View style={styles.giftCircle}><Ionicons name="gift" size={30} color="#fff" /></View>
        <Text style={styles.title}>Invite friends, both glow</Text>
        <Text style={styles.sub}>Share your code. Your friend gets a welcome bonus, and you unlock rewards as they join.</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your code</Text>
        <Text style={styles.code}>{stats?.code || '...'}</Text>
        <Pressable style={styles.cta} onPress={onShare}>
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={styles.ctaText}>Share my code</Text>
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHead}>
          <Text style={styles.progressTitle}>Invite reward</Text>
          <Text style={styles.progressCount}>{Math.min(shares, INVITER_GOAL)}/{INVITER_GOAL}</Text>
        </View>
        <View style={styles.track}><View style={[styles.fill, { width: `${pct}%` }]} /></View>
        <Text style={styles.progressSub}>
          {stats?.inviterRewardUnlocked ? 'Reward unlocked. Thank you for sharing the glow.' : `Share with ${INVITER_GOAL} friends to unlock your reward.`}
        </Text>
      </View>

      <Text style={styles.redeemLabel}>Have a friend's code?</Text>
      <View style={styles.redeemRow}>
        <TextInput
          style={styles.input}
          placeholder="GLOWXXXXXX"
          placeholderTextColor={C.textSoft}
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
          editable={!stats?.inviteeBonus}
        />
        <Pressable style={[styles.redeemBtn, stats?.inviteeBonus && styles.redeemBtnOff]} disabled={!!stats?.inviteeBonus} onPress={onRedeem}>
          <Text style={styles.redeemBtnText}>{stats?.inviteeBonus ? 'Redeemed' : 'Redeem'}</Text>
        </Pressable>
      </View>
      {msg && <Text style={[styles.msg, { color: msg.ok ? C.good : '#C2415B' }]}>{msg.text}</Text>}
      {stats?.inviteeBonus && !msg && <Text style={[styles.msg, { color: C.good }]}>Welcome bonus active.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 50 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  hero: { alignItems: 'center', marginBottom: 20 },
  giftCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.pink, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 24, fontWeight: '900', color: C.text, textAlign: 'center' },
  sub: { fontSize: 14, color: C.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  codeCard: { backgroundColor: C.card, borderRadius: 22, padding: 20, alignItems: 'center', marginBottom: 14 },
  codeLabel: { fontSize: 12.5, color: C.textSoft, fontWeight: '700' },
  code: { fontSize: 30, fontWeight: '900', color: C.pink, letterSpacing: 3, marginTop: 4, marginBottom: 16 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: C.pink, borderRadius: 26, paddingVertical: 15, paddingHorizontal: 28, alignSelf: 'stretch' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  progressCard: { backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 22 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  progressCount: { fontSize: 15, fontWeight: '900', color: C.pink },
  track: { height: 8, backgroundColor: C.track, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.pink, borderRadius: 4 },
  progressSub: { fontSize: 12.5, color: C.textSoft, marginTop: 10, lineHeight: 18 },
  redeemLabel: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 10 },
  redeemRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '700', color: C.text, letterSpacing: 1 },
  redeemBtn: { backgroundColor: C.pink, borderRadius: 14, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  redeemBtnOff: { opacity: 0.5 },
  redeemBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  msg: { fontSize: 13, fontWeight: '600', marginTop: 12, textAlign: 'center' },
});
