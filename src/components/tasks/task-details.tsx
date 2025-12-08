'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import type { Task } from '@/lib/types';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (updatedTask: Partial<Task>) => void;
}

export function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  if (!task) return null;

  // Manejo seguro de fechas (funciona con Timestamps de Firebase y Dates normales)
  // Usamos 'as any' para evitar conflictos de tipado estricto con Firebase
  const fechaVencimiento = (task.fechaVencimiento as any)?.toDate 
    ? (task.fechaVencimiento as any).toDate() 
    : new Date(task.fechaVencimiento as any);

  return (
    <Sheet open={!!task} onOpenChange={() => onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={task.estado === 'completada' ? 'default' : 'secondary'}>
              {task.estado}
            </Badge>
            <span className="text-sm text-muted-foreground capitalize">
              Prioridad: {task.prioridad}
            </span>
          </div>
          <SheetTitle className="text-xl">{task.titulo}</SheetTitle>
          <SheetDescription>
            ID: {task.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Vence:</span>
              <span className="font-medium">
                {format(fechaVencimiento, 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Área:</span>
              <span className="font-medium">{task.area}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Acciones Rápidas</h4>
            <div className="flex gap-2">
              {task.estado !== 'completada' && (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    onUpdate({ estado: 'completada' });
                    onClose();
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Completada
                </Button>
              )}
              {task.estado === 'pendiente' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    onUpdate({ estado: 'en-progreso' });
                    onClose();
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Iniciar Progreso
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}