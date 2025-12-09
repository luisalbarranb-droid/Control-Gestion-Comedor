
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';
import { IngredientSummary, exportSummaryToCSV } from '@/lib/menu-utils';

interface IngredientSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  summary: IngredientSummary[];
}

export function IngredientSummaryDialog({ isOpen, onOpenChange, summary }: IngredientSummaryDialogProps) {
  const totalCost = summary.reduce((acc, item) => acc + item.cost, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resumen de Ingredientes para la Semana</DialogTitle>
          <DialogDescription>
            Lista consolidada de todos los ingredientes necesarios, aplicando los factores de desecho.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead className="text-right">Cant. Neta</TableHead>
                <TableHead className="text-right">Cant. a Comprar</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Costo Estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.netQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold">{item.grossQuantity.toFixed(2)}</TableCell>
                  <TableCell className="uppercase">{item.unit}</TableCell>
                  <TableCell className="text-right font-mono">${item.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter className="sm:justify-between items-center">
            <div className="font-bold text-lg">
                Costo Total Estimado: <span className="text-primary font-mono">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                <Button onClick={() => exportSummaryToCSV(summary)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Lista de Compras (CSV)
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
