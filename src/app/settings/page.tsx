'use client';

import { Settings, ShieldCheck } from 'lucide-react';
import { ProfileCard } from '@/components/settings/profile-card';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Settings className="h-6 w-6" />
        <h1 className="font-headline text-2xl font-bold md:text-3xl">
          Configuración
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileCard />
        </div>
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span>Administración</span>
                    </CardTitle>
                    <CardDescription>
                        Gestiona los parámetros y configuraciones del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                       <Link href="/settings/evaluation-matrix">
                        Matriz de Evaluación
                       </Link>
                    </Button>
                     <Button variant="outline" className="w-full justify-start" asChild>
                       <Link href="/settings/areas">
                        Gestionar Áreas
                       </Link>
                    </Button>
                     <Button variant="outline" className="w-full justify-start" asChild>
                       <Link href="/settings/task-templates">
                        Plantillas de Tareas
                       </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
