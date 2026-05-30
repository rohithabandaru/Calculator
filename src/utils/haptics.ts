import { Vibration, Platform } from 'react-native';

let ReactNativeHapticFeedback: any = null;
try {
  // Gracefully require the dependency to prevent crashes if it is not linked or built yet
  ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
} catch (e) {
  // Silent fallback
}

/**
 * Triggers light tactile/haptic feedback for button presses.
 */
export const triggerButtonHaptic = () => {
  if (ReactNativeHapticFeedback) {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactLight', options);
  } else {
    // Fallback to core Vibration API
    if (Platform.OS === 'android') {
      Vibration.vibrate(12); // Short pulse in milliseconds
    } else {
      Vibration.vibrate(); // iOS vibration fallback
    }
  }
};
