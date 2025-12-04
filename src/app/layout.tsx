
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider'; // Cambiado
import { firebaseApp, auth, firestore } from '@/firebase'; // Añadido

export const metadata: Metadata = {
  title: 'Comedor Control',
  description: 'Sistema Avanzado de Gestión de Tareas',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider
            firebaseApp={firebaseApp}
            auth={auth}
            firestore={firestore}
        >
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
