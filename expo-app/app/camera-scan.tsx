import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { trackScreen, trackEvent } from '../src/services/analytics';

// Populated lazily inside the component so the web bundle / Expo Go
// never evaluates the native module at import time.
let Camera: any = null;
let useCameraDevice: any = null;

function loadVisionCamera(): boolean {
  if (Platform.OS === 'web') return false;
  if (Camera && useCameraDevice) return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vc = require('react-native-vision-camera');
    Camera = vc.Camera;
    useCameraDevice = vc.useCameraDevice;
    return !!Camera && !!useCameraDevice;
  } catch {
    return false;
  }
}

function Fallback() {
  return (
    <View style={styles.center}>
      <View style={styles.fallbackCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="videocam-outline" size={36} color={C.pink} />
        </View>
        <Text style={styles.fallbackTitle}>Live scan requires the mobile app</Text>
        <Text style={styles.fallbackSub}>
          Open GlowScore on your phone to use the live camera scan.
        </Text>
        <Pressable style={styles.cta} onPress={() => router.back()}>
          <Text style={styles.ctaText}>Go back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NativeCameraScan() {
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturing, setCapturing] = useState(false);
  const device = useCameraDevice('front');

  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

  async function capture() {
    if (!cameraRef.current || capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePhoto();
      trackEvent('camera_scan_capture');
      router.replace({
        pathname: '/scan-result',
        params: { imageUri: 'file://' + photo.path },
      });
    } catch {
      setCapturing(false);
    }
  }

  if (hasPermission === false || (hasPermission && !device)) {
    return <Fallback />;
  }

  return (
    <View style={styles.cameraContainer}>
      {hasPermission && device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />
      ) : null}

      {/* Pink scan overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>

        <View style={styles.ring} />
        <Text style={styles.hint}>Position your face in the frame</Text>

        <Pressable style={styles.shutter} onPress={capture} disabled={capturing}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

export default function CameraScanScreen() {
  useEffect(() => {
    trackScreen('camera_scan');
  }, []);

  if (Platform.OS === 'web' || !loadVisionCamera()) {
    return <Fallback />;
  }
  return <NativeCameraScan />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fallbackCard: { width: '100%', backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  fallbackTitle: { fontSize: 19, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 8 },
  fallbackSub: { fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  cta: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 56, left: 20 },
  ring: {
    width: 280, height: 360, borderRadius: 160,
    borderWidth: 3, borderColor: C.pink,
  },
  hint: {
    color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 18,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 },
  },
  shutter: {
    position: 'absolute', bottom: 48,
    width: 78, height: 78, borderRadius: 39,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.pink },
});
