// In a real app, this hook would use context or a state manager
// to get the current user's role from your authentication system.
// For now, we'll simulate it based on the mock data.
import { users } from "@/lib/placeholder-data";
import { Role } from "@/lib/types";

// Simulate getting the current logged-in user.
// We'll just grab the first 'superadmin' user for this example.
const currentUser = users.find(u => u.rol === 'superadmin');

export function useUserRole(): { role: Role | null } {
    // In a real scenario, you might have loading states, etc.
    return { role: currentUser?.rol || null };
}
