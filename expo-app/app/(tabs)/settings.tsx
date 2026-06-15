import {
  View, Text, Pressable, ScrollView, StyleSheet, Alert, Linking, Platform,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../../src/theme';
import { typography, fonts } from '../../src/typography';
import { shadow } from '../../src/shadows';
import { checkSubscription } from '../../src/services/subscription';
import { trackScreen } from '../../src/services/analytics';
import { deleteAllData } from '../../src/services/account';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { trackScreen('settings'); }, []);

  useFocusEffect(
    useCallback(() => {
      checkSubscription().then(setIsSubscribed);
    }, [])
  );

  function confirmDelete() {
    const msg = 'This permanently deletes your account: all scans, your plan, and your purchase profile on this device. This cannot be undone.';
    if (Platform.OS === 'web') {
      if (confirm(msg)) runDelete();
      return;
    }
    Alert.alert('Delete Account & Data', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: runDelete },
    ]);
  }

  async function runDelete() {
    setDeleting(true);
    await deleteAllData();
    setDeleting(false);
    router.replace('/onboarding');
  }

  function openURL(url: string) { Linking.openURL(url); }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      {/* Subscription */}
      <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, isSubscribed ? styles.statusPremium : styles.statusFree]}>
            <Text style={[styles.statusText, { color: isSubscribed ? '#fff' : C.textSoft }]}>
              {isSubscribed ? 'Premium' : 'Free'}
            </Text>
          </View>
        </View>
        {!isSubscribed ? (
          <Pressable style={styles.upgradeButton} onPress={() => router.push('/pricing')}>
            <Text style={styles.upgradeButtonText}>Unlock Your Glow Up</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.linkButton}
            onPress={() => openURL(
              Platform.OS === 'ios' ? 'https://apps.apple.com/account/subscriptions'
              : Platform.OS === 'android' ? 'https://play.google.com/store/account/subscriptions'
              : 'https://glowupai.app/account')}
          >
            <Text style={styles.linkButtonText}>Manage Subscription</Text>
          </Pressable>
        )}
        <Pressable style={styles.restoreRow} onPress={() => router.push('/pricing')}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>
      </View>

      {/* About */}
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <View style={styles.card}>
        <AboutRow label="Privacy Policy" onPress={() => openURL('https://glowupai.app/privacy')} />
        <View style={styles.separator} />
        <AboutRow label="Terms of Use" onPress={() => openURL('https://glowupai.app/terms')} />
        <View style={styles.separator} />
        <AboutRow label="Contact Support" onPress={() => openURL('mailto:support@glowupai.app')} />
        <View style={styles.separator} />
        <AboutRow label="Mental Health Support" onPress={() => openURL('https://www.nationaleatingdisorders.org/help-support/')} />
      </View>

      {/* Account / data */}
      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <View style={styles.card}>
        <Pressable style={styles.dangerButton} onPress={confirmDelete} disabled={deleting}>
          <Ionicons name="trash-outline" size={18} color="#C2415B" />
          <Text style={styles.dangerButtonText}>{deleting ? 'Deleting…' : 'Delete Account & Data'}</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>
        AI-generated artistic visualization for entertainment purposes only.
        Results are not intended to represent real-world outcomes.
      </Text>
      <Text style={styles.version}>GlowScore v{APP_VERSION}</Text>
    </ScrollView>
  );
}

function AboutRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.aboutRow} onPress={onPress}>
      <Text style={styles.aboutRowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 100 },
  header: { ...typography.h2, marginBottom: 18 },
  sectionHeader: { ...typography.caption, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginTop: 20 },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 16, ...shadow(1) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 15, color: C.text, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusPremium: { backgroundColor: C.pink },
  statusFree: { backgroundColor: C.pinkSoft },
  statusText: { fontSize: 12, fontWeight: '800' },
  upgradeButton: { backgroundColor: C.pink, borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  upgradeButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkButtonText: { color: C.pink, fontSize: 14, fontWeight: '700' },
  restoreRow: { marginTop: 12, alignItems: 'center' },
  restoreText: { color: C.textSoft, fontSize: 13, fontWeight: '600' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  aboutRowText: { fontSize: 15, color: C.text, fontWeight: '600' },
  separator: { height: 1, backgroundColor: C.bg },
  dangerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FCE2E2', borderRadius: 14, paddingVertical: 14,
  },
  dangerButtonText: { color: '#C2415B', fontSize: 15, fontWeight: '800' },
  disclaimer: { fontSize: 11, color: C.textSoft, textAlign: 'center', lineHeight: 16, marginTop: 28, paddingHorizontal: 16, opacity: 0.85 },
  version: { fontSize: 11, color: C.textSoft, textAlign: 'center', marginTop: 14, marginBottom: 20, opacity: 0.6 },
});
