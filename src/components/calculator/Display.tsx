import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { COLORS } from '../../constants/theme';

interface DisplayProps {
  expression: string;
  result: string;
  isDarkMode: boolean;
  themeAnim: Animated.Value;
  useDegrees: boolean;
  onToggleAngleMode: () => void;
}

const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  isDarkMode,
  themeAnim,
  useDegrees,
  onToggleAngleMode,
}) => {
  const equationTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.light.equationText, COLORS.dark.equationText],
  });

  const displayTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.light.displayText, COLORS.dark.displayText],
  });

  // Auto-size the result text
  const getResultFontSize = () => {
    const len = result.length;
    if (len > 14) return 32;
    if (len > 10) return 40;
    if (len > 7) return 48;
    return 56;
  };

  return (
    <View style={styles.displayContainer}>
      {/* Expression row */}
      <View style={styles.expressionRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.expressionScroll}
          style={styles.expressionScrollContainer}
        >
          <Animated.Text
            style={[styles.equationText, { color: equationTextColor }]}
          >
            {expression || ' '}
          </Animated.Text>
        </ScrollView>
      </View>

      {/* Result */}
      <Animated.Text
        style={[
          styles.displayText,
          { color: displayTextColor, fontSize: getResultFontSize() },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {result}
      </Animated.Text>

      {/* Angle Mode Toggle */}
      <Pressable
        onPress={onToggleAngleMode}
        style={({ pressed }) => [
          styles.angleToggle,
          {
            borderColor: isDarkMode ? '#334155' : '#CBD5E1',
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(226, 232, 240, 0.4)',
          },
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Text style={[styles.angleText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
          {useDegrees ? 'DEG' : 'RAD'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 100,
    position: 'relative',
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  expressionScrollContainer: {
    flex: 1,
  },
  expressionScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  equationText: {
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'right',
  },
  displayText: {
    fontWeight: '300',
    textAlign: 'right',
    width: '100%',
    paddingBottom: 8,
  },
  angleToggle: {
    position: 'absolute',
    left: 24,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  angleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

export default React.memo(Display);
