'use client';

import type { User } from 'firebase/auth';

export const signInWithGoogle = async () => {
  try {
    // Dynamic imports to prevent Firebase from loading during SSR
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('./config');

    const auth = await getFirebaseAuth();
    if (!auth) {
      return { user: null, error: 'Firebase auth not initialized' };
    }

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    console.error('Google sign-in error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during Google sign-in';
    return { user: null, error: message };
  }
};

export const signInWithApple = async () => {
  try {
    // Dynamic imports to prevent Firebase from loading during SSR
    const { signInWithPopup, OAuthProvider } = await import('firebase/auth');
    const { getFirebaseAuth } = await import('./config');

    const auth = await getFirebaseAuth();
    if (!auth) {
      return { user: null, error: 'Firebase auth not initialized' };
    }

    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    console.error('Apple sign-in error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during Apple sign-in';
    return { user: null, error: message };
  }
};

// Sign Out
export const signOut = async () => {
  try {
    const firebaseAuth = await import('firebase/auth');
    const { getFirebaseAuth } = await import('./config');

    const auth = await getFirebaseAuth();
    if (!auth) {
      return { error: 'Firebase auth not initialized' };
    }

    await firebaseAuth.signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    console.error('Sign-out error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during sign-out';
    return { error: message };
  }
};

// Auth State Listener
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // This function needs to be synchronous for useEffect, so we handle it differently
  if (typeof window === 'undefined') {
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;

  // Import dynamically and subscribe
  import('firebase/auth').then(({ onAuthStateChanged }) => {
    import('./config').then(({ getFirebaseAuth }) => {
      getFirebaseAuth().then((auth) => {
        if (auth) {
          unsubscribe = onAuthStateChanged(auth, callback);
        }
      });
    });
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};
