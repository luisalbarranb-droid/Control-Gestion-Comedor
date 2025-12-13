
'use client';

import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, BarChart, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { WeeklyPlan, InventoryItem, Menu } from '@/lib/types';
import { WeeklyPlanForm } from '@/components/menu/weekly-plan-form';
import { WeeklyMenuCalendar } from '@/components/menu/weekly-menu-calendar';
import { IngredientSummaryDialog } from '@/components/menu/ingredient-summary-dialog';
import { calculateIngredientSummary, IngredientSummary } from '@/lib/menu-utils';
import { addDays, endOfWeek, startOfWeek } from 'date-fns';

export default function MenuPlannerPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isPlanFormOpen, setPlanFormOpen] = useState(false);
  const [isSummaryOpen, setSummaryOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);

  const { start, end } = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return { start, end };
  }, [currentWeek]);

  const menuQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading) return null;
    return query(
      collection(firestore, 'menus'),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );
  }, [firestore, isUserLoading, start, end]);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading) return null;
    return collection(firestore, 'inventory');
  }, [firestore, isUserLoading]);

  const { data: menus, isLoading: isLoadingMenus } = useCollection<Menu>(menuQuery);
  const { data: inventory, isLoading: isLoadingInventory } = useCollection<InventoryItem>(inventoryQuery);

  useEffect(() => {
    if (menus !== null) {
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      const planMenus = weekDays.map(day => {
        const found = menus.find(m => {
          const menuDate = m.date instanceof Timestamp ? m.date.toDate() : new Date(m.date);
          return menuDate.toDateString() === day.toDateString();
        });
        return found || null;
      });

      setActivePlan({
        id: `plan-${start.toISOString()}`,
        startDate: start,
        name: `Semana del ${start.toLocaleDateString()}`,
        menus: planMenus
      });
    }
  }, [menus, start]);

  const handleEditMenu = (dayIndex: number) => {
    toast({
      title: "Función no implementada",
      description: "La edición de menús individuales se gestiona dentro del formulario del plan semanal."
    });
  }
  
  const ingredientSummary: IngredientSummary[] = useMemo(() => {
    if (!activePlan || !inventory) return [];
    return calculateIngredientSummary(activePlan, inventory);
  }, [activePlan, inventory]);
  
  const isLoading = isUserLoading || isLoadingMenus || isLoadingInventory;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Planificador de Menús Semanales
          </h1>
          <p className="text-muted-foreground">Crea, visualiza y gestiona los menús de cada semana.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSummaryOpen(true)} disabled={!activePlan || isLoading}>
            <BarChart className="mr-2 h-4 w-4" />
            Resumen de Ingredientes
          </Button>
          <Button onClick={() => setPlanFormOpen(true)} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Plan Semanal
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : activePlan && activePlan.menus.some(m => m !== null) ? (
        <Card>
          <CardHeader>
            <CardTitle>{activePlan.name}</CardTitle>
            <CardDescription>Menús planificados para esta semana. Haz clic en un día para ver detalles o editar.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyMenuCalendar plan={activePlan} onEditMenu={handleEditMenu} />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <div className="flex flex-col items-center gap-1 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">
              No has creado ningún plan
            </h3>
            <p className="text-sm text-muted-foreground">
              Comienza creando un nuevo plan semanal para empezar a planificar.
            </p>
            <Button className="mt-4" onClick={() => setPlanFormOpen(true)}>Crear Plan Semanal</Button>
          </div>
        </div>
      )}

      {inventory && (
        <WeeklyPlanForm 
          isOpen={isPlanFormOpen}
          onOpenChange={setPlanFormOpen}
          onSave={() => {}} 
          inventory={inventory}
        />
      )}
      
      <IngredientSummaryDialog
        isOpen={isSummaryOpen}
        onOpenChange={setSummaryOpen}
        summary={ingredientSummary}
      />
    </main>
  );
}
