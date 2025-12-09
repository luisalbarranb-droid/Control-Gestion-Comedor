'use client';

import { useState } from 'react';
import { SquareCheck, PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { inventoryOrders as initialOrders, inventoryItems } from '@/lib/placeholder-data';
import type { InventoryOrder, OrderStatus, InventoryOrderItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { OrderForm } from '@/components/inventory/order-form';
import { useToast } from '@/components/ui/toast';

const statusVariant: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export default function InventoryOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<InventoryOrder[]>(initialOrders);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleCreateOrder = (orderData: Omit<InventoryOrder, 'orderId' | 'creadoPor' | 'costoTotal'> & { items: Omit<InventoryOrderItem, 'nombre' | 'costo'>[] }) => {
    const newItems = orderData.items.map(item => {
        const fullItem = inventoryItems.find(i => i.id === item.itemId);
        return {
            ...item,
            nombre: fullItem?.nombre || 'N/A',
            costo: (fullItem?.costoUnitario || 0) * item.quantity,
            unit: fullItem?.unidad || 'unidad'
        }
    });

    const costoTotal = newItems.reduce((acc, item) => acc + item.costo, 0);
    
    const newOrder: InventoryOrder = {
        ...orderData,
        orderId: `ord-${Date.now()}`,
        creadoPor: 'user-admin-1', // Placeholder
        items: newItems,
        costoTotal,
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setFormOpen(false);
    toast({
      title: 'Pedido Creado',
      description: `El pedido ${newOrder.orderId} para ${newOrder.proveedor} ha sido creado.`,
    });
  };

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="font-headline text-2xl font-bold md:text-3xl">
            Pedidos de Inventario
          </h1>
          <Button onClick={() => setFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Pedido
          </Button>
        </div>
        <Card>
          <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>Visualiza y gestiona todos los pedidos a proveedores.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha Pedido</TableHead>
                  <TableHead>Entrega Estimada</TableHead>
                  <TableHead className="text-right">Costo Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium uppercase">{order.orderId}</TableCell>
                    <TableCell>{order.proveedor}</TableCell>
                    <TableCell>{format(new Date(order.fechaPedido), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(order.fechaEntregaEstimada), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right font-mono">${order.costoTotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', statusVariant[order.estado])}>
                        {order.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      
        <OrderForm 
          isOpen={isFormOpen}
          onOpenChange={setFormOpen}
          onSave={handleCreateOrder}
          inventoryItems={inventoryItems}
        />
      </main>
  );
}
