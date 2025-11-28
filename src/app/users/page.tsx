import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="min-h-screen w-full">
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold group-data-[collapsible=icon]:hidden">
            Comedor
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Usuarios
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                Página de Usuarios
              </h3>
              <p className="text-sm text-muted-foreground">
                Aquí se mostrará la gestión de usuarios.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
