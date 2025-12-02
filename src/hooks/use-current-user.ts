'use client';
// In a real app, this hook would use context or a state manager
// to get the current user's role from your authentication system.
// For now, we'll simulate it based on the mock data.
import { users } from "@/lib/placeholder-data";
import type { User, Role } from "@/lib/types";

// Simulate getting the current logged-in user.
// We'll just grab the first 'superadmin' user for this example.
const currentUser = users.find(u => u.rol === 'superadmin');

interface CurrentUser {
    user: User | null;
    role: Role | null;
}

export function useCurrentUser(): CurrentUser {
    // In a real scenario, you might have loading states, etc.
    return { 
        user: currentUser || null,
        role: currentUser?.rol || 'comun' 
    };
}
