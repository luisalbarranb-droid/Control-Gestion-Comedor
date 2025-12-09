
'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Package, DollarSign, AlertCircle, TrendingDown, TrendingUp, Search, Filter, Plus, FileSpreadsheet, Upload, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast';

import { inventoryItems as initialItems, inventoryCategories } from '@/lib/placeholder-data';
import type { InventoryItem, InventoryCategoryId, InventoryTransaction, InventoryTransactionType, UnitOfMeasure } from '@/lib/types';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryEntryForm } from '@/components/inventory/inventory-entry-form';
import { InventoryExitForm } from '@/components/inventory/inventory-exit-form';
import { InventoryImportDialog } from '@/components/inventory/inventory-import-dialog';

type FormType = 'item' | 'entry' | 'exit' | 'import' | null;

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategoryId | 'all'>('all');
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const getCategoryName = (categoryId: InventoryCategoryId) => {
    return inventoryCategories.find(cat => cat.id === categoryId)?.nombre || 'N/A';
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.categoriaId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const handleOpenForm = (formType: FormType, item: InventoryItem | null = null) => {
    setEditingItem(item);
    setActiveForm(formType);
  };
  
  const handleCloseForm = () => {
    setEditingItem(null);
    setActiveForm(null);
  }

  const handleSaveItem = (itemData: any) => {
    const now = new Date().toISOString();
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData, ultimaActualizacion: now } : i));
    } else {
      const newItem: InventoryItem = {
        ...itemData,
        id: `inv-${Date.now()}`,
        fechaCreacion: now,
        ultimaActualizacion: now,
      };
      setItems(prev => [newItem, ...prev]);
    }
    handleCloseForm();
  };
  
  const handleSaveTransaction = (data: any, type: InventoryTransactionType) => {
     const transactionToast = (item: InventoryItem, quantity: number, typeLabel: string) => {
         toast({
            title: `Movimiento Registrado: ${typeLabel}`,
            description: `${quantity} ${item.unidad} de ${item.nombre} han sido procesadas.`
        });
     }
    
    setItems(prevItems => {
        const now = new Date().toISOString();
        let itemsUpdated = [...prevItems];
        data.items.forEach((txItem: { itemId: string; quantity: number; }) => {
            const itemIndex = itemsUpdated.findIndex(i => i.id === txItem.itemId);
            if(itemIndex > -1) {
                const item = itemsUpdated[itemIndex];
                let newQuantity = item.cantidad;
                if(type === 'entrada') {
                    newQuantity += txItem.quantity;
                    transactionToast(item, txItem.quantity, 'Entrada');
                } else if(type === 'salida') {
                    newQuantity -= txItem.quantity;
                    transactionToast(item, txItem.quantity, 'Salida');
                }
                itemsUpdated[itemIndex] = { ...item, cantidad: Math.max(0, newQuantity), ultimaActualizacion: now };
            }
        });
        return itemsUpdated;
    });
    handleCloseForm();
  };
  
  const handleImport = (importedData: any[]) => {
     try {
        const now = new Date().toISOString();
        const newItems: InventoryItem[] = importedData.map((row: any) => ({
            id: `inv-${Date.now()}-${Math.random()}`,
            nombre: String(row.nombre),
            descripcion: String(row.descripcion || ''),
            categoriaId: row.categoriaId as InventoryCategoryId,
            cantidad: Number(row.cantidad),
            unidad: row.unidad as UnitOfMeasure,
            stockMinimo: Number(row.stockMinimo),
            proveedor: String(row.proveedor || ''),
            costoUnitario: Number(row.costoUnitario || 0),
            fechaCreacion: now,
            ultimaActualizacion: now,
        }));
        
        // Simple merge: for now, we just add new items. A real-world scenario might update existing ones.
        setItems(prev => [...prev, ...newItems]);
        handleCloseForm();
        toast({
            title: "Importación Exitosa",
            description: `${newItems.length} artículos han sido añadidos al inventario.`
        })

     } catch(e) {
        toast({ variant: 'destructive', title: 'Error de Importación', description: 'El formato de los datos es incorrecto.' });
     }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-headline text-2xl font-bold md:text-3xl">Gestión de Inventario</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar artículos..."
                    className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {inventoryCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="secondary" asChild>
                <Link href="/inventory/orders"><ShoppingCart className="mr-2 h-4 w-4"/> Pedidos</Link>
            </Button>
            <Button variant="secondary" asChild>
                <Link href="/inventory/reports"><FileSpreadsheet className="mr-2 h-4 w-4" />Reportes</Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Acciones</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenForm('entry')}><TrendingUp className="mr-2 h-4 w-4" />Registrar Entrada</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenForm('exit')}><TrendingDown className="mr-2 h-4 w-4" />Registrar Salida</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOpenForm('item')}><Package className="mr-2 h-4 w-4" />Nuevo Artículo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenForm('import')}><Upload className="mr-2 h-4 w-4" />Importar desde Excel</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Resumen KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{items.length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">${items.reduce((sum, item) => sum + item.cantidad * (item.costoUnitario || 0), 0).toFixed(2)}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{items.filter(i => i.cantidad <= i.stockMinimo && i.cantidad > 0).length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agotados</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{items.filter(i => i.cantidad === 0).length}</div></CardContent>
         </Card>
      </div>

      {/* Tabla de Inventario */}
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Artículo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Stock Mínimo</TableHead>
                        <TableHead>Últ. Act.</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nombre}</TableCell>
                            <TableCell><Badge variant="secondary">{getCategoryName(item.categoriaId)}</Badge></TableCell>
                            <TableCell className={cn("text-right font-bold", item.cantidad <= item.stockMinimo ? 'text-red-500' : 'text-current')}>{item.cantidad.toFixed(2)} {item.unidad}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.stockMinimo} {item.unidad}</TableCell>
                            <TableCell className="text-muted-foreground">{format(new Date(item.ultimaActualizacion), 'dd/MM/yy HH:mm')}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenForm('item', item)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Ver Historial</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                     {filteredItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">No se encontraron artículos.</TableCell>
                        </TableRow>
                     )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {/* Forms */}
      <InventoryForm isOpen={activeForm === 'item'} onOpenChange={handleCloseForm} onSave={handleSaveItem} item={editingItem} />
      <InventoryEntryForm isOpen={activeForm === 'entry'} onOpenChange={handleCloseForm} onSave={(data) => handleSaveTransaction(data, 'entrada')} inventoryItems={items} />
      <InventoryExitForm isOpen={activeForm === 'exit'} onOpenChange={handleCloseForm} onSave={(data) => handleSaveTransaction(data, 'salida')} inventoryItems={items} />
      <InventoryImportDialog isOpen={activeForm === 'import'} onOpenChange={handleCloseForm} onImport={handleImport} />

    </div>
  );
}
