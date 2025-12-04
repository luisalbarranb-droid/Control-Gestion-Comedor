'use client';

import { FirebaseProvider } from '@/firebase/provider';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarRoutes = ['/login', '/signup']; // Agrega las rutas que no quieres que tengan sidebar
  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <FirebaseProvider>
      <SidebarProvider>
        {showSidebar ? (
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
        ) : (
          children
        )}
        <FirebaseErrorListener />
      </SidebarProvider>
    </FirebaseProvider>
  );
}
