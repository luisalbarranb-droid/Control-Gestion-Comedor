'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Drumstick } from 'lucide-react';
import type { Menu } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MenuSummaryCardProps {
  menu: Menu;
}

export function MenuSummaryCard({ menu }: MenuSummaryCardProps) {
  const proteico = menu.items.find(item => item.category === 'proteico');

  return (
    <Card className="h-full bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-primary/20">
      <CardHeader className="p-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{menu.pax}</span>
          </div>
           {proteico && <Drumstick className="w-3 h-3" />}
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xs font-bold leading-tight line-clamp-2">
          {proteico?.name || 'Menú sin proteico'}
        </p>
      </CardContent>
    </Card>
  );
}
