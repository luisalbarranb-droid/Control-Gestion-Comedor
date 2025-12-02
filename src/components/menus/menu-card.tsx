'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Menu, MenuItemCategory } from '@/lib/types';
import { MenuItemCard } from './menu-item-card';

interface MenuCardProps {
  menu: Menu;
}

const categoryOrder: MenuItemCategory[] = [
    'entrada',
    'proteico',
    'acompanante1',
    'acompanante2',
    'acompanante3',
    'bebida',
    'postre'
];


export function MenuCard({ menu }: MenuCardProps) {

  const sortedItems = menu.items.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <CardTitle className="capitalize">
                    Menú del {format(menu.date, 'EEEE, dd MMMM, yyyy', { locale: es })}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <CardDescription>{menu.pax} Comensales (PAX)</CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map(item => (
                <MenuItemCard key={item.menuItemId} menuItem={item} pax={menu.pax} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
