
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
    const isStudioEnv =
      url.includes('firebase-studio') ||
      url.includes('web.app') || // Más genérico para URLs de Firebase Hosting
      url.includes('firebaseapp.com');
      
    // En Studio, forzamos el mock auth. En local, lo leemos del .env
    return isStudioEnv;
  },
  
  // Usar autenticación simulada
  shouldUseMockAuth: (): boolean => {
    const isStudio = Environment.isFirebaseStudio();
    // Forzar mock en Studio. En otros entornos (local), respetar la variable de entorno.
    if (isStudio) return true;
    return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
  },

  // Obtener configuración según entorno
  getConfig: () => {
    const isStudio = Environment.isFirebaseStudio();
    const useMockAuth = Environment.shouldUseMockAuth();
    
    return {
      isStudio,
      
      // Configuración de Firebase
      firebase: {
        useMockAuth: useMockAuth,
        mockUser: {
          uid: isStudio ? 'studio-superadmin' : 'local-superadmin',
          email: isStudio ? 'admin@firebase-studio.com' : 'admin@localhost.com',
          name: 'Super Administrador',
          role: 'superadmin' as const
        }
      },
    };
  }
};

// Exportar configuración actual
export const currentEnv = Environment.getConfig();
