import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GlowUp AI',
  slug: 'glowup-ai',
  extra: {
    // C6 FIX: API keys from environment variables, not hardcoded
    REVENUECAT_IOS_KEY: process.env.REVENUECAT_IOS_KEY || 'dev_placeholder',
    REVENUECAT_ANDROID_KEY: process.env.REVENUECAT_ANDROID_KEY || 'dev_placeholder',
    WORKER_BASE_URL: process.env.WORKER_BASE_URL || 'https://glowup-api.your-domain.workers.dev',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '6b06dbe4-3470-42db-9542-e748059be140',
    },
  },
});
