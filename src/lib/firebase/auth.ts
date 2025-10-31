'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    return { user: null, error: 'Firebase auth not initialized' };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    console.error('Google sign-in error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during Google sign-in';
    return { user: null, error: message };
  }
};

// Apple Sign-In
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export const signInWithApple = async () => {
  if (!auth) {
    return { user: null, error: 'Firebase auth not initialized' };
  }
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    console.error('Apple sign-in error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during Apple sign-in';
    return { user: null, error: message };
  }
};

// Sign Out
export const signOut = async () => {
  if (!auth) {
    return { error: 'Firebase auth not initialized' };
  }
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: unknown) {
    console.error('Sign-out error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred during sign-out';
    return { error: message };
  }
};

// Auth State Listener
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Return a no-op unsubscribe function if auth is not initialized
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
