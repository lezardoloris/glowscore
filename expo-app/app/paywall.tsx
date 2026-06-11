import { useEffect } from 'react';
import { router } from 'expo-router';

/**
 * Legacy paywall screen — redirects to the new full-page pricing screen.
 * Kept as a redirect so any deep links or cached navigation still work.
 */
export default function PaywallRedirect() {
  useEffect(() => {
    router.replace('/pricing');
  }, []);

  return null;
}
