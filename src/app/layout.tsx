import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SquareCheck } from 'lucide-react';
import { FirebaseProvider } from '@/firebase/provider';


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
        <FirebaseProvider>
          <SidebarProvider>
            <div className="min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="p-4 justify-center flex items-center gap-2">
                    <SquareCheck className="size-8 text-primary" />
                    <h1 className="font-headline text-2xl font-bold">Comedor</h1>
                    </SidebarHeader>
                    <SidebarContent>
                    <MainNav />
                    </SidebarContent>
                </Sidebar>
                <SidebarInset>
                    <Header />
                    {children}
                </SidebarInset>
            </div>
            <Toaster />
          </SidebarProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
