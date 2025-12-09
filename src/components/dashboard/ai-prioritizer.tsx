
'use client';

import { useState, useTransition } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { aiPrioritizeTasks, type AIPrioritizeTasksOutput } from '@/ai/flows/ai-prioritize-tasks';
import { tasks as mockTasks, users as mockUsers } from '@/lib/placeholder-data';
import type { TaskPriority } from '@/lib/types';
import { cn } from '@/lib/utils';

const priorityVariant: Record<TaskPriority, string> = {
    baja: 'bg-green-100 text-green-800 border-green-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    alta: 'bg-orange-100 text-orange-800 border-orange-200',
    urgente: 'bg-red-100 text-red-800 border-red-200'
}

export default function AIPrioritizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [prioritizedTasks, setPrioritizedTasks] = useState<AIPrioritizeTasksOutput | null>(null);
  const { toast } = useToast();

  const handlePrioritize = () => {
    startTransition(async () => {
      try {
        // Map mock data to AI input schema
        const aiInput = {
          tasks: mockTasks.map(t => ({
            taskId: t.id,
            titulo: t.titulo,
            description: t.descripcion,
            area: t.area,
            asignadoA: t.asignadoA,
            estado: t.estado,
            prioridad: t.prioridad,
            fechaVencimiento: t.fechaVencimiento.toISOString(),
            tiempoEstimado: t.tiempoEstimado,
          })),
          users: mockUsers.map(u => ({
            userId: u.id,
            rol: u.role,
            area: u.area,
          })),
        }
        
        const result = await aiPrioritizeTasks(aiInput);
        setPrioritizedTasks(result);
      } catch (error) {
        console.error('Error prioritizing tasks:', error);
        toast({
          title: 'Error de Priorización',
          description: 'No se pudieron obtener las sugerencias de la IA. Inténtalo de nuevo.',
          variant: 'destructive',
        });
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handlePrioritize}>
          <Bot className="mr-2 h-4 w-4" />
          Priorizar con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Priorización de Tareas con IA</DialogTitle>
          <DialogDescription>
            La IA ha analizado las tareas y cargas de trabajo actuales. Revisa las sugerencias de prioridad a continuación.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Analizando tareas...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Prioridad Actual</TableHead>
                  <TableHead>Nueva Prioridad</TableHead>
                  <TableHead>Justificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prioritizedTasks?.map((suggestion) => {
                  const originalTask = mockTasks.find(t => t.id === suggestion.taskId);
                  if (!originalTask) return null;

                  return (
                    <TableRow key={suggestion.taskId}>
                      <TableCell className="font-medium">{originalTask.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(priorityVariant[originalTask.prioridad], 'capitalize')}>{originalTask.prioridad}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(priorityVariant[suggestion.nuevaPrioridad], 'capitalize')}>{suggestion.nuevaPrioridad}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{suggestion.razonamiento}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={() => {
            toast({ title: 'Éxito', description: 'Prioridades aplicadas correctamente.' });
            setIsOpen(false);
          }} disabled={isPending || !prioritizedTasks}>
            Aplicar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
