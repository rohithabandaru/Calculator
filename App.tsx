import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import Login from './src/components/Login';
import EditProfile from './src/components/EditProfile';
import CalculatorScreen from './src/components/calculator/CalculatorScreen';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLORS } from './src/constants/theme';
import {
  saveThemePreference,
  subscribeToUserDoc,
  updateUserProfile,
} from './src/services/userService';

export default function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Theme States (Light mode is the default)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const themeAnim = React.useRef(new Animated.Value(0)).current;

  // Animate color transition smoothly when isDarkMode changes
  useEffect(() => {
    Animated.timing(themeAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 350,
      useNativeDriver: false, // Color interpolation is done on JS thread
    }).start();
  }, [isDarkMode]);

  // Listen to auth state changes to persist login session
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
        });
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsDarkMode(false); // Reset to Light Mode default on logout
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync user profile and theme preference from Firestore in real-time
  useEffect(() => {
    if (user && user.uid) {
      const unsubscribe = subscribeToUserDoc(
        user.uid,
        (data) => {
          setUser((prevUser: any) => {
            if (!prevUser) return null;
            return {
              ...prevUser,
              displayName: data.displayName || prevUser.displayName || '',
              photoURL: data.photoURL || prevUser.photoURL || '',
            };
          });

          // Fetch saved theme preference if it exists
          if (data.themePreference) {
            setIsDarkMode(data.themePreference === 'dark');
          }
        },
        (error) => {
          console.log('Error listening to user doc:', error);
        }
      );
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);

    // Save to Firestore if user is authenticated
    if (user?.uid) {
      try {
        await saveThemePreference(user.uid, nextMode);
      } catch (e) {
        console.log('Error saving theme preference to Firestore:', e);
      }
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      const names = user.displayName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  // Render Login Screen if not logged in
  if (!isLoggedIn) {
    return (
      <Login
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLoginSuccess={(authenticatedUser) => {
          if (authenticatedUser) {
            setUser({
              uid: authenticatedUser.uid,
              email: authenticatedUser.email,
              displayName: authenticatedUser.displayName || '',
              photoURL: authenticatedUser.photoURL || '',
            });
            setIsLoggedIn(true);
          }
        }}
      />
    );
  }

  // Render Edit Profile Screen
  if (isEditingProfile) {
    return (
      <EditProfile
        user={user}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onClose={() => setIsEditingProfile(false)}
        onLogout={async () => {
          setIsEditingProfile(false);
          try {
            await auth().signOut();
            await GoogleSignin.signOut();
          } catch (e) {
            console.log('Error signing out:', e);
          }
          setIsLoggedIn(false);
          setUser(null);
        }}
        onProfileUpdate={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
    );
  }

  // Render Scientific Calculator Screen
  return (
    <CalculatorScreen
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      themeAnim={themeAnim}
      user={user}
      onEditProfile={() => setIsEditingProfile(true)}
      getInitials={getInitials}
    />
  );
}
