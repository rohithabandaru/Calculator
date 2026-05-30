import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { triggerButtonHaptic } from '../../utils/haptics';

export type ButtonType = 'digit' | 'operator' | 'special' | 'scientific' | 'second';

interface CalculatorButtonProps {
  label: string;
  onPress: () => void;
  type?: ButtonType;
  doubleWidth?: boolean;
  isDarkMode: boolean;
  buttonSize: number;
  isActive?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  onPress,
  type = 'digit',
  doubleWidth = false,
  isDarkMode,
  buttonSize,
  isActive = false,
}) => {
  const handlePress = () => {
    triggerButtonHaptic();
    onPress();
  };

  const getButtonStyles = (pressed: boolean) => {
    const theme = isDarkMode ? COLORS.dark : COLORS.light;
    let backgroundColor = theme.card;
    let shadowColor = isDarkMode ? '#000' : '#475569';
    let extraShadow = {};

    if (type === 'operator') {
      backgroundColor = pressed ? COLORS.primaryPressed : COLORS.primary;
    } else if (type === 'special') {
      backgroundColor = pressed ? theme.specialBgPressed : theme.specialBg;
    } else if (type === 'scientific') {
      backgroundColor = pressed ? theme.scientificBgPressed : theme.scientificBg;
    } else if (type === 'second') {
      if (isActive) {
        backgroundColor = pressed ? '#6D28D9' : theme.secondBtnActiveBg;
        shadowColor = '#7C3AED';
        extraShadow = {
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        };
      } else {
        backgroundColor = pressed ? theme.scientificBgPressed : theme.secondBtnBg;
      }
    } else if (type === 'digit') {
      if (pressed) {
        backgroundColor = theme.specialBg;
      }
    }

    return {
      backgroundColor,
      width: doubleWidth ? buttonSize * 2 + 12 : buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      transform: [{ scale: pressed ? 0.93 : 1 }],
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.15 : 0.08,
      shadowRadius: 5,
      elevation: 3,
      ...extraShadow,
    };
  };

  const getTextStyle = () => {
    const theme = isDarkMode ? COLORS.dark : COLORS.light;
    let color = theme.text;
    let fontSize = 26;
    let fontWeight: '400' | '500' | '600' | '700' = '400';

    if (type === 'operator') {
      color = COLORS.primaryText;
      fontSize = 30;
      fontWeight = '500';
    } else if (type === 'special') {
      color = theme.specialText;
      fontSize = 22;
    } else if (type === 'scientific') {
      color = theme.scientificText;
      fontSize = 17;
      fontWeight = '500';
    } else if (type === 'second') {
      color = isActive ? theme.secondBtnActiveText : theme.secondBtnText;
      fontSize = 15;
      fontWeight = '700';
    }

    return { color, fontSize, fontWeight };
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => getButtonStyles(pressed)}
    >
      <Text style={[styles.buttonText, getTextStyle()]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontWeight: '400',
  },
});

export default React.memo(CalculatorButton);
