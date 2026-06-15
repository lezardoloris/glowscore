import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../theme';
import { fonts } from '../typography';
import { shadow } from '../shadows';
import type { ProductRecommendation } from '../services/recoEngine';
import { impactLight } from '../services/haptics';
import { AFFILIATE_DISCLOSURE } from '../data/bodyCareSafety';

export default function ProductRecoCard({ reco }: { reco: ProductRecommendation }) {
  if (!reco.product) return null;
  const p = reco.product;
  return (
    <Pressable
      style={[styles.card, shadow(1)]}
      onPress={() => { impactLight(); if (reco.affiliateUrl) Linking.openURL(reco.affiliateUrl); }}
    >
      <View style={styles.badge}><Text style={styles.badgeText}>Pick for you</Text></View>
      <Text style={styles.brand}>{p.brand}</Text>
      <Text style={styles.name}>{p.name}</Text>
      <Text style={styles.because} numberOfLines={2}>{reco.because}</Text>
      <View style={styles.ctaRow}>
        <Text style={styles.cta}>View product</Text>
        <Ionicons name="open-outline" size={14} color={C.pink} />
        {reco.affiliateUrl ? <Text style={styles.affTag}>Affiliate</Text> : null}
      </View>
    </Pressable>
  );
}

export function ProductRecoList({ recos }: { recos: ProductRecommendation[] }) {
  const withProduct = recos.filter((r) => r.product);
  if (!withProduct.length) return null;
  return (
    <View style={styles.list}>
      <Text style={styles.section}>Recommended for you</Text>
      {withProduct.map((r) => <ProductRecoCard key={r.ruleId + (r.product?.id || '')} reco={r} />)}
      <Text style={styles.disclosure}>{AFFILIATE_DISCLOSURE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 16, gap: 10 },
  section: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text, marginBottom: 4 },
  card: { backgroundColor: C.card, borderRadius: radii.lg, padding: 14 },
  badge: { alignSelf: 'flex-start', backgroundColor: C.pinkSoft, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: C.pink },
  brand: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft },
  name: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text, marginTop: 2 },
  because: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft, marginTop: 6, lineHeight: 17 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  cta: { fontFamily: fonts.bodyBold, fontSize: 13, color: C.pink },
  affTag: { fontFamily: fonts.body, fontSize: 10, color: C.textSoft, marginLeft: 'auto' },
  disclosure: { fontFamily: fonts.body, fontSize: 10, color: C.textSoft, marginTop: 6, lineHeight: 14 },
});
