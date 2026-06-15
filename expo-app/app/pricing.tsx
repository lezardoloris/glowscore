import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getOfferings, purchasePackage, purchaseProduct, restorePurchases } from '../src/services/subscription';
import { trackScreen } from '../src/services/analytics';
import { impactMedium } from '../src/services/haptics';
import { CONFIG } from '../src/config';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow, ctaShadow } from '../src/shadows';

type PlanType = 'weekly' | 'annual' | 'lifetime';

const BENEFITS = [
  'Detailed score & insights',
  'Unlimited personalized plan',
  'All AI Studio tools',
  'Advanced progress tracking',
  'Weekly plan updates',
];

export default function PricingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [offering, setOffering] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { trackScreen('pricing'); }, []);
  useEffect(() => { getOfferings().then(setOffering); }, []);

  async function purchase() {
    impactMedium();
    setPurchasing(true);
    setError(null);
    try {
      if (selectedPlan === 'lifetime') {
        const success = await purchaseProduct(CONFIG.LIFETIME_PRODUCT_ID);
        if (success) router.back();
        return;
      }
      if (!offering) { setError('Could not load plans. Check your connection.'); return; }
      const pkgId = selectedPlan === 'weekly' ? '$rc_weekly' : '$rc_annual';
      const pkg = offering.availablePackages?.find((p: any) => p.identifier === pkgId);
      if (!pkg) { setError('Plan not available.'); return; }
      const success = await purchasePackage(pkg);
      if (success) router.back();
    } catch (e: any) {
      setError(e.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  }

  async function restore() {
    impactMedium();
    try {
      const success = await restorePurchases();
      if (success) router.back();
      else setError('No active subscription found.');
    } catch (e: any) {
      setError(e.message);
    }
  }

  function selectPlan(plan: PlanType) {
    impactMedium();
    setSelectedPlan(plan);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="close" size={22} color={C.text} />
      </Pressable>

      <Text style={styles.title}>Unlock your full{'\n'}GlowUp potential</Text>

      <View style={[styles.benefitsCard, shadow(2)]}>
        {BENEFITS.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View style={styles.featureCheck}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        <PlanTile
          name="Weekly"
          price="$12.99/week"
          detail="Most flexible"
          selected={selectedPlan === 'weekly'}
          onPress={() => selectPlan('weekly')}
        />
        <PlanTile
          name="Annual"
          price="$59.99/year"
          detail="$1.15/week · Save 91%"
          badge="Popular"
          selected={selectedPlan === 'annual'}
          onPress={() => selectPlan('annual')}
        />
        <PlanTile
          name="Lifetime"
          price="$99.99"
          detail="One-time payment"
          badge="Best value"
          selected={selectedPlan === 'lifetime'}
          onPress={() => selectPlan('lifetime')}
        />
      </View>

      <Pressable onPress={purchase} disabled={purchasing}>
        <LinearGradient colors={C.pinkGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cta, ctaShadow()]}>
          <Text style={styles.ctaText}>{purchasing ? 'Processing…' : 'Continue'}</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.guaranteeRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color={C.good} />
        <Text style={styles.guarantee}>7-day money-back guarantee</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={restore}>
        <Text style={styles.legal}>Restore Purchases</Text>
      </Pressable>
      <Text style={styles.legalSmall}>
        Cancel anytime. Auto-renews unless cancelled 24h before period ends.
      </Text>
      <View style={styles.legalLinks}>
        <Text style={styles.legal} onPress={() => Linking.openURL('https://glowupai.app/terms')}>Terms of Use</Text>
        <Text style={styles.legal} onPress={() => Linking.openURL('https://glowupai.app/privacy')}>Privacy Policy</Text>
      </View>
    </ScrollView>
  );
}

function PlanTile({
  name, price, detail, badge, selected, onPress,
}: {
  name: string; price: string; detail: string; badge?: string;
  selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={[styles.plan, selected && styles.planSelected, shadow(1)]} onPress={onPress}>
      <View style={styles.planContent}>
        {badge ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        ) : null}
        <Text style={styles.planName}>{name}</Text>
        <Text style={styles.planPrice}>{price}</Text>
        <Text style={styles.planDetail}>{detail}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Ionicons name="checkmark" size={15} color="#fff" />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 56, paddingBottom: 60 },
  closeBtn: {
    position: 'absolute', top: 54, right: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', ...shadow(1),
  },
  title: { ...typography.h1, fontFamily: fonts.displayBold, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  benefitsCard: {
    backgroundColor: C.card, borderRadius: radii.xl, padding: 18, gap: 12, marginBottom: 22,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontFamily: fonts.bodySemi, fontSize: 15, color: C.text, flex: 1 },
  plans: { gap: 10, marginBottom: 20 },
  plan: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: radii.lg, borderWidth: 2, borderColor: 'transparent',
    backgroundColor: C.card,
  },
  planSelected: { borderColor: C.pink },
  planContent: { flex: 1 },
  planName: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.textSoft, marginBottom: 2 },
  planPrice: { fontFamily: fonts.bodyBold, fontSize: 19, color: C.text },
  planDetail: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft, marginTop: 2 },
  badge: {
    backgroundColor: C.pink, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: '#fff' },
  radio: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: C.pink, backgroundColor: C.pink },
  cta: { borderRadius: radii.full, paddingVertical: 18, alignItems: 'center', marginTop: 6 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 18 },
  guaranteeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  guarantee: { fontFamily: fonts.bodySemi, fontSize: 13, color: C.textSoft },
  error: { color: '#C2415B', fontSize: 13, textAlign: 'center', marginTop: 12 },
  legal: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft, textAlign: 'center', marginTop: 12 },
  legalSmall: { fontFamily: fonts.body, fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 8, opacity: 0.8 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
});
