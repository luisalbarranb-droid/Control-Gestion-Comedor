
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { generateWeeklyPlanName } from '@/lib/menu-utils';
import { DailyMenuForm } from './daily-menu-form';
import type { InventoryItem, WeeklyPlan, Menu } from '@/lib/types';

const formSchema = z.object({
  startDate: z.date({ required_error: "La fecha de inicio es obligatoria." }),
});

type FormValues = z.infer<typeof formSchema>;

interface WeeklyPlanFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: WeeklyPlan) => void;
  inventory: InventoryItem[];
}

export function WeeklyPlanForm({ isOpen, onOpenChange, onSave, inventory }: WeeklyPlanFormProps) {
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      form.setValue('startDate', monday);
      
      const newPlan: WeeklyPlan = {
        id: uuidv4(),
        startDate: monday,
        name: generateWeeklyPlanName(monday),
        menus: Array(7).fill(null),
      };
      setCurrentPlan(newPlan);
    } else {
        setCurrentPlan(null);
    }
  }, [isOpen, form]);
  
  const startDate = form.watch('startDate');
  
  useEffect(() => {
      if (startDate) {
          setCurrentPlan(prev => prev ? {
              ...prev,
              startDate: startDate,
              name: generateWeeklyPlanName(startDate),
          } : null);
      }
  }, [startDate]);
  
  const handleSaveDailyMenu = (dailyMenu: Omit<Menu, 'id' | 'date'>) => {
    if (editingDayIndex === null || !currentPlan) return;
    
    const newMenus = [...currentPlan.menus];
    const date = addDays(currentPlan.startDate, editingDayIndex);
    
    const existingMenu = newMenus[editingDayIndex];
    if (existingMenu) {
        newMenus[editingDayIndex] = { ...existingMenu, ...dailyMenu };
    } else {
        newMenus[editingDayIndex] = { id: uuidv4(), date, ...dailyMenu };
    }

    setCurrentPlan({ ...currentPlan, menus: newMenus });
    setEditingDayIndex(null);
  }

  const onSubmit = () => {
    if (currentPlan) {
      onSave(currentPlan);
      onOpenChange(false);
    }
  };
  
  const weekdays = currentPlan ? Array.from({ length: 7 }, (_, i) => addDays(currentPlan.startDate, i)) : [];

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>Crear Nuevo Plan Semanal</DialogTitle>
            <DialogDescription>Selecciona la fecha de inicio (lunes) y completa los menús para cada día.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Semana del:</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date.getDay() !== 1}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                {currentPlan && (
                    <div className="space-y-2">
                        {weekdays.map((day, index) => (
                             <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div>
                                    <p className="font-semibold capitalize">{format(day, 'EEEE dd', { locale: es })}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentPlan.menus[index] ? `${currentPlan.menus[index]?.items.length} componentes` : 'No planificado'}
                                    </p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingDayIndex(index)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    {currentPlan.menus[index] ? 'Editar' : 'Crear'}
                                </Button>
                             </div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="button" onClick={onSubmit}>Guardar Plan</Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
        
        {editingDayIndex !== null && currentPlan && (
            <DailyMenuForm
                isOpen={editingDayIndex !== null}
                onOpenChange={() => setEditingDayIndex(null)}
                onSave={handleSaveDailyMenu}
                menu={currentPlan.menus[editingDayIndex]}
                inventory={inventory}
            />
        )}
    </>
  );
}
