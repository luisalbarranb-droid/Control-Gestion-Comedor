
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { FirebaseProvider } from '@/firebase';

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
          <div className="min-h-screen w-full bg-background flex">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-white sm:flex">
              <div className="p-4 justify-center flex items-center gap-2 border-b h-16">
                <SquareCheck className="size-8 text-primary" />
                <h1 className="font-headline text-2xl font-bold">Comedor</h1>
              </div>
              <MainNav />
            </aside>
            <div className="flex flex-col flex-1 sm:pl-64">
              <Header />
              <main className="flex-1 p-4 sm:p-6 md:p-8">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
          <FirebaseErrorListener />
        </FirebaseProvider>
      </body>
    </html>
  );
}

