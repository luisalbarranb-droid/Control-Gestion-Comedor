
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MenuItem, InventoryItem as TInventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface MenuItemCardProps {
  menuItem: MenuItem;
  pax: number;
  inventoryItems: TInventoryItem[];
}

const categoryDisplay: Record<string, { label: string; className: string }> = {
    entrada: { label: 'Entrada', className: 'bg-blue-100 text-blue-800' },
    proteico: { label: 'Proteico', className: 'bg-red-100 text-red-800' },
    acompanante1: { label: '1er Acompañante', className: 'bg-green-100 text-green-800' },
    acompanante2: { label: '2do Acompañante', className: 'bg-yellow-100 text-yellow-800' },
    acompanante3: { label: '3er Acompañante', className: 'bg-purple-100 text-purple-800' },
    bebida: { label: 'Bebida', className: 'bg-indigo-100 text-indigo-800' },
    postre: { label: 'Postre', className: 'bg-pink-100 text-pink-800' },
}

export function MenuItemCard({ menuItem, pax, inventoryItems }: MenuItemCardProps) {
  const getInventoryItem = (id: string) => inventoryItems?.find(i => i.id === id);
  const { label, className } = categoryDisplay[menuItem.category];
  const isLoading = !inventoryItems;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
             <CardTitle>{menuItem.name}</CardTitle>
             <Badge className={cn('capitalize', className)}>{label}</Badge>
        </div>
        <CardDescription>Detalle de ingredientes para {pax} personas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingrediente</TableHead>
              <TableHead className="text-right">Requerido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={2} className="text-center">Cargando ingredientes...</TableCell></TableRow>}
            {!isLoading && menuItem.ingredients.map((ingredient, index) => {
              const itemInfo = getInventoryItem(ingredient.inventoryItemId);
              if (!itemInfo) return (
                 <TableRow key={index}>
                    <TableCell className="font-medium text-red-500">Ingrediente no encontrado</TableCell>
                    <TableCell className="text-right font-mono">
                      -
                    </TableCell>
                  </TableRow>
              );
              
              const netQuantityPerPax = ingredient.quantity;
              const wasteFactor = Math.max(0, Math.min(1, ingredient.wasteFactor || 0));
              const grossQuantityPerPax = wasteFactor === 1 ? netQuantityPerPax : netQuantityPerPax / (1 - wasteFactor);
              const totalRequired = grossQuantityPerPax * pax;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{itemInfo.nombre}</TableCell>
                  <TableCell className="text-right font-mono">
                    {totalRequired.toFixed(2)} <span className="uppercase text-muted-foreground">{itemInfo.unidadReceta}</span>
                  </TableCell>
                </TableRow>
              );
            })}
             {!isLoading && menuItem.ingredients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Sin ingredientes definidos.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
