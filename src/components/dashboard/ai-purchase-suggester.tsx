
'use client';

import { useState, useTransition } from 'react';
import { ShoppingCart, Loader2, Sparkles, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { aiRecommendPurchases, type AIRecommendPurchasesOutput } from '@/ai/flows/ai-recommend-purchases';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AIPurchaseSuggesterProps {
    inventoryItems: InventoryItem[];
}

export function AIPurchaseSuggester({ inventoryItems }: AIPurchaseSuggesterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [recommendations, setRecommendations] = useState<AIRecommendPurchasesOutput | null>(null);
    const { toast } = useToast();

    const handleRecommend = () => {
        const lowStockItems = inventoryItems
            .filter(item => item.cantidad <= item.stockMinimo)
            .map(item => ({
                id: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                stockMinimo: item.stockMinimo,
                unidadReceta: item.unidadReceta,
                categoriaId: item.categoriaId
            }));

        if (lowStockItems.length === 0) {
            toast({
                title: 'Inventario Saludable',
                description: 'No hay artículos por debajo del stock mínimo actualmente.',
            });
            return;
        }

        startTransition(async () => {
            try {
                const result = await aiRecommendPurchases({ lowStockItems });
                setRecommendations(result);
                setIsOpen(true);
            } catch (error) {
                console.error('Error in AI Recommendations:', error);
                toast({
                    title: 'Error de IA',
                    description: 'No se pudieron generar las sugerencias. Inténtalo de nuevo.',
                    variant: 'destructive',
                });
            }
        });
    };

    const priorityColor: Record<string, string> = {
        critica: 'bg-red-100 text-red-800 border-red-200',
        alta: 'bg-orange-100 text-orange-800 border-orange-200',
        media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        baja: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant="outline"
                onClick={handleRecommend}
                disabled={isPending}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 text-blue-700 font-semibold"
            >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-blue-600" />}
                Sugerir Compras con IA
            </Button>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Lista de Compras Inteligente
                    </DialogTitle>
                    <DialogDescription>
                        Análisis de stock crítico realizado por la IA para garantizar el servicio.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Sugerencia</TableHead>
                                <TableHead>Prioridad</TableHead>
                                <TableHead>Razonamiento de la IA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recommendations?.map((rec) => (
                                <TableRow key={rec.itemId}>
                                    <TableCell className="font-medium">{rec.nombre}</TableCell>
                                    <TableCell className="text-center font-bold text-blue-700">
                                        +{rec.cantidadSugerida}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(priorityColor[rec.prioridad], 'capitalize')}>
                                            {rec.prioridad}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground leading-snug">
                                        {rec.mensaje}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cerrar</Button>
                    <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Lista de Compras
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
