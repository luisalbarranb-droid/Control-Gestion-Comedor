'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function TaskTemplatesPage() {

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a Configuración</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold md:text-2xl">
            Plantillas de Tareas
          </h1>
        </div>
      </div>

      <Card className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">Funcionalidad en Construcción</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Esta sección te permitirá crear tareas predefinidas para asignarlas rápidamente. ¡Vuelve pronto para ver las actualizaciones!
            </CardDescription>
          </CardHeader>
           <CardContent>
                <Button asChild>
                    <Link href="/tasks">Ir a Tareas</Link>
                </Button>
           </CardContent>
      </Card>
    </main>
  );
}
