'use client';

import { FileSpreadsheet, Search, ChevronDown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { inventoryCategories } from '@/lib/placeholder-data';
import { InventoryCategoryId } from '@/lib/types';
import Link from 'next/link';

interface InventoryHeaderProps {
  onAddItem: () => void;
  onAddEntry: () => void;
  onAddExit: () => void;
  onImport: () => void;
  onSearch: (query: string) => void;
  onFilterChange: (categoryId: InventoryCategoryId | 'all') => void;
  searchQuery: string;
  categoryFilter: InventoryCategoryId | 'all';
}

export function InventoryHeader({ 
    onAddItem, 
    onAddEntry,
    onAddExit,
    onImport,
    onSearch, 
    onFilterChange, 
    searchQuery, 
    categoryFilter
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="font-headline text-2xl font-bold md:text-3xl">
        Gestión de Inventario
      </h1>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar artículos..."
            className="w-full pl-8 md:w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {inventoryCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
         <Button variant="secondary" asChild>
          <Link href="/inventory/orders">
            Pedidos
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/inventory/reports">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Reportes
          </Link>
        </Button>
         <Button variant="outline" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importar desde Excel
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="w-full md:w-auto">
                    Acciones <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddEntry}>Registrar Entrada</DropdownMenuItem>
                <DropdownMenuItem onClick={onAddExit}>Registrar Salida</DropdownMenuItem>
                <DropdownMenuItem onClick={onAddItem}>Añadir Nuevo Artículo</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
