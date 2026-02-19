import { atom, computed } from 'nanostores';
import type { User } from 'firebase/auth';

export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isApproved: boolean;
}

export interface AppConfig {
  defaultModel: string;
  defaultProvider: string;
}

// Core auth atoms
export const authLoading = atom<boolean>(true);
export const firebaseUser = atom<User | null>(null);
export const appUser = atom<AppUser | null>(null);
export const appConfig = atom<AppConfig>({
  defaultModel: '',
  defaultProvider: '',
});

// Computed stores
export const isAuthenticated = computed(firebaseUser, (user) => user !== null);
export const isAdmin = computed(appUser, (user) => user?.role === 'admin');
export const isApproved = computed(appUser, (user) => user?.isApproved === true);

// Auth state initialization
let authInitialized = false;

export async function initializeAuthListener() {
  if (authInitialized || typeof window === 'undefined') {
    return;
  }

  authInitialized = true;

  const { onAuthStateChanged } = await import('firebase/auth');
  const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
  const { getFirebaseAuth, getFirebaseFirestore } = await import('~/lib/firebase/firebase');

  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();

  onAuthStateChanged(auth, async (user) => {
    firebaseUser.set(user);

    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          appUser.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: data.role || 'user',
            isApproved: data.isApproved || false,
          });

          // Update last login
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        } else {
          /*
           * New user - create document
           * Auto-approve and set as admin for mo.feich@gmail.com
           */
          const isFirstAdmin = user.email === 'mo.feich@gmail.com';

          const newUserData = {
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            role: isFirstAdmin ? 'admin' : 'user',
            isApproved: isFirstAdmin,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };

          await setDoc(userDocRef, newUserData);

          appUser.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isFirstAdmin ? 'admin' : 'user',
            isApproved: isFirstAdmin,
          });
        }

        // Load app config
        const configRef = doc(db, 'config', 'app');
        const configDoc = await getDoc(configRef);

        if (configDoc.exists()) {
          const data = configDoc.data();
          appConfig.set({
            defaultModel: data.defaultModel || '',
            defaultProvider: data.defaultProvider || '',
          });
        }
      } catch (error) {
        console.error('Error loading user data from Firestore:', error);
        appUser.set(null);
      }
    } else {
      appUser.set(null);
    }

    authLoading.set(false);
  });
}
