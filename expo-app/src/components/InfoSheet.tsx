import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme as C, radii } from '../theme';
import { fonts } from '../typography';
import { shadow } from '../shadows';

export interface InfoContent { title: string; body: string; }

/**
 * Reusable explainer bottom sheet (review 2026-06): an (i) on goals and score
 * metrics opens "what it is / why it matters / how to improve", so the app
 * teaches instead of judging. Available whether content is locked or not.
 */
export default function InfoSheet({
  visible,
  content,
  onClose,
}: {
  visible: boolean;
  content: InfoContent | null;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, shadow(3)]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{content?.title}</Text>
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.body}>{content?.body}</Text>
          </ScrollView>
          <Pressable style={styles.cta} onPress={onClose}>
            <Text style={styles.ctaText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Small circular (i) trigger to place next to a title/label. */
export function InfoButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iBtn} accessibilityRole="button" accessibilityLabel="More info">
      <Ionicons name="information-circle-outline" size={18} color={C.textSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(45,35,48,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: 22, paddingBottom: Platform.OS === 'ios' ? 40 : 26 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.track, marginBottom: 14 },
  title: { fontFamily: fonts.displayBold, fontSize: 22, color: C.text, marginBottom: 10 },
  body: { fontFamily: fonts.body, fontSize: 15, color: C.textSoft, lineHeight: 22 },
  cta: { backgroundColor: C.pink, borderRadius: radii.full, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  ctaText: { fontFamily: fonts.bodyBold, color: '#fff', fontSize: 16 },
  iBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
