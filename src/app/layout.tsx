
import type { Metadata } from 'next';
import './globals.css';
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
            <div className="min-h-screen w-full flex">
              <aside className="w-64 border-r fixed inset-y-0 bg-background z-50">
                <MainNav />
              </aside>
              <div className="flex-1 flex flex-col ml-64">
                <Header />
                <main>{children}</main>
              </div>
            </div>
          <Toaster />
        </SmartAuthProvider>
      </body>
    </html>
  );
}
