import { View, Text, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { trackScreen, trackEvent } from '../src/services/analytics';

interface FeatureCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  isPremium: boolean;
}

const FEATURES: FeatureCard[] = [
  { id: 'glowup', name: 'Glow Up', icon: '✨', description: 'Transform your look with AI styles', route: '/styles', isPremium: false },
  { id: 'face-swap', name: 'Face Swap', icon: '🎭', description: 'Swap your face onto anyone', route: '/face-swap', isPremium: false },
  { id: 'instant-style', name: 'Art Style', icon: '🎨', description: 'Turn your photo into art', route: '/instant-style', isPremium: false },
  { id: 'headshot', name: 'AI Headshot', icon: '💼', description: 'Professional headshots instantly', route: '/headshot', isPremium: true },
  { id: 'hair-change', name: 'Hair Change', icon: '💇', description: 'Try any hairstyle on you', route: '/hair-change', isPremium: false },
  { id: 'relight', name: 'Relight', icon: '💡', description: 'Change lighting dramatically', route: '/relight', isPremium: false },
  { id: 'age-transform', name: 'Age Machine', icon: '⏳', description: 'See yourself at any age', route: '/age-transform', isPremium: false },
  { id: 'try-on', name: 'Try On', icon: '👗', description: 'Virtual clothing try-on', route: '/try-on', isPremium: true },
  { id: 'virtual-makeup', name: 'Makeup', icon: '💄', description: 'Virtual makeup application', route: '/virtual-makeup', isPremium: false },
  { id: 'beauty-filter', name: 'Beauty Filter', icon: '🪞', description: 'Enhance with beauty filters', route: '/beauty-filter', isPremium: false },
  { id: 'couple-glowup', name: 'Couple Glow Up', icon: '💑', description: 'Glow up together as a couple', route: '/couple-glowup', isPremium: false },
  { id: 'animate-portrait', name: 'Animate', icon: '🎬', description: 'Bring your photo to life', route: '/animate-portrait', isPremium: false },
  { id: 'talking-photo', name: 'Talking Photo', icon: '🗣️', description: 'Make your photo talk', route: '/talking-photo', isPremium: true },
  { id: 'background-removal', name: 'Remove BG', icon: '✂️', description: 'Instant background removal', route: '/background-removal', isPremium: false },
  { id: 'caricature', name: 'Caricature', icon: '🎪', description: '3D cartoon portrait of you', route: '/caricature', isPremium: false },
  { id: 'photo-restore', name: 'Restore', icon: '🕰️', description: 'Fix old or damaged photos', route: '/photo-restore', isPremium: false },
  { id: 'pet-portrait', name: 'Pet Portrait', icon: '🐾', description: 'Style your pet as a hero', route: '/pet-portrait', isPremium: false },
  { id: 'fitness-transform', name: 'Fitness', icon: '💪', description: 'Visualize your fit self', route: '/fitness-transform', isPremium: false },
  { id: 'upscale', name: '4K Upscale', icon: '🔍', description: 'Enhance to crisp 4K', route: '/upscale', isPremium: false },
];

export default function FeatureHubScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  useEffect(() => {
    trackScreen('feature_hub');
  }, []);

  function navigateToFeature(feature: FeatureCard) {
    trackEvent('feature_selected', { featureId: feature.id });
    router.push({ pathname: feature.route as any, params: { imageUri } });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>{'<'} Back</Text>
      </Pressable>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}
      <Text style={styles.title}>Choose a Feature</Text>
      <Text style={styles.subtitle}>What do you want to do with your photo?</Text>

      <View style={styles.grid}>
        {FEATURES.map((feature) => (
          <Pressable
            key={feature.id}
            style={styles.card}
            onPress={() => navigateToFeature(feature)}
          >
            {feature.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{feature.icon}</Text>
            </View>
            <Text style={styles.featureName}>{feature.name}</Text>
            <Text style={styles.featureDesc}>{feature.description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
  preview: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(236,72,153,0.25)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: { fontSize: 9, fontWeight: '700', color: '#ec4899' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(236,72,153,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 20 },
  featureName: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 3 },
  featureDesc: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
