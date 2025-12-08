'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/dashboard/main-nav';
import { SquareCheck } from 'lucide-react';
import type { Menu } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MonthlyPlanner } from '@/components/menus/monthly-planner';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function MenuCalendarPage() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const menusCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'menus') : null),
    [firestore, authUser]
  );
  const { data: menus, isLoading } = useCollection<Menu>(menusCollectionRef);


  return (
    <div className="min-h-screen w-full">
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
          {isLoading ? <p className="p-8">Cargando calendario...</p> : <MonthlyPlanner menus={menus || []} />}
      </main>
    </div>
  );
}
