import {
  View, Text, Image, Pressable, StyleSheet, ScrollView, ActivityIndicator,
  Share, Linking, Platform, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackEvent, trackScanStart, trackScanComplete, trackScoreRevealed } from '../src/services/analytics';
import { checkSubscription, getSubscriberToken } from '../src/services/subscription';
import { faceScan, GlowScore } from '../src/services/faceScan';
import AnalysisLoader from '../src/components/AnalysisLoader';
import { saveScan, getLastScan, ScanRecord } from '../src/services/history';
import { savePlanForProfile } from '../src/services/glowPlan';
import { scheduleRescanReminder } from '../src/services/notifications';
import { captureAndShare } from '../src/services/shareCapture';
import {
  shareInvite, getInviteCount, isInviteUnlocked, INVITES_REQUIRED,
} from '../src/services/inviteUnlock';
import { hasAiConsent, setAiConsent } from '../src/services/aiConsent';
import { getQuizProfile } from '../src/services/quizProfile';
import { transformTeaser } from '../src/services/transform';
import ShareCard from '../src/components/ShareCard';
import AnimatedBar from '../src/components/AnimatedBar';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import AnimatedNumbers from 'react-native-animated-numbers';
import SoftConfetti from '../src/components/SoftConfetti';
import { theme as C, radii } from '../src/theme';
import { fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import { recommendForQuiz } from '../src/services/recoEngine';
import { ProductRecoList } from '../src/components/ProductRecoCard';

const WEB_FRAME_W = 440;

const LOCK_BG = '#EFEAEC';
const LOCK_ICON = '#9B8F96';

// The 6 diagnostic components, ranked most → least relevant for the female
// glow-up persona (see market-research/diagnostic-composants-visage.md).
// Each has a generated clinical-luxe thumbnail (assets/components/*).
const METRIC_DEFS = [
  { key: 'skin', img: require('../assets/components/skin.png'), title: 'Skin Clarity', subtitle: 'Evenness, texture & glow' },
  { key: 'symmetry', img: require('../assets/components/symmetry.png'), title: 'Facial Symmetry', subtitle: 'How balanced your features are' },
  { key: 'nose_lip_ratio', img: require('../assets/components/nose.png'), title: 'Nose & Profile', subtitle: 'Balance of your nose and profile' },
  { key: 'eyes', img: require('../assets/components/eyes.png'), title: 'Eye Area', subtitle: 'Brightness, contour & openness' },
  { key: 'jawline', img: require('../assets/components/jawline.png'), title: 'Jawline Definition', subtitle: 'Definition of your lower face' },
  { key: 'lip_harmony', img: require('../assets/components/lips.png'), title: 'Lips & Smile', subtitle: 'Shape, balance & smile' },
] as const;

export default function ScanResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<GlowScore | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [inviteUnlocked, setInviteUnlocked] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const [prevOverall, setPrevOverall] = useState<number | null>(null);
  const [awaitingConsent, setAwaitingConsent] = useState(false);
  const [consentTick, setConsentTick] = useState(0);
  const [teaserUri, setTeaserUri] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [animatedTarget, setAnimatedTarget] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [avatarBlur, setAvatarBlur] = useState(22);
  const [productRecos, setProductRecos] = useState<ReturnType<typeof recommendForQuiz>>([]);
  const sawLocked = useRef(false);
  const pagerRef = useRef<ScrollView>(null);
  // Pager pages must match the visible frame width, not the browser window.
  // On web the phone frame is capped at WEB_FRAME_W; on native use full screen.
  const { width: winW } = useWindowDimensions();
  const pagerW = Platform.OS === 'web' ? Math.min(winW, WEB_FRAME_W) : winW;
  const mounted = useRef(true);
  const shareRef = useRef<View>(null);

  const unlocked = isSubscribed || inviteUnlocked;

  useEffect(() => {
    trackScreen('scan_result');
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    (async () => {
      if (!imageUri) { setError('No photo provided.'); setLoading(false); return; }

      // Apple compliance: never send the photo to the AI without explicit consent.
      const consent = await hasAiConsent();
      if (!consent) {
        if (mounted.current) { setAwaitingConsent(true); setLoading(false); }
        return;
      }
      if (mounted.current) { setAwaitingConsent(false); setAnalysisComplete(false); }
      trackScanStart('scan_result');

      try {
        const [sub, invUnlocked, invCount] = await Promise.all([
          checkSubscription(), isInviteUnlocked(), getInviteCount(),
        ]);
        if (mounted.current) {
          setIsSubscribed(sub);
          setInviteUnlocked(invUnlocked);
          setInviteCount(invCount);
        }
        const token = sub ? await getSubscriberToken() : undefined;

        // Read the previous scan BEFORE saving the new one (for the delta)
        const prev = await getLastScan();
        if (mounted.current && prev) setPrevOverall(prev.overall);

        // Persona-branching (EPIC 7.2): bias the scan toward the quiz focus
        const quiz = await getQuizProfile();
        const focus = quiz?.goals?.length ? quiz.goals.join(', ') : quiz?.glowUpType;
        if (mounted.current) setProductRecos(recommendForQuiz(quiz, 4));

        const res = await faceScan(imageUri, token, focus || undefined);
        if (!mounted.current) return;
        if (!res.overall) { setError('No face detected. Try a clear, front-facing selfie.'); setLoading(false); return; }
        setScore(res);
        setLoading(false);
        notificationSuccess();
        trackScanComplete(res.overall);

        // Maxed-Out Self teaser (EPIC 4.4): pre-generate the glow_max so the
        // locked reveal shows HER blurred potential right before the paywall.
        if (!sub) {
          transformTeaser(imageUri).then((uri) => {
            if (mounted.current && uri) setTeaserUri(uri);
          }).catch(() => {});
        }

        // Retention plumbing (fire-and-forget): persist scan, build plan, schedule rescan
        const record: ScanRecord = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          overall: res.overall, skin: res.skin, jawline: res.jawline,
          symmetry: res.symmetry, eyes: res.eyes, harmony: res.harmony,
          nose_lip_ratio: res.nose_lip_ratio, lip_harmony: res.lip_harmony,
          potential: res.potential, percentile: res.percentile,
        };
        saveScan(record).catch(() => {});
        // Persona + score aware glow-up plan (built from the quiz + this scan).
        savePlanForProfile(quiz, {
          overall: res.overall, skin: res.skin, jawline: res.jawline,
          symmetry: res.symmetry, eyes: res.eyes, harmony: res.harmony,
          nose_lip_ratio: res.nose_lip_ratio, lip_harmony: res.lip_harmony,
        }).catch(() => {});
        scheduleRescanReminder(res.overall).catch(() => {});
      } catch (e: any) {
        if (mounted.current) { setError(e?.message || 'Scan failed'); setLoading(false); }
      }
    })();
  }, [imageUri, consentTick]);

  useEffect(() => {
    if (score && !unlocked) sawLocked.current = true;
  }, [score, unlocked]);

  useEffect(() => {
    if (!score || !unlocked) return;
    if (sawLocked.current) {
      setShowConfetti(true);
      let b = 22;
      const blurId = setInterval(() => {
        b -= 2;
        setAvatarBlur(Math.max(0, b));
        if (b <= 0) clearInterval(blurId);
      }, 45);
      sawLocked.current = false;
    } else {
      setAvatarBlur(0);
    }
    const t1 = setTimeout(() => setAnimatedTarget(score.overall), 150);
    const t2 = setTimeout(() => { impactMedium(); trackScoreRevealed(score.overall, true); }, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [score, unlocked]);

  async function grantConsentAndScan() {
    await setAiConsent(true);
    trackEvent('ai_consent_granted', { source: 'scan_result' });
    if (mounted.current) {
      setAwaitingConsent(false);
      setLoading(true);
      setConsentTick((t) => t + 1);
    }
  }

  function goToPage(idx: number) {
    const clamped = Math.max(0, Math.min(1, idx));
    pagerRef.current?.scrollTo({ x: clamped * pagerW, animated: true });
    setPage(clamped);
  }

  function openPaywall() {
    trackEvent('unlock_glowup_tapped', { page });
    router.push('/pricing');
  }

  async function handleInvite() {
    const result = await shareInvite();
    if (!mounted.current) return;
    setInviteCount(result.count);
    if (result.unlocked && !inviteUnlocked) {
      setInviteUnlocked(true);
      notificationSuccess();
    }
  }

  function seePotential() {
    trackEvent('glowscore_potential_tapped', { subscribed: isSubscribed });
    if (isSubscribed) router.push({ pathname: '/processing', params: { imageUri, styleId: 'glow_max' } });
    else router.push('/pricing');
  }

  async function shareScore() {
    if (!score) return;
    trackEvent('glowscore_shared');
    await captureAndShare(shareRef, async () => {
      await Share.share({
        message: `My Facial Harmony is ${score.overall}/100, top ${Math.max(1, 100 - score.percentile)}%. Glow-up potential ${score.potential}. What's yours?`,
      });
    });
  }

  // ── AI consent gate (safety net before any photo leaves the device) ───────
  if (awaitingConsent) {
    return (
      <View style={styles.center}>
        <View style={styles.consentIcon}>
          <Ionicons name="sparkles" size={34} color={C.pink} />
        </View>
        <Text style={styles.consentTitle}>Analyze your photo with AI?</Text>
        <Text style={styles.consentBody}>
          Your photo is sent securely to our AI provider to generate your report. It is not stored
          afterwards, and never sold or used to train other models.
        </Text>
        <Pressable style={styles.consentBtn} onPress={grantConsentAndScan}>
          <Text style={styles.consentBtnText}>I Agree &amp; Continue</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')} hitSlop={8}>
          <Text style={styles.consentCancel}>Not now</Text>
        </Pressable>
        <Text style={styles.consentLegal} onPress={() => Linking.openURL('https://glowupai.app/privacy')}>
          Privacy Policy
        </Text>
      </View>
    );
  }

  // ── Loading / multi-step analysis (always show the full sequence) ──────────
  if (loading || (!!score && !analysisComplete && !error)) {
    return (
      <AnalysisLoader
        photo={typeof imageUri === 'string' ? imageUri : undefined}
        onComplete={() => { setAnalysisComplete(true); if (score) trackScoreRevealed(score.overall, unlocked); }}
      />
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !score) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>{error || 'Something went wrong.'}</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.replace('/')}>
          <Text style={styles.primaryBtnText}>Try Another Photo</Text>
        </Pressable>
      </View>
    );
  }

  const delta = prevOverall != null ? score.overall - prevOverall : null;
  const treatments = score.treatments?.length
    ? score.treatments
    : score.tips.slice(0, 3).map((t, i) => ({ name: `Treatment ${i + 1}`, detail: t, impact: 70 - i * 8 }));

  return (
    <View style={styles.container}>
      <SoftConfetti active={showConfetti && unlocked} onDone={() => setShowConfetti(false)} />
      {/* Off-screen branded card used as the share asset (unlocked only) */}
      {unlocked && (
        <View ref={shareRef} collapsable={false} style={styles.offscreen}>
          <ShareCard score={score} imageUri={imageUri} />
        </View>
      )}

      {/* Top bar: stepper pill + close */}
      <View style={styles.topBar}>
        <View style={styles.stepperPill}>
          <View style={page === 0 ? styles.stepDotActive : styles.stepDot} />
          <View style={page === 1 ? styles.stepDotActive : styles.stepDot} />
        </View>
        <Pressable style={styles.closeBtn} onPress={() => router.replace('/(tabs)')} hitSlop={10}>
          <Ionicons name="close" size={24} color={C.text} />
        </Pressable>
      </View>

      {/* Pager: Harmony page + Plan page */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / pagerW))}
        style={{ flex: 1 }}
      >
        {/* ── PAGE 1: Your Facial Harmony ── */}
        <ScrollView style={{ width: pagerW }} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Your Facial{'\n'}Harmony</Text>

            {/* Harmony hero: animated radial ring gauge + score count-up */}
            <View style={styles.heroCardCenter}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.heroAvatar}
                  blurRadius={unlocked ? avatarBlur : 22}
                />
              ) : null}
              <AnimatedCircularProgress
                size={156}
                width={13}
                fill={unlocked ? score.overall : 100}
                tintColor={unlocked ? C.pink : C.trackLocked}
                backgroundColor={C.track}
                rotation={0}
                lineCap="round"
                duration={1400}
              >
                {() => (
                  <View style={styles.ringInner}>
                    {unlocked ? (
                      <View style={styles.ringScoreRow}>
                        <AnimatedNumbers animateToNumber={animatedTarget} fontStyle={styles.ringScore} />
                        <Text style={styles.ringOutOf}>/100</Text>
                      </View>
                    ) : (
                      <View style={styles.ringScoreRow}>
                        <Text style={[styles.ringScore, styles.ringScoreBlurred]}>{score.overall}</Text>
                        <Text style={styles.ringOutOf}>/100</Text>
                      </View>
                    )}
                    <Text style={styles.ringLabel}>Facial Harmony</Text>
                  </View>
                )}
              </AnimatedCircularProgress>
              <Text style={styles.heroUnlock}>
                {unlocked
                  ? `Top ${Math.max(1, 100 - score.percentile)}% · Potential ${score.potential}`
                  : 'Unlock your detailed score and personalized plan'}
              </Text>
              {!unlocked && <Text style={styles.premiumHint}>Included in GlowUp Premium</Text>}
            </View>

            {/* Maxed-Out Self teaser (EPIC 4.4): her blurred potential, right before the paywall */}
            {!unlocked && teaserUri && (
              <Pressable style={styles.teaserCard} onPress={openPaywall}>
                <Image source={{ uri: teaserUri }} style={styles.teaserImg} blurRadius={32} />
                <View style={styles.teaserOverlay}>
                  <View style={styles.teaserLock}>
                    <Ionicons name="lock-closed" size={20} color="#fff" />
                  </View>
                  <Text style={styles.teaserTitle}>Your Maxed-Out Self is ready</Text>
                  <Text style={styles.teaserSub}>Unlock to reveal your full potential</Text>
                </View>
              </Pressable>
            )}

            {unlocked && delta != null && (
              <Text style={[styles.delta, { color: delta >= 0 ? '#2E9E5B' : '#D97742' }]}>
                {delta >= 0 ? '+' : ''}{delta} since your last scan
              </Text>
            )}
            {unlocked && !!score.rationale && (
              <Text style={styles.rationale}>{score.rationale}</Text>
            )}

            {/* Metric cards */}
            {METRIC_DEFS.map((m, i) => {
              const value = (score as any)[m.key] as number;
              return (
                <Pressable
                  key={m.key}
                  style={styles.metricCard}
                  disabled={!unlocked}
                  onPress={() => router.push({ pathname: '/component-detail', params: { key: m.key } })}
                >
                  <View style={styles.metricHeader}>
                    <Image source={m.img} style={styles.metricThumb} />
                    <View style={styles.metricHeaderText}>
                      <Text style={styles.metricTitle}>{m.title}</Text>
                      <Text style={styles.metricSubtitle}>{m.subtitle}</Text>
                    </View>
                    {unlocked ? (
                      <Text style={styles.metricValue}>{value}</Text>
                    ) : (
                      <View style={styles.lockChip}>
                        <Ionicons name="lock-closed" size={15} color={LOCK_ICON} />
                      </View>
                    )}
                  </View>
                  <AnimatedBar value={value} unlocked={unlocked} delay={i * 90} />
                </Pressable>
              );
            })}

            {productRecos.length > 0 && <ProductRecoList recos={productRecos} />}
          </View>
        </ScrollView>

        {/* ── PAGE 2: Your Glow Up Plan ── */}
        <ScrollView style={{ width: pagerW }} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Your Glow Up{'\n'}Plan</Text>

            {treatments.map((t, i) => (
              <View key={i} style={styles.treatmentCard}>
                <View style={styles.metricHeader}>
                  <View style={styles.lockChipBig}>
                    <Ionicons
                      name={unlocked ? 'sparkles' : 'lock-closed'}
                      size={18}
                      color={unlocked ? C.pink : LOCK_ICON}
                    />
                  </View>
                  <Text style={styles.metricTitle}>{unlocked ? t.name : `Treatment ${i + 1}`}</Text>
                </View>
                <Text style={styles.treatmentDetail}>
                  {unlocked ? t.detail : 'Unlock to see your personalized enhancement plan'}
                </Text>
                <View style={styles.impactBox}>
                  <Text style={styles.impactLabel}>Impact</Text>
                  <View style={styles.impactRow}>
                    <View style={styles.metricTrack}>
                      <View
                        style={[
                          styles.metricFill,
                          unlocked
                            ? { width: `${Math.max(5, t.impact)}%`, backgroundColor: C.pink }
                            : { width: '22%', backgroundColor: C.trackLocked },
                        ]}
                      />
                    </View>
                    <Text style={styles.impactSpark}>✨</Text>
                  </View>
                </View>
              </View>
            ))}

            {unlocked && (
              <Pressable style={styles.planCta} onPress={() => router.push('/glow-plan')}>
                <Text style={styles.planCtaText}>Track this plan & build a streak →</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Pager arrows */}
      {page > 0 && (
        <Pressable style={[styles.arrow, styles.arrowLeft]} onPress={() => goToPage(page - 1)}>
          <Ionicons name="chevron-back" size={22} color={C.pink} />
        </Pressable>
      )}
      {page < 1 && (
        <Pressable style={[styles.arrow, styles.arrowRight]} onPress={() => goToPage(page + 1)}>
          <Ionicons name="chevron-forward" size={22} color={C.pink} />
        </Pressable>
      )}

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {!unlocked ? (
          <>
            <Pressable style={styles.cta} onPress={openPaywall}>
              <Text style={styles.ctaText}>Unlock now</Text>
            </Pressable>
            <Pressable onPress={handleInvite} hitSlop={8}>
              <Text style={styles.inviteLink}>
                {inviteCount > 0
                  ? `or invite 3 friends (${Math.min(inviteCount, INVITES_REQUIRED)}/${INVITES_REQUIRED})`
                  : 'or invite 3 friends'}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.cta} onPress={seePotential}>
              <Text style={styles.ctaText}>✨ See Your Maxed-Out Self</Text>
            </Pressable>
            <Pressable style={styles.shareSecondary} onPress={shareScore}>
              <Ionicons name="share-social-outline" size={18} color={C.pink} />
              <Text style={styles.shareSecondaryText}>Share my results</Text>
            </Pressable>
          </>
        )}
        <Text style={styles.disclaimer}>
          For wellness and entertainment only. Not a medical device, diagnosis, or treatment.{' '}
          <Text style={styles.mhLink} onPress={() => Linking.openURL('https://www.nationaleatingdisorders.org/help-support/')}>
            Need support?
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingTop: 54 },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 24 },
  offscreen: { position: 'absolute', left: -10000, top: 0 },

  scanPhoto: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: C.pink, opacity: 0.85 },
  scanText: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 20 },
  scanSub: { color: C.textSoft, fontSize: 12, marginTop: 8, letterSpacing: 0.5 },

  errText: { color: '#C2415B', fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  primaryBtn: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.trackLocked },
  stepDotActive: { width: 22, height: 7, borderRadius: 4, backgroundColor: C.pink },
  closeBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  pageContent: { paddingHorizontal: 16, paddingBottom: 16 },
  panel: {
    backgroundColor: C.panel,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    shadowColor: '#C77E97', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 3,
  },
  panelTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    lineHeight: 38,
    marginVertical: 14,
  },

  heroCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 14,
  },
  heroPhoto: { width: 104, height: 104, borderRadius: 18 },
  heroRight: { flex: 1 },
  heroLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 2 },
  heroScore: { fontSize: 40, fontWeight: '900', color: C.text },
  heroOutOf: { fontSize: 18, color: C.textSoft, fontWeight: '600' },
  heroHint: { fontSize: 12, color: C.textSoft, fontStyle: 'italic', marginTop: 2 },

  // Animated ring hero
  heroCardCenter: {
    backgroundColor: C.card, borderRadius: 22, padding: 20, marginBottom: 12,
    alignItems: 'center', gap: 12,
  },
  heroAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: C.pink },
  ringInner: { alignItems: 'center' },
  ringScoreRow: { flexDirection: 'row', alignItems: 'flex-end' },
  ringScore: { fontFamily: fonts.displayBold, fontSize: 40, color: C.text },
  ringScoreBlurred: { opacity: 0.35, textShadowColor: 'rgba(45,35,48,0.5)', textShadowRadius: 12 },
  ringOutOf: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.textSoft, marginBottom: 6 },
  ringLabel: { fontFamily: fonts.bodySemi, fontSize: 11, color: C.textSoft, marginTop: 2 },
  heroUnlock: { fontFamily: fonts.bodyBold, fontSize: 15, color: C.text, marginTop: 2, textAlign: 'center' },
  premiumHint: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginTop: 4, textAlign: 'center' },

  // Maxed-Out Self teaser
  teaserCard: { borderRadius: 22, overflow: 'hidden', marginBottom: 12, backgroundColor: C.card },
  teaserImg: { width: '100%', height: 220 },
  teaserOverlay: {
    ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(45,35,48,0.30)', gap: 6,
  },
  teaserLock: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(224,83,122,0.92)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  teaserTitle: { color: '#fff', fontSize: 17, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 6 },
  teaserSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '600' },

  delta: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  rationale: { color: C.textSoft, fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 10, paddingHorizontal: 6 },

  metricCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  metricThumb: { width: 54, height: 54, borderRadius: 14, backgroundColor: C.pinkSoft },
  metricHeaderText: { flex: 1 },
  metricTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  metricValue: { fontSize: 18, fontWeight: '900', color: C.pink },
  lockChip: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: LOCK_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  lockChipBig: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: LOCK_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  metricSubtitle: { fontSize: 13, color: C.textSoft, marginTop: 2 },
  metricTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.track, overflow: 'hidden' },
  metricFill: { height: 8, borderRadius: 4 },

  treatmentCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  treatmentDetail: { fontSize: 14, color: C.textSoft, lineHeight: 20, marginBottom: 10 },
  impactBox: { backgroundColor: '#FDF4F7', borderRadius: 12, padding: 10 },
  impactLabel: { fontSize: 13, fontWeight: '700', color: C.textSoft, marginBottom: 6 },
  impactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  impactSpark: { fontSize: 14 },

  planCta: { marginTop: 4, paddingVertical: 10 },
  planCtaText: { color: C.pink, fontSize: 15, fontWeight: '800', textAlign: 'center' },

  arrow: {
    position: 'absolute',
    top: '46%',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#D98CA4', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  arrowLeft: { left: 6 },
  arrowRight: { right: 6 },

  bottomBar: { paddingHorizontal: 24, paddingBottom: 30, paddingTop: 8, alignItems: 'center', gap: 10 },
  cta: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#D98CA4', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { fontSize: 19, fontWeight: '900', color: C.text },
  inviteLink: { color: C.pink, fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
  shareSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', borderRadius: 26, paddingVertical: 14, borderWidth: 1.5, borderColor: C.pink,
  },
  shareSecondaryText: { color: C.pink, fontSize: 15, fontWeight: '800' },

  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', marginTop: 2 },
  mhLink: { textDecorationLine: 'underline', color: C.textSoft },

  // ---- AI consent gate ----
  consentIcon: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: C.pinkSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 22,
  },
  consentTitle: { fontSize: 24, fontWeight: '900', color: C.text, textAlign: 'center', marginBottom: 12 },
  consentBody: { fontSize: 15, color: C.textSoft, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  consentBtn: {
    width: '100%', backgroundColor: C.pink, borderRadius: 30, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#D98CA4', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  consentBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  consentCancel: { color: C.textSoft, fontSize: 15, fontWeight: '600', marginTop: 18 },
  consentLegal: { color: C.textSoft, fontSize: 12, textDecorationLine: 'underline', marginTop: 22 },
});
