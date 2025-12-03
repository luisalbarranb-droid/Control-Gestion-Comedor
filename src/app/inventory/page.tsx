'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { MainNav } from '@/components/dashboard/main-nav';
import { MoreHorizontal, SquareCheck, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  inventoryCategories,
} from '@/lib/placeholder-data';
import type { InventoryItem, InventoryCategoryId, UnitOfMeasure } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { InventoryHeader } from '@/components/inventory/inventory-header';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryEntryForm } from '@/components/inventory/inventory-entry-form';
import { InventoryExitForm } from '@/components/inventory/inventory-exit-form';
import { InventoryImportDialog } from '@/components/inventory/inventory-import-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';


export default function InventoryPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  
  const itemsCollectionRef = useMemoFirebase(
    () => (firestore && authUser ? collection(firestore, 'inventory') : null),
    [firestore, authUser]
  );
  const { data: items, isLoading } = useCollection<InventoryItem>(itemsCollectionRef);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isEntryFormOpen, setEntryFormOpen] = useState(false);
  const [isExitFormOpen, setExitFormOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategoryId | 'all'>('all');

  const getCategoryName = (categoryId: InventoryCategoryId) => {
    return inventoryCategories.find(cat => cat.id === categoryId)?.nombre || 'N/A';
  }

  const handleCreate = (newItem: Omit<InventoryItem, 'id' | 'fechaCreacion' | 'ultimaActualizacion'>) => {
    if (!firestore) return;
    const docRef = doc(collection(firestore, 'inventory'));
    const fullNewItem = {
      ...newItem,
      id: docRef.id,
      fechaCreacion: serverTimestamp(),
      ultimaActualizacion: serverTimestamp(),
    };
    setDocumentNonBlocking(docRef, fullNewItem, { merge: false });
    setFormOpen(false);
  };

  const handleUpdate = (updatedItem: InventoryItem) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'inventory', updatedItem.id);
    const dataToUpdate = {
        ...updatedItem,
        ultimaActualizacion: serverTimestamp()
    };
    setDocumentNonBlocking(docRef, dataToUpdate, { merge: true });
    setFormOpen(false);
    setSelectedItem(null);
  };
  
  const handleStockEntry = (entryData: { items: { itemId: string, quantity: number }[] }) => {
    if (!firestore || !items) return;
    entryData.items.forEach(entry => {
      const itemDocRef = doc(firestore, 'inventory', entry.itemId);
      const currentItem = items.find(i => i.id === entry.itemId);
      if (currentItem) {
        const newQuantity = currentItem.cantidad + entry.quantity;
        updateDocumentNonBlocking(itemDocRef, { 
          cantidad: newQuantity,
          ultimaActualizacion: serverTimestamp()
        });
      }
    });
    setEntryFormOpen(false);
    toast({ title: "Entrada registrada", description: "El stock ha sido actualizado." });
  };

  const handleStockExit = (exitData: { items: { itemId: string, quantity: number }[] }) => {
     if (!firestore || !items) return;
     exitData.items.forEach(entry => {
        const itemDocRef = doc(firestore, 'inventory', entry.itemId);
        const currentItem = items.find(i => i.id === entry.itemId);
        if (currentItem) {
            const newQuantity = currentItem.cantidad - entry.quantity;
            updateDocumentNonBlocking(itemDocRef, { 
              cantidad: newQuantity,
              ultimaActualizacion: serverTimestamp()
            });
        }
    });
    setExitFormOpen(false);
    toast({ title: "Salida registrada", description: "El stock ha sido actualizado." });
  };

  const handleImport = (importedData: any[]) => {
    if (!firestore || !items) return;
    
    let newItemsCount = 0;
    let updatedItemsCount = 0;

    importedData.forEach(importedItem => {
      const existingItem = items.find(i => i.nombre.toLowerCase() === importedItem.nombre?.toLowerCase());
      
      const itemData = {
          nombre: importedItem.nombre,
          descripcion: importedItem.descripcion,
          categoriaId: importedItem.categoriaId as InventoryCategoryId,
          cantidad: Number(importedItem.cantidad) || 0,
          unidad: importedItem.unidad as UnitOfMeasure,
          stockMinimo: Number(importedItem.stockMinimo) || 0,
          proveedor: importedItem.proveedor,
          costoUnitario: Number(importedItem.costoUnitario) || 0,
          ultimaActualizacion: serverTimestamp(),
      };

      if (existingItem) {
        const itemDocRef = doc(firestore, 'inventory', existingItem.id);
        updateDocumentNonBlocking(itemDocRef, {
            ...itemData,
            cantidad: existingItem.cantidad + itemData.cantidad
        });
        updatedItemsCount++;
      } else {
        const newItemDocRef = doc(collection(firestore, 'inventory'));
        setDocumentNonBlocking(newItemDocRef, {
          ...itemData,
          id: newItemDocRef.id,
          fechaCreacion: serverTimestamp(),
        }, { merge: false });
        newItemsCount++;
      }
    });

    toast({
      title: "Importación Completada",
      description: `${newItemsCount} artículos nuevos creados y ${updatedItemsCount} artículos actualizados.`,
    });
    setImportOpen(false);
  };


  const openForm = (item: InventoryItem | null = null) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const filteredItems = items
    ?.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item =>
      categoryFilter === 'all' || item.categoriaId === categoryFilter
    ) || [];

    if (isLoading && !items) {
      return (
          <div className="min-h-screen w-full flex items-center justify-center">
              <p>Cargando inventario...</p>
          </div>
      )
    }

  return (
    <div className="min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 justify-center flex items-center gap-2">
          <SquareCheck className="size-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Comedor</h1>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <InventoryHeader
            onAddItem={() => openForm()}
            onAddEntry={() => setEntryFormOpen(true)}
            onAddExit={() => setExitFormOpen(true)}
            onImport={() => setImportOpen(true)}
            onSearch={setSearchQuery}
            onFilterChange={setCategoryFilter}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
          />
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artículo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="hidden md:table-cell">U. Medida</TableHead>
                    <TableHead className="hidden sm:table-cell">Stock Mínimo</TableHead>
                    <TableHead className="hidden lg:table-cell">Últ. Act.</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => {
                    const isLowStock = item.cantidad <= item.stockMinimo;
                    const lastUpdate = item.ultimaActualizacion?.toDate ? item.ultimaActualizacion.toDate() : new Date();
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isLowStock && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <span>{item.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getCategoryName(item.categoriaId)}</Badge>
                        </TableCell>
                        <TableCell className={cn("text-right font-mono", isLowStock && "text-red-500 font-bold")}>
                          {item.cantidad}
                        </TableCell>
                        <TableCell className="hidden md:table-cell uppercase">{item.unidad}</TableCell>
                        <TableCell className="hidden sm:table-cell font-mono">{item.stockMinimo}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(lastUpdate, 'dd/MM/yy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openForm(item)}>
                                Editar Artículo
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setEntryFormOpen(true)}>
                                Registrar Entrada
                              </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExitFormOpen(true)}>
                                Registrar Salida
                              </DropdownMenuItem>
                              <DropdownMenuItem>Ver Historial</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <InventoryForm 
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onSave={selectedItem ? handleUpdate : handleCreate}
        item={selectedItem}
      />

      <InventoryEntryForm
        isOpen={isEntryFormOpen}
        onOpenChange={setEntryFormOpen}
        onSave={handleStockEntry}
        inventoryItems={items || []}
      />

      <InventoryExitForm
        isOpen={isExitFormOpen}
        onOpenChange={setExitFormOpen}
        onSave={handleStockExit}
        inventoryItems={items || []}
      />

       <InventoryImportDialog
        isOpen={isImportOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
    </div>
  );
}
