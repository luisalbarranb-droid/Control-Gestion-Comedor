'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UserForm({ isOpen, onOpenChange, editingUser }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center text-muted-foreground">
            <p>Formulario de gestión de usuarios (Simulación).</p>
        </div>
        <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
