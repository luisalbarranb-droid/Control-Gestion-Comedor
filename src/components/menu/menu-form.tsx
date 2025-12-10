'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/components/ui/toast";
import type { Menu } from "@/lib/types";
import { useEffect } from "react";
import { DatePicker } from "../ui/datepicker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

const menuSchema = z.object({
    name: z.string().min(3, "El nombre es requerido."),
    date: z.date({ required_error: 'La fecha es obligatoria.'}),
    pax: z.coerce.number().int().positive("El número de comensales debe ser positivo."),
});

type MenuFormValues = z.infer<typeof menuSchema>;

interface MenuFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingMenu: Menu | null;
}

export function MenuForm({ isOpen, onOpenChange, editingMenu }: MenuFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const form = useForm<MenuFormValues>({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            name: '',
            date: new Date(),
            pax: 150,
        }
    });
    
    useEffect(() => {
        if(editingMenu) {
            form.reset({
                name: (editingMenu as any).name || '',
                date: editingMenu.date ? (editingMenu.date instanceof Timestamp ? editingMenu.date.toDate() : new Date(editingMenu.date)) : new Date(),
                pax: editingMenu.pax || 150
            });
        } else {
            form.reset({
                name: '',
                date: new Date(),
                pax: 150,
            });
        }
    }, [editingMenu, isOpen, form]);

    const onSubmit = async (values: MenuFormValues) => {
        if (!firestore) return;
        try {
            const dataToSave = {
                ...values,
                date: Timestamp.fromDate(values.date),
            };

            if (editingMenu) {
                const menuRef = doc(firestore, 'menus', editingMenu.id);
                // No incluyas `items` aquí a menos que quieras sobrescribirlos
                const { ...updateData } = dataToSave;
                updateDocumentNonBlocking(menuRef, updateData);
                toast({ title: 'Menú actualizado' });
            } else {
                const collectionRef = collection(firestore, 'menus');
                addDocumentNonBlocking(collectionRef, { ...dataToSave, items: [], createdAt: serverTimestamp() });
                toast({ title: 'Menú creado' });
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error guardando menú:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el menú.' });
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingMenu ? 'Editar Menú' : 'Nuevo Menú'}</DialogTitle>
                    <DialogDescription>
                        {editingMenu ? 'Actualiza los detalles de este menú.' : 'Crea un nuevo menú para planificar.'}
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Menú/Platillo</FormLabel>
                                    <FormControl><Input placeholder="Ej: Almuerzo Ejecutivo" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha</FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="pax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comensales (PAX)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
