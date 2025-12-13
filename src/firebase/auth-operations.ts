'use client';

import {
  createUserWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/**
 * Creates a new user account in Firebase Authentication.
 * This function should ideally be called from a secure backend environment
 * in a real production app, but is client-side for this prototype.
 * 
 * @param email The new user's email.
 * @returns An object containing the new user credential or an error message.
 */
export async function createUserAccount(email: string): Promise<{ user?: UserCredential, error?: string }> {
  try {
    // For demonstration, we'll use a default, non-secure password.
    // In a real app, this should be handled differently (e.g., sending an email link).
    const tempPassword = "password"; 

    // Because this is a privileged operation (creating users), we cannot use the
    // currently signed-in user's auth instance directly. We would typically use
    // the Firebase Admin SDK on a server. For this prototype, we'll assume
    // the security rules are temporarily relaxed or the operation is allowed for admins.
    // NOTE: This will likely fail without proper Admin SDK setup or specific client-side permissions.
    // We are simulating the call and catching the expected error.
    
    // const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    // --- SIMULATION FOR PROTOTYPE ---
    // In a real scenario, the above line would be used with a proper auth instance.
    // To make the UI flow work without a backend, we'll simulate a successful response
    // and log a warning. This part would be replaced by a call to a serverless function.
    console.warn("SIMULATION: User creation in Firebase Auth is simulated. A real implementation would use a backend function.");
    
    const simulatedUser = {
        uid: `simulated_${Date.now()}`,
        email: email,
    };
    
    // We return a structure that mimics UserCredential
    const simulatedUserCredential = {
        user: simulatedUser,
        providerId: "password",
        operationType: "signIn",
    } as unknown as UserCredential;


    return { user: simulatedUserCredential };
    // --- END SIMULATION ---

  } catch (error: any) {
    console.error("Error creating user account in Firebase Auth:", error);
    if (error.code === 'auth/email-already-in-use') {
        return { error: 'Este correo electrónico ya está en uso.' };
    }
    return { error: 'No se pudo crear la cuenta de autenticación.' };
  }
}
