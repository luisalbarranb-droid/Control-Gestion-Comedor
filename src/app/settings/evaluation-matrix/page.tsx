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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreVertical,
  Plus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { EvaluationCriterion } from '@/lib/types';
import { CriterionForm } from '@/components/settings/criterion-form';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';


export default function EvaluationMatrixPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterion | null>(null);

  const criteriaQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'evaluationCriteria'), orderBy('name'));
  }, [firestore]);

  const { data: criteria, isLoading } = useCollection<EvaluationCriterion>(criteriaQuery);

  const handleOpenForm = (criterion: EvaluationCriterion | null = null) => {
    setEditingCriterion(criterion);
    setFormOpen(true);
  };
  
  const handleToggleActive = (criterion: EvaluationCriterion) => {
    if (!firestore) return;
    const criterionRef = doc(firestore, 'evaluationCriteria', criterion.id);
    updateDocumentNonBlocking(criterionRef, { isActive: !criterion.isActive });
    toast({
        title: `Criterio ${criterion.isActive ? 'desactivado' : 'activado'}`,
        description: `${criterion.name} ha sido actualizado.`,
    });
  }

  const handleSave = (values: Omit<EvaluationCriterion, 'id'>) => {
    if (!firestore) return;
    
    if (editingCriterion) {
      const criterionRef = doc(firestore, 'evaluationCriteria', editingCriterion.id);
      updateDocumentNonBlocking(criterionRef, values);
       toast({ title: 'Criterio Actualizado' });
    } else {
      addDocumentNonBlocking(collection(firestore, 'evaluationCriteria'), values);
      toast({ title: 'Criterio Creado' });
    }
    setFormOpen(false);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/attendance">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a RRHH</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold md:text-2xl">
            Matriz de Evaluación
          </h1>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Criterio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criterios de Evaluación</CardTitle>
          <CardDescription>
            Define los parámetros que se usarán para evaluar el rendimiento de
            los empleados y acumular puntos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Criterio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Puntos Máx.</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Cargando criterios...
                  </TableCell>
                </TableRow>
              )}
               {!isLoading && criteria?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se han definido criterios. ¡Empieza creando uno!
                  </TableCell>
                </TableRow>
              )}
              {criteria?.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell className="font-medium">{criterion.name}</TableCell>
                  <TableCell className="text-muted-foreground">{criterion.description}</TableCell>
                  <TableCell className="text-center font-mono">{criterion.maxPoints}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={criterion.isActive ? 'secondary' : 'outline'} className={criterion.isActive ? 'text-green-700 bg-green-100' : ''}>
                      {criterion.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(criterion)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(criterion)}>
                          {criterion.isActive ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                          {criterion.isActive ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <CriterionForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        criterion={editingCriterion}
      />
    </main>
  );
}
