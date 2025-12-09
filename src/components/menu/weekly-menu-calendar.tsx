
'use client';

import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeeklyPlan, MenuItemCategory } from '@/lib/types';

interface WeeklyMenuCalendarProps {
  plan: WeeklyPlan;
  onEditMenu: (dayIndex: number) => void;
}

const categoryOrder: MenuItemCategory[] = ['entrada', 'proteico', 'acompanante1', 'acompanante2', 'acompanante3', 'bebida', 'postre'];

export function WeeklyMenuCalendar({ plan, onEditMenu }: WeeklyMenuCalendarProps) {
  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(plan.startDate, i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {weekdays.map((day, index) => {
        const menu = plan.menus[index];
        return (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="capitalize">{format(day, 'EEEE dd', { locale: es })}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              {menu ? (
                <>
                  <p className="text-sm text-muted-foreground">{menu.pax} Comensales</p>
                  <div className="space-y-1">
                    {categoryOrder.map(category => {
                      const item = menu.items.find(i => i.category === category);
                      return (
                        <div key={category} className="flex items-center justify-between text-xs p-1 rounded bg-gray-50">
                          <span className="font-semibold capitalize text-gray-500">{category.replace('acompanante', 'Acomp. ')}:</span>
                          <span className="text-right truncate">{item?.name || 'No asignado'}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Sin planificar
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant={menu ? "outline" : "default"} className="w-full" onClick={() => onEditMenu(index)}>
                {menu ? 'Editar Menú' : 'Crear Menú'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
