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
import { CheckCircle2, Clock, Calendar as CalendarIcon, User, Info } from 'lucide-react';
import type { Task } from '@/lib/types';
import { format, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

interface TaskDetailsProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (updatedTask: Partial<Task>) => void;
}

function convertToDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Date && isValid(date)) return date;
    if (date instanceof Timestamp) return date.toDate();
    const parsed = new Date(date);
    return isValid(parsed) ? parsed : null;
}


export function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  if (!task) return null;

  const fechaVencimiento = convertToDate(task.fechaVencimiento);

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
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
            ID de Tarea: {task.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Vence:</span>
              <span className="font-medium">
                {fechaVencimiento ? format(fechaVencimiento, 'dd/MM/yyyy') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Área:</span>
              <span className="font-medium capitalize">{task.area}</span>
            </div>
          </div>
            
          {task.descripcion && (
             <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2"><Info className="h-4 w-4"/>Descripción</h4>
                 <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
                    {task.descripcion}
                </p>
             </div>
          )}


          <Separator />

          <div>
            <h4 className="font-medium mb-2">Acciones Rápidas</h4>
            <div className="flex gap-2">
              {task.estado !== 'completada' && task.estado !== 'verificada' && (
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
             {task.estado === 'completada' && (
                 <p className="text-xs text-center text-muted-foreground mt-2">Esta tarea ya fue completada. Esperando verificación.</p>
             )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
