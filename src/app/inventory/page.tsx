'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  MoreVertical,
  Package 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Datos de ejemplo para la demo
const inventoryItems = [
  { id: 'INS-001', name: 'Arroz Blanco Premium', category: 'Granos', stock: 50, unit: 'kg', min: 20, lastUpdate: 'Hoy, 08:30' },
  { id: 'INS-002', name: 'Aceite Vegetal 1L', category: 'Aceites', stock: 12, unit: 'un', min: 15, lastUpdate: 'Ayer' },
  { id: 'INS-003', name: 'Pollo Entero', category: 'Cárnicos', stock: 0, unit: 'kg', min: 10, lastUpdate: '02/12/2025' },
  { id: 'INS-004', name: 'Pasta Larga', category: 'Granos', stock: 45, unit: 'kg', min: 10, lastUpdate: 'Hoy, 09:00' },
  { id: 'INS-005', name: 'Tomate Perita', category: 'Vegetales', stock: 5, unit: 'kg', min: 8, lastUpdate: 'Hoy, 07:15' },
];

export default function InventoryPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      
      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold md:text-3xl">Gestión de Inventario</h1>
          <p className="text-gray-500">Control de stock y movimientos de almacén.</p>
        </div>
      </div>

      {/* Barra de Herramientas */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-1 gap-2 w-full xl:w-auto">
            <div className="relative flex-1 md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                type="search"
                placeholder="Buscar artículos..."
                className="pl-8 bg-gray-50"
                />
            </div>
            <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
            </Button>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
            <Button variant="outline" asChild>
                <Link href="/inventory/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Pedidos
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/inventory/reports">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Reportes
                </Link>
            </Button>
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar Excel
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Acciones
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Crear Nuevo</DropdownMenuLabel>
                    <DropdownMenuItem>Registrar Entrada</DropdownMenuItem>
                    <DropdownMenuItem>Registrar Salida</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Nuevo Artículo</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid gap-4 md:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">8</div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <span className="text-muted-foreground font-bold">$</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$612.00</div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
                <div className="h-2 w-2 rounded-full bg-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-orange-600">2</div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agotados</CardTitle>
                <div className="h-2 w-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">1</div>
            </CardContent>
         </Card>
      </div>

      {/* Tabla de Inventario */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                    <tr>
                        <th className="p-4">Artículo</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4 text-right">Cantidad</th>
                        <th className="p-4 text-right">U. Medida</th>
                        <th className="p-4 text-right">Stock Mínimo</th>
                        <th className="p-4 text-right">Últ. Act.</th>
                        <th className="p-4 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {inventoryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{item.id}</div>
                            </td>
                            <td className="p-4">
                                <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-700">
                                    {item.category}
                                </Badge>
                            </td>
                            <td className={`p-4 text-right font-bold ${
                                item.stock === 0 ? 'text-red-600' : 
                                item.stock <= item.min ? 'text-orange-600' : 'text-gray-900'
                            }`}>
                                {item.stock}
                            </td>
                            <td className="p-4 text-right text-gray-500">{item.unit}</td>
                            <td className="p-4 text-right text-gray-500">{item.min}</td>
                            <td className="p-4 text-right text-gray-500">{item.lastUpdate}</td>
                            <td className="p-4 text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}