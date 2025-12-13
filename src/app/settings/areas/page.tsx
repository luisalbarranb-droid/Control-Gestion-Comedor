'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Area } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

// Simulación de un formulario de área para evitar complejidad adicional por ahora
const AreaForm = ({ onSave, onCancel }: { onSave: (name: string) => void, onCancel: () => void }) => {
    const [name, setName] = useState('');
    return (
        <div className="p-4 border rounded-lg my-4">
            <h3 className="font-medium mb-2">Nueva Área</h3>
            <div className="flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del área" className="p-2 border rounded-md w-full" />
                <Button onClick={() => onSave(name)}>Guardar</Button>
                <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
            </div>
        </div>
    );
};


export default function AreasManagementPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const areasQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'areas'), orderBy('nombre'));
  }, [firestore]);

  const { data: areas, isLoading } = useCollection<Area>(areasQuery);

  const handleSaveArea = (name: string) => {
    // Aquí iría la lógica para guardar en Firebase
    console.log("Guardando nueva área:", name);
    setIsFormOpen(false);
  }

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
            Gestionar Áreas
          </h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Área
        </Button>
      </div>

      {isFormOpen && <AreaForm onSave={handleSaveArea} onCancel={() => setIsFormOpen(false)} />}

      <Card>
        <CardHeader>
          <CardTitle>Áreas de Trabajo</CardTitle>
          <CardDescription>
            Define las diferentes áreas o departamentos de la operación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Área</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Cargando áreas...
                  </TableCell>
                </TableRow>
              )}
               {!isLoading && areas?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No hay áreas definidas.
                  </TableCell>
                </TableRow>
              )}
              {areas?.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{area.descripcion}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={area.activa ? 'secondary' : 'outline'} className={area.activa ? 'text-green-700 bg-green-100' : ''}>
                      {area.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
