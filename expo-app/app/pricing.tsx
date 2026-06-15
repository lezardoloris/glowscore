import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getOfferings, purchasePackage, purchaseProduct, restorePurchases } from '../src/services/subscription';
import { trackScreen } from '../src/services/analytics';
import { CONFIG } from '../src/config';
import { PAYWALL_BENEFITS } from '../src/data/routineCopy';

type PlanType = 'weekly' | 'annual' | 'lifetime';

// Aura palette (light pink clinical-feminine theme)
const C = {
  bg: '#F9E0E8',
  card: '#FFFFFF',
  border: '#F2C4D2',
  pink: '#E0537A',
  pinkSoft: '#F8D4DF',
  text: '#2D2330',
  textSoft: '#8A7B85',
};

const FEATURES = PAYWALL_BENEFITS;

export default function PricingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [offering, setOffering] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { trackScreen('pricing'); }, []);

  useEffect(() => {
    getOfferings().then(setOffering);
  }, []);

  async function purchase() {
    setPurchasing(true);
    setError(null);
    try {
      if (selectedPlan === 'lifetime') {
        const success = await purchaseProduct(CONFIG.LIFETIME_PRODUCT_ID);
        if (success) router.back();
        return;
      }

      if (!offering) {
        setError('Could not load plans. Check your connection.');
        return;
      }
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
    try {
      const success = await restorePurchases();
      if (success) router.back();
      else setError('No active subscription found.');
    } catch (e: any) {
      setError(e.message);
    }
  }

  function getCTAText(): string {
    if (purchasing) return 'Processing...';
    if (selectedPlan === 'lifetime') return 'Unlock Forever';
    return 'Unlock Your Glow Up';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Close button (discreet, Aura-style X) */}
      <Pressable style={styles.closeBtn} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="close" size={22} color={C.text} />
      </Pressable>

      {/* Headline */}
      <Text style={styles.sparkle}>✨</Text>
      <Text style={styles.title}>
        Unlock Your{'\n'}<Text style={{ color: C.pink }}>Glow Up</Text>
      </Text>
      <Text style={styles.subtitle}>Your full Facial Harmony report and personalized plan are ready</Text>

      {/* Feature checklist */}
      <View style={styles.features}>
        {FEATURES.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureCheck}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Plan cards */}
      <View style={styles.plans}>
        {/* Annual first (anchor, best value) */}
        <Pressable
          style={[styles.plan, selectedPlan === 'annual' && styles.planSelected]}
          onPress={() => setSelectedPlan('annual')}
        >
          <View style={styles.planContent}>
            <View style={styles.bestValue}>
              <Text style={styles.bestValueText}>BEST VALUE 🔥</Text>
            </View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planPrice}>$59.99/year</Text>
            <Text style={styles.planDetail}>$1.15/week, Save 91%</Text>
          </View>
          <View style={[styles.radio, selectedPlan === 'annual' && styles.radioSelected]}>
            {selectedPlan === 'annual' && <Ionicons name="checkmark" size={15} color="#fff" />}
          </View>
        </Pressable>

        {/* Weekly */}
        <Pressable
          style={[styles.plan, selectedPlan === 'weekly' && styles.planSelected]}
          onPress={() => setSelectedPlan('weekly')}
        >
          <View style={styles.planContent}>
            <Text style={styles.planName}>Weekly</Text>
            <Text style={styles.planPrice}>$12.99/week</Text>
            <Text style={styles.planDetail}>Most flexible, cancel anytime</Text>
          </View>
          <View style={[styles.radio, selectedPlan === 'weekly' && styles.radioSelected]}>
            {selectedPlan === 'weekly' && <Ionicons name="checkmark" size={15} color="#fff" />}
          </View>
        </Pressable>

        {/* Lifetime */}
        <Pressable
          style={[styles.plan, selectedPlan === 'lifetime' && styles.planSelected]}
          onPress={() => setSelectedPlan('lifetime')}
        >
          <View style={styles.planContent}>
            <Text style={styles.planName}>Lifetime</Text>
            <Text style={styles.planPrice}>$99.99</Text>
            <Text style={styles.planDetail}>One-time, pays off in under 2 years</Text>
          </View>
          <View style={[styles.radio, selectedPlan === 'lifetime' && styles.radioSelected]}>
            {selectedPlan === 'lifetime' && <Ionicons name="checkmark" size={15} color="#fff" />}
          </View>
        </Pressable>
      </View>

      <Text style={styles.guarantee}>7-day satisfaction guarantee on annual and lifetime plans</Text>

      {/* Primary CTA */}
      <Pressable style={styles.cta} onPress={purchase} disabled={purchasing}>
        <Text style={styles.ctaText}>{getCTAText()}</Text>
      </Pressable>
      <Text style={styles.socialProof}>Cancel anytime · Join 10,000+ members</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Legal footer */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingTop: 56, paddingBottom: 60 },
  closeBtn: {
    position: 'absolute', top: 54, right: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  sparkle: { fontSize: 44, textAlign: 'center', marginTop: 4 },
  title: { fontSize: 36, fontWeight: '900', color: C.text, textAlign: 'center', marginTop: 8, lineHeight: 42 },
  subtitle: { fontSize: 15, color: C.textSoft, textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 21 },
  features: { gap: 12, marginBottom: 26 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.pink,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 15, color: C.text, fontWeight: '600', flex: 1 },
  plans: { gap: 10, marginBottom: 20 },
  plan: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 18, borderWidth: 2, borderColor: 'transparent',
    backgroundColor: C.card,
  },
  planSelected: { borderColor: C.pink },
  planContent: { flex: 1 },
  planName: { fontSize: 14, fontWeight: '700', color: C.textSoft, marginBottom: 2 },
  planPrice: { fontSize: 19, fontWeight: '900', color: C.text },
  planDetail: { fontSize: 12, color: C.textSoft, marginTop: 2 },
  bestValue: { backgroundColor: C.pink, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  bestValueText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  radio: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: C.pink, backgroundColor: C.pink },
  cta: {
    backgroundColor: C.pink, borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginTop: 6,
    shadowColor: '#D98CA4', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  socialProof: { fontSize: 13, color: C.textSoft, textAlign: 'center', marginTop: 12, fontWeight: '600' },
  guarantee: { fontSize: 12, color: C.pink, textAlign: 'center', marginBottom: 12, fontWeight: '700' },
  error: { color: '#C2415B', fontSize: 13, textAlign: 'center', marginTop: 12 },
  legal: { fontSize: 12, color: C.textSoft, textAlign: 'center', marginTop: 12 },
  legalSmall: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 8, opacity: 0.8 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
});
