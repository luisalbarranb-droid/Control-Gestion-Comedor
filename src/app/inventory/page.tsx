
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Package, DollarSign, AlertCircle, TrendingDown, TrendingUp, Search, Filter, Plus, FileSpreadsheet, Upload, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { useToast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  Timestamp,
  setDoc,
  getDocs,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


import type { InventoryItem, InventoryCategoryId, InventoryTransaction, InventoryTransactionType, UnitOfMeasure } from '@/lib/types';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryEntryForm } from '@/components/inventory/inventory-entry-form';
import { InventoryExitForm } from '@/components/inventory/inventory-exit-form';
import { InventoryImportDialog } from '@/components/inventory/inventory-import-dialog';
import { inventoryCategories } from '@/lib/placeholder-data';


type FormType = 'item' | 'entry' | 'exit' | 'import' | null;

function convertToDate(date: any): Date | null {
    if (!date) return null;
    if (date instanceof Date && isValid(date)) return date;
    if (date instanceof Timestamp) return date.toDate();
    const parsed = new Date(date);
    return isValid(parsed) ? parsed : null;
}

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isUserLoading, user } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'inventory'), orderBy('nombre', 'asc'));
  }, [firestore]);

  const { data: items, isLoading: isLoadingItems } = useCollection<InventoryItem>(inventoryQuery, { disabled: isUserLoading || !user });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategoryId | 'all'>('all');
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);


  const getCategoryName = (categoryId: InventoryCategoryId) => {
    return inventoryCategories.find(cat => cat.id === categoryId)?.nombre || 'N/A';
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
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
  
  const handleDeleteItem = async (itemId: string) => {
    if (!firestore) return;

    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción es irreversible.')) {
      try {
          const itemRef = doc(firestore, 'inventory', itemId);
          await deleteDoc(itemRef);
          toast({
              title: 'Artículo Eliminado',
              description: 'El artículo ha sido eliminado del inventario.',
          });
      } catch (e) {
          console.error("Error eliminando artículo: ", e);
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el artículo.' });
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!firestore || selectedItems.length === 0) return;
    
    try {
      const batch = writeBatch(firestore);
      selectedItems.forEach(itemId => {
        const itemRef = doc(firestore, 'inventory', itemId);
        batch.delete(itemRef);
      });
      
      await batch.commit();
      
      toast({
        title: 'Artículos Eliminados',
        description: `Se han eliminado ${selectedItems.length} artículos.`,
      });
      setSelectedItems([]);
    } catch (e) {
      console.error("Error eliminando los artículos seleccionados: ", e);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo completar el borrado seleccionado.' });
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, itemId] : prev.filter(id => id !== itemId)
    );
  };


  const handleSaveItem = async (itemData: any, isNew: boolean) => {
    if (!firestore) return;
    
    const inventoryCollection = collection(firestore, 'inventory');

    if(isNew) {
        const q = query(inventoryCollection, where("codigo", "==", itemData.codigo));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'Error', description: `El código "${itemData.codigo}" ya existe.` });
            return;
        }
    }
    
    try {
        if (isNew) {
            const newItemRef = doc(inventoryCollection);
            await setDoc(newItemRef, {
                ...itemData,
                id: newItemRef.id,
                fechaCreacion: serverTimestamp(),
                ultimaActualizacion: serverTimestamp(),
            });
            toast({ title: 'Artículo Creado', description: `El artículo "${itemData.nombre}" ha sido creado.`});
        } else if (editingItem) {
            const itemRef = doc(firestore, 'inventory', editingItem.id);
            await updateDoc(itemRef, { ...itemData, ultimaActualizacion: serverTimestamp() });
            toast({ title: 'Artículo Actualizado', description: `El artículo "${itemData.nombre}" ha sido actualizado.`});
        }
        handleCloseForm();
    } catch (e) {
        console.error("Error guardando artículo: ", e);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el artículo.' });
    }
  };
  
  const handleSaveTransaction = async (data: any, type: InventoryTransactionType) => {
    if (!firestore || !items) return;

    const batch = writeBatch(firestore);

    const transactionToast = (item: InventoryItem, quantity: number, typeLabel: string) => {
         toast({
            title: `Movimiento Registrado: ${typeLabel}`,
            description: `${quantity} ${item.unidadReceta} de ${item.nombre} han sido procesadas.`
        });
    }
    
    data.items.forEach((txItem: { itemId: string; quantity: number; }) => {
        const itemRef = doc(firestore, 'inventory', txItem.itemId);
        const item = items.find(i => i.id === txItem.itemId);
        if(item) {
            let newQuantity = item.cantidad;
            if(type === 'entrada') {
                newQuantity += txItem.quantity;
                transactionToast(item, txItem.quantity, 'Entrada');
            } else if(type === 'salida') {
                newQuantity -= txItem.quantity;
                transactionToast(item, txItem.quantity, 'Salida');
            }
            batch.update(itemRef, { cantidad: Math.max(0, newQuantity), ultimaActualizacion: serverTimestamp() });
        }
    });

    await batch.commit();
    handleCloseForm();
  };
  
  const handleImport = async (importedData: any[]) => {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay conexión o sesión activa.'});
        return;
    };

    const existingCodes = (items || []).reduce((acc, item) => {
        if(item.codigo) acc[item.codigo] = item.id;
        return acc;
    }, {} as Record<string, string>);

    const CHUNK_SIZE = 450;
    let createdCount = 0;
    let updatedCount = 0;

    try {
        for (let i = 0; i < importedData.length; i += CHUNK_SIZE) {
            const chunk = importedData.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(firestore);
            const inventoryRef = collection(firestore, 'inventory');

            chunk.forEach((row) => {
                if (!row.codigo) return;

                const itemData = {
                    nombre: String(row.nombre),
                    codigo: String(row.codigo),
                    descripcion: String(row.descripcion || ''),
                    categoriaId: row.categoriaId as InventoryCategoryId,
                    subCategoria: row.subCategoria || '',
                    cantidad: Number(row.cantidad || 0),
                    unidadReceta: (row.unidadReceta as UnitOfMeasure) || 'unidad',
                    unidadCompra: (row.unidadCompra as UnitOfMeasure) || undefined,
                    factorConversion: Number(row.factorConversion || 1),
                    stockMinimo: Number(row.stockMinimo || 0),
                    proveedor: String(row.proveedor || ''),
                    costoUnitario: Number(row.costoUnitario || 0),
                    ultimaActualizacion: serverTimestamp(),
                };

                const existingId = existingCodes[itemData.codigo];

                if (existingId) {
                    const itemRef = doc(inventoryRef, existingId);
                    batch.update(itemRef, itemData);
                    updatedCount++;
                } else {
                    const newItemRef = doc(inventoryRef);
                    batch.set(newItemRef, {
                        ...itemData,
                        id: newItemRef.id,
                        fechaCreacion: serverTimestamp(),
                    });
                    createdCount++;
                }
            });

            await batch.commit();
        }

        handleCloseForm();
        toast({
            title: "Importación Completada",
            description: `${createdCount} artículos creados y ${updatedCount} actualizados.`
        });

    } catch (e) {
        console.error("Error en la importación: ", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Falló la importación por lotes.' });
    }
  }

  const isLoading = isLoadingItems || isUserLoading;

  const totalInventoryValue = useMemo(() => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.cantidad * (item.costoUnitario || 0), 0);
  }, [items]);


  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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

      <div className="grid gap-4 md:grid-cols-4">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : items?.length || 0}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${totalInventoryValue.toFixed(2)}`}
              </div>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : items?.filter(i => i.cantidad <= i.stockMinimo && i.cantidad > 0).length || 0}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agotados</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : items?.filter(i => i.cantidad === 0).length || 0}</div></CardContent>
         </Card>
      </div>

      <Card>
         <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Listado de Artículos</CardTitle>
              {selectedItems.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar ({selectedItems.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción es irreversible y eliminará permanentemente {selectedItems.length} artículo(s) de tu inventario.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSelected}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
              )}
            </div>
          </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                onCheckedChange={handleSelectAll}
                                checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length ? true : selectedItems.length > 0 ? 'indeterminate' : false}
                                aria-label="Seleccionar todo"
                            />
                        </TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Cant. (Un. Compra)</TableHead>
                        <TableHead className="text-center">Stock Mínimo (Un. Compra)</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={7} className="h-24 text-center">Cargando inventario...</TableCell></TableRow>}
                    {!isLoading && filteredItems.map((item) => {
                        const factor = item.factorConversion || 1;
                        const quantityInPurchaseUnit = item.cantidad / factor;
                        const minStockInPurchaseUnit = item.stockMinimo / factor;
                        const isLowStock = quantityInPurchaseUnit <= minStockInPurchaseUnit;

                        return (
                        <TableRow key={item.id} data-state={selectedItems.includes(item.id) && "selected"}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedItems.includes(item.id)}
                                    onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                                    aria-label={`Seleccionar ${item.nombre}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{item.nombre}</TableCell>
                            <TableCell><Badge variant="secondary">{getCategoryName(item.categoriaId)}</Badge></TableCell>
                            <TableCell className={cn("text-center font-bold", isLowStock ? 'text-red-500' : 'text-current')}>
                                {quantityInPurchaseUnit.toFixed(2)}
                                <span className="text-xs text-muted-foreground ml-1 uppercase">{item.unidadCompra || 'N/A'}</span>
                            </TableCell>
                             <TableCell className="text-center">
                                {minStockInPurchaseUnit.toFixed(2)}
                                <span className="text-xs text-muted-foreground ml-1 uppercase">{item.unidadCompra || 'N/A'}</span>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenForm('item', item)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Ver Historial</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        );
                    })}
                     {!isLoading && filteredItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">No se encontraron artículos.</TableCell>
                        </TableRow>
                     )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <InventoryForm isOpen={activeForm === 'item'} onOpenChange={handleCloseForm} onSave={handleSaveItem} item={editingItem} />
      <InventoryImportDialog isOpen={activeForm === 'import'} onOpenChange={handleCloseForm} onImport={handleImport} />
      
      {items && (
        <>
          <InventoryEntryForm isOpen={activeForm === 'entry'} onOpenChange={handleCloseForm} onSave={(data) => handleSaveTransaction(data, 'entrada')} inventoryItems={items} />
          <InventoryExitForm isOpen={activeForm === 'exit'} onOpenChange={handleCloseForm} onSave={(data) => handleSaveTransaction(data, 'salida')} inventoryItems={items} />
        </>
      )}

    </div>
  );
}
