// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SmartAuthProvider } from '@/providers/SmartAuthProvider';
import { MainNav } from '@/components/dashboard/main-nav';
import { Header } from '@/components/dashboard/header';


export const metadata: Metadata = {
  title: 'Sistema Comedor - Gestión Inteligente',
  description: 'Sistema de gestión para comedor industrial',
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
        <SmartAuthProvider>
          <SidebarProvider>
            <div className="min-h-screen w-full">
                <div className="flex">
                  <Sidebar>
                     <MainNav />
                  </Sidebar>
                  <SidebarInset>
                      <Header />
                      {children}
                  </SidebarInset>
                </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </SmartAuthProvider>
      </body>
    </html>
  );
}
