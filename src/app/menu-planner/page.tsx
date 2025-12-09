
'use client';

import { useState } from 'react';
import { PlusCircle, BarChart, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { WeeklyPlan, InventoryItem } from '@/lib/types';
import { inventoryItems } from '@/lib/placeholder-data'; // Usando datos de placeholder por ahora
import { WeeklyPlanForm } from '@/components/menu/weekly-plan-form';
import { WeeklyMenuCalendar } from '@/components/menu/weekly-menu-calendar';
import { IngredientSummaryDialog } from '@/components/menu/ingredient-summary-dialog';
import { calculateIngredientSummary, IngredientSummary } from '@/lib/menu-utils';

export default function MenuPlannerPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [isPlanFormOpen, setPlanFormOpen] = useState(false);
  const [isSummaryOpen, setSummaryOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);
  
  const inventory: InventoryItem[] = inventoryItems;

  const handleSavePlan = (plan: WeeklyPlan) => {
    // Aquí se guardaría en Firebase en una app real
    setPlans(prev => [...prev, plan]);
    setActivePlan(plan);
    toast({
      title: "Plan Semanal Creado",
      description: `Se ha creado el plan para la semana del ${plan.name}.`,
    });
  };

  const handleEditMenu = (dayIndex: number) => {
      // Esta función se pasa al calendario pero la lógica de edición
      // se gestiona dentro del WeeklyPlanForm.
      toast({
          title: "Función no implementada",
          description: "La edición de menús individuales se gestiona dentro del formulario del plan semanal."
      })
  }
  
  const ingredientSummary: IngredientSummary[] = activePlan ? calculateIngredientSummary(activePlan, inventory) : [];

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
          <Button variant="outline" onClick={() => setSummaryOpen(true)} disabled={!activePlan}>
            <BarChart className="mr-2 h-4 w-4" />
            Resumen de Ingredientes
          </Button>
          <Button onClick={() => setPlanFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Plan Semanal
          </Button>
        </div>
      </div>
      
      {activePlan ? (
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

      <WeeklyPlanForm 
        isOpen={isPlanFormOpen}
        onOpenChange={setPlanFormOpen}
        onSave={handleSavePlan}
        inventory={inventory}
      />
      
      <IngredientSummaryDialog
        isOpen={isSummaryOpen}
        onOpenChange={setSummaryOpen}
        summary={ingredientSummary}
      />

    </main>
  );
}
