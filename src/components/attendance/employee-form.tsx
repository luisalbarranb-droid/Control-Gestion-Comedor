
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth, useFirestore, useCollection, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { createUserAccount } from '@/firebase/auth-operations';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { areas } from '@/lib/placeholder-data';
import { DatePicker } from '../ui/datepicker';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { uploadProfilePicture } from '@/actions/upload-actions';
import { useMultiTenant } from '@/providers/multi-tenant-provider';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const employeeSchema = z.object({
  name: z.string().min(3, 'El nombre es requerido.'),
  cedula: z.string().min(6, 'La cédula es requerida.'),
  rif: z.string().optional(),
  email: z.string().email('Email no válido.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['comun', 'admin', 'superadmin']),
  area: z.string().optional(),
  workerType: z.enum(['obrero', 'empleado']),
  contractType: z.enum(['determinado', 'indeterminado', 'prueba']),
  position: z.string().optional(),
  fechaIngreso: z.date().optional(),
  fechaNacimiento: z.date().optional(),
  diasContrato: z.coerce.number().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  comedorId: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional(),

  // New Fields
  gender: z.enum(['M', 'F', 'Other']).optional(),
  civilStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed', 'Cohabiting']).optional(),
  nationality: z.string().optional(),
  shirtSize: z.string().optional(),
  pantsSize: z.string().optional(),
  shoeSize: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  diseases: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountType: z.enum(['Savings', 'Current']).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
}

const convertToDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  if (date instanceof Timestamp) return date.toDate();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

export function EmployeeForm({ isOpen, onOpenChange, employee }: EmployeeFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { activeComedorId, isSuperAdmin } = useMultiTenant();

  // Load comedores list for SuperAdmin selection
  const comedoresQuery = isSuperAdmin ? collection(firestore, 'comedores') : null;
  const { data: comedoresList } = useCollection<any>(comedoresQuery);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      cedula: '',
      rif: '',
      email: '',
      phone: '',
      address: '',
      role: 'comun',
      area: undefined,
      workerType: 'obrero',
      contractType: 'indeterminado',
      position: '',
      fechaIngreso: undefined,
      fechaNacimiento: undefined,
      diasContrato: 0,
      avatarUrl: '',
      comedorId: activeComedorId || '',
      gender: undefined,
      civilStatus: undefined,
      nationality: '',
      shirtSize: '',
      pantsSize: '',
      shoeSize: '',
      bloodType: '',
      allergies: '',
      diseases: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountType: 'Savings',
      password: '',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name || '',
        cedula: employee.cedula || '',
        rif: employee.rif || '',
        email: employee.email || '',
        phone: employee.phone || '',
        address: employee.address || '',
        role: employee.role || 'comun',
        area: employee.area || undefined,
        workerType: employee.workerType || 'obrero',
        contractType: employee.contractType || 'indeterminado',
        position: employee.position || '',
        fechaIngreso: convertToDate(employee.fechaIngreso),
        fechaNacimiento: convertToDate(employee.fechaNacimiento),
        diasContrato: employee.diasContrato || 0,
        avatarUrl: employee.avatarUrl || '',
        comedorId: employee.comedorId || activeComedorId || '',
        gender: employee.gender || undefined,
        civilStatus: employee.civilStatus || undefined,
        nationality: employee.nationality || '',
        shirtSize: employee.shirtSize || '',
        pantsSize: employee.pantsSize || '',
        shoeSize: employee.shoeSize || '',
        bloodType: employee.bloodType || '',
        allergies: employee.allergies || '',
        diseases: employee.diseases || '',
        emergencyContactName: employee.emergencyContactName || '',
        emergencyContactPhone: employee.emergencyContactPhone || '',
        emergencyContactRelation: employee.emergencyContactRelation || '',
        bankName: employee.bankName || '',
        bankAccountNumber: employee.bankAccountNumber || '',
        bankAccountType: employee.bankAccountType || 'Savings',
      });
      setPreviewUrl(employee.avatarUrl || null);
    } else {
      form.reset({
        name: '',
        cedula: '',
        rif: '',
        email: '',
        phone: '',
        address: '',
        role: 'comun',
        area: undefined,
        workerType: 'obrero',
        contractType: 'indeterminado',
        position: '',
        fechaIngreso: new Date(),
        fechaNacimiento: undefined,
        diasContrato: 0,
        avatarUrl: '',
        comedorId: activeComedorId || '',
        gender: undefined,
        civilStatus: undefined,
        nationality: '',
        shirtSize: '',
        pantsSize: '',
        shoeSize: '',
        bloodType: '',
        allergies: '',
        diseases: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        bankName: '',
        bankAccountNumber: '',
        bankAccountType: 'Savings',
        password: '',
      });
      setPreviewUrl(null);
    }
    setPhotoFile(null);
  }, [employee, isOpen, form, activeComedorId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const onSubmit = async (values: EmployeeFormValues) => {
    if (!firestore || !auth) return;
    setIsUploading(true);

    try {
      let docId: string;
      let finalAvatarUrl = values.avatarUrl;

      if (employee) { // --- UPDATE EXISTING USER ---
        docId = employee.id;
        if (photoFile) {
          const { url, error } = await uploadProfilePicture(docId, photoFile);
          if (error || !url) throw new Error(error || "No se pudo obtener la URL de la imagen.");
          finalAvatarUrl = url;
        }

        const dataToUpdate = { ...values, avatarUrl: finalAvatarUrl };
        const employeeRef = doc(firestore, 'users', docId);
        await updateDocumentNonBlocking(employeeRef, dataToUpdate);

        toast({ title: 'Empleado actualizado', description: `${values.name} ha sido actualizado.` });

      } else { // --- CREATE NEW USER ---
        if (!values.password) {
          throw new Error('Debes asignar una contraseña para el nuevo empleado.');
        }
        const { user: newUserAuth, error: authError } = await createUserAccount(values.email, values.password);
        if (authError || !newUserAuth) {
          throw new Error(authError || 'No se pudo crear la cuenta de autenticación.');
        }
        docId = newUserAuth.user.uid;

        if (photoFile) {
          const { url, error } = await uploadProfilePicture(docId, photoFile);
          if (error || !url) throw new Error(error || "No se pudo obtener la URL de la imagen.");
          finalAvatarUrl = url;
        }

        const employeeRef = doc(firestore, 'users', docId);

        const newEmployeeData = {
          ...values,
          id: docId,
          userId: docId,
          email: values.email, // Ensure email is passed correctly as it's required in User type
          name: values.name,
          role: values.role,
          avatarUrl: finalAvatarUrl,
          isActive: true,
          creationDate: serverTimestamp(),
          createdBy: auth.currentUser?.uid || 'system',
          comedorId: values.comedorId || activeComedorId || '',
        } as any;

        await setDocumentNonBlocking(employeeRef, newEmployeeData);

        toast({
          title: 'Empleado Creado Exitosamente',
          description: `${values.name} ha sido agregado. Ya puede ingresar con su correo y la clave asignada.`
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({ variant: 'destructive', title: 'Error al Guardar', description: error.message || 'No se pudo completar la operación.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{employee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            {employee ? 'Actualiza los datos del empleado y su expediente.' : 'Registra un nuevo empleado en el sistema.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Información General</TabsTrigger>
                  <TabsTrigger value="personal">Detalles y Dotación</TabsTrigger>
                  <TabsTrigger value="financial">Financiero y Médico</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-6">
                <TabsContent value="general" className="space-y-4 mt-0">
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <Avatar className="w-24 h-24 border-2 border-dashed">
                      <AvatarImage src={previewUrl || undefined} alt={form.getValues('name')} />
                      <AvatarFallback className="text-3xl">
                        {getUserInitials(form.getValues('name'))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-4 items-center">
                      <Button type="button" variant="outline" asChild>
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Camera className="mr-2 h-4 w-4" />
                          Subir Foto
                          <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="name" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="cedula" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Cédula</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="rif" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>R.I.F.</FormLabel><FormControl><Input {...field} placeholder="ej. V-12345678-0" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="email" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!employee} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="phone" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  {isSuperAdmin && (
                    <FormField
                      name="comedorId"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sede / Comedor</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar comedor..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {comedoresList?.map((comedor: any) => (
                                <SelectItem key={comedor.id} value={comedor.id}>
                                  {comedor.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <h3 className="font-semibold text-sm text-muted-foreground mt-4 mb-2">Contrato y Rol</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="role" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol en el Sistema</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="comun">Común</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Superadmin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="area" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Trabajo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar área..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {areas.map(area => <SelectItem key={area.id} value={area.id}>{area.nombre}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="workerType" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Trabajador</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="obrero">Obrero</SelectItem>
                            <SelectItem value="empleado">Empleado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="contractType" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Contrato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="indeterminado">Indeterminado</SelectItem>
                            <SelectItem value="determinado">Determinado</SelectItem>
                            <SelectItem value="prueba">Prueba</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="fechaIngreso" control={form.control} render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Fecha de Ingreso</FormLabel><DatePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>
                    )} />
                    <FormField name="diasContrato" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Días de Contrato</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField name="position" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Cargo (Posición)</FormLabel><FormControl><Input {...field} placeholder="Ej. Supervisor de Cocina" /></FormControl><FormMessage /></FormItem>
                  )} />
                  {!employee && (
                    <FormField name="password" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña Inicial (Para Login)</FormLabel>
                        <FormControl><Input type="password" {...field} placeholder="Mínimo 6 caracteres" /></FormControl>
                        <FormDescription>Asigna una clave si este trabajador necesita ingresar a la aplicación.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </TabsContent>

                <TabsContent value="personal" className="space-y-4 mt-0">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="fechaNacimiento" control={form.control} render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel><DatePicker date={field.value} setDate={field.onChange} captionLayout="dropdown-nav" fromYear={1950} toYear={new Date().getFullYear()} /><FormMessage /></FormItem>
                    )} />
                    <FormField name="gender" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="Other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField name="civilStatus" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Soltero/a</SelectItem>
                            <SelectItem value="Married">Casado/a</SelectItem>
                            <SelectItem value="Divorced">Divorciado/a</SelectItem>
                            <SelectItem value="Widowed">Viudo/a</SelectItem>
                            <SelectItem value="Cohabiting">Concubinato</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                  <FormField name="nationality" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Nacionalidad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <h3 className="font-semibold text-sm text-muted-foreground mt-6 mb-2">Tallas y Dotación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="shirtSize" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Talla Camisa</FormLabel><FormControl><Input {...field} placeholder="ej. M, L" /></FormControl></FormItem>
                    )} />
                    <FormField name="pantsSize" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Talla Pantalón</FormLabel><FormControl><Input {...field} placeholder="ej. 32, 34" /></FormControl></FormItem>
                    )} />
                    <FormField name="shoeSize" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Talla Calzado</FormLabel><FormControl><Input {...field} placeholder="ej. 40, 42" /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4 mt-0">
                  <h3 className="font-semibold text-sm text-center text-muted-foreground mb-2">Datos Bancarios y Pagos</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="bankName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Banco</FormLabel><FormControl><Input {...field} placeholder="ej. Banco de Venezuela" /></FormControl></FormItem>
                      )} />
                      <FormField name="bankAccountType" control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cuenta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Savings">Ahorro</SelectItem>
                              <SelectItem value="Current">Corriente</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                    <FormField name="bankAccountNumber" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Número de Cuenta</FormLabel><FormControl><Input {...field} placeholder="0102-..." /></FormControl><FormDescription>Para transferencias bancarias o Pago Móvil.</FormDescription></FormItem>
                    )} />
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md mt-4">
                    <h4 className="text-sm font-medium mb-2">Para Pago Móvil:</h4>
                    <p className="text-xs text-muted-foreground">
                      Generalmente se usa la misma Cédula y Teléfono del perfil. Si difieren, indícalo en "Observaciones" o asegúrate de que el teléfono principal sea el afiliado.
                    </p>
                  </div>

                  <h3 className="font-semibold text-sm text-center text-muted-foreground mt-8 mb-2">Ficha Médica y Emergencia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="bloodType" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Tipo de Sangre</FormLabel><FormControl><Input {...field} placeholder="ej. O+" /></FormControl></FormItem>
                    )} />
                    <FormField name="allergies" control={form.control} render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Alergias</FormLabel><FormControl><Input {...field} placeholder="Ninguna o especificar" /></FormControl></FormItem>
                    )} />
                  </div>
                  <FormField name="diseases" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Enfermedades / Patologías</FormLabel><FormControl><Input {...field} placeholder="Ninguna o especificar" /></FormControl></FormItem>
                  )} />

                  <h4 className="font-medium text-sm mt-4">Contacto de Emergencia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField name="emergencyContactName" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Nombre Contacto</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                    <FormField name="emergencyContactRelation" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Parentesco</FormLabel><FormControl><Input {...field} placeholder="ej. Madre, Esposa" /></FormControl></FormItem>
                    )} />
                    <FormField name="emergencyContactPhone" control={form.control} render={({ field }) => (
                      <FormItem><FormLabel>Teléfono Contacto</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </TabsContent>
              </ScrollArea>

              <DialogFooter className="p-6 pt-2 border-t mt-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? 'Guardando...' : 'Guardar Empleado'}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
