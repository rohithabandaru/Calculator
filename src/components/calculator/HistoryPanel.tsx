import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { HistoryEntry } from '../../utils/historyStorage';

const { height: screenHeight } = Dimensions.get('window');

interface HistoryPanelProps {
  visible: boolean;
  isDarkMode: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  visible,
  isDarkMode,
  history,
  onClose,
  onRestore,
  onClear,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const theme = isDarkMode ? COLORS.dark : COLORS.light;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <Pressable
      style={({ pressed }) => [
        styles.historyItem,
        {
          backgroundColor: pressed ? theme.historyCardBorder : theme.historyCard,
          borderColor: theme.historyCardBorder,
        },
      ]}
      onPress={() => {
        onRestore(item);
        onClose();
      }}
    >
      <View style={styles.historyItemContent}>
        <Text style={[styles.historyExpression, { color: theme.historySubtext }]} numberOfLines={1}>
          {item.expression}
        </Text>
        <Text style={[styles.historyResult, { color: theme.historyText }]} numberOfLines={1}>
          = {item.result}
        </Text>
      </View>
      <Text style={[styles.historyTimestamp, { color: theme.historySubtext }]}>
        {formatTimestamp(item.timestamp)}
      </Text>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon]}>📝</Text>
      <Text style={[styles.emptyText, { color: theme.historySubtext }]}>
        No calculations yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.historySubtext }]}>
        Your calculation history will appear here
      </Text>
    </View>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.historyBackdrop }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: theme.historyBg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.historyCardBorder }]} />
            </View>

            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: theme.historyText }]}>
                History
              </Text>
              <View style={styles.headerActions}>
                {history.length > 0 && (
                  <Pressable
                    onPress={onClear}
                    style={({ pressed }) => [
                      styles.clearBtn,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={[styles.clearBtnText, { color: COLORS.accent }]}>
                      Clear All
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    { backgroundColor: theme.historyCard },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={[styles.closeBtnText, { color: theme.historyText }]}>✕</Text>
                </Pressable>
              </View>
            </View>

            {/* History List */}
            <FlatList
              data={history}
              keyExtractor={item => item.id}
              renderItem={renderHistoryItem}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: screenHeight * 0.65,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    maxHeight: screenHeight * 0.45,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyItemContent: {
    flex: 1,
    marginRight: 12,
  },
  historyExpression: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 3,
  },
  historyResult: {
    fontSize: 20,
    fontWeight: '600',
  },
  historyTimestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default React.memo(HistoryPanel);
