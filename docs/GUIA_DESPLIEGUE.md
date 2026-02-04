# 🚀 Guía de Despliegue - Control Comedor Full

## ✅ Estado Actual

- ✅ **Firebase Project**: `studio-9056270070-cf8b2`
- ✅ **Firestore Rules**: Desplegadas correctamente
- ✅ **Firebase App Hosting**: Configurado (`apphosting.yaml`)
- ✅ **GitHub**: Repositorio conectado
- ✅ **Código**: Actualizado con módulo de contratos

---

## 📋 Opciones de Despliegue

### Opción 1: Firebase App Hosting (Recomendado) 🌟

Firebase App Hosting despliega automáticamente desde tu repositorio de GitHub.

#### Pasos:

1. **Ir a Firebase Console**
   ```
   https://console.firebase.google.com/project/studio-9056270070-cf8b2
   ```

2. **Navegar a App Hosting**
   - En el menú lateral, busca "App Hosting"
   - O ve directamente a: Build → App Hosting

3. **Conectar con GitHub** (si no está conectado)
   - Haz clic en "Get Started" o "Add Backend"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio: `luisalbarranb-droid/Control-Gestion-Comedor`
   - Selecciona la rama: `main`

4. **Configurar el Backend**
   - Firebase detectará automáticamente tu `apphosting.yaml`
   - Configuración detectada:
     - Framework: Next.js
     - Build command: `npm run build`
     - Max instances: 1

5. **Desplegar**
   - Haz clic en "Deploy"
   - Firebase construirá y desplegará tu aplicación
   - Tiempo estimado: 5-10 minutos

6. **Obtener URL**
   - Una vez completado, obtendrás una URL como:
   - `https://studio-9056270070-cf8b2--[backend-id].web.app`

#### Ventajas:
- ✅ Despliegue automático en cada push a GitHub
- ✅ SSL/HTTPS automático
- ✅ CDN global
- ✅ Rollback fácil a versiones anteriores
- ✅ Preview deployments para PRs

---

### Opción 2: Build Local + Firebase Hosting

Si prefieres hacer el build localmente:

#### Pasos:

1. **Construir la aplicación**
   ```bash
   npm run build
   ```

2. **Exportar para hosting estático** (si es necesario)
   
   Primero, actualiza `next.config.js` para agregar export:
   ```javascript
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   ```

   Luego ejecuta:
   ```bash
   npm run build
   ```

3. **Desplegar a Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

**Nota**: Esta opción puede tener limitaciones con algunas características de Next.js como API routes y SSR.

---

### Opción 3: Vercel (Alternativa)

Si prefieres Vercel para Next.js:

1. **Ir a Vercel**
   ```
   https://vercel.com
   ```

2. **Importar proyecto desde GitHub**
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio
   - Vercel detectará Next.js automáticamente

3. **Configurar variables de entorno**
   - Agrega tus variables de Firebase
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - etc.

4. **Desplegar**
   - Haz clic en "Deploy"
   - Obtendrás una URL como: `https://control-comedor.vercel.app`

---

## 🔐 Variables de Entorno

Asegúrate de configurar estas variables en tu plataforma de despliegue:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9056270070-cf8b2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Ubicación del archivo**: Revisa `src/firebase/config.ts` para ver las variables actuales.

---

## ✅ Checklist Pre-Despliegue

Antes de desplegar, verifica:

- [x] ✅ Firestore Rules actualizadas y desplegadas
- [x] ✅ Código subido a GitHub
- [ ] ⚠️ Variables de entorno configuradas
- [ ] ⚠️ Firebase Authentication habilitado
- [ ] ⚠️ Usuarios de prueba creados
- [ ] ⚠️ Datos de prueba en Firestore (opcional)

---

## 🧪 Probar el Despliegue

Una vez desplegado:

1. **Acceder a la URL de producción**
2. **Probar login** con usuarios autorizados:
   - `arvecladu@gmail.com`
   - `luisalbarranb@gmail.com`

3. **Verificar módulos**:
   - ✅ Dashboard
   - ✅ Tareas
   - ✅ Menús
   - ✅ Inventario
   - ✅ RRHH / Asistencia
   - ✅ **Gestión de Contratos** (nuevo)

4. **Probar funcionalidad de contratos**:
   - Subir plantilla de ejemplo
   - Generar contrato de prueba
   - Descargar contrato

---

## 🔄 Actualizar el Despliegue

### Con Firebase App Hosting:
```bash
# 1. Hacer cambios en el código
# 2. Commit y push a GitHub
git add .
git commit -m "feat: nuevas funcionalidades"
git push origin main

# 3. Firebase desplegará automáticamente
```

### Con Firebase Hosting manual:
```bash
npm run build
firebase deploy --only hosting
```

---

## 📊 Monitoreo Post-Despliegue

### Firebase Console
- **Performance**: Monitorea tiempos de carga
- **Crashlytics**: Detecta errores en producción
- **Analytics**: Rastrea uso de la aplicación

### Logs
```bash
# Ver logs de App Hosting
firebase apphosting:backends:logs [backend-id]
```

---

## 🆘 Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que las variables de entorno estén configuradas
- Revisa `src/firebase/config.ts`

### Error: "Permission denied"
- Verifica que las Firestore Rules estén desplegadas
- Confirma que el usuario tenga los permisos correctos

### Error de Build
- Ejecuta `npm run build` localmente para detectar errores
- Revisa los logs de despliegue en Firebase Console

### Página en blanco
- Revisa la consola del navegador (F12)
- Verifica que todas las rutas estén correctamente configuradas

---

## 📞 Recursos

- **Firebase Console**: https://console.firebase.google.com/project/studio-9056270070-cf8b2
- **GitHub Repo**: https://github.com/luisalbarranb-droid/Control-Gestion-Comedor
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase App Hosting**: https://firebase.google.com/docs/app-hosting

---

## 🎯 Próximos Pasos Recomendados

1. **Configurar dominio personalizado** (opcional)
   - En Firebase Hosting → Add custom domain
   - Ej: `comedor.tuempresa.com`

2. **Configurar CI/CD avanzado**
   - GitHub Actions para tests automáticos
   - Preview deployments para PRs

3. **Monitoreo y Alertas**
   - Configurar alertas de errores
   - Monitoreo de performance

4. **Backup automático**
   - Configurar exports automáticos de Firestore
   - Backup de datos críticos

---

**Última actualización**: Febrero 2026
**Versión de la app**: 1.1.0 (con módulo de contratos)
