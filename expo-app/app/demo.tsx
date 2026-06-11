import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 64 - 16) / 2; // 2 columns with gap

interface DemoFace {
  id: string;
  emoji: string;
  label: string;
  bgColor: string;
}

const DEMO_FACES: DemoFace[] = [
  { id: 'demo_1', emoji: '\uD83D\uDE0A', label: 'Face A', bgColor: '#ec4899' },
  { id: 'demo_2', emoji: '\uD83D\uDE0E', label: 'Face B', bgColor: '#a855f7' },
  { id: 'demo_3', emoji: '\uD83E\uDD29', label: 'Face C', bgColor: '#6366f1' },
  { id: 'demo_4', emoji: '\uD83D\uDE42', label: 'Face D', bgColor: '#8b5cf6' },
];

export default function DemoScreen() {
  function handleSelectFace(face: DemoFace) {
    // Pass the demo face id as imageUri so the styles screen can detect demo mode
    router.push({ pathname: '/feature-hub', params: { imageUri: face.id } });
  }

  function handleUseCamera() {
    router.replace('/');
  }

  function renderFace({ item }: { item: DemoFace }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.faceCard,
          pressed && styles.faceCardPressed,
        ]}
        onPress={() => handleSelectFace(item)}
      >
        <View style={[styles.faceCircle, { backgroundColor: item.bgColor + '30' }]}>
          <LinearGradient
            colors={[item.bgColor, item.bgColor + '88']}
            style={styles.faceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.faceEmoji}>{item.emoji}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.faceLabel}>{item.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Demo Face</Text>
        <Text style={styles.subtitle}>Or use your own photo below</Text>
      </View>

      <FlatList
        data={DEMO_FACES}
        renderItem={renderFace}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />

      <View style={styles.footer}>
        <Pressable onPress={handleUseCamera}>
          <LinearGradient
            colors={['#ec4899', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cameraButton}
          >
            <Text style={styles.cameraButtonText}>
              {'\uD83D\uDCF7'} Use My Own Photo
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  grid: {
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  faceCard: {
    width: CARD_SIZE,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  faceCardPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    transform: [{ scale: 0.96 }],
  },
  faceCircle: {
    width: CARD_SIZE * 0.6,
    height: CARD_SIZE * 0.6,
    borderRadius: CARD_SIZE * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  faceGradient: {
    width: '100%',
    height: '100%',
    borderRadius: CARD_SIZE * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceEmoji: {
    fontSize: 48,
  },
  faceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 40,
    gap: 12,
  },
  cameraButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '500',
  },
});
