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
 * Defer call with setTimeout to prevent blocking the JS/render thread on fast clicks.
 */
export const triggerButtonHaptic = () => {
  setTimeout(() => {
    try {
      if (ReactNativeHapticFeedback) {
        const options = {
          enableVibrateFallback: false, // Turn off fallback to heavy vibrations
          ignoreAndroidSystemSettings: false,
        };
        ReactNativeHapticFeedback.trigger('impactLight', options);
      } else {
        // Fallback to core Vibration API (Android only - iOS fallback is too heavy/slow)
        if (Platform.OS === 'android') {
          Vibration.vibrate(10); // Very short pulse
        }
      }
    } catch (e) {
      // Catch any unexpected haptic module failures silently
    }
  }, 0);
};
