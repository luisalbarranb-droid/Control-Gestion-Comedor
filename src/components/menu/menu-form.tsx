'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/components/ui/toast";
import type { Menu, MealType, MenuItem, MenuItemCategory, InventoryItem } from "@/lib/types";
import { useEffect, useState } from "react";
import { DatePicker } from "../ui/datepicker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Edit, Loader2 } from "lucide-react";
import { MealComponentForm } from "./meal-component-form";

const categoryOrder: MenuItemCategory[] = ['entrada', 'proteico', 'acompanante1', 'acompanante2', 'acompanante3', 'bebida', 'postre'];

const menuSchema = z.object({
    name: z.string().optional(),
    date: z.date({ required_error: 'La fecha es obligatoria.'}),
    pax: z.coerce.number().int().positive("El número de comensales debe ser positivo."),
    time: z.enum(['desayuno', 'almuerzo', 'cena', 'merienda', 'especial', 'otro']).optional(),
    items: z.array(z.any()).min(1, "Debes definir al menos un componente del menú."),
});

type MenuFormValues = z.infer<typeof menuSchema>;

interface MenuFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingMenu: Menu | null;
    inventoryItems: InventoryItem[];
    isLoadingInventory: boolean;
}

const mealTypeLabels: Record<MealType, string> = {
    desayuno: "Desayuno",
    almuerzo: "Almuerzo",
    cena: "Cena",
    merienda: "Merienda",
    especial: "Plato Especial",
    otro: "Otro"
};

export function MenuForm({ isOpen, onOpenChange, editingMenu, inventoryItems, isLoadingInventory }: MenuFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [editingComponent, setEditingComponent] = useState<{ category: MenuItemCategory, component: Partial<MenuItem> } | null>(null);

    const form = useForm<MenuFormValues>({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            name: '',
            date: new Date(),
            pax: 150,
            time: 'almuerzo',
            items: categoryOrder.map(cat => ({ id: `new-${cat}`, name: '', category: cat, ingredients: [] }))
        }
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "items"
    });

    useEffect(() => {
        if(isOpen) {
            if(editingMenu) {
                const menuItems = categoryOrder.map(cat => {
                    const existing = editingMenu.items.find(item => item.category === cat);
                    return existing || { id: `new-${cat}`, name: '', category: cat, ingredients: [] };
                });
                form.reset({
                    name: (editingMenu as any).name || '',
                    date: editingMenu.date ? (editingMenu.date instanceof Timestamp ? editingMenu.date.toDate() : new Date(editingMenu.date)) : new Date(),
                    pax: editingMenu.pax || 150,
                    time: editingMenu.time || 'almuerzo',
                    items: menuItems
                });
            } else {
                 form.reset({
                    name: '',
                    date: new Date(),
                    pax: 150,
                    time: 'almuerzo',
                    items: categoryOrder.map(cat => ({ id: `new-${cat}`, name: '', category: cat, ingredients: [] }))
                });
            }
        }
    }, [editingMenu, isOpen, form]);

    const handleSaveComponent = (componentData: Omit<MenuItem, 'id' | 'category'>) => {
        if (!editingComponent) return;
        const { category } = editingComponent;
        const currentItems = form.getValues('items');
        const itemIndex = currentItems.findIndex(item => item.category === category);

        if (itemIndex > -1) {
            const updatedItems = [...currentItems];
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...componentData, category };
            form.setValue('items', updatedItems, { shouldValidate: true });
        }
        setEditingComponent(null);
    };

    const onSubmit = async (values: MenuFormValues) => {
        if (!firestore) return;
        try {
            const dataToSave = {
                ...values,
                name: values.name || values.time, // Default name to meal type if empty
                date: Timestamp.fromDate(values.date),
                items: values.items.filter(item => item.name), // Only save items that have a name
            };

            if (editingMenu) {
                const menuRef = doc(firestore, 'menus', editingMenu.id);
                updateDocumentNonBlocking(menuRef, dataToSave);
                toast({ title: 'Menú actualizado' });
            } else {
                const collectionRef = collection(firestore, 'menus');
                addDocumentNonBlocking(collectionRef, { ...dataToSave, createdAt: serverTimestamp() });
                toast({ title: 'Menú creado' });
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error guardando menú:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el menú.' });
        }
    };
    
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Comida</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.entries(mealTypeLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Menú (Opcional)</FormLabel>
                                <FormControl><Input placeholder="Ej: Almuerzo Ejecutivo, Cena Navideña" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Separator />
                    <div className="space-y-2">
                        <FormLabel>Componentes del Menú</FormLabel>
                        {isLoadingInventory ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                <span>Cargando inventario...</span>
                            </div>
                        ) : (
                            fields.map((item, index) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                    <div className="flex flex-col">
                                        <span className="font-semibold capitalize text-sm text-muted-foreground">{(item as MenuItem).category.replace('acompanante', 'Acomp. ')}</span>
                                        <span className="text-sm truncate">{(item as MenuItem).name || 'Sin definir'}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingComponent({ category: (item as MenuItem).category, component: item as MenuItem })}
                                    >
                                        <Edit className="mr-2 h-3 w-3" /> {(item as MenuItem).name ? 'Editar' : 'Definir'}
                                    </Button>
                                </div>
                            ))
                        )}
                        <FormMessage>{form.formState.errors.items?.message}</FormMessage>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Guardar Menú</Button>
                    </DialogFooter>
                </form>
            </Form>

            {editingComponent && (
                <MealComponentForm 
                    isOpen={!!editingComponent}
                    onOpenChange={() => setEditingComponent(null)}
                    onSave={handleSaveComponent}
                    inventory={inventoryItems}
                    component={editingComponent.component}
                    category={editingComponent.category}
                />
            )}
        </>
    );
}
