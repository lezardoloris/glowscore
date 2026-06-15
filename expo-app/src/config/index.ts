import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

// C6 FIX: Read from environment via app.config.ts, not hardcoded
export const CONFIG = {
  REVENUECAT_IOS_KEY: extra.REVENUECAT_IOS_KEY || 'dev_placeholder',
  REVENUECAT_ANDROID_KEY: extra.REVENUECAT_ANDROID_KEY || 'dev_placeholder',
  WORKER_BASE_URL: extra.WORKER_BASE_URL || 'https://glowup-api.your-domain.workers.dev',
  MAX_FREE_STANDARD_PER_DAY: 5,
  MAX_HD_TRANSFORMS_PER_DAY: 10,
  PREVIEW_SIZE: 512,
  HD_SIZE: 1024,
  WEEKLY_PRODUCT_ID: 'glowup_weekly_1299',
  ANNUAL_PRODUCT_ID: 'glowup_annual_5999',
  LIFETIME_PRODUCT_ID: 'glowup_lifetime_9999',
  ENTITLEMENT_ID: 'glowup_premium',
  // Anti-abuse: shared app token. Dormant until the Worker has APP_TOKEN set.
  APP_TOKEN: extra.APP_TOKEN || '',
};

/** Standard headers for Worker calls. Adds the app token (anti-abuse) when set,
 *  plus any extras (e.g. Authorization). Use everywhere we fetch the Worker. */
export function workerHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...extraHeaders };
  if (CONFIG.APP_TOKEN) h['X-App-Token'] = CONFIG.APP_TOKEN;
  return h;
}

export const STYLE_PRESETS = [
  { id: 'clear_skin', name: 'Clear Skin', description: 'Flawless, even skin tone', icon: '✨', isPremium: false },
  { id: 'model_look', name: 'Model Look', description: 'High-fashion editorial', icon: '⭐', isPremium: false },
  { id: 'hair_makeover', name: 'Hair Makeover', description: 'Try different hairstyles', icon: '✂️', isPremium: false },
  { id: 'age_rewind', name: 'Age Rewind', description: 'See your younger self', icon: '🔄', isPremium: false },
  { id: 'fit_version', name: 'Fit Version', description: 'Visualize fitness goals', icon: '🏃', isPremium: false },
  { id: 'celebrity_glam', name: 'Celebrity Glam', description: 'Red carpet ready', icon: '🌟', isPremium: false },
  { id: 'vintage_retro', name: 'Vintage Retro', description: 'Classic film star look', icon: '📷', isPremium: false },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon future aesthetic', icon: '🔮', isPremium: false },
  { id: 'glow_max', name: 'Max Glow-Up', description: 'Your maxed-out potential', icon: '🚀', isPremium: true },
];
