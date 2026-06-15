import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../src/theme';
import { typography, fonts } from '../src/typography';
import { shadow } from '../src/shadows';
import { DISCLAIMER } from '../src/data/bodyCareSafety';
import { impactMedium, notificationSuccess } from '../src/services/haptics';
import { trackScreen } from '../src/services/analytics';

const JOURNAL_KEY = 'skin_change_journal';

interface JournalEntry {
  id: string;
  date: string;
  photoUri?: string;
  firmness: number; // 1-5
  glow: number;
  density: number;
  note?: string;
}

const EDUCATION = `When your body changes quickly, facial volume can shift too. That is a normal skin adaptation. Your plan supports your skin's comfort and healthy look through peptides, gentle retinoids, and daily SPF. For information only, not medical advice.`;

export default function SkinChangeTrackScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [firmness, setFirmness] = useState(3);
  const [glow, setGlow] = useState(3);
  const [density, setDensity] = useState(3);
  const [photo, setPhoto] = useState<string | undefined>();

  useEffect(() => {
    trackScreen('skin_change_track');
    AsyncStorage.getItem(JOURNAL_KEY).then((raw) => {
      if (raw) setEntries(JSON.parse(raw));
    });
  }, []);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.85, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) setPhoto(r.assets[0].uri);
  }

  async function save() {
    impactMedium();
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      photoUri: photo,
      firmness, glow, density,
    };
    const next = [entry, ...entries].slice(0, 24);
    setEntries(next);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
    notificationSuccess();
    setPhoto(undefined);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <Text style={styles.eyebrow}>SKIN THROUGH CHANGE</Text>
      <Text style={styles.title}>Support your skin</Text>
      <Text style={styles.sub}>Photo journal for glow and comfort. No weight tracking, ever.</Text>

      <View style={[styles.eduCard, shadow(1)]}>
        <Ionicons name="heart-outline" size={22} color={C.pink} />
        <Text style={styles.edu}>{EDUCATION}</Text>
      </View>

      <Pressable style={styles.photoBtn} onPress={pick}>
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : (
          <><Ionicons name="camera" size={28} color={C.pink} /><Text style={styles.photoLabel}>Add progress selfie</Text></>
        )}
      </Pressable>

      <SliderRow label="Firmness feel" value={firmness} onChange={setFirmness} />
      <SliderRow label="Glow / radiance" value={glow} onChange={setGlow} />
      <SliderRow label="Skin density comfort" value={density} onChange={setDensity} />

      <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save check-in</Text></Pressable>

      {entries.map((e) => (
        <View key={e.id} style={[styles.entry, shadow(1)]}>
          {e.photoUri ? <Image source={{ uri: e.photoUri }} style={styles.entryThumb} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.entryDate}>{new Date(e.date).toLocaleDateString()}</Text>
            <Text style={styles.entryScores}>Firmness {e.firmness} · Glow {e.glow} · Density {e.density}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </ScrollView>
  );
}

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} style={[styles.dot, value >= n && styles.dotOn]} onPress={() => onChange(n)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 48 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  eyebrow: typography.eyebrow,
  title: { ...typography.h2, fontFamily: fonts.displayBold, marginTop: 4 },
  sub: { ...typography.body2, color: C.textSoft, marginTop: 8, marginBottom: 16 },
  eduCard: { flexDirection: 'row', gap: 12, backgroundColor: C.blush, borderRadius: radii.lg, padding: 14, marginBottom: 16 },
  edu: { fontFamily: fonts.body, fontSize: 13, color: C.text, flex: 1, lineHeight: 19 },
  photoBtn: { height: 140, borderRadius: radii.xl, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...shadow(1) },
  photo: { width: '100%', height: '100%', borderRadius: radii.xl },
  photoLabel: { fontFamily: fonts.body, fontSize: 13, color: C.textSoft, marginTop: 6 },
  sliderRow: { marginBottom: 14 },
  sliderLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text, marginBottom: 8 },
  dots: { flexDirection: 'row', gap: 10 },
  dot: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.track },
  dotOn: { backgroundColor: C.pink },
  saveBtn: { backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginVertical: 16 },
  saveText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16 },
  entry: { flexDirection: 'row', gap: 12, backgroundColor: C.card, borderRadius: radii.lg, padding: 12, marginBottom: 8 },
  entryThumb: { width: 52, height: 52, borderRadius: 26 },
  entryDate: { fontFamily: fonts.bodyBold, fontSize: 14, color: C.text },
  entryScores: { fontFamily: fonts.body, fontSize: 12, color: C.textSoft, marginTop: 2 },
  disclaimer: { ...typography.caption, textAlign: 'center', marginTop: 16 },
});
