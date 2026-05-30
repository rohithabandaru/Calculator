import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import CalculatorButton from './CalculatorButton';
import { COLORS } from '../../constants/theme';

interface ButtonGridProps {
  isDarkMode: boolean;
  isLandscape: boolean;
  buttonSize: number;
  gap: number;
  isAllClear: boolean;
  isScientificMode: boolean;
  isSecondActive: boolean;
  onToggleScientific: () => void;
  onToggleSecondActive: () => void;
  onDigit: (d: string) => void;
  onOperator: (op: string) => void;
  onDecimal: () => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onScientific: (fn: string) => void;
  onBracket: (bracket: '(' | ')') => void;
  onPercentage: () => void;
  onNegate: () => void;
}

const ButtonGrid: React.FC<ButtonGridProps> = ({
  isDarkMode,
  isLandscape,
  buttonSize,
  gap,
  isAllClear,
  isScientificMode,
  isSecondActive,
  onToggleScientific,
  onToggleSecondActive,
  onDigit,
  onOperator,
  onDecimal,
  onEquals,
  onClear,
  onBackspace,
  onScientific,
  onBracket,
  onPercentage,
  onNegate,
}) => {
  // Animation value for switching between Standard and Scientific layouts in Portrait
  const transitionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(transitionAnim, {
      toValue: isScientificMode ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  }, [isScientificMode]);

  // Interpolate opacity and scale for Standard Digit Pad (Portrait)
  const standardOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const standardScale = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
  });

  // Interpolate opacity and scale for Scientific Keypad (Portrait)
  const scientificOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scientificScale = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });

  const gridHeight = buttonSize * 4 + gap * 3;
  const leftGridWidth = buttonSize * 3 + gap * 2;

  // Render landscape layout side-by-side
  if (isLandscape) {
    return (
      <View style={[styles.gridContainer, { paddingHorizontal: 24 }]}>
        {/* Row 1: 2nd, (, ), AC/C, ⌫, %, ÷ */}
        <View style={[styles.row, { marginBottom: gap }]}>
          <CalculatorButton
            label="2nd"
            onPress={onToggleSecondActive}
            type="second"
            isActive={isSecondActive}
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="("
            onPress={() => onBracket('(')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label=")"
            onPress={() => onBracket(')')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isAllClear ? 'AC' : 'C'}
            onPress={onClear}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="⌫"
            onPress={onBackspace}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="%"
            onPress={onPercentage}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="÷"
            onPress={() => onOperator('÷')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>

        {/* Row 2: sin/sin⁻¹, cos/cos⁻¹, tan/tan⁻¹, 7, 8, 9, × */}
        <View style={[styles.row, { marginBottom: gap }]}>
          <CalculatorButton
            label={isSecondActive ? 'sin⁻¹' : 'sin'}
            onPress={() => onScientific(isSecondActive ? 'sin⁻¹' : 'sin')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? 'cos⁻¹' : 'cos'}
            onPress={() => onScientific(isSecondActive ? 'cos⁻¹' : 'cos')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? 'tan⁻¹' : 'tan'}
            onPress={() => onScientific(isSecondActive ? 'tan⁻¹' : 'tan')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton label="7" onPress={() => onDigit('7')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="8" onPress={() => onDigit('8')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="9" onPress={() => onDigit('9')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton
            label="×"
            onPress={() => onOperator('×')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>

        {/* Row 3: log/10ˣ, ln/eˣ, √/³√, 4, 5, 6, − */}
        <View style={[styles.row, { marginBottom: gap }]}>
          <CalculatorButton
            label={isSecondActive ? '10\u02e3' : 'log'}
            onPress={() => onScientific(isSecondActive ? '10\u02e3' : 'log')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? 'e\u02e3' : 'ln'}
            onPress={() => onScientific(isSecondActive ? 'e\u02e3' : 'ln')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? '\u00b3\u221a' : '\u221a'}
            onPress={() => onScientific(isSecondActive ? '\u00b3\u221a' : '\u221a')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton label="4" onPress={() => onDigit('4')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="5" onPress={() => onDigit('5')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="6" onPress={() => onDigit('6')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton
            label="−"
            onPress={() => onOperator('-')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>

        {/* Row 4: x²/x³, xʸ/n!, π/e, 1, 2, 3, + */}
        <View style={[styles.row, { marginBottom: gap }]}>
          <CalculatorButton
            label={isSecondActive ? 'x\u00b3' : 'x\u00b2'}
            onPress={() => onScientific(isSecondActive ? 'x\u00b3' : 'x\u00b2')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? 'n!' : 'x\u02b8'}
            onPress={() => onScientific(isSecondActive ? 'n!' : 'x\u02b8')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label={isSecondActive ? 'e' : '\u03c0'}
            onPress={() => onScientific(isSecondActive ? 'e' : '\u03c0')}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton label="1" onPress={() => onDigit('1')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="2" onPress={() => onDigit('2')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton label="3" onPress={() => onDigit('3')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
          <CalculatorButton
            label="+"
            onPress={() => onOperator('+')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>

        {/* Row 5: +/−, spacer, spacer, 0 (double), ., = */}
        <View style={styles.row}>
          <CalculatorButton
            label="+/\u2212"
            onPress={onNegate}
            type="scientific"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <View style={{ width: buttonSize }} />
          <View style={{ width: buttonSize }} />
          <CalculatorButton
            label="0"
            onPress={() => onDigit('0')}
            doubleWidth
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="."
            onPress={onDecimal}
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="="
            onPress={onEquals}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>
      </View>
    );
  }

  // Portrait Layout (Default)
  return (
    <View style={[styles.gridContainer, { paddingHorizontal: 24 }]}>
      {/* Row 1: persistent header controls (2nd/123, C, ⌫, ÷) */}
      <View style={[styles.row, { marginBottom: gap }]}>
        {isScientificMode ? (
          <CalculatorButton
            label="123"
            onPress={onToggleScientific}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        ) : (
          <CalculatorButton
            label="2nd"
            onPress={onToggleScientific}
            type="second"
            isActive={false}
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        )}

        {isScientificMode ? (
          <CalculatorButton
            label="2nd"
            onPress={onToggleSecondActive}
            type="second"
            isActive={isSecondActive}
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        ) : (
          <CalculatorButton
            label={isAllClear ? 'AC' : 'C'}
            onPress={onClear}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        )}

        {isScientificMode ? (
          <CalculatorButton
            label={isAllClear ? 'AC' : 'C'}
            onPress={onClear}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        ) : (
          <CalculatorButton
            label="⌫"
            onPress={onBackspace}
            type="special"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        )}

        <CalculatorButton
          label="÷"
          onPress={() => onOperator('÷')}
          type="operator"
          isDarkMode={isDarkMode}
          buttonSize={buttonSize}
        />
      </View>

      {/* Main Grid Area: Left toggled keypad + Right operators */}
      <View style={styles.gridBody}>
        {/* Left Side: digits / scientific functions */}
        <View style={[styles.gridLeft, { width: leftGridWidth, height: gridHeight }]}>
          
          {/* STANDARD DIGITS OVERLAY */}
          <Animated.View
            style={[
              styles.keypadOverlay,
              {
                opacity: standardOpacity,
                transform: [{ scale: standardScale }],
                zIndex: isScientificMode ? 0 : 1,
              },
            ]}
            pointerEvents={isScientificMode ? 'none' : 'auto'}
          >
            {/* Row 2: 7, 8, 9 */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton label="7" onPress={() => onDigit('7')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="8" onPress={() => onDigit('8')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="9" onPress={() => onDigit('9')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
            </View>

            {/* Row 3: 4, 5, 6 */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton label="4" onPress={() => onDigit('4')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="5" onPress={() => onDigit('5')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="6" onPress={() => onDigit('6')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
            </View>

            {/* Row 4: 1, 2, 3 */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton label="1" onPress={() => onDigit('1')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="2" onPress={() => onDigit('2')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="3" onPress={() => onDigit('3')} isDarkMode={isDarkMode} buttonSize={buttonSize} />
            </View>

            {/* Row 5: 0, . */}
            <View style={styles.row}>
              <CalculatorButton label="0" onPress={() => onDigit('0')} doubleWidth isDarkMode={isDarkMode} buttonSize={buttonSize} />
              <CalculatorButton label="." onPress={onDecimal} isDarkMode={isDarkMode} buttonSize={buttonSize} />
            </View>
          </Animated.View>

          {/* SCIENTIFIC KEYS OVERLAY */}
          <Animated.View
            style={[
              styles.keypadOverlay,
              {
                opacity: scientificOpacity,
                transform: [{ scale: scientificScale }],
                zIndex: isScientificMode ? 1 : 0,
              },
            ]}
            pointerEvents={isScientificMode ? 'auto' : 'none'}
          >
            {/* Row 2: sin, cos, tan (Set 1) vs sin⁻¹, cos⁻¹, tan⁻¹ (Set 2) */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton
                label={isSecondActive ? 'sin⁻¹' : 'sin'}
                onPress={() => onScientific(isSecondActive ? 'sin⁻¹' : 'sin')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? 'cos⁻¹' : 'cos'}
                onPress={() => onScientific(isSecondActive ? 'cos⁻¹' : 'cos')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? 'tan⁻¹' : 'tan'}
                onPress={() => onScientific(isSecondActive ? 'tan⁻¹' : 'tan')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
            </View>

            {/* Row 3: log, ln, √ (Set 1) vs 10ˣ, eˣ, ³√ (Set 2) */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton
                label={isSecondActive ? '10\u02e3' : 'log'}
                onPress={() => onScientific(isSecondActive ? '10\u02e3' : 'log')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? 'e\u02e3' : 'ln'}
                onPress={() => onScientific(isSecondActive ? 'e\u02e3' : 'ln')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? '\u00b3\u221a' : '\u221a'}
                onPress={() => onScientific(isSecondActive ? '\u00b3\u221a' : '\u221a')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
            </View>

            {/* Row 4: x², x\u02e8, \u03c0 (Set 1) vs x\u00b3, n!, e (Set 2) */}
            <View style={[styles.row, { marginBottom: gap }]}>
              <CalculatorButton
                label={isSecondActive ? 'x\u00b3' : 'x\u00b2'}
                onPress={() => onScientific(isSecondActive ? 'x\u00b3' : 'x\u00b2')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? 'n!' : 'x\u02b8'}
                onPress={() => onScientific(isSecondActive ? 'n!' : 'x\u02b8')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? 'e' : '\u03c0'}
                onPress={() => onScientific(isSecondActive ? 'e' : '\u03c0')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
            </View>

            {/* Row 5: (, ), % (Set 1) vs (, ), +/- (Set 2) */}
            <View style={styles.row}>
              <CalculatorButton
                label="("
                onPress={() => onBracket('(')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label=")"
                onPress={() => onBracket(')')}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
              <CalculatorButton
                label={isSecondActive ? '+/\u2212' : '%'}
                onPress={isSecondActive ? onNegate : onPercentage}
                type="scientific"
                isDarkMode={isDarkMode}
                buttonSize={buttonSize}
              />
            </View>
          </Animated.View>

        </View>

        {/* Right Side: operators column */}
        <View style={[styles.gridRight, { width: buttonSize, height: gridHeight }]}>
          <CalculatorButton
            label="×"
            onPress={() => onOperator('×')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="−"
            onPress={() => onOperator('-')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="+"
            onPress={() => onOperator('+')}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
          <CalculatorButton
            label="="
            onPress={onEquals}
            type="operator"
            isDarkMode={isDarkMode}
            buttonSize={buttonSize}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridLeft: {
    position: 'relative',
  },
  keypadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridRight: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default React.memo(ButtonGrid);
