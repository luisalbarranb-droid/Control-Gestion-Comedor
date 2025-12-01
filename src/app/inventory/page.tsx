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
import { SquareCheck, MoreHorizontal, AlertCircle } from 'lucide-react';
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
  inventoryItems as initialItems,
  inventoryCategories,
} from '@/lib/placeholder-data';
import type { InventoryItem, InventoryCategoryId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { InventoryHeader } from '@/components/inventory/inventory-header';
import { InventoryForm } from '@/components/inventory/inventory-form';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategoryId | 'all'>('all');

  const getCategoryName = (categoryId: InventoryCategoryId) => {
    return inventoryCategories.find(cat => cat.id === categoryId)?.nombre || 'N/A';
  }

  const handleCreate = (newItem: Omit<InventoryItem, 'itemId' | 'fechaCreacion' | 'ultimaActualizacion'>) => {
    const fullNewItem: InventoryItem = {
      ...newItem,
      itemId: `inv-${Date.now()}`,
      fechaCreacion: new Date(),
      ultimaActualizacion: new Date(),
    };
    setItems(prev => [fullNewItem, ...prev]);
    setFormOpen(false);
  };

  const handleUpdate = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => item.itemId === updatedItem.itemId ? { ...updatedItem, ultimaActualizacion: new Date() } : item));
    setFormOpen(false);
    setSelectedItem(null);
  };

  const openForm = (item: InventoryItem | null = null) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const filteredItems = items
    .filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item =>
      categoryFilter === 'all' || item.categoriaId === categoryFilter
    );

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
                    return (
                      <TableRow key={item.itemId}>
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
                          {format(new Date(item.ultimaActualizacion), 'dd/MM/yy')}
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
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>Ajustar Stock</DropdownMenuItem>
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
    </div>
  );
}
