'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore } from '@/firebase'; // Import the initialized instances

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Provides the initialized Firebase services to the FirebaseProvider.
 * This component ensures that Firebase is initialized once and passed down.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {

  if (!firebaseApp || !auth || !firestore) {
    // This can happen if initialization somehow fails.
    return <div>Loading Firebase...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
