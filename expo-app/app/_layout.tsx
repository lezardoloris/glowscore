import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initPurchases } from '../src/services/subscription';
import { trackScreen } from '../src/services/analytics';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { theme } from '../src/theme';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    initPurchases();
  }, []);

  useEffect(() => {
    if (pathname) {
      const screenName = pathname === '/' ? 'Home' : pathname.replace('/', '');
      trackScreen(screenName);
    }
  }, [pathname]);

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      {/* Web-only phone frame: constrain to mobile width so the desktop
          preview shows the app at real phone dimensions instead of stretching. */}
      <View style={isWeb ? styles.webOuter : styles.fill}>
        <View style={isWeb ? styles.webPhone : styles.fill}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="feature-hub" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="styles" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="processing" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="scan-result" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="glow-plan" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="pricing" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="paywall" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="demo" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="hd-compare" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="face-swap" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="instant-style" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="headshot" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="hair-change" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="relight" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="age-transform" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="try-on" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="couple-glowup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="beauty-filter" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="virtual-makeup" options={{ animation: 'slide_from_right' }} />
      </Stack>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // Desktop web: dim backdrop, app constrained to a centered phone-width column.
  webOuter: { flex: 1, alignItems: 'center', backgroundColor: '#E4BACB' },
  webPhone: { flex: 1, width: '100%', maxWidth: 440, backgroundColor: theme.bg, overflow: 'hidden' },
});
