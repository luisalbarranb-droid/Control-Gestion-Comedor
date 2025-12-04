// src/lib/environment.ts
'use client';

/**
 * DETECCIÓN INTELIGENTE DE ENTORNO
 * Determina automáticamente si estamos en Firebase Studio o desarrollo local
 */
export const Environment = {
  // Detectar Firebase Studio
  isFirebaseStudio: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const url = window.location.href;
    return (
      url.includes('firebase-studio') ||
      url.includes('firebaseapp.com') ||
      /web-[a-z0-9]+\.web\.app/.test(url) ||
      document.cookie.includes('firebase-studio')
    );
  },
  
  // Detectar desarrollo local
  isLocalDevelopment: (): boolean => {
    return process.env.NODE_ENV === 'development' && 
           !Environment.isFirebaseStudio();
  },
  
  // Detectar producción
  isProduction: (): boolean => {
    return process.env.NODE_ENV === 'production' && 
           !Environment.isFirebaseStudio();
  },
  
  // Obtener configuración según entorno
  getConfig: () => {
    const isStudio = Environment.isFirebaseStudio();
    
    return {
      isStudio,
      isLocal: Environment.isLocalDevelopment(),
      isProd: Environment.isProduction(),
      
      // Configuración de Firebase
      firebase: {
        // En Studio, usamos autenticación simulada
        // En local, usamos Firebase real
        useMockAuth: isStudio,
        mockUser: {
          uid: isStudio ? 'studio-superadmin' : 'local-superadmin',
          email: isStudio ? 'admin@firebase-studio.com' : 'admin@localhost.com',
          name: 'Super Administrador',
          role: 'superadmin' as const
        }
      },
      
      // Features habilitadas
      features: {
        userManagement: true,
        tasks: true,
        attendance: true,
        overrideAuth: isStudio // Sobreescribir auth en Studio
      }
    };
  }
};

// Exportar configuración actual
export const currentEnv = Environment.getConfig();
