import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { theme as C } from '../src/theme';
import { STYLE_PRESETS } from '../src/config';
import { trackScreen } from '../src/services/analytics';

export default function StylesScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  useEffect(() => {
    trackScreen('style_selection');
  }, []);

  function selectStyle(styleId: string) {
    router.push({ pathname: '/processing', params: { imageUri, styleId } });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}
      <Text style={styles.title}>Choose Your Glow Up</Text>

      <View style={styles.grid}>
        {STYLE_PRESETS.map((style) => (
          <Pressable
            key={style.id}
            style={styles.card}
            onPress={() => selectStyle(style.id)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{style.icon}</Text>
            </View>
            <Text style={styles.styleName}>{style.name}</Text>
            <Text style={styles.styleDesc}>{style.description}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.hint}>
        Every style renders in full HD with your Premium plan.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  preview: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: C.border, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: { width: '48%', backgroundColor: C.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: C.border },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.pinkSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  icon: { fontSize: 22 },
  styleName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 4 },
  styleDesc: { fontSize: 11, color: C.textSoft, textAlign: 'center' },
  hint: { fontSize: 12, color: C.textSoft, marginTop: 16 },
});
