
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { MenuCard } from '@/components/menus/menu-card';
import { CreateMenuForm } from '@/components/menus/create-menu-form';
import { dailyMenu } from '@/lib/placeholder-data';


export default function MenusPage() {

  return (
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
             <h1 className="font-headline text-2xl font-bold md:text-3xl">
              Planificación de Menús
            </h1>
            <CreateMenuForm />
          </div>
          <MenuCard menu={dailyMenu} />
        </main>
      </SidebarInset>
    </div>
  );
}
