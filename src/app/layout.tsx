// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SmartAuthProvider } from '@/providers/SmartAuthProvider';
import { MainNav } from '@/components/dashboard/main-nav';
import { Environment } from '@/lib/environment';


export const metadata: Metadata = {
  title: 'Sistema Comedor - Gestión Inteligente',
  description: 'Sistema de gestión para comedor industrial',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isStudio = Environment.isFirebaseStudio();
  
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
        <SmartAuthProvider>
            <div className="min-h-screen w-full">
              <SidebarProvider>
                <div className="flex">
                  <Sidebar>
                     <MainNav />
                  </Sidebar>
                  <SidebarInset>
                      {children}
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </div>
          <Toaster />
        </SmartAuthProvider>
      </body>
    </html>
  );
}
