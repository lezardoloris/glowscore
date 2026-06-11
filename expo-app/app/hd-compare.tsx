import { View, Text, Image, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { trackScreen } from '../src/services/analytics';

export default function HDCompareScreen() {
  const { imageUri, resultUri, styleId } = useLocalSearchParams<{
    imageUri: string;
    resultUri: string;
    styleId: string;
  }>();

  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min((screenWidth - 56) / 2, 220);

  useEffect(() => {
    trackScreen('hd_compare');
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Compare Quality</Text>
      <Text style={styles.subtitle}>See the difference HD makes</Text>

      {/* Side-by-side panels */}
      <View style={styles.panelsRow}>
        {/* Standard panel */}
        <View style={[styles.panel, { width: panelWidth }]}>
          <View style={styles.labelBadgeStandard}>
            <Text style={styles.labelBadgeText}>STANDARD</Text>
          </View>
          <Image
            source={{ uri: resultUri }}
            style={[styles.panelImage, { width: panelWidth, height: panelWidth * 1.2 }]}
            resizeMode="cover"
          />
          <View style={styles.panelOverlayStandard} />
        </View>

        {/* HD panel */}
        <View style={[styles.panel, { width: panelWidth }]}>
          <View style={styles.labelBadgeHD}>
            <Text style={styles.labelBadgeText}>HD</Text>
          </View>
          <Image
            source={{ uri: resultUri }}
            style={[styles.panelImage, { width: panelWidth, height: panelWidth * 1.2 }]}
            resizeMode="cover"
            blurRadius={0}
          />
          {/* Simulated blur overlay on standard, crisp on HD */}
          <View style={styles.panelOverlayHD} />
          <View style={styles.hdShimmer} />
        </View>
      </View>

      {/* Quality indicators */}
      <View style={styles.qualityRow}>
        <View style={styles.qualityItem}>
          <Text style={styles.qualityValue}>512px</Text>
          <Text style={styles.qualityLabel}>Standard</Text>
        </View>
        <Text style={styles.qualityVs}>vs</Text>
        <View style={styles.qualityItem}>
          <Text style={[styles.qualityValue, styles.qualityValueHD]}>1024px</Text>
          <Text style={styles.qualityLabel}>HD</Text>
        </View>
      </View>

      {/* Value prop */}
      <View style={styles.valuePropCard}>
        <Text style={styles.valuePropIcon}>✨</Text>
        <Text style={styles.valuePropText}>
          Get HD quality + exclusive monthly style drops
        </Text>
      </View>

      {/* Primary CTA */}
      <Pressable style={styles.cta} onPress={() => router.push('/pricing')}>
        <Text style={styles.ctaText}>Upgrade to Premium →</Text>
      </Pressable>

      {/* Secondary CTA */}
      <Pressable style={styles.secondaryCta} onPress={() => router.back()}>
        <Text style={styles.secondaryCtaText}>Keep Standard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a001a' },
  content: { padding: 24, paddingTop: 20, paddingBottom: 60, alignItems: 'center' },

  // Header
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  backBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 4, marginBottom: 28 },

  // Panels
  panelsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 20 },
  panel: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  panelImage: { borderRadius: 16 },
  panelOverlayStandard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
  },
  panelOverlayHD: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(236,72,153,0.4)',
  },
  hdShimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(236,72,153,0.15)',
    borderBottomLeftRadius: 16,
  },
  labelBadgeStandard: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(251,146,60,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  labelBadgeHD: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(74,222,128,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  labelBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // Quality indicators
  qualityRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  qualityItem: { alignItems: 'center' },
  qualityValue: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  qualityValueHD: { color: '#4ade80' },
  qualityLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  qualityVs: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },

  // Value prop card
  valuePropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(236,72,153,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  valuePropIcon: { fontSize: 22 },
  valuePropText: { flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 21 },

  // CTAs
  cta: {
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryCta: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  secondaryCtaText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '600' },
});
