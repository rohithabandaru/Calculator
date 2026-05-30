import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useCalculator } from '../../hooks/useCalculator';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import HistoryPanel from './HistoryPanel';

// Sizing variables constants
const gap = 12;
const padding = 24;

interface CalculatorScreenProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeAnim: Animated.Value;
  user: any;
  onEditProfile: () => void;
  getInitials: () => string;
}

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  isDarkMode,
  toggleTheme,
  themeAnim,
  user,
  onEditProfile,
  getInitials,
}) => {
  const calc = useCalculator();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [isSecondActive, setIsSecondActive] = useState(false);

  // Dynamic window dimensions for landscape support
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const columns = isLandscape ? 7 : 4;
  const rows = 5;
  const buttonSizeWidth = (width - padding * 2 - gap * (columns - 1)) / columns;
  const availableHeightForGrid = isLandscape ? height * 0.60 : height * 0.52;
  const buttonSizeHeight = (availableHeightForGrid - gap * (rows - 1)) / rows;
  const buttonSize = Math.min(buttonSizeWidth, buttonSizeHeight);

  // Animated colors
  const containerBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.light.bg, COLORS.dark.bg],
  });

  const headerTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.light.headerText, COLORS.dark.headerText],
  });

  return (
    <Animated.View style={[styles.safeArea, { backgroundColor: containerBgColor }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0B0813' : '#F8FAFC'}
      />
      <Animated.View style={[styles.container, { backgroundColor: containerBgColor }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Animated.Text style={[styles.headerText, { color: headerTextColor }]}>
            Scientific Calc
          </Animated.Text>

          <View style={styles.headerRightActions}>
            {/* History Button */}
            <Pressable
              onPress={() => setIsHistoryVisible(true)}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <Text style={styles.iconBtnText}>🕒</Text>
            </Pressable>

            {/* Theme Toggle */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' },
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <Text style={styles.iconBtnText}>
                {isDarkMode ? '☀️' : '🌙'}
              </Text>
            </Pressable>

            {/* Profile Badge */}
            <Pressable
              style={({ pressed }) => [
                styles.profileBadge,
                pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
              ]}
              onPress={onEditProfile}
            >
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileBadgeImage} />
              ) : (
                <View style={styles.profileBadgePlaceholder}>
                  <Text style={styles.profileBadgePlaceholderText}>
                    {getInitials()}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Display */}
        <Display
          expression={calc.expression}
          result={calc.result}
          isDarkMode={isDarkMode}
          themeAnim={themeAnim}
          useDegrees={calc.useDegrees}
          onToggleAngleMode={calc.toggleAngleMode}
        />

        {/* Standard Button Grid */}
        <ButtonGrid
          isDarkMode={isDarkMode}
          isLandscape={isLandscape}
          buttonSize={buttonSize}
          gap={gap}
          isAllClear={calc.isAllClear}
          isScientificMode={isScientificMode}
          isSecondActive={isSecondActive}
          onToggleScientific={() => {
            setIsScientificMode(prev => !prev);
            // Reset secondary functions set when toggling layout
            setIsSecondActive(false);
          }}
          onToggleSecondActive={() => setIsSecondActive(prev => !prev)}
          onDigit={calc.pressDigit}
          onOperator={calc.pressOperator}
          onDecimal={calc.pressDecimal}
          onEquals={calc.pressEquals}
          onClear={calc.pressClear}
          onBackspace={calc.pressBackspace}
          onScientific={calc.pressScientific}
          onBracket={calc.pressBracket}
          onPercentage={calc.pressPercentage}
          onNegate={calc.pressNegate}
        />

        {/* History Panel */}
        <HistoryPanel
          visible={isHistoryVisible}
          isDarkMode={isDarkMode}
          history={calc.history}
          onClose={() => setIsHistoryVisible(false)}
          onRestore={calc.restoreFromHistory}
          onClear={calc.clearHistory}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnText: {
    fontSize: 18,
    lineHeight: 22,
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  profileBadgeImage: {
    width: '100%',
    height: '100%',
  },
  profileBadgePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadgePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default CalculatorScreen;
