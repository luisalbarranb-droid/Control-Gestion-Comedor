'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MenuForm({ isOpen, onOpenChange, editingMenu }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingMenu ? 'Editar Menú' : 'Crear Nuevo Menú'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center p-4 text-muted-foreground">
            <p>Aquí irá el formulario para gestionar los platillos, ingredientes y horarios del menú.</p>
            <p className="text-xs mt-2">(Componente en desarrollo)</p>
          </div>
        </div>
        <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
    