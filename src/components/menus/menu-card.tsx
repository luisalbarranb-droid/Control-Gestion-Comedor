'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Calendar, MoreVertical, FileText } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
  const sortedItems = [...menu.items].sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
  const menuDateObj = menu.date.toDate ? menu.date.toDate() : new Date(menu.date);
  const menuDate = format(menuDateObj, 'yyyy-MM-dd');

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <CardTitle className="capitalize text-lg">
                Menú del {format(menuDateObj, 'EEEE, dd MMMM, yyyy', { locale: es })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <CardDescription>{menu.pax} Comensales (PAX)</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar Menú</DropdownMenuItem>
              <DropdownMenuItem>Duplicar Menú</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedItems.map(item => (
            <MenuItemCard key={item.menuItemId} menuItem={item} pax={menu.pax} />
          ))}
          {sortedItems.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-40 border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Este menú aún no tiene platos asignados.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Ver Necesidades de Compra</Button>
         <Button asChild>
          <Link href={`/menus/report?date=${menuDate}`}>
            <FileText className="mr-2 h-4 w-4" />
            Ver Reporte
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    