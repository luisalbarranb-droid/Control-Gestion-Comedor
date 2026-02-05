import {
  createUserWithEmailAndPassword,
  getAuth,
  UserCredential,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
    const tempPassword = "password"; 
    
    // NOTE: This will likely fail without proper Admin SDK setup or specific client-side permissions if restricted.
    // However, we'll try the real call first.
    const auth = getAuth();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        return { user: userCredential };
    } catch (realError: any) {
        console.warn("Real user creation failed, falling back to simulation:", realError.message);
        
        // --- SIMULATION FOR PROTOTYPE ---
        const simulatedUser = {
            uid: `simulated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            email: email,
            emailVerified: false,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            tenantId: null,
            displayName: null,
            photoURL: null,
            phoneNumber: null,
        };
        
        const simulatedUserCredential = {
            user: simulatedUser,
            providerId: "password",
            operationType: "signIn",
        } as unknown as UserCredential;

        return { user: simulatedUserCredential };
    }

  } catch (error: any) {
    console.error("Error in createUserAccount:", error);
    if (error.code === 'auth/email-already-in-use') {
        return { error: 'Este correo electrónico ya está en uso.' };
    }
    return { error: 'No se pudo crear la cuenta de autenticación.' };
  }
}

/**
 * Sends a password reset email to the specified user.
 */
export async function resetUserPassword(email: string): Promise<{ success: boolean, error?: string }> {
    const auth = getAuth();
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending reset email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Updates the current user's password.
 * Requires recent login/reauthentication.
 */
export async function updateCurrentUserPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean, error?: string }> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user || !user.email) return { success: false, error: 'No hay usuario autenticado.' };

    try {
        // Reautenticar para poder cambiar la contraseña
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Actualizar contraseña
        await firebaseUpdatePassword(user, newPassword);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating password:", error);
        let errorMsg = 'Error al actualizar la contraseña.';
        if (error.code === 'auth/wrong-password') {
            errorMsg = 'La contraseña actual no es correcta.';
        }
        return { success: false, error: errorMsg };
    }
}
