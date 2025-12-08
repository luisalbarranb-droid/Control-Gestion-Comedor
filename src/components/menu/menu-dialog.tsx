'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MenuDialog({ isOpen, onOpenChange }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestión de Menú (Componente Pendiente)</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center">
            <p>Aquí irá el formulario para crear/editar menús.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}