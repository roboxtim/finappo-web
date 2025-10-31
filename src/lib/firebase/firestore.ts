'use client';

import type { UserCategory, Transaction } from '../types/models';

// Categories Collection
export const subscribeToCategories = (
  userId: string,
  callback: (categories: UserCategory[]) => void
) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;

  // Dynamic import to prevent Firebase from loading during SSR
  import('firebase/firestore').then(({ collection, query, where, orderBy, onSnapshot }) => {
    import('./config').then(({ getFirebaseDb }) => {
      getFirebaseDb().then((db) => {
        if (!db) {
          return;
        }

        const q = query(
          collection(db, 'categories'),
          where('userId', '==', userId),
          orderBy('order', 'asc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const categories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserCategory[];
          callback(categories);
        });
      });
    });
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};

export const addCategory = async (userId: string, category: Partial<UserCategory>) => {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { id: null, error: 'Firebase not initialized' };
    }

    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred adding category';
    return { id: null, error: message };
  }
};

export const updateCategory = async (categoryId: string, updates: Partial<UserCategory>) => {
  try {
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { error: 'Firebase not initialized' };
    }

    await updateDoc(doc(db, 'categories', categoryId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred updating category';
    return { error: message };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { error: 'Firebase not initialized' };
    }

    await deleteDoc(doc(db, 'categories', categoryId));
    return { error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred deleting category';
    return { error: message };
  }
};

// Transactions Collection
export const subscribeToTransactions = (
  userId: string,
  startDate: Date,
  endDate: Date,
  callback: (transactions: Transaction[]) => void
) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;

  // Dynamic import to prevent Firebase from loading during SSR
  import('firebase/firestore').then(({ collection, query, where, orderBy, onSnapshot, Timestamp }) => {
    import('./config').then(({ getFirebaseDb }) => {
      getFirebaseDb().then((db) => {
        if (!db) {
          return;
        }

        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', userId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const transactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[];
          callback(transactions);
        });
      });
    });
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};

export const addTransaction = async (userId: string, transaction: Partial<Transaction>) => {
  try {
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { id: null, error: 'Firebase not initialized' };
    }

    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred adding transaction';
    return { id: null, error: message };
  }
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { error: 'Firebase not initialized' };
    }

    await updateDoc(doc(db, 'transactions', transactionId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred updating transaction';
    return { error: message };
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./config');

    const db = await getFirebaseDb();
    if (!db) {
      return { error: 'Firebase not initialized' };
    }

    await deleteDoc(doc(db, 'transactions', transactionId));
    return { error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred deleting transaction';
    return { error: message };
  }
};
