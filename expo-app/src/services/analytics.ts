import { Platform } from 'react-native';

const isDev = __DEV__;
const isWeb = Platform.OS === 'web';

function log(eventName: string, params?: Record<string, any>) {
  if (isDev) {
    console.log(`[Analytics] ${eventName}`, params ?? '');
  }
}

/**
 * Track a generic event.
 */
export function trackEvent(name: string, params?: Record<string, any>): void {
  log(name, params);

  if (!isWeb) {
    // TODO: Firebase Analytics integration
    // import analytics from '@react-native-firebase/analytics';
    // analytics().logEvent(name, params);
  }
}

/**
 * Track a screen view.
 */
export function trackScreen(name: string): void {
  log(`screen_view: ${name}`);

  if (!isWeb) {
    // TODO: Firebase Analytics integration
    // import analytics from '@react-native-firebase/analytics';
    // analytics().logScreenView({ screen_name: name, screen_class: name });
  }
}

/**
 * Track when a user starts a transformation.
 */
export function trackTransformStart(styleId: string): void {
  trackEvent('transform_start', { styleId });
}

/**
 * Track when a transformation completes successfully.
 */
export function trackTransformComplete(
  styleId: string,
  isHD: boolean,
  durationMs: number
): void {
  trackEvent('transform_complete', { styleId, isHD, durationMs });
}

/**
 * Track when the paywall is shown.
 */
export function trackPaywallShown(): void {
  trackEvent('paywall_shown');
}

/**
 * Track a successful purchase.
 */
export function trackPurchase(productId: string): void {
  trackEvent('purchase', { productId });
}

/**
 * Track a share action (initiated).
 */
export function trackShareInitiated(destination: string): void {
  trackEvent('share_initiated', { destination });
}

/**
 * Track a share action (completed).
 */
export function trackShareCompleted(destination: string): void {
  trackEvent('share_completed', { destination });
}

/**
 * Legacy alias for existing call sites.
 */
export function trackShare(destination: string): void {
  trackShareCompleted(destination);
}

// MARK: - Onboarding

export function trackOnboardingStarted(): void {
  trackEvent('onboarding_started');
}

export function trackOnboardingCompleted(): void {
  trackEvent('onboarding_completed');
}

// MARK: - Pricing & Subscription

export function trackPricingViewed(): void {
  trackEvent('pricing_viewed');
}

export function trackTrialStarted(plan: string): void {
  trackEvent('trial_started', { plan });
}

export function trackSubscriptionPurchased(plan: string): void {
  trackEvent('subscription_purchased', { plan });
}

export function trackSkippedToFree(): void {
  trackEvent('skipped_to_free');
}

// MARK: - Style & Transform

export function trackStyleSelected(styleId: string): void {
  trackEvent('style_selected', { styleId });
}

export function trackTransformCompleted(quality: 'standard' | 'hd'): void {
  trackEvent('transform_completed_quality', { quality });
}

// MARK: - Canonical funnel events (deep-research measurement plan)
// QuizStart/Complete -> ScanStart/Complete -> ScoreRevealed -> PaywallSeen ->
// TrialStarted -> Subscribed -> PlanViewed -> TaskCompleted.

export function trackScanStart(source?: string): void {
  trackEvent('ScanStart', source ? { source } : undefined);
}
export function trackScanComplete(overall: number): void {
  trackEvent('ScanComplete', { overall });
}
export function trackScoreRevealed(overall: number, unlocked: boolean): void {
  trackEvent('ScoreRevealed', { overall, unlocked });
}
export function trackPlanViewed(persona?: string): void {
  trackEvent('PlanViewed', persona ? { persona } : undefined);
}
export function trackTaskCompleted(category?: string): void {
  trackEvent('TaskCompleted', category ? { category } : undefined);
}

// MARK: - User Properties

export function setUserProperty(key: string, value: string): void {
  log(`user_property: ${key}=${value}`);

  if (!isWeb) {
    // TODO: Firebase Analytics integration
    // import analytics from '@react-native-firebase/analytics';
    // analytics().setUserProperty(key, value);
  }
}
