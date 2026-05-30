import React from 'react';

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(true)),
    getCurrentUser: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  },
}));

// Mock Firebase Auth
jest.mock('@react-native-firebase/auth', () => {
  const authMock = () => ({
    onAuthStateChanged: jest.fn((callback) => {
      // Simulate no logged in user initially
      callback(null);
      return jest.fn(); // unsubscribe function
    }),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: null,
  });
  return authMock;
});

// Mock Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
  const firestoreMock = () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
        onSnapshot: jest.fn((callback) => {
          callback({ exists: () => false, data: () => null });
          return jest.fn(); // unsubscribe
        }),
      })),
    })),
  });
  firestoreMock.FieldValue = {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
  };
  return firestoreMock;
});

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native Haptic Feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock React Native Image Picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));
