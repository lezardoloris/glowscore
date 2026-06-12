import { View, Text, Image, Pressable, StyleSheet, Platform, PanResponder } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { theme as C } from '../src/theme';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen, trackShare } from '../src/services/analytics';
import { generateShareImage } from '../src/services/shareGenerator';
import { STYLE_PRESETS } from '../src/config';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function ResultScreen() {
  const { imageUri, resultUri, styleId, isHD } = useLocalSearchParams<{
    imageUri: string; resultUri: string; styleId: string; isHD: string;
  }>();
  const [sliderPos, setSliderPos] = useState(0.5);
  const sliderPosRef = useRef(0.5);

  const { width: screenWidth } = useWindowDimensions();
  const sliderSize = Math.min(screenWidth - 32, 440);
  const sliderSizeRef = useRef(sliderSize);
  sliderSizeRef.current = sliderSize;

  // SLIDER FIX: measure the container's absolute left so we can convert the
  // absolute touch (pageX) into a position relative to the slider.
  const containerRef = useRef<View>(null);
  const containerLeftRef = useRef(0);
  const measureContainer = useCallback(() => {
    containerRef.current?.measureInWindow((x) => { containerLeftRef.current = x; });
  }, []);

  const style = STYLE_PRESETS.find(s => s.id === styleId) || STYLE_PRESETS[0];
  const isHDResult = isHD === 'true';

  useEffect(() => { trackScreen('result'); }, []);

  const updateSlider = useCallback((pos: number) => {
    setSliderPos(pos);
    sliderPosRef.current = pos;
  }, []);

  // Auto-reveal animation
  useEffect(() => {
    const t1 = setTimeout(() => updateSlider(0.08), 300);
    const t2 = setTimeout(() => updateSlider(0.5), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [updateSlider]);

  // SLIDER FIX: use absolute pageX minus the measured container left (locationX
  // is relative to the touched sub-view and made the handle jump erratically).
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      measureContainer();
      const x = evt.nativeEvent.pageX - containerLeftRef.current;
      updateSlider(Math.max(0.02, Math.min(0.98, x / sliderSizeRef.current)));
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.pageX - containerLeftRef.current;
      const oldPos = sliderPosRef.current;
      const newPos = Math.max(0.02, Math.min(0.98, x / sliderSizeRef.current));
      updateSlider(newPos);
      if ((oldPos < 0.5 && newPos >= 0.5) || (oldPos > 0.5 && newPos <= 0.5)) impactMedium();
    },
  })).current;

  async function shareResult() {
    try {
      const shareUri = await generateShareImage({
        originalUri: imageUri || '', resultUri: resultUri || '', styleName: style.name, isHD: isHDResult,
      });
      if (Platform.OS === 'web') {
        if (navigator.share && shareUri) {
          if (shareUri.startsWith('data:')) {
            const resp = await fetch(shareUri);
            const blob = await resp.blob();
            const file = new File([blob], 'glowup-share.png', { type: 'image/png' });
            await navigator.share({ title: 'My GlowScore', files: [file] });
          } else {
            await navigator.share({ title: 'My GlowScore', url: shareUri });
          }
        }
        trackShare('branded_share');
        return;
      }
      if (shareUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri);
        trackShare('branded_share');
      }
    } catch (e) { console.log('Share failed:', e); }
  }

  async function saveToGallery() {
    if (Platform.OS === 'web') { if (resultUri) window.open(resultUri, '_blank'); return; }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted' && resultUri) {
        await MediaLibrary.saveToLibraryAsync(resultUri);
        notificationSuccess();
        trackShare('save_to_gallery');
      }
    } catch (e) { console.log('Save failed:', e); }
  }

  return (
    <View style={styles.container}>
      {/* Before/After slider */}
      <View
        ref={containerRef}
        onLayout={measureContainer}
        style={[styles.sliderContainer, { width: sliderSize, height: sliderSize }]}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: resultUri }} style={[styles.sliderImage, { width: sliderSize, height: sliderSize }]} />
        <View style={[styles.beforeClip, { width: sliderSize * sliderPos, height: sliderSize }]}>
          <Image source={{ uri: imageUri }} style={[styles.sliderImage, { width: sliderSize, height: sliderSize }]} />
        </View>
        <View style={[styles.handle, { left: sliderSize * sliderPos - 1.5 }]}>
          <View style={styles.knob}><Text style={styles.knobText}>◀ ▶</Text></View>
        </View>
        <View style={styles.labels}>
          <Text style={styles.label}>BEFORE</Text>
          <Text style={styles.label}>AFTER</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>{style.icon} {style.name}</Text>
        <View style={[styles.badgeContainer, isHDResult ? styles.badgeHD : styles.badgeStandard]}>
          <Text style={[styles.badgeText, { color: isHDResult ? '#2E9E5B' : C.pink }]}>{isHDResult ? 'HD' : 'Standard'}</Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        AI-generated artistic visualization for entertainment purposes only.{'\n'}Results do not represent real-world outcomes.
      </Text>

      <View style={styles.row}>
        <Pressable style={styles.glassBtn} onPress={shareResult}><Text style={styles.glassBtnText}>Share</Text></Pressable>
        <Pressable style={styles.glassBtn} onPress={saveToGallery}><Text style={styles.glassBtnText}>Save</Text></Pressable>
        <Pressable style={styles.glassBtn} onPress={() => router.push('/')}><Text style={styles.glassBtnText}>New</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingTop: 60, paddingHorizontal: 16, gap: 16, alignItems: 'center' },
  sliderContainer: { borderRadius: 22, overflow: 'hidden', position: 'relative', backgroundColor: C.card },
  sliderImage: { position: 'absolute' },
  beforeClip: { position: 'absolute', overflow: 'hidden' },
  handle: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: '#fff', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
  knob: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#D98CA4', shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  knobText: { fontSize: 11, color: C.pink, fontWeight: '900' },
  labels: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
  label: { fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: 'rgba(45,35,48,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  info: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoText: { fontSize: 15, fontWeight: '700', color: C.text },
  badgeContainer: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: C.pinkSoft },
  badgeText: { fontSize: 12, fontWeight: '800' },
  badgeStandard: { backgroundColor: C.pinkSoft },
  badgeHD: { backgroundColor: '#DDF3E4' },
  disclaimer: { fontSize: 10, color: C.textSoft, textAlign: 'center', lineHeight: 15 },
  compareBtn: { backgroundColor: C.card, borderRadius: 26, paddingVertical: 16, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: C.pink },
  compareBtnText: { color: C.pink, fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  glassBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  glassBtnText: { color: C.text, fontSize: 14, fontWeight: '700' },
});
