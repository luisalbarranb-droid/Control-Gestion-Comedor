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
import { APP_VERSION } from '@/lib/version';
import { VersionChecker } from '@/components/dashboard/version-checker';

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
              <SidebarFooter className="p-4 border-t bg-slate-50/80 mt-auto">
                <div className="flex flex-col gap-1 text-[11px] text-slate-500 leading-tight">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-900">© 2026 VELCAR, C.A.</p>
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[9px] font-mono font-bold">
                      v{APP_VERSION}
                    </span>
                  </div>
                  <p>Todos los derechos reservados.</p>
                  <div className="mt-1 pt-1 border-t border-slate-200">
                    <p className="opacity-70">Desarrollado por:</p>
                    <p className="font-semibold text-primary">Luis E. Albarrán B.</p>
                  </div>
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
      <VersionChecker />
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
