
'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { OrderForm } from '@/components/inventory/order-form';
import { inventoryItems } from '@/lib/placeholder-data';
import { useToast } from '@/components/ui/toast';

const initialOrders = [
  { id: 'PED-001', proveedor: 'Distribuidora Los Andes', fecha: '2024-05-20', items: 15, total: '$450.00', estado: 'completado' },
  { id: 'PED-002', proveedor: 'Carnes del Centro', fecha: '2024-05-22', items: 4, total: '$120.50', estado: 'pendiente' },
  { id: 'PED-003', proveedor: 'Verduras Frescas SA', fecha: '2024-05-23', items: 8, total: '$85.00', estado: 'en_camino' },
];

export default function InventoryOrdersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const { toast } = useToast();

  const handleCreateOrder = (newOrderData: any) => {
    const newOrder = {
        id: `PED-00${orders.length + 1}`,
        proveedor: newOrderData.proveedor === 'nuevo' ? 'Proveedor Nuevo' : newOrderData.proveedor,
        fecha: newOrderData.fechaPedido.toISOString().split('T')[0],
        items: newOrderData.items.length,
        total: '$0.00',
        estado: 'pendiente'
    };
    
    setOrders([newOrder, ...orders]);
    
    toast({
        title: "Pedido Creado",
        description: `Orden ${newOrder.id} generada correctamente.`,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/inventory">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <h1 className="font-headline text-2xl font-bold md:text-3xl">
                    Pedidos de Abastecimiento
                </h1>
                <p className="text-gray-500">Gestiona las compras y recepciones.</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => setIsFormOpen(true)}
            >
                <Plus className="h-4 w-4" />
                Crear Nuevo Pedido
            </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-white border rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                <Clock className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.estado === 'pendiente').length}</p>
            </div>
        </div>
        <div className="p-6 bg-white border rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">En Camino</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.estado === 'en_camino').length}</p>
            </div>
        </div>
        <div className="p-6 bg-white border rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <CheckCircle className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">Recibidos</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.estado === 'completado').length}</p>
            </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                    <tr>
                        <th className="p-4">ID Pedido</th>
                        <th className="p-4">Proveedor</th>
                        <th className="p-4">Fecha Solicitud</th>
                        <th className="p-4 text-center">Items</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-xs font-medium">{order.id}</td>
                            <td className="p-4 font-medium">{order.proveedor}</td>
                            <td className="p-4 text-gray-500">{order.fecha}</td>
                            <td className="p-4 text-center">{order.items}</td>
                            <td className="p-4 text-right font-mono">{order.total}</td>
                            <td className="p-4 text-center">
                                {order.estado === 'completado' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Recibido</Badge>}
                                {order.estado === 'pendiente' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0">Pendiente</Badge>}
                                {order.estado === 'en_camino' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">En Camino</Badge>}
                            </td>
                            <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" className="text-blue-600">Ver</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Componente del Formulario */}
      <OrderForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSave={handleCreateOrder}
        inventoryItems={inventoryItems} // Pasamos los items de ejemplo para el selector
      />

    </div>
  );
}
