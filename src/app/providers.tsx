'use client';

import { FirebaseProvider } from '@/firebase';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar-provider';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

import React from 'react';

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const noSidebarRoutes = ['/login', '/signup', '/share'];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  React.useEffect(() => {
    if (!isUserLoading && !user && showSidebar) {
      router.push('/login');
    }
  }, [user, isUserLoading, showSidebar, router]);

  return (
    <SidebarProvider>
      {showSidebar ? (
        user ? (
          <div className="min-h-screen w-full">
            <Sidebar>
              <SidebarHeader className="p-4 justify-center flex items-center gap-2">
                <SquareCheck className="size-8 text-primary" />
                <h1 className="font-headline text-2xl font-bold">Comedor</h1>
              </SidebarHeader>
              <SidebarContent>
                <MainNav />
              </SidebarContent>
              <SidebarFooter className="p-4 border-t bg-muted/20">
                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground leading-tight">
                  <p className="font-semibold">© {new Date().getFullYear()} VELCAR, C.A.</p>
                  <p>Todos los derechos reservados.</p>
                  <p className="mt-1 opacity-70">Diseñado y desarrollado por:</p>
                  <p className="font-medium text-primary/80">Luis E. Albarrán B.</p>
                </div>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <Header />
              {children}
            </SidebarInset>
          </div>
        ) : (
          <div className="flex h-screen w-full items-center justify-center">
            <SquareCheck className="h-12 w-12 animate-pulse text-primary" />
          </div>
        )
      ) : (
        children
      )}
      <FirebaseErrorListener />
    </SidebarProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <AppContent>{children}</AppContent>
    </FirebaseProvider>
  );
}
