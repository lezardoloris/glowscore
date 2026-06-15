import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme as C } from '../src/theme';
import { STYLE_PRESETS } from '../src/config';
import { STYLE_ICONS } from '../src/config/styleIcons';
import BrandLogo from '../src/components/BrandLogo';
import { trackScreen } from '../src/services/analytics';
import { impactMedium } from '../src/services/haptics';

export default function StylesScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [imageUri, setImageUri] = useState<string | undefined>(typeof params.imageUri === 'string' ? params.imageUri : undefined);

  useEffect(() => { trackScreen('style_selection'); }, []);

  async function pick(): Promise<string | undefined> {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, quality: 0.9, allowsEditing: true, aspect: [1, 1] });
    if (!r.canceled && r.assets[0]) { setImageUri(r.assets[0].uri); return r.assets[0].uri; }
    return undefined;
  }

  async function selectStyle(styleId: string) {
    impactMedium();
    const uri = imageUri || (await pick());
    if (!uri) return;
    router.push({ pathname: '/processing', params: { imageUri: uri, styleId } });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={C.text} />
      </Pressable>

      <BrandLogo width={150} style={{ marginBottom: 18 }} />

      <Pressable style={styles.photoBar} onPress={pick}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photoThumb} />
        ) : (
          <View style={[styles.photoThumb, styles.photoThumbEmpty]}><Ionicons name="camera" size={20} color={C.pink} /></View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.photoTitle}>{imageUri ? 'Your photo' : 'Add your photo'}</Text>
          <Text style={styles.photoSub}>{imageUri ? 'Tap to change' : 'Pick a selfie to transform'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
      </Pressable>

      <Text style={styles.title}>Choose Your Glow Up</Text>

      <View style={styles.grid}>
        {STYLE_PRESETS.map((style) => (
          <Pressable key={style.id} style={styles.card} onPress={() => selectStyle(style.id)}>
            <View style={styles.iconCircle}>
              <Image source={STYLE_ICONS[style.id]} style={styles.iconImg} />
            </View>
            <Text style={styles.styleName}>{style.name}</Text>
            <Text style={styles.styleDesc}>{style.description}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>Every style renders in full HD with your Premium plan.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 80 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  photoBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 16, padding: 12, marginBottom: 16 },
  photoThumb: { width: 44, height: 44, borderRadius: 22 },
  photoThumbEmpty: { backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontSize: 14.5, fontWeight: '800', color: C.text },
  photoSub: { fontSize: 12, color: C.textSoft, marginTop: 1 },
  title: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: C.card, borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' },
  iconImg: { width: 56, height: 56 },
  styleName: { fontSize: 14.5, fontWeight: '800', color: C.text, marginBottom: 3 },
  styleDesc: { fontSize: 11, color: C.textSoft, textAlign: 'center' },
  hint: { fontSize: 12, color: C.textSoft, marginTop: 16, textAlign: 'center' },
});
