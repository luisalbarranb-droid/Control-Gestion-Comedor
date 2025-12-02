'use client';

import { Salad, Soup, Drumstick, Users } from 'lucide-react';
import type { Menu } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface MenuSummaryCardProps {
  menu: Menu;
}

const categoryIcons: Record<string, React.ElementType> = {
    entrada: Soup,
    proteico: Drumstick,
    acompanante1: Salad,
    acompanante2: Salad,
    acompanante3: Salad,
}

export function MenuSummaryCard({ menu }: MenuSummaryCardProps) {
  const proteico = menu.items.find(item => item.category === 'proteico');
  const accompanimentsCount = menu.items.filter(item => item.category.startsWith('acompanante')).length;

  return (
    <Card className="h-full bg-card/80 hover:bg-card transition-colors cursor-pointer flex flex-col">
      <CardHeader className="p-2">
        {proteico ? (
            <CardTitle className="text-sm font-semibold">{proteico.name}</CardTitle>
        ) : (
            <CardTitle className="text-sm font-semibold text-muted-foreground italic">Sin plato fuerte</CardTitle>
        )}
        {proteico && accompanimentsCount > 0 && (
          <CardDescription className="text-xs">
            + {accompanimentsCount} acompañante{accompanimentsCount > 1 ? 's' : ''}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-2 flex-grow">
         <div className="flex flex-wrap gap-1">
            {menu.items.slice(0, 3).map(item => {
                 const Icon = categoryIcons[item.category];
                 if (!Icon) return null;
                 return <Icon key={item.menuItemId} className="w-4 h-4 text-muted-foreground" />
            })}
        </div>
      </CardContent>
      <CardFooter className="p-2">
        <Badge variant="secondary" className="w-full justify-center">
            <Users className="w-3 h-3 mr-1.5" />
            {menu.pax} PAX
        </Badge>
      </CardFooter>
    </Card>
  );
}
