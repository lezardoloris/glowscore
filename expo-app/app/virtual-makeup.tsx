import { View, Text, Pressable, Image, ScrollView, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';
import * as MediaLibrary from 'expo-media-library';
import { notificationSuccess } from '../src/services/haptics';

interface ColorOption {
  id: string;
  name: string;
  color: string;
}

const LIP_COLORS: ColorOption[] = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'red', name: 'Red', color: '#DC2626' },
  { id: 'pink', name: 'Pink', color: '#EC4899' },
  { id: 'berry', name: 'Berry', color: '#9333EA' },
  { id: 'nude', name: 'Nude', color: '#D4A574' },
  { id: 'coral', name: 'Coral', color: '#FB923C' },
  { id: 'wine', name: 'Wine', color: '#7F1D1D' },
];

const EYE_SHADOW_COLORS: ColorOption[] = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'gold', name: 'Gold', color: '#F59E0B' },
  { id: 'smoky', name: 'Smoky', color: '#374151' },
  { id: 'bronze', name: 'Bronze', color: '#92400E' },
  { id: 'purple', name: 'Purple', color: '#7C3AED' },
  { id: 'blue', name: 'Blue', color: '#3B82F6' },
  { id: 'rose', name: 'Rose', color: '#F472B6' },
];

const BLUSH_COLORS: ColorOption[] = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'peach', name: 'Peach', color: '#FDBA74' },
  { id: 'pink', name: 'Pink', color: '#F9A8D4' },
  { id: 'berry', name: 'Berry', color: '#C084FC' },
  { id: 'coral', name: 'Coral', color: '#FB7185' },
];

interface MakeupPreset {
  id: string;
  name: string;
  icon: string;
  lip: string;
  eyeShadow: string;
  blush: string;
  eyeliner: boolean;
}

const MAKEUP_PRESETS: MakeupPreset[] = [
  { id: 'natural_day', name: 'Natural Day', icon: '🌤️', lip: 'nude', eyeShadow: 'gold', blush: 'peach', eyeliner: false },
  { id: 'date_night', name: 'Date Night', icon: '🌙', lip: 'red', eyeShadow: 'smoky', blush: 'pink', eyeliner: true },
  { id: 'glam', name: 'Glam', icon: '💎', lip: 'berry', eyeShadow: 'gold', blush: 'berry', eyeliner: true },
  { id: 'bold', name: 'Bold', icon: '🔥', lip: 'wine', eyeShadow: 'purple', blush: 'coral', eyeliner: true },
  { id: 'minimal', name: 'Minimal', icon: '🌿', lip: 'nude', eyeShadow: 'none', blush: 'peach', eyeliner: false },
];

export default function VirtualMakeupScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [selectedLip, setSelectedLip] = useState('none');
  const [selectedEyeShadow, setSelectedEyeShadow] = useState('none');
  const [selectedBlush, setSelectedBlush] = useState('none');
  const [eyeliner, setEyeliner] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('virtual_makeup');
  }, []);

  function applyPreset(preset: MakeupPreset) {
    setSelectedLip(preset.lip);
    setSelectedEyeShadow(preset.eyeShadow);
    setSelectedBlush(preset.blush);
    setEyeliner(preset.eyeliner);
    setActivePreset(preset.id);
    trackEvent('virtual_makeup_preset', { preset: preset.id });
  }

  async function savePhoto() {
    if (!imageUri) return;

    if (Platform.OS === 'web') {
      window.open(imageUri, '_blank');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(imageUri);
        notificationSuccess();
        trackEvent('virtual_makeup_saved');
      }
    } catch (e) {
      console.log('Save failed:', e);
    }
  }

  // Build makeup overlay info
  const hasAnyMakeup = selectedLip !== 'none' || selectedEyeShadow !== 'none' || selectedBlush !== 'none' || eyeliner;

  function ColorPicker({ label, options, selected, onSelect }: {
    label: string;
    options: ColorOption[];
    selected: string;
    onSelect: (id: string) => void;
  }) {
    return (
      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <View style={styles.colorRow}>
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                styles.colorCircle,
                opt.color === 'transparent' && styles.colorCircleEmpty,
                selected === opt.id && styles.colorCircleActive,
              ]}
              onPress={() => { onSelect(opt.id); setActivePreset(null); }}
            >
              {opt.color !== 'transparent' && (
                <View style={[styles.colorFill, { backgroundColor: opt.color }]} />
              )}
              {opt.color === 'transparent' && (
                <Text style={styles.noneText}>X</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      <Text style={styles.title}>Virtual Makeup</Text>
      <Text style={styles.subtitle}>Try different makeup looks</Text>

      {/* Photo with overlay */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.mainImage} />

          {/* Simulated makeup overlay using colored semi-transparent views */}
          {!showBefore && hasAnyMakeup && (
            <View style={styles.makeupOverlay}>
              {/* Lip color overlay (bottom center of face region) */}
              {selectedLip !== 'none' && (
                <View style={[
                  styles.lipOverlay,
                  { backgroundColor: LIP_COLORS.find(c => c.id === selectedLip)?.color + '40' },
                ]} />
              )}
              {/* Eye shadow overlay (upper region) */}
              {selectedEyeShadow !== 'none' && (
                <>
                  <View style={[
                    styles.eyeOverlayLeft,
                    { backgroundColor: EYE_SHADOW_COLORS.find(c => c.id === selectedEyeShadow)?.color + '30' },
                  ]} />
                  <View style={[
                    styles.eyeOverlayRight,
                    { backgroundColor: EYE_SHADOW_COLORS.find(c => c.id === selectedEyeShadow)?.color + '30' },
                  ]} />
                </>
              )}
              {/* Blush overlay (cheek regions) */}
              {selectedBlush !== 'none' && (
                <>
                  <View style={[
                    styles.blushLeft,
                    { backgroundColor: BLUSH_COLORS.find(c => c.id === selectedBlush)?.color + '25' },
                  ]} />
                  <View style={[
                    styles.blushRight,
                    { backgroundColor: BLUSH_COLORS.find(c => c.id === selectedBlush)?.color + '25' },
                  ]} />
                </>
              )}
            </View>
          )}

          {showBefore && (
            <View style={styles.beforeLabel}>
              <Text style={styles.beforeLabelText}>BEFORE</Text>
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
      <Text style={styles.sectionTitle}>Preset Looks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll} contentContainerStyle={styles.presetContainer}>
        {MAKEUP_PRESETS.map((preset) => (
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

      {/* Color pickers */}
      <ColorPicker label="Lip Color" options={LIP_COLORS} selected={selectedLip} onSelect={setSelectedLip} />
      <ColorPicker label="Eye Shadow" options={EYE_SHADOW_COLORS} selected={selectedEyeShadow} onSelect={setSelectedEyeShadow} />
      <ColorPicker label="Blush" options={BLUSH_COLORS} selected={selectedBlush} onSelect={setSelectedBlush} />

      {/* Eyeliner toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.pickerLabel}>Eyeliner</Text>
        <Pressable
          style={[styles.toggleSwitch, eyeliner && styles.toggleSwitchActive]}
          onPress={() => { setEyeliner(!eyeliner); setActivePreset(null); }}
        >
          <Text style={styles.toggleSwitchText}>{eyeliner ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>

      {/* Save */}
      <Pressable style={styles.saveBtn} onPress={savePhoto}>
        <Text style={styles.saveBtnText}>Save Photo</Text>
      </Pressable>
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
  mainImage: { width: 260, height: 260, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  makeupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, overflow: 'hidden' },
  lipOverlay: {
    position: 'absolute',
    bottom: '25%',
    left: '30%',
    width: '40%',
    height: '8%',
    borderRadius: 20,
  },
  eyeOverlayLeft: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '25%',
    height: '8%',
    borderRadius: 12,
  },
  eyeOverlayRight: {
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: '25%',
    height: '8%',
    borderRadius: 12,
  },
  blushLeft: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    width: '22%',
    height: '12%',
    borderRadius: 30,
  },
  blushRight: {
    position: 'absolute',
    top: '45%',
    right: '10%',
    width: '22%',
    height: '12%',
    borderRadius: 30,
  },
  beforeLabel: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  beforeLabelText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
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
  pickerSection: { width: '100%', marginBottom: 16 },
  pickerLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colorCircleEmpty: { borderStyle: 'dashed' },
  colorCircleActive: { borderColor: '#ec4899', borderWidth: 3 },
  colorFill: { width: '100%', height: '100%', borderRadius: 19 },
  noneText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },
  toggleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
  },
  toggleSwitch: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  toggleSwitchActive: { backgroundColor: 'rgba(236,72,153,0.3)' },
  toggleSwitchText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  saveBtn: {
    width: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
