import { Stack, usePathname } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { initPurchases } from '../src/services/subscription';
import { trackScreen } from '../src/services/analytics';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { theme } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    initPurchases();
  }, []);

  useEffect(() => {
    if (pathname) {
      const screenName = pathname === '/' ? 'Home' : pathname.replace('/', '');
      trackScreen(screenName);
    }
  }, [pathname]);

  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <View style={isWeb ? styles.webOuter : styles.fill} onLayout={onLayout}>
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
        <Stack.Screen name="headshot" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="hair-change" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="relight" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="age-transform" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="virtual-makeup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="camera-scan" options={{ animation: 'fade' }} />
        <Stack.Screen name="multi-scan" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="component-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="stress-scan" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="color-season" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="visual-weight" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chrono-skincare" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="concerns" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="body-care" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="makeup-round-face" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="debloat-morning" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="skin-change-track" options={{ animation: 'slide_from_right' }} />
      </Stack>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  webOuter: { flex: 1, alignItems: 'center', backgroundColor: '#E4BACB' },
  webPhone: { flex: 1, width: '100%', maxWidth: 440, backgroundColor: theme.bg, overflow: 'hidden' },
});
