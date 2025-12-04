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
    email: 'superadmin@comedor.com',
    name: 'Super Administrador',
    role: 'superadmin',
    department: 'Administración',
    position: 'Director',
    phone: '+1234567890',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['all']
  },
  'local-superadmin': {
    id: 'local-superadmin',
    email: 'admin@localhost.com',
    name: 'Admin Local',
    role: 'superadmin',
    department: 'IT',
    position: 'SysAdmin',
    phone: '+1234567891',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ['all']
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
      
      console.log(`🔧 Inicializando en entorno: ${config.isStudio ? 'Firebase Studio' : 'Local'}`);
      
      if (config.firebase.useMockAuth) {
        // MODO STUDIO: Usar mock
        console.log('🎭 Usando autenticación simulada para Firebase Studio');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga
        
        const mockUser = MOCK_USERS[config.firebase.mockUser.uid];
        setUser(mockUser);
        
        // Si estamos en Studio, intentar ocultar su botón de login
        if (config.isStudio && typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              const style = document.createElement('style');
              style.textContent = `
                [data-firebase-studio-login],
                button:contains("Iniciar Sesión"),
                button:contains("Login"),
                button:contains("Sign In") {
                  opacity: 0 !important;
                  pointer-events: none !important;
                  height: 0 !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: hidden !important;
                }
                
                /* Resaltar nuestro módulo */
                a[href="/users"] {
                  animation: pulse 2s infinite !important;
                  border: 2px solid #3b82f6 !important;
                }
                
                @keyframes pulse {
                  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
              `;
              document.head.appendChild(style);
            } catch (error) {
              console.warn('No se pudo ocultar botón de Studio:', error);
            }
          }, 1000);
        }
      } else {
        // MODO LOCAL: Conectar con Firebase real
        console.log('🔥 Conectando con Firebase real');
        // Aquí iría tu conexión real a Firebase
        // Por ahora usamos mock para desarrollo local también
        const mockUser = MOCK_USERS['local-superadmin'];
        setUser(mockUser);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [config]);

  // Funciones de autenticación
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    if (config.firebase.useMockAuth) {
      // Login mock para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = MOCK_USERS[config.firebase.mockUser.uid];
      setUser(mockUser);
      
      console.log(`✅ Login simulado: ${email}`);
    } else {
      // Login real con Firebase
      // await signInWithEmailAndPassword(auth, email, password);
      console.log('🔐 Login real (simulado)');
    }
    
    setIsLoading(false);
  };

  const logout = async () => {
    if (config.firebase.useMockAuth) {
      setUser(null);
      console.log('🚪 Logout simulado');
    } else {
      // await auth.signOut();
      console.log('🚪 Logout real (simulado)');
    }
  };

  const refreshUser = async () => {
    // Simular refresh
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
    }
  };

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
      {/* Badge de entorno */}
      {config.isStudio && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Firebase Studio</span>
            <span className="text-xs bg-yellow-200 px-2 py-1 rounded">Dev Mode</span>
          </div>
        </div>
      )}
      
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
