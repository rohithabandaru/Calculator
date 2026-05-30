import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { updateUserProfile } from '../services/userService';
import { launchImageLibrary } from 'react-native-image-picker';

interface EditProfileProps {
  user: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onClose: () => void;
  onLogout: () => void;
  onProfileUpdate: (user: any) => void;
}

export default function EditProfile({ user, isDarkMode, toggleTheme, onClose, onLogout, onProfileUpdate }: EditProfileProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Visibility States
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  
  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Error States
  const [nameError, setNameError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  // Check auth providers
  const hasPasswordProvider = auth().currentUser?.providerData.some(
    (provider) => provider.providerId === 'password'
  );
  const isGoogleUser = !hasPasswordProvider && auth().currentUser?.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );
  const isDemoUser = !auth().currentUser;

  useEffect(() => {
    console.log('=== EditProfile DEBUG ===');
    console.log('User Email:', auth().currentUser?.email);
    console.log('Provider Data:', JSON.stringify(auth().currentUser?.providerData, null, 2));
    console.log('=========================');
  }, []);

  // Initials generator if there's no avatar image
  const getInitials = () => {
    if (displayName) {
      const names = displayName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  // Image library picker handler
  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.7,
        includeBase64: true,
      },
      async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', 'Unable to select photo.');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          if (asset.base64) {
            setIsUploading(true);
            const base64Image = `data:${asset.type};base64,${asset.base64}`;
            setPhotoURL(base64Image);
            setIsUploading(false);
          }
        }
      }
    );
  };

  // Main profile update handler
  const handleSave = async () => {
    // Reset errors
    setNameError('');
    setCurrentPasswordError('');
    setNewPasswordError('');

    let hasError = false;

    // Validate Display Name
    if (!displayName.trim()) {
      setNameError('Name is required.');
      hasError = true;
    }

    // Validate Passwords if user is changing password
    if (newPassword) {
      if (isDemoUser) {
        setNewPasswordError('Not available in Demo Mode.');
        hasError = true;
      } else {
        if (!currentPassword) {
          setCurrentPasswordError('Current password is required.');
          hasError = true;
        }
        
        if (newPassword.length < 6) {
          setNewPasswordError('Minimum 6 characters.');
          hasError = true;
        } else if (!/[0-9]/.test(newPassword)) {
          setNewPasswordError('Must include a number.');
          hasError = true;
        } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
          setNewPasswordError('Must include a special character.');
          hasError = true;
        }
      }
    }

    if (hasError) return;

    setIsSaving(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('No authenticated user found.');

      // 1. Password Update Flow (requires re-authentication)
      if (newPassword && !isGoogleUser) {
        try {
          const credential = auth.EmailAuthProvider.credential(currentUser.email || email, currentPassword);
          await currentUser.reauthenticateWithCredential(credential);
          await currentUser.updatePassword(newPassword);
        } catch (passwordErr: any) {
          console.log('Re-authentication / Password change error:', passwordErr);
          if (passwordErr.code === 'auth/wrong-password') {
            setCurrentPasswordError('Wrong password.');
          } else {
            Alert.alert('Password Error', 'Failed to update password.');
          }
          setIsSaving(false);
          return;
        }
      }


      // 2. Update Firebase Auth Profile (Only update display name here to bypass Firebase Auth character limits on photoURL string size)
      await currentUser.updateProfile({
        displayName: displayName.trim(),
      });

      // 3. Update Firestore Document
      await updateUserProfile(currentUser.uid, displayName, photoURL);

      // Trigger local state updates
      onProfileUpdate({
        ...user,
        displayName: displayName.trim(),
        photoURL: photoURL,
      });

      Alert.alert('Success', 'Profile saved!', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (err: any) {
      console.log('Error updating profile:', err);
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Color interpolations for smooth transitions
  const themeAnim = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(themeAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const containerBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FAFC', '#0B0813'],
  });

  const cardBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#141026'],
  });

  const cardBorderColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#2A224E'],
  });

  const labelTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#475569', '#A78BFA'],
  });

  const inputBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F8FAFC', '#0D0A1A'],
  });

  const inputBorderColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#231C42'],
  });

  const disabledBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#1A162B'],
  });

  const disabledBorderColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#201B35'],
  });

  const dividerLineColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#2A224E'],
  });

  const backBtnBgColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#1E293B'],
  });

  const backBtnTextColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334155', '#E2E8F0'],
  });

  return (
    <Animated.View style={[styles.safeArea, { backgroundColor: containerBgColor }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#0B0813" : "#F8FAFC"} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            
            {/* Header Toolbar */}
            <View style={styles.header}>
              <Pressable onPress={onClose}>
                <Animated.View style={[styles.backButton, { backgroundColor: backBtnBgColor }]}>
                  <Animated.Text style={[styles.backButtonText, { color: backBtnTextColor }]}>← BACK</Animated.Text>
                </Animated.View>
              </Pressable>
              <Text style={styles.title}>EDIT PROFILE</Text>
              <View style={styles.placeholderWidth} />
            </View>

            {/* Profile Card Container */}
            <Animated.View style={[styles.card, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
              
              {/* Avatar Selector */}
              <View style={styles.avatarContainer}>
                <Pressable onPress={handleSelectPhoto} style={styles.avatarPressable}>
                  {photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarPlaceholderText}>{getInitials()}</Text>
                    </View>
                  )}
                  <View style={styles.editBadge}>
                    <Text style={styles.editBadgeText}>📷</Text>
                  </View>
                </Pressable>
                {isUploading && (
                  <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 8 }} />
                )}
              </View>

              {/* Name Field */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Name</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: nameError ? '#EF4444' : inputBorderColor }]}>
                  <Text style={styles.fieldIcon}>👤</Text>
                  <TextInput
                    style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                    placeholder="Enter your name"
                    placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                    value={displayName}
                    onChangeText={(text) => {
                      setDisplayName(text);
                      setNameError('');
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </Animated.View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              {/* Email Field (Disabled) */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Email (Read-only)</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: disabledBgColor, borderColor: disabledBorderColor }]}>
                  <Text style={styles.fieldIcon}>✉</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput, { color: isDarkMode ? '#64748B' : '#64748B' }]}
                    value={email}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                </Animated.View>
              </View>

              <Animated.View style={[styles.divider, { backgroundColor: dividerLineColor }]} />
              <Animated.Text style={[styles.sectionHeader, { color: labelTextColor }]}>Change Password</Animated.Text>

              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Current Password</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: currentPasswordError ? '#EF4444' : inputBorderColor }]}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                    placeholder="Enter current password"
                    placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      setCurrentPasswordError('');
                    }}
                    secureTextEntry={!isCurrentPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                  >
                    <Text style={[styles.eyeIcon, { color: isCurrentPasswordVisible ? '#8B5CF6' : (isDarkMode ? '#64748B' : '#94A3B8') }]}>
                      👁️
                    </Text>
                  </Pressable>
                </Animated.View>
                {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>New Password</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: newPasswordError ? '#EF4444' : inputBorderColor }]}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                    placeholder="Enter new password"
                    placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setNewPasswordError('');
                    }}
                    secureTextEntry={!isNewPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  >
                    <Text style={[styles.eyeIcon, { color: isNewPasswordVisible ? '#8B5CF6' : (isDarkMode ? '#64748B' : '#94A3B8') }]}>
                      👁️
                    </Text>
                  </Pressable>
                </Animated.View>
                {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}
              </View>

              {/* Save Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                ]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                )}
              </Pressable>

              {/* Logout Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                ]}
                onPress={onLogout}
              >
                <Text style={styles.logoutButtonText}>LOGOUT</Text>
              </Pressable>

            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  placeholderWidth: {
    width: 60, // Equal width placeholder to center the title text perfectly
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPressable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2.5,
    borderColor: '#8B5CF6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#2A224E',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#141026',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  editBadgeText: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 18,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  disabledInputWrapper: {
    borderWidth: 1.5,
  },
  fieldIcon: {
    fontSize: 16,
    color: '#8B5CF6',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  disabledInput: {
    color: '#64748B',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    marginLeft: 4,
  },
  googleUserNotice: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#312E81',
    marginVertical: 10,
    alignItems: 'center',
  },
  googleNoticeText: {
    color: '#C7D2FE',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#7C3AED',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 14,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
