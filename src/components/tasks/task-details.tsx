
'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  Calendar,
  User,
  Flag,
  Clock,
  Paperclip,
  Tag,
  Square,
  CheckSquare,
  Upload,
  Repeat,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { areas } from '@/lib/placeholder-data';
import type { Task, TaskPriority, TaskStatus, TaskPeriodicity, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


const priorityConfig: Record<TaskPriority, { label: string, className: string }> = {
  baja: { label: 'Baja', className: 'bg-green-100 text-green-800' },
  media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  alta: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-800' },
};

const statusConfig: Record<TaskStatus, { label: string, className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  'en-progreso': { label: 'En Progreso', className: 'bg-blue-100 text-blue-800' },
  completada: { label: 'Completada', className: 'bg-green-100 text-green-800' },
  verificada: { label: 'Verificada', className: 'bg-teal-100 text-teal-800' },
  rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
};

const periodicityConfig: Record<TaskPeriodicity, { label: string }> = {
    diaria: { label: 'Diaria' },
    semanal: { label: 'Semanal' },
    quincenal: { label: 'Quincenal' },
    mensual: { label: 'Mensual' },
    unica: { label: 'Única Vez' },
};


export function TaskDetails({
  task,
  onClose,
  onUpdate
}: {
  task: Task | null;
  onClose: () => void;
  onUpdate: (updatedTask: Partial<Task>) => void;
}) {
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const firestore = useFirestore();

  const usersCollectionRef = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);


  if (!task) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    if (file) {
      setEvidenceFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreview(newPreviewUrl);
    } else {
      setEvidenceFile(null);
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (evidenceFile) {
      // In a real app, you would upload the file to a server or cloud storage
      // and update the task state. Here we just log it.
      console.log('Uploading evidence:', evidenceFile.name);
      
      const newEvidence = {
        url: URL.createObjectURL(evidenceFile),
        nombreArchivo: evidenceFile.name,
        fechaSubida: new Date(),
        usuario: 'user-comun-1', // Placeholder for current user
        descripcion: 'Evidencia de tarea completada'
      };

      onUpdate({ evidencias: [...task.evidencias, newEvidence] });

      setEvidenceFile(null);
      setPreview(null);
    }
  };

  const assignedUser = users?.find((u) => u.id === task.asignadoA);
  const creatorUser = users?.find((u) => u.id === task.creadoPor);
  const area = areas.find((a) => a.id === task.area);
  const fechaCreacion = task.fechaCreacion.toDate ? task.fechaCreacion.toDate() : new Date(task.fechaCreacion as any);
  const fechaVencimiento = task.fechaVencimiento.toDate ? task.fechaVencimiento.toDate() : new Date(task.fechaVencimiento as any);

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-30 w-full max-w-lg transform border-l bg-background shadow-lg transition-transform duration-300 ease-in-out',
        task ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Detalles de la Tarea</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <Badge className={cn('capitalize', statusConfig[task.estado].className)}>
              {statusConfig[task.estado].label}
            </Badge>

            <h3 className="text-2xl font-bold">{task.titulo}</h3>
            
            {task.descripcion && <p className="text-muted-foreground">{task.descripcion}</p>}

            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Asignado a</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={assignedUser?.avatarUrl} />
                                <AvatarFallback>{assignedUser?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p>{assignedUser?.name}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Vencimiento</p>
                        <p>{format(fechaVencimiento, 'dd MMM, yyyy', { locale: es })}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Flag className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Prioridad</p>
                        <Badge variant="outline" className={cn('capitalize', priorityConfig[task.prioridad].className)}>{priorityConfig[task.prioridad].label}</Badge>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Tiempo Estimado</p>
                        <p>{task.tiempoEstimado} minutos</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Square className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Área</p>
                        <p>{area?.nombre}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Repeat className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Periodicidad</p>
                        <p className="capitalize">{periodicityConfig[task.periodicidad].label}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">Creado por</p>
                         <p>{creatorUser?.name}</p>
                    </div>
                </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4"/> Evidencia
              </h4>
              <div className="space-y-4">
                {task.evidencias && task.evidencias.length > 0 && (
                  <div className="space-y-2">
                    {task.evidencias.map((ev, index) => (
                      <div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg border">
                          <Image src={ev.url} alt={ev.nombreArchivo} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-upload">Añadir Evidencia</Label>
                  <div className="flex gap-2">
                    <Input id="evidence-upload" type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
                    <Button onClick={handleUpload} disabled={!evidenceFile}>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir
                    </Button>
                  </div>
                   {preview && (
                      <div className="relative aspect-video w-full mt-2 overflow-hidden rounded-lg border">
                          <Image src={preview} alt="Vista previa de evidencia" fill className="object-cover" />
                      </div>
                   )}
                </div>
              </div>
            </div>

            {task.checklist && task.checklist.length > 0 && (
                 <div>
                    <h4 className="mb-2 font-semibold">Checklist</h4>
                    <ul className="space-y-2">
                        {task.checklist.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                {item.completado ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                                <span className={cn(item.completado && "line-through text-muted-foreground")}>{item.item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>ID Tarea: {task.id}</p>
              <p>Creada hace {formatDistanceToNow(fechaCreacion, { locale: es })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
