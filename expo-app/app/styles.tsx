import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
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
        All styles are free to try! Upgrade for HD quality and more.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  preview: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(236,72,153,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  icon: { fontSize: 22 },
  styleName: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  styleDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 },
});
