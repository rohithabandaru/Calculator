import firestore from '@react-native-firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  themePreference?: 'light' | 'dark';
  createdAt?: any;
  lastLogin?: any;
  lastUpdated?: any;
}

/**
 * Saves or updates standard user details in the Firestore 'users' collection on signup or login.
 */
export const saveUserToFirestore = async (user: any, isNewUser: boolean = false): Promise<void> => {
  if (!user || !user.uid) return;

  const userData: Partial<UserData> = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    lastLogin: firestore.FieldValue.serverTimestamp(),
  };

  if (isNewUser) {
    userData.createdAt = firestore.FieldValue.serverTimestamp();
  }

  await firestore().collection('users').doc(user.uid).set(userData, { merge: true });
};

/**
 * Updates user profile details (displayName, photoURL) in the Firestore document.
 */
export const updateUserProfile = async (uid: string, displayName: string, photoURL: string): Promise<void> => {
  await firestore()
    .collection('users')
    .doc(uid)
    .set(
      {
        displayName: displayName.trim(),
        photoURL: photoURL,
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
};

/**
 * Saves a user's theme preference ('light' or 'dark') in the Firestore document.
 */
export const saveThemePreference = async (uid: string, isDarkMode: boolean): Promise<void> => {
  const themePreference = isDarkMode ? 'dark' : 'light';
  await firestore()
    .collection('users')
    .doc(uid)
    .set({ themePreference }, { merge: true });
};

/**
 * Subscribes to changes in a user's Firestore document in real-time.
 * Returns an unsubscribe function.
 */
export const subscribeToUserDoc = (
  uid: string,
  onUpdate: (data: UserData) => void,
  onError?: (error: Error) => void
) => {
  return firestore()
    .collection('users')
    .doc(uid)
    .onSnapshot(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          const data = documentSnapshot.data() as UserData;
          if (data) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        if (onError) {
          onError(error);
        } else {
          console.log('Error listening to user doc:', error);
        }
      }
    );
};
