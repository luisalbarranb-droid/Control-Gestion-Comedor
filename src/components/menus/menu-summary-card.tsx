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

   const items = Array.isArray(menu.items) ? menu.items : [];

   // Try category-based display first
   const itemsByCategory = categoryOrder
      .map(category => {
         const item = items.find(i => i.category === category);
         const displayInfo = categoryDisplay[category] || { label: category, className: '' };
         return { category, item, displayInfo };
      })
      .filter(({ item }) => !!item);

   // If no items matched by category but items exist, show them directly
   const hasUnmatchedItems = itemsByCategory.length === 0 && items.length > 0;

   return (
      <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-primary/20 overflow-hidden shadow-sm">
         <CardHeader className="p-2 pb-1">
            <div className="flex justify-between items-center">
               <span className="font-bold text-primary text-xs flex items-center gap-1"><Utensils className="w-3 h-3" /> {menuTitle}</span>
               <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                  <Users className="w-3 h-3" />
                  <span>{menu.pax} PAX</span>
               </div>
            </div>
         </CardHeader>
         <CardContent className="p-2 pt-0">
            {itemsByCategory.length > 0 ? (
               <ul className="space-y-0.5">
                  {itemsByCategory.map(({ category, item, displayInfo }) => (
                     <li key={category} className="flex items-baseline gap-1 text-[11px] leading-tight">
                        <span className="font-semibold text-muted-foreground whitespace-nowrap">{displayInfo.label.replace('1er Acompañante', '1er Acomp.').replace('2do Acompañante', '2do Acomp.').replace('3er Acompañante', '3er Acomp.')}:</span>
                        <span className="font-medium truncate">{item?.name}</span>
                     </li>
                  ))}
               </ul>
            ) : hasUnmatchedItems ? (
               <ul className="space-y-0.5">
                  {items.map((item, idx) => {
                     const displayInfo = categoryDisplay[item.category] || { label: item.category || 'Plato', className: '' };
                     return (
                        <li key={item.id || idx} className="flex items-baseline gap-1 text-[11px] leading-tight">
                           <span className="font-semibold text-muted-foreground whitespace-nowrap capitalize">{displayInfo.label}:</span>
                           <span className="font-medium truncate">{item.name}</span>
                        </li>
                     );
                  })}
               </ul>
            ) : (
               <p className="text-[10px] text-muted-foreground italic">Sin platos asignados</p>
            )}
         </CardContent>
      </Card>
   );
}
