import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../theme';
import { fonts } from '../typography';
import { impactMedium } from '../services/haptics';

/**
 * Real-time camera scan, cross-platform via expo-camera CameraView (live preview
 * on web AND native, unlike react-native-vision-camera which is native-only).
 * Shows a live feed with a face oval + shutter; falls back to the gallery if the
 * camera is unavailable or denied. Review 2026-06: the owner saw no live camera.
 */
export default function LiveCameraCapture({
  label,
  hint,
  onCapture,
  onClose,
}: {
  label: string;
  hint: string;
  onCapture: (uri: string) => void;
  onClose: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  async function pickFallback() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets?.[0]) onCapture(r.assets[0].uri);
  }

  async function shoot() {
    if (busy) return;
    setBusy(true);
    impactMedium();
    try {
      const p = await camRef.current?.takePictureAsync({ quality: 0.85 });
      if (p?.uri) onCapture(p.uri);
    } catch {
      // If capture fails, let the user fall back to the gallery.
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return <View style={[styles.bg, styles.center]}><ActivityIndicator color="#fff" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.bg, styles.center]}>
        <View style={styles.permCard}>
          <View style={styles.permIcon}><Ionicons name="camera" size={36} color={C.pink} /></View>
          <Text style={styles.permTitle}>Live camera scan</Text>
          <Text style={styles.permSub}>Allow your camera for a live face scan. Your photo is processed securely and deleted after.</Text>
          <Pressable style={styles.cta} onPress={requestPermission}><Text style={styles.ctaText}>Allow camera</Text></Pressable>
          <Pressable onPress={pickFallback} hitSlop={8}><Text style={styles.link}>Use a photo from gallery</Text></Pressable>
          <Pressable onPress={onClose} hitSlop={8}><Text style={styles.linkMuted}>Cancel</Text></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing="front" />
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <View style={styles.oval} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
        <Pressable style={styles.shutter} onPress={shoot} disabled={busy}>
          {busy ? <ActivityIndicator color={C.pink} /> : <View style={styles.shutterInner} />}
        </Pressable>
        <Pressable onPress={pickFallback} style={styles.galleryLink} hitSlop={8}>
          <Text style={styles.galleryText}>Use gallery instead</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', zIndex: 50 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  close: { position: 'absolute', top: 52, left: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  oval: { width: 250, height: 330, borderRadius: 150, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)' },
  label: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 18, marginTop: 22, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  hint: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.body, fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 30, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  shutter: { position: 'absolute', bottom: 64, width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.pink },
  galleryLink: { position: 'absolute', bottom: 20 },
  galleryText: { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.bodySemi, fontSize: 13 },
  permCard: { width: '100%', backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center', gap: 6 },
  permIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  permTitle: { fontFamily: fonts.bodyBold, fontSize: 19, color: C.text },
  permSub: { fontFamily: fonts.body, fontSize: 14, color: C.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  cta: { backgroundColor: C.pink, borderRadius: 26, paddingVertical: 14, paddingHorizontal: 34, marginBottom: 6 },
  ctaText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 16 },
  link: { color: C.pink, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 10 },
  linkMuted: { color: C.textSoft, fontFamily: fonts.body, fontSize: 13, marginTop: 10 },
});
