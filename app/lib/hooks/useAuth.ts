import { useStore } from '@nanostores/react';
import { useCallback } from 'react';
import {
  authLoading,
  firebaseUser,
  appUser,
  isAdmin as isAdminStore,
  isApproved as isApprovedStore,
  isAuthenticated as isAuthenticatedStore,
  appConfig,
} from '~/lib/stores/authStore';

export function useAuth() {
  const loading = useStore(authLoading);
  const user = useStore(firebaseUser);
  const profile = useStore(appUser);
  const isAdmin = useStore(isAdminStore);
  const isApproved = useStore(isApprovedStore);
  const isAuthenticated = useStore(isAuthenticatedStore);
  const config = useStore(appConfig);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('~/lib/firebase/firebase');

    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('~/lib/firebase/firebase');

    return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const firebaseAuth = await import('firebase/auth');
    const { getFirebaseAuth } = await import('~/lib/firebase/firebase');
    const googleProvider = new firebaseAuth.GoogleAuthProvider();

    return firebaseAuth.signInWithPopup(getFirebaseAuth(), googleProvider);
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('~/lib/firebase/firebase');

    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(getFirebaseAuth(), email, actionCodeSettings);
    localStorage.setItem('emailForSignIn', email);
  }, []);

  const logout = useCallback(async () => {
    const { signOut } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('~/lib/firebase/firebase');

    return signOut(getFirebaseAuth());
  }, []);

  return {
    loading,
    user,
    profile,
    isAdmin,
    isApproved,
    isAuthenticated,
    config,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    sendMagicLink,
    logout,
  };
}
