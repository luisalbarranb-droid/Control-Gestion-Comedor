'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import { weeklyMenus } from '@/lib/placeholder-data';
import type { Menu } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MonthlyPlanner } from '@/components/menus/monthly-planner';

export default function MenuCalendarPage() {
  const [menus] = useState<Menu[]>(weeklyMenus);

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
        <main className="flex flex-1 flex-col">
           <div className="flex items-center justify-between p-4 md:p-8 border-b">
                <div>
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">
                        Calendario de Planificación
                    </h1>
                     <p className="text-muted-foreground">
                        Visualiza los menús planificados en una vista de calendario mensual.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/menus">Volver a la Lista</Link>
                </Button>
            </div>
          <MonthlyPlanner menus={menus} />
        </main>
      </SidebarInset>
    </div>
  );
}
