'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, Utensils } from 'lucide-react';
import type { Menu, MenuItem, MenuItemCategory, MealType } from '@/lib/types';
import { categoryDisplay } from '@/components/daily-closing/category-display';

interface MenuSummaryCardProps {
  menu: Menu;
}

const mealTypeLabels: Record<MealType, string> = {
    desayuno: "Desayuno",
    almuerzo: "Almuerzo",
    cena: "Cena",
    merienda: "Merienda",
    especial: "Plato Especial",
    otro: "Otro"
};

const categoryOrder: MenuItemCategory[] = ['entrada', 'proteico', 'acompanante1', 'acompanante2', 'acompanante3', 'bebida', 'postre'];

export function MenuSummaryCard({ menu }: MenuSummaryCardProps) {
  const menuTitle = menu.name || (menu.time ? mealTypeLabels[menu.time] : "Menú");
  
  return (
    <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-primary/20 overflow-hidden shadow-sm">
      <CardHeader className="p-2 pb-1">
         <div className="flex justify-between items-center">
            <span className="font-bold text-primary text-xs flex items-center gap-1"><Utensils className="w-3 h-3"/> {menuTitle}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                <Users className="w-3 h-3" />
                <span>{menu.pax} PAX</span>
            </div>
         </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ul className="space-y-0.5">
           {categoryOrder.map(category => {
              const item = menu.items.find(i => i.category === category);
              const displayInfo = categoryDisplay[category] || { label: category };
              return (
                 <li key={category} className="flex justify-between items-center text-[10px] leading-tight gap-1">
                    <span className="font-semibold text-muted-foreground whitespace-nowrap capitalize">{displayInfo.label.replace('Acompañante', 'Acomp.')}:</span>
                    <span className="text-right truncate">{item?.name || 'N/A'}</span>
                 </li>
              )
           })}
        </ul>
      </CardContent>
    </Card>
  );
}
