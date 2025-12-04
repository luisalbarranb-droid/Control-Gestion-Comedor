
'use client';

// OVERRIDE COMPLETO - Deshabilitar Firebase Studio Auth
if (typeof window !== 'undefined') {
  // 1. Anular la autenticación de Firebase Studio
  const originalFirebaseAuth = (window as any).firebaseAuth;
  if (originalFirebaseAuth) {
    console.log('🚫 Deshabilitando Firebase Studio Auth...');
    (window as any).firebaseAuth = {
      ...originalFirebaseAuth,
      onAuthStateChanged: (callback: any) => {
        // Simular usuario autenticado inmediatamente
        const mockUser = {
          uid: 'studio-override-uid',
          email: 'admin@comedor.com',
          displayName: 'Administrador',
          emailVerified: true
        };
        
        // Llamar callback inmediatamente con usuario mock
        setTimeout(() => callback(mockUser), 100);
        
        // Retornar función unsubscribe vacía
        return () => {};
      },
      currentUser: {
        uid: 'studio-override-uid',
        email: 'admin@comedor.com',
        displayName: 'Administrador',
        emailVerified: true
      }
    };
  }
  
  // 2. Inyectar CSS para ocultar elementos de login
  const style = document.createElement('style');
  style.textContent = `
    /* Ocultar cualquier botón de login */
    button:contains("Iniciar Sesión"),
    button:contains("Login"),
    button:contains("Sign In"),
    a:contains("Iniciar Sesión"),
    a:contains("Login"),
    a:contains("Sign In"),
    [data-testid*="login"],
    [data-testid*="signin"],
    [href*="login"],
    [href*="signin"] {
      display: none !important;
    }
    
    /* Resaltar módulo de usuarios */
    a[href="/users"] {
      background-color: #3b82f6 !important;
      color: white !important;
      font-weight: bold !important;
      border: 2px solid #1d4ed8 !important;
    }
    
    /* Estilo para desarrollo */
    .dev-badge {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #10b981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
  
  // 3. Agregar badge de desarrollo
  if (!document.querySelector('.dev-badge')) {
    const devBadge = document.createElement('div');
    devBadge.className = 'dev-badge';
    devBadge.textContent = '🔥 MODO DESARROLLO - Auth deshabilitado';
    document.body.appendChild(devBadge);
  }
}
