
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MenuForm } from './menu-form';
import type { Menu, InventoryItem } from '@/lib/types';

interface MenuDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  menu: Menu | null;
  setEditingMenu: (menu: Menu | null) => void;
  currentWeekStart: Date;
  inventoryItems: InventoryItem[];
  isLoadingInventory: boolean;
}

export default function MenuDialog({
  isOpen,
  onOpenChange,
  menu,
  setEditingMenu,
  currentWeekStart,
  inventoryItems,
  isLoadingInventory,
}: MenuDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    // Pequeño retraso para evitar que se vea el cambio de contenido al cerrar
    setTimeout(() => setEditingMenu(null), 150);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{menu ? 'Editar Menú' : 'Crear Nuevo Menú'}</DialogTitle>
          <DialogDescription>
            {menu
              ? 'Actualiza los detalles básicos de este menú.'
              : 'Define los detalles básicos para un nuevo menú.'}
          </DialogDescription>
        </DialogHeader>
        <MenuForm
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          editingMenu={menu}
          inventoryItems={inventoryItems}
          isLoadingInventory={isLoadingInventory}
        />
      </DialogContent>
    </Dialog>
  );
}
