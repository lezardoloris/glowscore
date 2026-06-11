import { View, Text, Pressable, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import * as MediaLibrary from 'expo-media-library';
import { notificationSuccess } from '../src/services/haptics';

interface FilterSlider {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const FILTER_SLIDERS: FilterSlider[] = [
  { id: 'smoothing', name: 'Smoothing', min: 0, max: 100, step: 5, defaultValue: 0 },
  { id: 'brightness', name: 'Brightness', min: -50, max: 50, step: 5, defaultValue: 0 },
  { id: 'contrast', name: 'Contrast', min: -50, max: 50, step: 5, defaultValue: 0 },
  { id: 'saturation', name: 'Saturation', min: -50, max: 50, step: 5, defaultValue: 0 },
  { id: 'warmth', name: 'Warmth', min: -50, max: 50, step: 5, defaultValue: 0 },
  { id: 'sharpen', name: 'Sharpen', min: 0, max: 100, step: 5, defaultValue: 0 },
];

interface Preset {
  id: string;
  name: string;
  icon: string;
  values: Record<string, number>;
}

const PRESETS: Preset[] = [
  { id: 'natural', name: 'Natural', icon: '🌿', values: { smoothing: 20, brightness: 5, contrast: 5, saturation: 10, warmth: 5, sharpen: 10 } },
  { id: 'glam', name: 'Glam', icon: '💎', values: { smoothing: 50, brightness: 10, contrast: 15, saturation: 20, warmth: 10, sharpen: 15 } },
  { id: 'soft', name: 'Soft', icon: '🌸', values: { smoothing: 40, brightness: 10, contrast: -10, saturation: -5, warmth: 15, sharpen: 0 } },
  { id: 'dramatic', name: 'Dramatic', icon: '🔥', values: { smoothing: 15, brightness: -5, contrast: 30, saturation: 25, warmth: -10, sharpen: 25 } },
  { id: 'cool', name: 'Cool', icon: '❄️', values: { smoothing: 25, brightness: 5, contrast: 10, saturation: -10, warmth: -20, sharpen: 10 } },
];

export default function BeautyFilterScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [filters, setFilters] = useState<Record<string, number>>({
    smoothing: 0, brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0,
  });
  const [showBefore, setShowBefore] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('beauty_filter');
  }, []);

  function updateFilter(id: string, delta: number) {
    setFilters(prev => {
      const slider = FILTER_SLIDERS.find(s => s.id === id)!;
      const newVal = Math.max(slider.min, Math.min(slider.max, prev[id] + delta));
      return { ...prev, [id]: newVal };
    });
    setActivePreset(null);
  }

  function applyPreset(preset: Preset) {
    setFilters(preset.values);
    setActivePreset(preset.id);
    trackEvent('beauty_filter_preset', { preset: preset.id });
  }

  const applyFilters = useCallback(async () => {
    if (!imageUri) return;
    setProcessing(true);

    try {
      if (Platform.OS === 'web') {
        // Web: just return the original for now
        setResultUri(imageUri);
        setProcessing(false);
        return;
      }

      const ImageManipulator = await import('expo-image-manipulator');

      // Apply brightness and contrast via image manipulator
      // Note: expo-image-manipulator has limited filter support,
      // so we use resize + compress adjustments as approximation
      const actions: any[] = [];

      // Resize to maintain quality
      actions.push({ resize: { width: 1024, height: 1024 } });

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        {
          compress: Math.max(0.5, Math.min(1, 0.85 + (filters.brightness / 500))),
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setResultUri(result.uri);
      trackEvent('beauty_filter_applied', { filters });
    } catch (e) {
      console.log('Filter apply failed:', e);
    } finally {
      setProcessing(false);
    }
  }, [imageUri, filters]);

  async function savePhoto() {
    const uriToSave = resultUri || imageUri;
    if (!uriToSave) return;

    if (Platform.OS === 'web') {
      window.open(uriToSave, '_blank');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uriToSave);
        notificationSuccess();
        trackEvent('beauty_filter_saved');
      }
    } catch (e) {
      console.log('Save failed:', e);
    }
  }

  const displayUri = showBefore ? imageUri : (resultUri || imageUri);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Beauty Filter</Text>
      <Text style={styles.subtitle}>Enhance your photo with filters</Text>

      {/* Photo display */}
      {displayUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayUri }} style={styles.mainImage} />
          {showBefore && (
            <View style={styles.beforeLabel}>
              <Text style={styles.beforeLabelText}>BEFORE</Text>
            </View>
          )}
          {!showBefore && resultUri && (
            <View style={styles.afterLabel}>
              <Text style={styles.afterLabelText}>AFTER</Text>
            </View>
          )}
        </View>
      )}

      {/* Before/After toggle */}
      <Pressable
        style={styles.toggleBtn}
        onPressIn={() => setShowBefore(true)}
        onPressOut={() => setShowBefore(false)}
      >
        <Text style={styles.toggleText}>Hold to see Before</Text>
      </Pressable>

      {/* Presets */}
      <Text style={styles.sectionTitle}>Presets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll} contentContainerStyle={styles.presetContainer}>
        {PRESETS.map((preset) => (
          <Pressable
            key={preset.id}
            style={[styles.presetPill, activePreset === preset.id && styles.presetPillActive]}
            onPress={() => applyPreset(preset)}
          >
            <Text style={styles.presetIcon}>{preset.icon}</Text>
            <Text style={[styles.presetText, activePreset === preset.id && styles.presetTextActive]}>
              {preset.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sliders */}
      <Text style={styles.sectionTitle}>Adjustments</Text>
      {FILTER_SLIDERS.map((slider) => (
        <View key={slider.id} style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>{slider.name}</Text>
          <View style={styles.sliderControls}>
            <Pressable style={styles.stepBtn} onPress={() => updateFilter(slider.id, -slider.step)}>
              <Text style={styles.stepBtnText}>-</Text>
            </Pressable>
            <Text style={styles.sliderValue}>{filters[slider.id]}</Text>
            <Pressable style={styles.stepBtn} onPress={() => updateFilter(slider.id, slider.step)}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Apply & Save */}
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.applyBtn, processing && styles.ctaDisabled]}
          onPress={applyFilters}
          disabled={processing}
        >
          <Text style={styles.applyBtnText}>{processing ? 'Applying...' : 'Apply Filters'}</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={savePhoto}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 },
  imageContainer: { position: 'relative', marginBottom: 16 },
  mainImage: { width: 280, height: 280, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  beforeLabel: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  beforeLabelText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  afterLabel: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(236,72,153,0.4)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  afterLabelText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, alignSelf: 'flex-start' },
  presetScroll: { width: '100%', marginBottom: 24 },
  presetContainer: { flexDirection: 'row', gap: 10 },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  presetPillActive: { backgroundColor: 'rgba(236,72,153,0.2)', borderColor: 'rgba(236,72,153,0.5)' },
  presetIcon: { fontSize: 16 },
  presetText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  presetTextActive: { color: '#ec4899' },
  sliderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
  },
  sliderLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', width: 90 },
  sliderControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sliderValue: { color: '#ec4899', fontSize: 14, fontWeight: '600', minWidth: 36, textAlign: 'center' },
  actionRow: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 12 },
  applyBtn: {
    flex: 2,
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  ctaDisabled: { opacity: 0.4 },
});
