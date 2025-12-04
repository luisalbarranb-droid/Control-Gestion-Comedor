
// src/providers/SmartAuthProvider.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { currentEnv, Environment } from '@/lib/environment';
import type { User } from '@/lib/types';

// Tipos
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  environment: typeof currentEnv;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuario mock para desarrollo
const MOCK_USERS: Record<string, User> = {
  'studio-superadmin': {
    id: 'studio-superadmin',
    name: 'Super Administrador (Studio)',
    email: 'superadmin@comedor.com',
    role: 'superadmin',
    avatarUrl: 'https://i.pravatar.cc/150?u=studio-superadmin',
  },
  'local-superadmin': {
    id: 'local-superadmin',
    email: 'admin@localhost.com',
    name: 'Admin Local',
    role: 'superadmin',
    avatarUrl: 'https://i.pravatar.cc/150?u=local-superadmin',
  }
};

export function SmartAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const config = currentEnv;

  // Inicializar autenticación según entorno
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      console.log(`[SmartAuth] 🔧 Inicializando en entorno: ${config.isStudio ? 'Firebase Studio' : 'Local'}`);
      
      if (config.firebase.useMockAuth) {
        // MODO STUDIO o LOCAL FORZADO: Usar mock
        console.log('[SmartAuth] 🎭 Usando autenticación simulada.');
        await new Promise(resolve => setTimeout(resolve, 250)); // Simular carga
        
        const mockUser = MOCK_USERS[config.firebase.mockUser.uid];
        setUser(mockUser);

      } else {
        // MODO REAL: Conectar con Firebase
        console.log('[SmartAuth] 🔥 Conectando con Firebase real (NO IMPLEMENTADO EN ESTA FASE).');
        // En una fase posterior, aquí iría la lógica de `onAuthStateChanged` de Firebase.
        // Por ahora, para evitar errores, no hacemos nada y el usuario queda como `null`.
        setUser(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [config]);

  // Funciones de autenticación
  const login = async (email: string, password: string) => {
    // No implementado en esta fase
    console.log(`[SmartAuth] Intento de login con ${email}. No implementado.`);
  };

  const logout = async () => {
    if (config.firebase.useMockAuth) {
      // En modo simulado, no hacemos nada para mantener la sesión persistente.
      console.log('[SmartAuth] 🚪 Logout solicitado en modo simulado. No se cerrará la sesión para mantener la estabilidad del entorno.');
    } else {
      console.log('[SmartAuth] 🚪 Logout real (no implementado).');
    }
  };

  const refreshUser = async () => {
    // Función para futuras actualizaciones
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Cargando sistema de autenticación...</p>
      </div>
    )
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    environment: config
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar la autenticación
export const useSmartAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSmartAuth debe usarse dentro de SmartAuthProvider');
  }
  return context;
};
