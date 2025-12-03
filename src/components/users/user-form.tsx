'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datepicker';
import { Switch } from '@/components/ui/switch';
import { areas } from '@/lib/placeholder-data';
import type { User, Role, AreaId, WorkerType, ContractType } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un email válido."),
  password: z.string().optional(),
  cedula: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.string({ required_error: 'El rol es obligatorio.'}),
  area: z.string({ required_error: 'El área es obligatoria.' }),
  workerType: z.string().optional(),
  contractType: z.string().optional(),
  isActive: z.boolean(),
  creationDate: z.date({ required_error: 'La fecha de ingreso es obligatoria.' }),
  contractEndDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: any, password?: string) => void;
  user: User | null;
}

const roles: Role[] = ['superadmin', 'admin', 'comun'];
const workerTypes: WorkerType[] = ['empleado', 'obrero'];
const contractTypes: ContractType[] = ['determinado', 'indeterminado', 'prueba'];

export function UserForm({ isOpen, onOpenChange, onSave, user }: UserFormProps) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      cedula: '',
      phone: '',
      address: '',
      isActive: true,
      creationDate: new Date(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({
            ...user,
            password: '', // Password should not be shown when editing
            creationDate: user.creationDate?.toDate ? user.creationDate.toDate() : new Date(user.creationDate as any),
            contractEndDate: user.contractEndDate?.toDate ? user.contractEndDate.toDate() : user.contractEndDate ? new Date(user.contractEndDate as any) : undefined,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          password: '',
          cedula: '',
          phone: '',
          address: '',
          role: undefined,
          area: undefined,
          workerType: undefined,
          contractType: undefined,
          isActive: true,
          creationDate: new Date(),
          contractEndDate: undefined
        });
      }
    }
  }, [user, isOpen, form]);

  const onSubmit = (values: FormValues) => {
    const { password, ...userData } = values;
    const dataToSave = {
        ...userData,
        role: values.role as Role,
        area: values.area as AreaId,
        workerType: values.workerType as WorkerType | undefined,
        contractType: values.contractType as ContractType | undefined,
    };
    onSave(dataToSave, password);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Actualiza la información del usuario.' : 'Completa los detalles para registrar un nuevo usuario.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ej: John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="ej: john.doe@example.com" {...field} disabled={!!user} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {!user && (
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                control={form.control}
                name="cedula"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                        <Input placeholder="V-12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                        <Input placeholder="0412-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Dirección completa..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {roles.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Área de Trabajo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="workerType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Trabajador</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {workerTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Contrato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un contrato" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {contractTypes.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="creationDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Ingreso</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contractEndDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fin de Contrato (Opcional)</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormMessage />
                    </FormItem>
                    )}
                />

            </div>
             <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Usuario Activo</FormLabel>
                        <FormMessage />
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{user ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
