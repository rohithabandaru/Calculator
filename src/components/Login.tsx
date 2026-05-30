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
  Animated,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { saveUserToFirestore } from '../services/userService';

interface LoginProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function Login({ isDarkMode, toggleTheme, onLoginSuccess }: LoginProps) {
  // Auth Screen State
  const [isSignUp, setIsSignUp] = useState(false);

  // Authentication Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility Controls
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  // Validation Error States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');




  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '465427982099-kgk82nn0svkmhsao53k43dg4r8t8cbgv.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = (await GoogleSignin.signIn()) as any;
      
      // Get the idToken from the response
      const idToken = response.idToken || (response.data && response.data.idToken);
      
      if (!idToken) {
        throw new Error('No ID token found from Google Sign-In');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Store user details in Cloud Firestore
      await saveUserToFirestore(userCredential.user);

      // Trigger success callback with authenticated user
      onLoginSuccess(userCredential.user);
    } catch (error: any) {
      console.log('Google Sign-In Error details:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign-in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services', 'Google Play Services is not available or outdated on this device.');
      } else {
        Alert.alert(
          'Google Sign-In Error',
          error.message || 'Please check your Firebase console Google Sign-in settings.'
        );
      }
    }
  };

  // Central Authentication Handler (Login or Sign-Up)
  const handleAuthentication = async () => {
    // Clear previous errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    let hasError = false;

    // 0. Name check (Sign Up only)
    if (isSignUp) {
      if (!trimmedName) {
        setNameError('Please enter your name.');
        hasError = true;
      } else if (trimmedName.length < 2) {
        setNameError('Name must be at least 2 characters long.');
        hasError = true;
      }
    }

    // 1. Email checks
    if (!trimmedEmail) {
      setEmailError('Please enter your email.');
      hasError = true;
    } else if (!trimmedEmail.toLowerCase().endsWith('@gmail.com')) {
      setEmailError('Email address must end with "@gmail.com".');
      hasError = true;
    }

    // 2. Password checks
    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else {
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        hasError = true;
      } else if (!/[0-9]/.test(password)) {
        setPasswordError('Password must contain at least one number.');
        hasError = true;
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        setPasswordError('Password must contain at least one special character.');
        hasError = true;
      }
    }

    // 3. Confirm Password check (Sign Up only)
    if (isSignUp) {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password.');
        hasError = true;
      } else if (confirmPassword !== password) {
        setConfirmPasswordError('Passwords do not match.');
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    if (isSignUp) {
      // --- Firebase Email/Password SIGN UP Flow ---
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(trimmedEmail, password);
        
        // Update the Firebase Auth user profile with the display name
        await userCredential.user.updateProfile({
          displayName: trimmedName,
        });

        // Store user in Cloud Firestore as a new user (isNewUser = true)
        // Pass displayName manually since updateProfile may not reflect immediately
        await saveUserToFirestore({ ...userCredential.user, displayName: trimmedName }, true);

        // Reset all fields for security and clean UI
        setName('');
        setPassword('');
        setConfirmPassword('');
        
        // Switch view back to Login Screen
        setIsSignUp(false);

        Alert.alert(
          'Success', 
          'Account created successfully! Please log in with your new credentials.'
        );
      } catch (error: any) {
        console.log('Firebase Sign-Up Error:', error);
        if (error.code === 'auth/email-already-in-use') {
          setEmailError('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          setEmailError('That email address is invalid!');
        } else if (error.code === 'auth/weak-password') {
          setPasswordError('The password is too weak.');
        } else {
          Alert.alert(
            'Sign Up Failed',
            error.message || 'An error occurred during account registration.'
          );
        }
      }
    } else {
      // --- Firebase Email/Password LOGIN Flow ---
      try {
        const userCredential = await auth().signInWithEmailAndPassword(trimmedEmail, password);
        
        // Store or update user details in Cloud Firestore
        await saveUserToFirestore(userCredential.user);

        onLoginSuccess(userCredential.user);
      } catch (error: any) {
        console.log('Firebase Sign-In failed:', error);
        
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          setPasswordError('Invalid email or password.');
        } else {
          // Fall back to showing an Alert with Demo Mode choice only for configuration/network issues
          Alert.alert(
            'Authentication Error',
            error.message || 'An error occurred during sign in.',
            [
              { text: 'Login in Demo Mode', onPress: () => onLoginSuccess({ email: trimmedEmail }) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    }
  };

  // Color interpolations for smooth animations
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

  const dividerLineColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#2A224E'],
  });

  return (
    <Animated.View style={[styles.loginSafeArea, { backgroundColor: containerBgColor }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? "#0B0813" : "#F8FAFC"} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.loginContainer, { backgroundColor: containerBgColor }]}>
            
            {/* Absolute Theme Toggle in top-right */}
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.themeToggleFloatingBtn,
                { backgroundColor: isDarkMode ? '#141026' : '#FFFFFF', borderColor: isDarkMode ? '#2A224E' : '#E2E8F0' },
                pressed && { transform: [{ scale: 0.9 }] }
              ]}
            >
              <Text style={styles.themeToggleFloatingIcon}>
                {isDarkMode ? '☀️' : '🌙'}
              </Text>
            </Pressable>

            <Animated.View style={[styles.loginCard, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
              <Text style={styles.loginHeader}>{isSignUp ? 'SIGN UP' : 'LOGIN'}</Text>

              {/* Name Input (Sign Up Only) */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Name</Animated.Text>
                  <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: nameError ? '#EF4444' : inputBorderColor }]}>
                    <Text style={styles.fieldIcon}>👤</Text>
                    <TextInput
                      style={[styles.inputWithIcon, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                      placeholder="Enter your full name"
                      placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setNameError('');
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </Animated.View>
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Email</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: emailError ? '#EF4444' : inputBorderColor }]}>
                  <Text style={styles.fieldIcon}>✉</Text>
                  <TextInput
                    style={[styles.inputWithIcon, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                    placeholder="Enter your email"
                    placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Animated.View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Password</Animated.Text>
                <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: passwordError ? '#EF4444' : inputBorderColor }]}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={[styles.inputWithIcon, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                    placeholder="Enter your password"
                    placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Text style={[styles.eyeIcon, { color: isPasswordVisible ? '#8B5CF6' : (isDarkMode ? '#64748B' : '#94A3B8') }]}>
                      👁️
                    </Text>
                  </Pressable>
                </Animated.View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input (Sign Up Only) */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Animated.Text style={[styles.inputLabel, { color: labelTextColor }]}>Confirm Password</Animated.Text>
                  <Animated.View style={[styles.inputWrapper, { backgroundColor: inputBgColor, borderColor: confirmPasswordError ? '#EF4444' : inputBorderColor }]}>
                    <Text style={styles.fieldIcon}>🔒</Text>
                    <TextInput
                      style={[styles.inputWithIcon, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                      placeholder="Re-enter your password"
                      placeholderTextColor={isDarkMode ? '#5B647A' : '#94A3B8'}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setConfirmPasswordError('');
                      }}
                      secureTextEntry={!isConfirmPasswordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      <Text style={[styles.eyeIcon, { color: isConfirmPasswordVisible ? '#8B5CF6' : (isDarkMode ? '#64748B' : '#94A3B8') }]}>
                        👁️
                      </Text>
                    </Pressable>
                  </Animated.View>
                  {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
                onPress={handleAuthentication}
              >
                <Text style={styles.loginButtonText}>{isSignUp ? 'SIGN UP' : 'LOGIN'}</Text>
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <Animated.View style={[styles.dividerLine, { backgroundColor: dividerLineColor }]} />
                <Text style={styles.dividerText}>OR</Text>
                <Animated.View style={[styles.dividerLine, { backgroundColor: dividerLineColor }]} />
              </View>

              {/* Google Sign-in Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  { borderColor: isDarkMode ? '#2A224E' : '#E2E8F0', borderWidth: isDarkMode ? 0 : 1 },
                  pressed && styles.googleButtonPressed,
                ]}
                onPress={handleGoogleSignIn}
              >
                <Text style={styles.googleIconText}>G</Text>
                <Text style={styles.googleButtonText}>SIGN IN WITH GOOGLE</Text>
              </Pressable>

              {/* Switch View Toggle Text */}
              <Pressable
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setEmailError('');
                  setPasswordError('');
                  setConfirmPasswordError('');
                }}
                style={styles.toggleTextContainer}
              >
                <Text style={[styles.toggleText, { color: isDarkMode ? '#64748B' : '#475569' }]}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleTextLink}>
                    {isSignUp ? 'Login' : 'Sign Up'}
                  </Text>
                </Text>
              </Pressable>

            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loginSafeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  themeToggleFloatingBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  themeToggleFloatingIcon: {
    fontSize: 20,
    lineHeight: 22,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1.5,
  },
  loginHeader: {
    color: '#8B5CF6', // Vibrant purple accent
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
    borderColor: '#EF4444', // Elegant red-500 outline for erroneous inputs
  },
  fieldIcon: {
    fontSize: 18,
    color: '#8B5CF6',
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#EF4444', // Vibrant warning red
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#7C3AED',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#64748B',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Google Button Styles
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  googleButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#F1F5F9',
  },
  googleIconText: {
    color: '#EA4335', // Google Red Accent
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1E293B', // Slate 800
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  // Toggle Switch Styles
  toggleTextContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextLink: {
    color: '#8B5CF6', // Purple 500
    fontWeight: 'bold',
  },
});
