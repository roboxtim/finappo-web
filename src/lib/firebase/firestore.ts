'use client';

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { UserCategory, Transaction } from '../types/models';

// Categories Collection
export const subscribeToCategories = (
  userId: string,
  callback: (categories: UserCategory[]) => void
) => {
  const q = query(
    collection(db, 'categories'),
    where('userId', '==', userId),
    orderBy('order', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserCategory[];
    callback(categories);
  });
};

export const addCategory = async (userId: string, category: Partial<UserCategory>) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateCategory = async (categoryId: string, updates: Partial<UserCategory>) => {
  try {
    await updateDoc(doc(db, 'categories', categoryId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Transactions Collection
export const subscribeToTransactions = (
  userId: string,
  startDate: Date,
  endDate: Date,
  callback: (transactions: Transaction[]) => void
) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    callback(transactions);
  });
};

export const addTransaction = async (userId: string, transaction: Partial<Transaction>) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    await updateDoc(doc(db, 'transactions', transactionId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
