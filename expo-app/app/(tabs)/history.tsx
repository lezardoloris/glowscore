import {
  View,
  Text,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getHistory,
  deleteFromHistory,
  TransformationRecord,
} from '../../src/services/history';
import { trackScreen } from '../../src/services/analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const TILE_GAP = 4;
const TILE_SIZE = (SCREEN_WIDTH - 32 - TILE_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function HistoryScreen() {
  const [records, setRecords] = useState<TransformationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // M11: Track screen view
  useEffect(() => { trackScreen('history'); }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    setLoading(true);
    const data = await getHistory();
    setRecords(data);
    setLoading(false);
  }

  function confirmDelete(id: string) {
    if (Platform.OS === 'web') {
      if (confirm('Delete this transformation?')) {
        handleDelete(id);
      }
      return;
    }
    Alert.alert('Delete', 'Delete this transformation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDelete(id),
      },
    ]);
  }

  async function handleDelete(id: string) {
    await deleteFromHistory(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function openResult(record: TransformationRecord) {
    router.push({
      pathname: '/result',
      params: {
        imageUri: record.originalUri,
        resultUri: record.resultUri,
        styleId: record.styleId,
        isHD: String(record.isHD),
      },
    });
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const month = d.toLocaleString('en', { month: 'short' });
    const day = d.getDate();
    return `${month} ${day}`;
  }

  if (!loading && records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Text style={styles.emptyIconText}>🔄</Text>
        </View>
        <Text style={styles.emptyTitle}>No transformations yet</Text>
        <Text style={styles.emptySubtitle}>
          Your glow ups will appear here
        </Text>
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.ctaButtonText}>Start Your First Glow Up</Text>
        </Pressable>
      </View>
    );
  }

  function renderItem({ item }: { item: TransformationRecord }) {
    return (
      <Pressable
        style={styles.tile}
        onPress={() => openResult(item)}
        onLongPress={() => confirmDelete(item.id)}
      >
        <Image source={{ uri: item.resultUri }} style={styles.tileImage} />
        {/* Delete button (top-right corner) */}
        <Pressable
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
          hitSlop={8}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
        <View style={styles.tileOverlay}>
          <Text style={styles.tileStyleName} numberOfLines={1}>
            {item.styleName}
          </Text>
          <View style={styles.tileMeta}>
            {item.isHD && (
              <View style={styles.hdBadge}>
                <Text style={styles.hdBadgeText}>HD</Text>
              </View>
            )}
            <Text style={styles.tileDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>History</Text>
      <Text style={styles.hint}>Tap ✕ or long press to delete</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE * 1.25,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tileImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  tileStyleName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  tileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  hdBadge: {
    backgroundColor: 'rgba(74,222,128,0.25)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  hdBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#4ade80',
  },
  tileDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
  },
  // Delete button on tiles
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#a855f7',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
