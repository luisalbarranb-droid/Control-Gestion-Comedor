
'use client';
import {
  Auth, 
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, // Renombrado
} from 'firebase/auth';


export async function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  try {
    await firebaseSignInAnonymously(authInstance);
  } catch (error) {
    console.error("Anonymous sign-in failed:", error);
    throw error;
  }
}

export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

// Esta función ya no es necesaria con el nuevo enfoque de login, pero la dejamos por si se usa en otro lado.
/** @deprecated Use signInWithEmailAndPassword directly from 'firebase/auth' */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  firebaseSignInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      // Los errores ahora se manejan en el componente que llama
      console.error("Sign-in attempt failed, handled by component:", error.code);
    });
}
